const User = require('../models/User');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('balance cname cid pin');
        if (!user) return res.status(404).json({ error: 'User not found' });

        const hasPinFlag = user.pin ? true : false;
        console.log(`[DEBUG] User ID: ${req.user.id}, PIN set: ${hasPinFlag}`);

        res.json({
            balance: user.balance,
            cname: user.cname,
            cid: user.cid,
            hasPin: hasPinFlag
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const setPin = async (req, res) => {
    const { password, pin } = req.body;
    const userId = req.user.id;

    console.log(`[DEBUG] setPin attempt for User ID: ${userId}`);

    if (!password || !pin || pin.length < 4) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            console.log(`[DEBUG] setPin Failed: User ${userId} not found`);
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.cpassword);
        if (!isMatch) {
            console.log(`[DEBUG] setPin Failed: Password mismatch for ${user.email}`);
            return res.status(401).json({ error: 'Invalid application password' });
        }

        const hashedPin = await bcrypt.hash(pin, 10);
        user.pin = hashedPin;
        await user.save();

        console.log(`[DEBUG] setPin Success for ${user.email}`);
        res.json({ message: 'PIN set successfully' });
    } catch (error) {
        console.error('[DEBUG] setPin ERROR:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const verifyPin = async (req, res) => {
    const { pin } = req.body;
    const userId = req.user.id;

    if (!pin) return res.status(400).json({ error: 'PIN required' });

    try {
        const user = await User.findById(userId).select('pin');
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!user.pin) return res.status(400).json({ error: 'PIN not set' });

        const isMatch = await bcrypt.compare(pin, user.pin);
        if (!isMatch) return res.status(401).json({ error: 'Invalid PIN' });

        res.json({ message: 'PIN verified' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const sendMoney = async (req, res) => {
    const { receiverEmail, receiverId, amount, pin } = req.body;
    const senderId = req.user.id;
    const transferAmount = parseFloat(amount);

    if (!receiverEmail || !receiverId || !amount || transferAmount <= 0 || !pin) {
        return res.status(400).json({ error: 'Invalid input (PIN required)' });
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        // Verify PIN and Check Sender Balance
        const sender = await User.findById(senderId).session(session);
        if (!sender) throw new Error('Sender not found');
        if (!sender.pin) throw new Error('Please set your PIN first');

        const isPinMatch = await bcrypt.compare(pin, sender.pin);
        if (!isPinMatch) throw new Error('Invalid PIN');

        if (sender.balance < transferAmount) {
            throw new Error('Insufficient balance');
        }

        // Check Receiver (Email AND Numeric CID must match)
        const receiver = await User.findOne({ email: receiverEmail, cid: parseInt(receiverId) }).session(session);
        if (!receiver) throw new Error('Receiver not found or ID/Email mismatch');

        if (receiver._id.toString() === senderId.toString()) {
            throw new Error('Cannot send money to yourself');
        }

        // Deduct from Sender
        sender.balance -= transferAmount;
        await sender.save({ session });

        // Add to Receiver
        receiver.balance += transferAmount;
        await receiver.save({ session });

        // Log Transaction
        const transaction = new Transaction({
            sender_id: senderId,
            receiver_id: receiver._id,
            amount: transferAmount
        });
        await transaction.save({ session });

        await session.commitTransaction();
        res.json({ message: 'Transaction successful' });

    } catch (error) {
        await session.abortTransaction();
        console.error('Transaction Failed:', error.message);
        res.status(400).json({ error: error.message || 'Transaction failed' });
    } finally {
        session.endSession();
    }
};

const getTransactions = async (req, res) => {
    const userId = req.user.id;
    try {
        const transactions = await Transaction.find({
            $or: [{ sender_id: userId }, { receiver_id: userId }]
        })
            .populate('sender_id', 'cname email cid')
            .populate('receiver_id', 'cname email cid')
            .sort({ timestamp: -1 });

        // Format to match old SQL response structure if needed by frontend
        const formatted = transactions.map(t => ({
            id: t._id,
            amount: t.amount,
            timestamp: t.timestamp,
            sender_id: t.sender_id?.cid,
            receiver_id: t.receiver_id?.cid,
            sender_name: t.sender_id?.cname,
            sender_email: t.sender_id?.email,
            receiver_name: t.receiver_id?.cname,
            receiver_email: t.receiver_id?.email,
            receiver_cid: t.receiver_id?.cid
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching transactions' });
    }
};

module.exports = { getBalance, sendMoney, setPin, verifyPin, getTransactions };
