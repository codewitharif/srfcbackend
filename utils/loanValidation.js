const db = require('../config/db');

async function getLoanInterestCharge(loan_category_id, loan_subcategory_id) {
  let query = 'SELECT * FROM loan_interest_charges WHERE is_active = TRUE AND effective_from <= NOW() AND effective_to >= NOW()';
  const params = [];
  const conditions = [];

  // Prioritize subcategory if provided
  if (loan_subcategory_id) {
    conditions.push(`loan_subcategory_id = $${params.length + 1}`);
    params.push(loan_subcategory_id);
  } else if (loan_category_id) { // Fallback to category if subcategory not provided
    conditions.push(`loan_category_id = $${params.length + 1}`);
    params.push(loan_category_id);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  } else {
    // If neither category nor subcategory is provided, return null as no specific charge can be found
    return null;
  }

  query += ' ORDER BY created_at DESC LIMIT 1'; // Get the most recent active charge

  const { rows } = await db.query(query, params);
  return rows[0];
}

function validateLoanApplication(loanInterestCharge, requested_amount, tenure_months) {
  if (!loanInterestCharge) {
    return { isValid: false, message: 'No active loan interest charge found for the specified category/subcategory.' };
  }

  const minLoanAmount = parseFloat(loanInterestCharge.min_loan_amount);
  const maxLoanAmount = parseFloat(loanInterestCharge.max_loan_amount);
  const minTenureMonths = loanInterestCharge.min_tenure_months;
  const maxTenureMonths = loanInterestCharge.max_tenure_months;

  if (requested_amount < minLoanAmount) {
    return { isValid: false, message: `Requested amount is below the minimum allowed loan amount of ${minLoanAmount}.` };
  }
  if (requested_amount > maxLoanAmount) {
    return { isValid: false, message: `Requested amount exceeds the maximum allowed loan amount of ${maxLoanAmount}.` };
  }
  if (tenure_months < minTenureMonths) {
    return { isValid: false, message: `Tenure in months is below the minimum allowed tenure of ${minTenureMonths} months.` };
  }
  if (tenure_months > maxTenureMonths) {
    return { isValid: false, message: `Tenure in months exceeds the maximum allowed tenure of ${maxTenureMonths} months.` };
  }

  return { isValid: true, message: 'Loan application valid.' };
}

module.exports = {
  getLoanInterestCharge,
  validateLoanApplication,
};