import VerificationReport from '../models/VerificationReport.js';
import Execution from '../models/Execution.js';
import ExecutionStep from '../models/ExecutionStep.js';
import { runVerificationEngine } from '../services/verificationService.js';

/**
 * Get verification report for an execution
 */
export async function getVerification(req, res, next) {
  try {
    const { executionId } = req.params;

    const report = await VerificationReport.findOne({ executionId }).lean();
    if (!report) {
      return res.status(404).json({
        success: false,
        error: `Verification report for execution "${executionId}" not found`,
      });
    }

    return res.json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Re-run verification engine on existing execution traces
 */
export async function reverifyExecution(req, res, next) {
  try {
    const { executionId } = req.params;

    const execution = await Execution.findOne({ executionId });
    if (!execution) {
      return res.status(404).json({
        success: false,
        error: `Execution "${executionId}" not found`,
      });
    }

    const steps = await ExecutionStep.find({ executionId }).sort({ stepId: 1 }).lean();
    const io = req.app.get('io');

    const report = await runVerificationEngine({
      executionId,
      taskId: execution.taskId,
      taskText: execution.taskText,
      steps,
      finalResponse: execution.finalResponse,
      io,
    });

    return res.json({
      success: true,
      message: 'Verification re-evaluated successfully',
      report,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getVerification,
  reverifyExecution,
};
