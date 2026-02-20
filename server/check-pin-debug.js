const mongoose = require('mongoose');
require('dotenv').config();

// Pre-register models
require('./models/Counter');
const User = require('./models/User');

async function checkPin() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI ? 'URI FOUND' : 'URI MISSING');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log('Total users found:', users.length);

        users.forEach(u => {
            const hasPinField = u.pin !== undefined && u.pin !== null;
            console.log(`User: ${u.email}`);
            console.log(`  - CID: ${u.cid}`);
            console.log(`  - PIN Raw: "${u.pin}"`);
            console.log(`  - PIN exists: ${hasPinField}`);
            console.log(`  - Type of PIN: ${typeof u.pin}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
}

checkPin();
