const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join('/tmp', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

exports.getAll = async (req, res) => {
  try {
    const { customer_id } = req.query;
    let query = `
      SELECT d.* 
      FROM documents d
      JOIN loan_applications la ON d.application_id = la.id
    `;
    const params = [];

    if (customer_id) {
      query += ' WHERE la.customer_id = ?';
      params.push(customer_id);
    }
    
    query += ' ORDER BY d.uploaded_at DESC';

    const rows = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => { 
  try { 
    const { id } = req.params; 
    const [row] = await db.query('SELECT * FROM documents WHERE id = ?', [id]); 
    if(!row) return res.status(404).json({ error:'Not found' }); 
    res.json(row); 
  } catch(err){ 
    res.status(500).json({ error: err.message }); 
  } 
};

exports.create = async (req, res) => {
  try {
    const cols = ['application_id', 'document_requirement_id', 'document_type', 'original_filename', 'stored_filename', 'file_path', 'file_size_kb', 'mime_type'];
    const values = cols.map(c => req.body[c] || null);
    const placeholders = cols.map(() => '?').join(',');
    
    const result = await db.query(`INSERT INTO documents (${cols.join(',')}) VALUES (${placeholders})`, values);
    
    const [newRow] = await db.query('SELECT * FROM documents WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};

exports.update = async (req, res) => { 
  try { 
    const { id } = req.params; 
    const allowed = ['verification_status', 'verified_by', 'verified_at', 'rejection_reason']; 
    const sets = []; 
    const values = []; 
    
    allowed.forEach(k => { 
      if (k in req.body) { 
        sets.push(`${k} = ?`); 
        values.push(req.body[k]); 
      }
    }); 
    
    if (!sets.length) return res.status(400).json({ error: 'No fields to update' }); 
    
    values.push(id); 
    
    await db.query(`UPDATE documents SET ${sets.join(',')}, uploaded_at=COALESCE(uploaded_at, NOW()) WHERE id = ?`, values); 
    
    const [updatedRow] = await db.query('SELECT * FROM documents WHERE id = ?', [id]);
    if (!updatedRow) return res.status(404).json({ error: 'Not found' }); 
    
    res.json(updatedRow); 
  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  } 
};

const { cloudinary, storage } = require('../config/cloudinary');
const multer = require('multer');

exports.uploadToCloudinary = multer({ storage }).array('documents');

exports.upload = async (req, res) => {
  try {
    const { loan_application_id } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const documents = [];
    for (const file of files) {
      const newDocument = {
        application_id: loan_application_id,
        document_type: 'LoanApplicationDocument',
        original_filename: file.originalname,
        stored_filename: file.filename,
        file_path: file.path,
        file_size_kb: Math.round(file.size / 1024),
        mime_type: file.mimetype,
      };

      const cols = Object.keys(newDocument);
      const values = Object.values(newDocument);
      const placeholders = cols.map(() => '?').join(',');

      const result = await db.query(`INSERT INTO documents (${cols.join(',')}) VALUES (${placeholders})`, values);
      const [row] = await db.query('SELECT * FROM documents WHERE id = ?', [result.insertId]);
      documents.push(row);
    }

    res.status(201).json({
      message: `${files.length} document(s) uploaded successfully`,
      data: documents
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.uploadLegacy = async (req, res) => {
  try {
    console.log('Upload endpoint called');
    console.log('Files received:', req.files);
    
    if (!req.files || !req.files.document) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.document;
    const { application_id, customer_id, document_type, metadata } = req.body;
    
    console.log('File details:', { name: file.name, size: file.size, mimetype: file.mimetype });
    console.log('Form data:', { application_id, customer_id, document_type });

    const timestamp = Date.now();
    const storedFilename = `${timestamp}-${file.name}`;
    const uploadPath = path.join(uploadsDir, storedFilename);

    await file.mv(uploadPath);
    console.log('File saved to:', uploadPath);

    let metadataObj = {};
    if (metadata && typeof metadata === 'string') {
      try {
        metadataObj = JSON.parse(metadata);
      } catch (e) {
        metadataObj = { original_filename: file.name };
      }
    }

    const cols = ['application_id', 'document_type', 'original_filename', 'stored_filename', 'file_path', 'file_size_kb', 'mime_type'];
    const values = [
      application_id || null,
      document_type || 'LoanApplicationDocument',
      metadataObj.original_filename || file.name,
      storedFilename,
      uploadPath,
      Math.round(file.size / 1024),
      file.mimetype
    ];

    const placeholders = values.map(() => '?').join(',');
    const result = await db.query(
      `INSERT INTO documents (${cols.join(',')}) VALUES (${placeholders})`,
      values
    );

    const [newRow] = await db.query('SELECT * FROM documents WHERE id = ?', [result.insertId]);

    console.log('Document record created:', newRow);

    res.status(201).json({
      message: 'File uploaded successfully',
      data: newRow
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => { 
  try { 
    const { id } = req.params; 
    
    const [doc] = await db.query('SELECT stored_filename FROM documents WHERE id = ?', [id]);
    
    if (doc && doc.stored_filename) {
      const filePath = path.join(uploadsDir, doc.stored_filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await db.query('DELETE FROM documents WHERE id = ?', [id]); 
    res.status(204).end(); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};