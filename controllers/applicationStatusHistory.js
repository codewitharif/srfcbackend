const db = require('../config/db');

exports.getAll = async (req, res) => { 
  try { 
    const rows = await db.query('SELECT * FROM application_status_history ORDER BY changed_at DESC'); 
    res.json(rows); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};

exports.getByApplication = async (req, res) => { 
  try { 
    const { application_id } = req.params; 
    const rows = await db.query('SELECT * FROM application_status_history WHERE application_id = ? ORDER BY changed_at', [application_id]); 
    res.json(rows); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};

exports.create = async (req, res) => { 
  try { 
    const cols = ['application_id', 'from_status', 'to_status', 'changed_by', 'remarks']; 
    const values = cols.map(c => req.body[c] || null); 
    const placeholders = cols.map(() => '?').join(','); 
    
    const result = await db.query(`INSERT INTO application_status_history (${cols.join(',')}) VALUES (${placeholders})`, values); 
    
    const [newRow] = await db.query('SELECT * FROM application_status_history WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow); 
  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  } 
};
