const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/loanCategories');
const subcategoryCtrl = require('../controllers/loanSubcategories'); // Import subcategory controller

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

// New route to get subcategories by category ID
router.get('/:categoryId/subcategories', subcategoryCtrl.getAll);

module.exports = router;
