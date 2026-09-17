import mongoose from 'mongoose';

const verificationErrorSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'MISSING_STEP',
      'WRONG_TOOL',
      'TOOL_EXECUTION_FAILURE',
      'INCORRECT_RESULT',
      'INVALID_PARAMETER',
      'FALSE_SUCCESS',
      'PARTIAL_COMPLETION',
      'CONSTRAINT_VIOLATION',
      'AGENT_LOOP_LIMIT',
      'UNEXPECTED_ERROR',
    ],
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
  },
  stepId: {
    type: Number,
    default: null,
  },
  tool: {
    type: String,
    default: null,
  },
  expected: {
    type: String,
    default: '',
  },
  actual: {
    type: String,
    default: '',
  },
  explanation: {
    type: String,
    required: true,
  },
  recommendation: {
    type: String,
    required: true,
  },
}, { _id: false });

const verificationReportSchema = new mongoose.Schema({
  executionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  taskId: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    required: true,
  },
  status: {
    type: String,
    enum: ['VERIFIED', 'FAILED', 'PARTIAL'],
    required: true,
  },
  score: {
    type: Number, // 0 - 100
    required: true,
  },
  totalSteps: {
    type: Number,
    default: 0,
  },
  successfulSteps: {
    type: Number,
    default: 0,
  },
  failedSteps: {
    type: Number,
    default: 0,
  },
  errorCount: {
    type: Number,
    default: 0,
  },
  errors: [verificationErrorSchema],
  recommendations: [{
    type: String,
  }],
  summary: {
    type: String,
    default: '',
  },
  aiVerification: {
    enabled: { type: Boolean, default: false },
    explanation: { type: String, default: null },
    rawOutput: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  suppressReservedKeysWarning: true,
});

export const VerificationReport = mongoose.model('VerificationReport', verificationReportSchema);
export default VerificationReport;
