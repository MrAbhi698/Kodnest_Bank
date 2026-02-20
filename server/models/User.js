const mongoose = require('mongoose');
const Counter = require('./Counter');

const userSchema = new mongoose.Schema({
    cid: { type: Number, unique: true },
    cname: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    cpassword: { type: String, required: true },
    balance: { type: Number, default: 100000.00, min: 0 },
    pin: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
