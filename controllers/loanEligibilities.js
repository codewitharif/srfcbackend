const db = require('../config/db');

// Get all loan eligibility rules
exports.getAll = async (req, res) => {
  try {
    const { loan_category_id } = req.query;
    let query = `
      SELECT
          le.id,
          le.loan_category_id,
          lc.category_name AS loan_category_name,
          le.loan_subcategory_id,
          lsc.subcategory_name AS loan_subcategory_name,
          le.parameter_name,
          le.parameter_type,
          le.min_value,
          le.max_value,
          le.required,
          le.validation_rule,
          le.error_message,
          le.created_at
      FROM
          loan_eligibility le
      LEFT JOIN
          loan_categories lc ON le.loan_category_id = lc.id
      LEFT JOIN
          loan_subcategories lsc ON le.loan_subcategory_id = lsc.id
    `;
    const params = [];

    if (loan_category_id) {
      query += ' WHERE le.loan_category_id = ?';
      params.push(loan_category_id);
    }

    query += ' ORDER BY le.created_at DESC';

    const rows = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single loan eligibility rule by ID
exports.getLoanEligibilityById = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await db.query('SELECT * FROM loan_eligibility WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Loan eligibility rule not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new loan eligibility rule
exports.create = async (req, res) => {
  try {
    const {
      loan_category_id,
      loan_subcategory_id,
      parameter_name,
      parameter_type,
      min_value,
      max_value,
      required,
      validation_rule,
      error_message,
    } = req.body;

    const result = await db.query(
      `INSERT INTO loan_eligibility (
        loan_category_id,
        loan_subcategory_id,
        parameter_name,
        parameter_type,
        min_value,
        max_value,
        required,
        validation_rule,
        error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        loan_category_id,
        loan_subcategory_id,
        parameter_name,
        parameter_type,
        min_value,
        max_value,
        required,
        validation_rule,
        error_message,
      ]
    );
    
    const [newRow] = await db.query('SELECT * FROM loan_eligibility WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a loan eligibility rule
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [
      'loan_category_id',
      'loan_subcategory_id',
      'parameter_name',
      'parameter_type',
      'min_value',
      'max_value',
      'required',
      'validation_rule',
      'error_message',
    ];
    
    const setClauses = [];
    const values = [];
    
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE loan_eligibility SET ${setClauses.join(', ')} WHERE id = ?`;
    
    await db.query(query, values);

    res.json({ message: 'Loan eligibility rule updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a loan eligibility rule
exports.removeLoanEligibility = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM loan_eligibility WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Loan eligibility rule not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// New function to get dynamic eligibility parameters
exports.getEligibilityParameters = async (req, res) => {
  try {
    const { category_id, subcategory_id } = req.query; // Expecting category_id and subcategory_id from query params
    let query = `
      SELECT
          id,
          parameter_name,
          parameter_type,
          min_value,
          max_value,
          required,
          validation_rule,
          error_message
      FROM
          loan_eligibility
      WHERE
          (loan_category_id = ? OR loan_category_id IS NULL)
    `;
    const params = [category_id];

    if (subcategory_id) {
      query += ' AND (loan_subcategory_id = ? OR loan_subcategory_id IS NULL)';
      params.push(subcategory_id);
    } else {
      query += ' AND loan_subcategory_id IS NULL'; // Ensure only category-specific or global if no subcategory
    }

    const rows = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveDynamicEligibilityParameters = async (req, res) => {
  try {
    const { loan_category_id, loan_subcategory_id, parameters } = req.body;

    if (!loan_category_id || !parameters || !Array.isArray(parameters)) {
      return res.status(400).json({ error: 'Missing loan_category_id or parameters array' });
    }

    // Start a transaction for atomicity
    // await db.query('BEGIN'); // In mysql2, transactions are handled differently

    // 1. Delete existing eligibility records for the given category/subcategory combination
    let deleteQuery = 'DELETE FROM loan_eligibility WHERE loan_category_id = ?';
    let deleteParams = [loan_category_id];

    if (loan_subcategory_id) {
      deleteQuery += ' AND loan_subcategory_id = ?';
      deleteParams.push(loan_subcategory_id);
    } else {
      deleteQuery += ' AND loan_subcategory_id IS NULL';
    }
    await db.query(deleteQuery, deleteParams);

    // 2. Insert new eligibility records
    for (const param of parameters) {
      const { parameter_name, parameter_type, min_value, max_value, required, validation_rule, error_message } = param;

      await db.query(
        `INSERT INTO loan_eligibility (
          loan_category_id,
          loan_subcategory_id,
          parameter_name,
          parameter_type,
          min_value,
          max_value,
          required,
          validation_rule,
          error_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          loan_category_id,
          loan_subcategory_id,
          parameter_name,
          parameter_type,
          min_value || null,
          max_value || null,
          required,
          validation_rule,
          error_message
        ]
      );
    }

    // await db.query('COMMIT');
    res.status(200).json({ message: 'Dynamic loan eligibility parameters saved successfully!' });
  } catch (err) {
    // await db.query('ROLLBACK'); // Rollback on error
    console.error('Error saving dynamic loan eligibility parameters:', err);
    res.status(500).json({ error: err.message });
  }
};
