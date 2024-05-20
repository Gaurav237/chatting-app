const express = require('express');
const protect = require('../middleware/authorizeMiddleware');
const { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup, updateAdmin } = require('../controllers/chatController');

const router = express.Router();

router.post('/', protect, accessChat);
router.get('/', protect, fetchChats);
router.post('/group', protect, createGroupChat);
router.put('/rename', protect, renameGroup); 
router.put('/add_to_group', protect, addToGroup);
router.put('/remove_from_group', protect, removeFromGroup);
router.put('/updateAdmin', protect, updateAdmin);

module.exports = router;