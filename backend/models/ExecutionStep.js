import mongoose from 'mongoose';

const executionStepSchema = new mongoose.Schema({
  executionId: {
    type: String,
    required: true,
    index: true,
  },
  stepId: {
    type: Number,
    required: true,
  },
  tool: {
    type: String,
    required: true,
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  status: {
    type: String,
    enum: ['RUNNING', 'SUCCESS', 'FAILED'],
    default: 'RUNNING',
  },
  error: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number, // milliseconds
    default: 0,
  },
  validationStatus: {
    type: String,
    default: 'UNVALIDATED',
  },
}, {
  timestamps: true,
});

executionStepSchema.index({ executionId: 1, stepId: 1 }, { unique: true });

export const ExecutionStep = mongoose.model('ExecutionStep', executionStepSchema);
export default ExecutionStep;
