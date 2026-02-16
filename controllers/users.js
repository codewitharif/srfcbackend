const db = require('../config/db');
const crypto = require('crypto');

// Simple password hashing function (use bcrypt in production)
const hashPassword = (password) => {
  if (!password) return null;
  return crypto.createHash('sha256').update(password).digest('hex');
};

exports.getAll = async (req, res) => {
  try {
    const rows = await db.query('SELECT id, username, email, full_name, role, department, mobile_number, is_active, last_login, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await db.query('SELECT id, username, email, full_name, role, department, mobile_number, is_active, last_login, created_at FROM users WHERE id = ?', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { username, email, password, full_name, role, department, mobile_number, is_active } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: username, email, and password are required' 
      });
    }
    
    // Hash the password
    const password_hash = hashPassword(password);
    
    // Check if username or email already exists
    const existing = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        error: 'Username or email already exists' 
      });
    }
    
    // Insert user
    const result = await db.query(
      `INSERT INTO users (username, email, password_hash, full_name, role, department, mobile_number, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, email, password_hash, full_name || null, role || 'customer_support', department || null, mobile_number || null, is_active !== false]
    );
    
    const [newUser] = await db.query('SELECT id, username, email, full_name, role, department, mobile_number, is_active, created_at FROM users WHERE id = ?', [result.insertId]);

    res.status(201).json(newUser);
  } catch (err) {
    console.error('User creation error:', err);
    res.status(500).json({ error: err.message });
  }
};


exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ['full_name', 'role', 'department', 'mobile_number', 'is_active'];
    const sets = [];
    const values = [];
    
    allowed.forEach((k) => {
      if (k in req.body) { 
        sets.push(`${k} = ?`); 
        values.push(req.body[k]); 
      }
    });
    
    if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
    
    values.push(id);
    await db.query(
      `UPDATE users SET ${sets.join(',')}, updated_at=NOW() WHERE id = ?`,
      values
    );
    
    const [updatedUser] = await db.query('SELECT id, username, email, full_name, role, department, mobile_number, is_active, updated_at FROM users WHERE id = ?', [id]);
    
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
