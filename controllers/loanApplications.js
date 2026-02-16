const db = require('../config/db');
const { getLoanInterestCharge, validateLoanApplication } = require('../utils/loanValidation');
const { calculateEmi } = require('../utils/emiCalculator');

exports.getAll = async (req, res) => {
  try {
    const { customer_id } = req.query;
    let query = 'SELECT *, full_name as customer_name, created_at as application_date FROM vw_applications_with_hierarchy';
    const params = [];

    if (customer_id) {
      query += ' WHERE customer_id = ?';
      params.push(customer_id);
    }
    
    query += ' ORDER BY application_date DESC';

    const rows = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [row] = await db.query('SELECT * FROM loan_applications WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    // Generate a unique application number
    req.body.application_number = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const fields = ['application_number', 'customer_id', 'product_id', 'loan_category_id', 'loan_subcategory_id', 'requested_amount', 'tenure_months', 'interest_rate', 'source', 'conversation_id', 'ip_address', 'device_info'];
    const values = fields.map(f => req.body[f] || null);
    const placeholders = fields.map(() => '?').join(',');
    
    const result = await db.query(`INSERT INTO loan_applications (${fields.join(',')}) VALUES (${placeholders})`, values);
    
    const [newRow] = await db.query('SELECT * FROM loan_applications WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ['requested_amount', 'approved_amount', 'tenure_months', 'interest_rate', 'processing_fee', 'total_charges', 'application_status', 'assigned_to', 'rejection_reason', 'disbursement_date', 'first_emi_date'];
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
    
    await db.query(`UPDATE loan_applications SET ${sets.join(',')}, updated_at=NOW() WHERE id = ?`, values);
    
    const [updatedRow] = await db.query('SELECT * FROM loan_applications WHERE id = ?', [id]);

    if (!updatedRow) return res.status(404).json({ error: 'Not found' });
    res.json(updatedRow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM loan_applications WHERE id = ?', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.calculateEmi = async (req, res) => {
  try {
    const { requested_amount, tenure_months, loan_category_id, loan_subcategory_id } = req.body;

    if (!requested_amount || !tenure_months || !loan_category_id) {
      return res.status(400).json({ error: 'Missing required parameters: requested_amount, tenure_months, loan_category_id' });
    }

    const P = parseFloat(requested_amount);
    const N = parseInt(tenure_months, 10);

    if (isNaN(P) || P <= 0) {
      return res.status(400).json({ error: 'Invalid requested_amount. Must be a positive number.' });
    }
    if (isNaN(N) || N <= 0) {
      return res.status(400).json({ error: 'Invalid tenure_months. Must be a positive integer.' });
    }

    const loanInterestCharge = await getLoanInterestCharge(loan_category_id, loan_subcategory_id);

    if (!loanInterestCharge) {
      return res.status(404).json({ error: 'No active loan interest charge found for the specified category/subcategory.' });
    }

    const validationResult = validateLoanApplication(loanInterestCharge, P, N);
    if (!validationResult.isValid) {
      return res.status(400).json({ error: validationResult.message });
    }

    const annualInterestRate = parseFloat(loanInterestCharge.min_interest_rate); // Using min_interest_rate as per requirement

    // More specific check for NaN or invalid interest rate from DB
    if (isNaN(annualInterestRate) || annualInterestRate <= 0) { // Interest rate should also be positive
      return res.status(500).json({ error: `Invalid or non-positive interest rate (${loanInterestCharge.min_interest_rate}) configured for the selected loan.` });
    }
    
    const emi = calculateEmi(P, annualInterestRate, N);
    
    res.json({ emi: emi.toFixed(2) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

