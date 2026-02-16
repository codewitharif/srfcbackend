const db = require('../config/db');

exports.getAll = async (req, res) => { 
  try { 
    // MySQL doesn't support NULLS LAST, so we use a different ORDER BY clause
    const rows = await db.query('SELECT * FROM document_requirements ORDER BY display_order IS NULL, display_order ASC'); 
    res.json(rows); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};

exports.getById = async (req, res) => { 
  try { 
    const { id } = req.params; 
    const [row] = await db.query('SELECT * FROM document_requirements WHERE id = ?', [id]); 
    if (!row) return res.status(404).json({ error: 'Not found' }); 
    res.json(row); 
  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  } 
};

exports.create = async (req, res) => {
  try {
    const cols = ['loan_category_id', 'loan_subcategory_id', 'document_type', 'document_name', 'description', 'is_mandatory', 'allowed_formats', 'max_file_size_mb', 'display_order'];
    const values = cols.map(c => req.body[c] || null);
    const placeholders = cols.map(() => '?').join(',');
    
    const result = await db.query(`INSERT INTO document_requirements (${cols.join(',')}) VALUES (${placeholders})`, values);
    
    const [newRow] = await db.query('SELECT * FROM document_requirements WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};

exports.update = async (req, res) => { 
  try { 
    const { id } = req.params; 
    const allowed = ['document_type', 'document_name', 'description', 'is_mandatory', 'allowed_formats', 'max_file_size_mb', 'display_order']; 
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
    
    await db.query(`UPDATE document_requirements SET ${sets.join(',')}, updated_at=NOW() WHERE id = ?`, values); 
    
    const [updatedRow] = await db.query('SELECT * FROM document_requirements WHERE id = ?', [id]);
    
    if (!updatedRow) return res.status(404).json({ error: 'Not found' }); 
    res.json(updatedRow); 
  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  } 
};

exports.remove = async (req, res) => { 
  try { 
    const { id } = req.params; 
    await db.query('DELETE FROM document_requirements WHERE id = ?', [id]); 
    res.status(204).end(); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};
