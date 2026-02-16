const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { product_id } = req.query;
    let query = 'SELECT * FROM loan_categories';
    const params = [];

    if (product_id) {
      query += ' WHERE product_id = ?';
      params.push(product_id);
    }

    query += ' ORDER BY display_order, id';

    const rows = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await db.query('SELECT * FROM loan_categories WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { product_id, category_code, category_name, description, is_active, display_order } = req.body;
    const result = await db.query(
      `INSERT INTO loan_categories (product_id, category_code, category_name, description, is_active, display_order)
       VALUES (?,?,?,?,?,?)`,
      [product_id, category_code, category_name, description, is_active, display_order]
    );
    const [newRow] = await db.query('SELECT * FROM loan_categories WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, category_code, category_name, description, is_active, display_order } = req.body;
    await db.query(
      `UPDATE loan_categories SET product_id=?, category_code=?, category_name=?, description=?, is_active=?, display_order=?, updated_at=NOW()
       WHERE id=?`,
      [product_id, category_code, category_name, description, is_active, display_order, id]
    );
    res.json({ message: 'Loan category updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM loan_categories WHERE id=?', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
