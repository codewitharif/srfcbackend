const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/applicationAssets');

router.get('/', ctrl.getAll);
router.get('/application/:application_id', ctrl.getByApplication);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.remove);

module.exports = router;
