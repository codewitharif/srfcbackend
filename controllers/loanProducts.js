const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT
          lp.id,
          lp.product_name,
          lp.is_active,
          lp.description
      FROM
          loan_products lp
      WHERE lp.is_active = true
      ORDER BY lp.display_order, lp.id
    `);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await db.query('SELECT * FROM loan_products WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const { id } = req.params; // product id
    const rows = await db.query('SELECT * FROM loan_categories WHERE product_id = ? ORDER BY display_order, id', [id]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { product_code, product_name, description, is_active, display_order } = req.body;
    const result = await db.query(
      `INSERT INTO loan_products (product_code, product_name, description, is_active, display_order)
       VALUES (?,?,?,?,?)`,
      [product_code, product_name, description, is_active, display_order]
    );
    const [newRow] = await db.query('SELECT * FROM loan_products WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_code, product_name, description, is_active, display_order } = req.body;
    await db.query(
      `UPDATE loan_products SET product_code=?, product_name=?, description=?, is_active=?, display_order=?, updated_at=NOW()
       WHERE id=?`,
      [product_code, product_name, description, is_active, display_order, id]
    );
    res.json({ message: 'Loan product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM loan_products WHERE id=?', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
