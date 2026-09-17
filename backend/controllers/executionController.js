import Execution from '../models/Execution.js';
import ExecutionStep from '../models/ExecutionStep.js';
import VerificationReport from '../models/VerificationReport.js';

/**
 * Get all executions with filtering and search
 */
export async function getExecutions(req, res, next) {
  try {
    const { status, verification, search, limit = 50, page = 1 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    if (verification && verification !== 'ALL') {
      query.verificationStatus = verification.toUpperCase();
    }

    if (search && search.trim() !== '') {
      query.taskText = { $regex: search.trim(), $options: 'i' };
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [executions, total] = await Promise.all([
      Execution.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Execution.countDocuments(query),
    ]);

    // Attach verification score if exists
    const executionIds = executions.map((e) => e.executionId);
    const reports = await VerificationReport.find({ executionId: { $in: executionIds } }).lean();
    const reportMap = new Map(reports.map((r) => [r.executionId, r]));

    const enriched = executions.map((e) => {
      const report = reportMap.get(e.executionId);
      return {
        ...e,
        verificationScore: report?.score ?? null,
        errorCount: report?.errorCount ?? 0,
      };
    });

    return res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      limit: safeLimit,
      executions: enriched,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get full execution details by ID
 */
export async function getExecution(req, res, next) {
  try {
    const { executionId } = req.params;

    const execution = await Execution.findOne({ executionId }).lean();
    if (!execution) {
      return res.status(404).json({
        success: false,
        error: `Execution with ID "${executionId}" not found`,
      });
    }

    const [steps, verificationReport] = await Promise.all([
      ExecutionStep.find({ executionId }).sort({ stepId: 1 }).lean(),
      VerificationReport.findOne({ executionId }).lean(),
    ]);

    return res.json({
      success: true,
      execution: {
        ...execution,
        steps,
        verificationReport,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get trace steps for an execution
 */
export async function getExecutionSteps(req, res, next) {
  try {
    const { executionId } = req.params;

    const steps = await ExecutionStep.find({ executionId }).sort({ stepId: 1 }).lean();
    return res.json({
      success: true,
      executionId,
      stepCount: steps.length,
      steps,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getExecutions,
  getExecution,
  getExecutionSteps,
};
