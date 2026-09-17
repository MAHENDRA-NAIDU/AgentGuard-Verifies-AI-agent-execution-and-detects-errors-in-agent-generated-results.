import mongoose from 'mongoose';

const executionSchema = new mongoose.Schema({
  executionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  taskId: {
    type: String,
    required: true,
    index: true,
  },
  taskText: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'],
    default: 'RUNNING',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  totalDuration: {
    type: Number, // milliseconds
    default: 0,
  },
  stepCount: {
    type: Number,
    default: 0,
  },
  finalResponse: {
    type: String,
    default: '',
  },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'FAILED', 'PARTIAL'],
    default: 'PENDING',
  },
  error: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

export const Execution = mongoose.model('Execution', executionSchema);
export default Execution;
