import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {

        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Options to avoid deprecation warnings (might vary slightly based on Mongoose version)
            // Mongoose 6+ generally doesn't require these as much
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useCreateIndex: true, // Might not be needed/supported in Mongoose 6+
            // useFindAndModify: false, // Might not be needed/supported in Mongoose 6+
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;