const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/applicationStatusHistory');

router.get('/', ctrl.getAll);
router.get('/application/:application_id', ctrl.getByApplication);
router.post('/', ctrl.create);

module.exports = router;
