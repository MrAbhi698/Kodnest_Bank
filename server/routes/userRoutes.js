const express = require('express');
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/balance', authenticateToken, userController.getBalance);
router.post('/send-money', authenticateToken, userController.sendMoney);
router.post('/set-pin', authenticateToken, userController.setPin);
router.post('/verify-pin', authenticateToken, userController.verifyPin);
router.get('/transactions', authenticateToken, userController.getTransactions);

module.exports = router;
