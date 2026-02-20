const User = require('../models/User');
const Token = require('../models/Token');
const Counter = require('../models/Counter');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
    const { cname, email, password } = req.body;

    if (!cname || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Numeric Customer ID
        const counter = await Counter.findOneAndUpdate(
            { id: 'user_cid' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        // Insert user
        const newUser = new User({
            cid: counter.seq,
            cname,
            email,
            cpassword: hashedPassword,
            balance: 100000.00
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', cid: counter.seq });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ error: 'Server error during registration: ' + error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.cpassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const expireTime = new Date(Date.now() + 3600000); // 1 hour from now

        // Store token in DB
        const newToken = new Token({
            token_name: token,
            expire_time: expireTime
        });
        await newToken.save();

        res.status(200).json({
            token,
            user: {
                cname: user.cname,
                email: user.email,
                balance: user.balance,
                hasPin: !!user.pin
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const logout = async (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { signup, login, logout };
