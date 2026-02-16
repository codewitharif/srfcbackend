const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/documents');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.post('/upload', ctrl.uploadToCloudinary, ctrl.upload);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
