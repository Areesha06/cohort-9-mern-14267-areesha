import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    // Exit the process with failure — there's no point running a server
    // that can't talk to its database.
    process.exit(1);
  }
};

export default connectDB;