const express = require('express');
const protect = require('../middleware/authorizeMiddleware');
const { sendMessage, allMessages } = require('../controllers/messageController');

const router = express.Router();

// for sending message in 1 chat
router.post('/', protect, sendMessage);

// fetching all messages of 1 chat
router.get('/:chatId', protect, allMessages);

module.exports = router;