const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/chatbot');

router.get('/conversations', ctrl.getConversations);
router.post('/conversations', ctrl.createConversation);
router.get('/history/:customerId', ctrl.getChatHistoryByCustomerId);

module.exports = router;
