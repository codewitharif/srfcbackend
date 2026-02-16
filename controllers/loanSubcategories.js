const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { category_id } = req.query;
    const { categoryId } = req.params; // Get categoryId from params
    const idToUse = category_id || categoryId; // Use query first, then params

    let query = 'SELECT * FROM loan_subcategories';
    const params = [];

    if (idToUse) { // Use idToUse
      query += ' WHERE category_id = ?';
      params.push(idToUse);
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
    const rows = await db.query('SELECT * FROM loan_subcategories WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { category_id, subcategory_code, subcategory_name, description, is_active, display_order } = req.body;
    const result = await db.query(
      `INSERT INTO loan_subcategories (category_id, subcategory_code, subcategory_name, description, is_active, display_order)
       VALUES (?,?,?,?,?,?)`,
      [category_id, subcategory_code, subcategory_name, description, is_active, display_order]
    );
    const [newRow] = await db.query('SELECT * FROM loan_subcategories WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, subcategory_code, subcategory_name, description, is_active, display_order } = req.body;
    await db.query(
      `UPDATE loan_subcategories SET category_id=?, subcategory_code=?, subcategory_name=?, description=?, is_active=?, display_order=?, updated_at=NOW()
       WHERE id=?`,
      [category_id, subcategory_code, subcategory_name, description, is_active, display_order, id]
    );
    res.json({ message: 'Loan subcategory updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM loan_subcategories WHERE id=?', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
