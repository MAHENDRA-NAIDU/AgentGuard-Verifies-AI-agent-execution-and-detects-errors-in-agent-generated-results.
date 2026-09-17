import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export async function connectDB() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agentguard';
  try {
    await mongoose.connect(mongoURI);
    logger.system(`MongoDB connected successfully at ${mongoURI}`);
    return true;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    return false;
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.system('MongoDB reconnected');
});

export default connectDB;
