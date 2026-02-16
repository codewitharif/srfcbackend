const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userPermissions');

router.get('/user/:user_id', ctrl.getByUser);
router.post('/', ctrl.setPermissions);

module.exports = router;
