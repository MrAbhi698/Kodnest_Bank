const jwt = require('jsonwebtoken');
const Token = require('../models/Token');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Check if token exists in DB and is not expired
        const tokenData = await Token.findOne({ token_name: token });

        if (!tokenData) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        if (new Date() > new Date(tokenData.expire_time)) {
            return res.status(403).json({ error: 'Token expired' });
        }

        next();
    } catch (err) {
        console.error(err);
        return res.status(403).json({ error: 'Invalid token' });
    }
};

module.exports = authenticateToken;
