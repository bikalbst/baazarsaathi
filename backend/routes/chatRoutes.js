const express = require('express');
const {
  createConversation,
  getConversations,
  getMessageHistory,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/conversations', createConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessageHistory);

module.exports = router;
