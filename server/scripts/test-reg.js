const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Counter = require('../models/Counter');
const User = require('../models/User');

async function test() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        console.log('Cleaning up Alice...');
        await User.deleteOne({ email: 'alice@gmail.com' });

        console.log('Creating Alice...');
        const alice = new User({
            cname: 'Alice',
            email: 'alice@gmail.com',
            cpassword: 'hashed_password',
            balance: 100000
        });

        console.log('Saving Alice...');
        await alice.save();
        console.log('Alice saved successfully with CID:', alice.cid);

    } catch (error) {
        console.error('TEST FAILED:');
        console.dir(error, { depth: null });
    } finally {
        await mongoose.disconnect();
    }
}

test();
