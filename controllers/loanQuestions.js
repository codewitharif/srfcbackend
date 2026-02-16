const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    let query = 'SELECT * FROM loan_questions WHERE is_active=true';
    const values = [];
    const { productId, categoryId, subcategoryId } = req.query;

    if (productId) {
      query += ' AND loan_product_id = ?';
      values.push(productId);
    } else if (categoryId) {
      query += ' AND loan_category_id = ?';
      values.push(categoryId);
    } else if (subcategoryId) {
      query += ' AND loan_subcategory_id = ?';
      values.push(subcategoryId);
    }

    query += ' ORDER BY display_order';

    const rows = await db.query(query, values);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await db.query('SELECT * FROM loan_questions WHERE id=?', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { loan_product_id, loan_category_id, loan_subcategory_id } = req.body;

    if (!loan_product_id && !loan_category_id && !loan_subcategory_id) {
      return res.status(400).json({ error: 'A question must be associated with a product, category, or subcategory.' });
    }

    // Determine the new display_order
    let countQuery = 'SELECT COUNT(*) as count FROM loan_questions';
    const countValues = [];
    let whereClause = '';

    if (loan_product_id) {
        whereClause = ' WHERE loan_product_id = ?';
        countValues.push(loan_product_id);
    } else if (loan_category_id) {
        whereClause = ' WHERE loan_category_id = ?';
        countValues.push(loan_category_id);
    } else if (loan_subcategory_id) {
        whereClause = ' WHERE loan_subcategory_id = ?';
        countValues.push(loan_subcategory_id);
    }

    if (whereClause) {
        countQuery += whereClause;
    }
    const [countResult] = await db.query(countQuery, countValues);
    const display_order = countResult.count;


    const cols = ['loan_product_id', 'loan_category_id', 'loan_subcategory_id', 'question_text', 'question_code', 'question_type', 'options', 'validation_rules', 'is_mandatory', 'placeholder_text', 'help_text', 'display_order', 'parent_question_id', 'conditional_logic'];
    const values = cols.map(c => {
        if (c === 'display_order') return display_order;
        return req.body[c] || null
    });
    const placeholders = values.map(() => `?`).join(',');
    const result = await db.query(`INSERT INTO loan_questions (${cols.join(',')}) VALUES (${placeholders})`, values);
    const [newQuestion] = await db.query('SELECT * FROM loan_questions WHERE id=?', [result.insertId]);
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reorder = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds) || !orderedIds.length) {
      return res.status(400).json({ error: 'Invalid "orderedIds" array provided.' });
    }

    let caseSql = 'CASE id ';
    const values = [];
    orderedIds.forEach((id, index) => {
      caseSql += 'WHEN ? THEN ? ';
      values.push(id, index);
    });
    caseSql += 'END';

    const updateQuery = `UPDATE loan_questions SET display_order = ${caseSql} WHERE id IN (?)`;
    values.push(orderedIds);

    await db.query(updateQuery, values);

    res.status(200).json({ message: 'Order updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ['loan_product_id', 'loan_category_id', 'loan_subcategory_id', 'question_text', 'question_type', 'options', 'validation_rules', 'is_mandatory', 'placeholder_text', 'help_text', 'display_order', 'is_active', 'conditional_logic'];
    const sets = [];
    const values = [];
    allowed.forEach(k => {
      if (k in req.body) {
        sets.push(`${k}=?`);
        values.push(req.body[k]);
      }
    });
    if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
    values.push(id);
    await db.query(`UPDATE loan_questions SET ${sets.join(',')}, updated_at=NOW() WHERE id=?`, values);
    const [updatedQuestion] = await db.query('SELECT * FROM loan_questions WHERE id=?', [id]);
    res.json(updatedQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM loan_questions WHERE id=?', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
