const db = require('../config/db');

exports.getAll = async (req, res) => { 
  try { 
    const rows = await db.query('SELECT * FROM question_responses ORDER BY responded_at DESC'); 
    res.json(rows); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};

exports.getById = async (req, res) => { 
  try { 
    const { id } = req.params; 
    const rows = await db.query('SELECT * FROM question_responses WHERE id = ?', [id]); 
    if (!rows[0]) return res.status(404).json({ error:'Not found' }); 
    res.json(rows[0]); 
  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  } 
};

exports.create = async (req, res) => { 
  try { 
    const cols = ['application_id', 'question_id', 'response_value']; 
    const values = cols.map(c => req.body[c] || null); 
    const placeholders = values.map(() => '?').join(','); 
    
    const result = await db.query(`INSERT INTO question_responses (${cols.join(',')}) VALUES (${placeholders})`, values); 
    
    const [newRow] = await db.query('SELECT * FROM question_responses WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow); 
  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  } 
};

exports.remove = async (req, res) => { 
  try { 
    const { id } = req.params; 
    await db.query('DELETE FROM question_responses WHERE id = ?', [id]); 
    res.status(204).end(); 
  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  } 
};
