const express = require('express');
const router = express.Router();

router.use('/loan-products', require('./loanProducts'));
router.use('/loan-categories', require('./loanCategories'));
router.use('/loan-subcategories', require('./loanSubcategories'));
router.use('/customers', require('./customers'));
router.use('/loan-applications', require('./loanApplications'));
router.use('/chatbot', require('./chatbot'));
router.use('/users', require('./users'));
router.use('/loan-interest-charges', require('./loanInterestCharges'));
router.use('/document-requirements', require('./documentRequirements'));
router.use('/documents', require('./documents'));
router.use('/kyc-steps', require('./kycSteps'));
router.use('/kyc-verifications', require('./kycVerifications'));
router.use('/loan-questions', require('./loanQuestions'));
router.use('/question-responses', require('./questionResponses'));
router.use('/application-status-history', require('./applicationStatusHistory'));
router.use('/application-assets', require('./applicationAssets'));
router.use('/notification-templates', require('./notificationTemplates'));
router.use('/notifications', require('./notifications'));
router.use('/audit-logs', require('./auditLogs'));
router.use('/user-permissions', require('./userPermissions'));
router.use('/loan-eligibilities', require('./loanEligibilities'));

module.exports = router;
