const db = require('../config/db');

exports.getAll = async (req, res) => { 
  try { 
    const rows = await db.query('SELECT * FROM application_assets ORDER BY created_at DESC'); 
    res.json(rows); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};

exports.getByApplication = async (req, res) => { 
  try { 
    const { application_id } = req.params; 
    const rows = await db.query('SELECT * FROM application_assets WHERE application_id = ?', [application_id]); 
    res.json(rows); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};

exports.create = async (req, res) => { 
  try { 
    const cols = ['application_id', 'asset_type', 'asset_category', 'make', 'model', 'variant', 'year_of_manufacture', 'is_new', 'chassis_number', 'engine_number', 'registration_number', 'dealer_name', 'dealer_code', 'invoice_amount', 'insurance_value']; 
    const values = cols.map(c => req.body[c] || null); 
    const placeholders = cols.map(() => '?').join(','); 
    
    const result = await db.query(`INSERT INTO application_assets (${cols.join(',')}) VALUES (${placeholders})`, values); 
    
    const [newRow] = await db.query('SELECT * FROM application_assets WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow); 
  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  } 
};

exports.remove = async (req, res) => { 
  try { 
    const { id } = req.params; 
    await db.query('DELETE FROM application_assets WHERE id = ?', [id]); 
    res.status(204).end(); 
  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  } 
};
