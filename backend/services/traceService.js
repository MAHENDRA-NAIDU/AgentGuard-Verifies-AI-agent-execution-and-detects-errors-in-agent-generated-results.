import ExecutionStep from '../models/ExecutionStep.js';
import Execution from '../models/Execution.js';
import logger from '../utils/logger.js';

/**
 * Create initial running trace step record in MongoDB
 */
export async function createTraceStep({ executionId, stepId, tool, input }) {
  try {
    const startTime = new Date();
    const trace = await ExecutionStep.create({
      executionId,
      stepId,
      tool,
      input,
      status: 'RUNNING',
      startTime,
      timestamp: startTime,
    });

    // Increment step count on parent Execution document
    await Execution.findOneAndUpdate(
      { executionId },
      { $inc: { stepCount: 1 } }
    );

    logger.trace(`Step ${stepId} [${tool}] started for execution ${executionId}`);
    return trace;
  } catch (err) {
    logger.error(`Failed to create trace step ${stepId}:`, err.message);
    return null;
  }
}

/**
 * Finalize trace step record in MongoDB with output/error and duration
 */
export async function updateTraceStep({ executionId, stepId, output, status, error = null, startTime }) {
  try {
    const endTime = new Date();
    const duration = startTime ? (endTime.getTime() - new Date(startTime).getTime()) : 0;

    const updated = await ExecutionStep.findOneAndUpdate(
      { executionId, stepId },
      {
        output,
        status,
        error,
        endTime,
        duration,
      },
      { new: true }
    );

    logger.trace(`Step ${stepId} [${status}] completed in ${duration}ms for execution ${executionId}`);
    return updated;
  } catch (err) {
    logger.error(`Failed to update trace step ${stepId}:`, err.message);
    return null;
  }
}

/**
 * Retrieve full execution steps trace
 */
export async function getExecutionSteps(executionId) {
  return ExecutionStep.find({ executionId }).sort({ stepId: 1 }).lean();
}

export default {
  createTraceStep,
  updateTraceStep,
  getExecutionSteps,
};
