import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dev-ai-os';

        await mongoose.connect(mongoURI, {
            // These options are no longer necessary in Mongoose 6+, but kept for awareness if using older versions
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

export default connectDB;
