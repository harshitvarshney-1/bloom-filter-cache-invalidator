const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bloom-cache-db');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error connecting to primary MongoDB: ${err.message}`);
        console.log('Attempting to start in-memory MongoDB...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            const conn = await mongoose.connect(uri);
            console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
        } catch (memErr) {
            console.error(`Fatal: Could not start in-memory MongoDB: ${memErr.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
