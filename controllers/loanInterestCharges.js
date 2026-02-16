const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { category_id, subcategory_id } = req.query;
    let query = 'SELECT * FROM loan_interest_charges';
    const params = [];
    const conditions = [];

    if (subcategory_id) {
      conditions.push(`loan_subcategory_id = ?`);
      params.push(subcategory_id);
    } else if (category_id) {
      conditions.push(`loan_category_id = ?`);
      params.push(category_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';
    
    const rows = await db.query(query, params);
    res.json(rows);
  } catch (err) { 
    console.error("Error in getAll:", err);
    res.status(500).json({ error: err.message }); 
  }
};

exports.getById = async (req, res) => {
  try { 
    const { id } = req.params; 
    const rows = await db.query('SELECT * FROM loan_interest_charges WHERE id = ?', [id]); 
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' }); 
    res.json(rows[0]); 
  } catch (err) { 
    console.error("Error in getById:", err);
    res.status(500).json({ error: err.message }); 
  }
};

exports.create = async (req, res) => {
  try {
    const cols = ['loan_category_id','loan_subcategory_id','interest_rate_type','min_interest_rate','max_interest_rate','processing_fee_percentage','processing_fee_fixed','documentation_charges','late_payment_penalty','prepayment_charges','min_loan_amount','max_loan_amount','min_tenure_months','max_tenure_months','effective_from','effective_to','is_active'];
    const values = cols.map(c => req.body[c] || null);
    const placeholders = cols.map(() => '?').join(',');
    
    const result = await db.query(`INSERT INTO loan_interest_charges (${cols.join(',')}) VALUES (${placeholders})`, values);
    
    const newId = result.insertId;
    const newRow = await db.query('SELECT * FROM loan_interest_charges WHERE id = ?', [newId]);

    res.status(201).json(newRow[0]);
  } catch (err) { 
    console.error("Error in create:", err);
    res.status(500).json({ error: err.message }); 
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params; 
    const allowed = ['min_interest_rate','max_interest_rate','processing_fee_percentage','processing_fee_fixed','documentation_charges','late_payment_penalty','prepayment_charges','min_loan_amount','max_loan_amount','min_tenure_months','max_tenure_months','effective_from','effective_to','is_active'];
    const sets = []; 
    const values = []; 
    
    allowed.forEach(k => { 
      if (k in req.body) { 
        sets.push(`${k} = ?`); 
        values.push(req.body[k]); 
      }
    });

    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' }); 
    
    values.push(id);
    
    await db.query(`UPDATE loan_interest_charges SET ${sets.join(',')}, updated_at=NOW() WHERE id = ?`, values);
    
    const updatedRows = await db.query('SELECT * FROM loan_interest_charges WHERE id = ?', [id]);
    
    if (!updatedRows || updatedRows.length === 0) return res.status(404).json({ error: 'Not found' }); 
    
    res.json(updatedRows[0]);
  } catch (err) { 
    console.error("Error in update:", err);
    res.status(500).json({ error: err.message }); 
  }
};

exports.remove = async (req, res) => { 
  try { 
    const { id } = req.params; 
    await db.query('DELETE FROM loan_interest_charges WHERE id = ?', [id]); 
    res.status(204).end(); 
  } catch (err) { 
    console.error("Error in remove:", err);
    res.status(500).json({ error: err.message }); 
  } 
};