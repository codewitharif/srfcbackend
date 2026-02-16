const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/loanProducts');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/categories', ctrl.getCategories);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
