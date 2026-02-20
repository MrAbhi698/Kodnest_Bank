const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    token_name: { type: String, required: true },
    expire_time: { type: Date, required: true, index: { expires: 0 } }
}, { timestamps: true });

module.exports = mongoose.model('Token', tokenSchema);
