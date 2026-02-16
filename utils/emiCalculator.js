function calculateEmi(principal, annualInterestRate, tenureMonths) {
  const P = parseFloat(principal);
  const N = parseInt(tenureMonths, 10);
  const annualRate = parseFloat(annualInterestRate);

  if (isNaN(P) || isNaN(N) || isNaN(annualRate) || P <= 0 || N <= 0 || annualRate < 0) {
    throw new Error('Invalid input parameters for EMI calculation. Ensure principal, tenureMonths are positive numbers and annualInterestRate is a non-negative number.');
  }

  const R = annualRate / 12 / 100; // Monthly interest rate

  let emi;
  if (R === 0) {
    emi = P / N; // Simple interest if rate is 0
  } else {
    emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
  }

  return emi;
}

module.exports = {
  calculateEmi,
};
