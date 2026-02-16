const db = require('../config/db');

exports.getAll = async (req, res) => { 
  try { 
    const rows = await db.query('SELECT * FROM audit_logs ORDER BY created_at DESC'); 
    res.json(rows); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};

exports.create = async (req, res) => { 
  try { 
    const cols = ['user_id', 'action', 'entity_type', 'entity_id', 'old_values', 'new_values', 'ip_address', 'user_agent']; 
    const values = cols.map(c => req.body[c] || null); 
    const placeholders = cols.map(() => '?').join(','); 
    
    const result = await db.query(`INSERT INTO audit_logs (${cols.join(',')}) VALUES (${placeholders})`, values); 
    
    const [newRow] = await db.query('SELECT * FROM audit_logs WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};
