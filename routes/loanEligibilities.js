const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/loanEligibilities');

router.get('/', ctrl.getAll);
router.get('/parameters', ctrl.getEligibilityParameters);
router.post('/dynamic-parameters', ctrl.saveDynamicEligibilityParameters);
router.get('/:id', ctrl.getLoanEligibilityById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.removeLoanEligibility);

module.exports = router;
