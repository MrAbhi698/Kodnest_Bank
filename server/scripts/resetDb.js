const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const resetDatabase = async () => {
    try {
        console.log('🔄 Connecting to MongoDB for reset...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        const collections = ['users', 'transactions', 'tokens', 'counters'];

        for (const collectionName of collections) {
            console.log(`🧹 Clearing collection: ${collectionName}...`);
            await mongoose.connection.db.collection(collectionName).deleteMany({});
        }

        console.log('✨ All data cleared.');
        console.log('🔢 CID sequence reset to 1.');
        console.log('🚀 Database is now empty and ready for fresh accounts.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        process.exit(1);
    }
};

resetDatabase();
