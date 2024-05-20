const express = require('express');
const { registerUser, authenticateUser, allUsers } = require('../controllers/userControllers');
const protect = require('../middleware/authorizeMiddleware');

const router = express.Router();

router.post('/', registerUser);
router.post('/login', authenticateUser);
router.get('/', protect, allUsers);

module.exports = router;