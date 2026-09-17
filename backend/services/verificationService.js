import { evaluate } from 'mathjs';
import VerificationReport from '../models/VerificationReport.js';
import Execution from '../models/Execution.js';
import { sendChat } from './ollamaService.js';
import logger from '../utils/logger.js';

/**
 * Deterministic Rule-Based & Hybrid Verification Engine
 */
export async function runVerificationEngine({ executionId, taskId, taskText, steps = [], finalResponse = '', io = null }) {
  logger.verifier(`Starting verification for execution: ${executionId}`);

  if (io) {
    io.to(executionId).emit('agent:verification-started', { executionId });
  }

  const errors = [];
  const recommendations = [];
  const taskLower = taskText.toLowerCase();

  const totalSteps = steps.length;
  const successfulSteps = steps.filter((s) => s.status === 'SUCCESS').length;
  const failedSteps = steps.filter((s) => s.status === 'FAILED').length;

  // -------------------------------------------------------------
  // RULE 3: Tool Execution Failure
  // -------------------------------------------------------------
  for (const step of steps) {
    if (step.status === 'FAILED') {
      errors.push({
        type: 'TOOL_EXECUTION_FAILURE',
        severity: 'HIGH',
        stepId: step.stepId,
        tool: step.tool,
        expected: 'Successful tool execution with valid output',
        actual: `Failed: ${step.error || 'Execution returned false'}`,
        explanation: `Tool "${step.tool}" at Step ${step.stepId} failed to execute properly.`,
        recommendation: `Check parameters for tool "${step.tool}" and verify resource permissions.`,
      });
    }
  }

  // -------------------------------------------------------------
  // RULE 5: Parameter Validation
  // -------------------------------------------------------------
  for (const step of steps) {
    if (step.tool === 'file_writer') {
      const filename = step.input?.filename;
      const content = step.input?.content;
      if (!filename || filename.trim() === '') {
        errors.push({
          type: 'INVALID_PARAMETER',
          severity: 'HIGH',
          stepId: step.stepId,
          tool: step.tool,
          expected: 'Valid target filename parameter (e.g., "result.txt")',
          actual: 'Missing or empty filename',
          explanation: `Step ${step.stepId} (file_writer) was invoked without a valid target filename.`,
          recommendation: 'Ensure the agent extracts and provides the target file path in the tool call.',
        });
      }
      if (content === undefined || content === null || content === '') {
        errors.push({
          type: 'INVALID_PARAMETER',
          severity: 'MEDIUM',
          stepId: step.stepId,
          tool: step.tool,
          expected: 'Non-empty content payload to write',
          actual: 'Empty content',
          explanation: `Step ${step.stepId} (file_writer) attempted to write empty or undefined content.`,
          recommendation: 'Verify the data payload before calling file_writer.',
        });
      }
    } else if (step.tool === 'calculator') {
      const expression = step.input?.expression;
      if (!expression || expression.trim() === '') {
        errors.push({
          type: 'INVALID_PARAMETER',
          severity: 'HIGH',
          stepId: step.stepId,
          tool: step.tool,
          expected: 'Mathematical expression string',
          actual: 'Missing expression',
          explanation: `Step ${step.stepId} (calculator) was called without an expression.`,
          recommendation: 'Provide a valid mathematical expression string (e.g., "50 * 20").',
        });
      }
    }
  }

  // -------------------------------------------------------------
  // RULE 4: Result Validation (Independent Math & Content Verification)
  // -------------------------------------------------------------
  for (const step of steps) {
    if (step.tool === 'calculator' && step.status === 'SUCCESS' && step.input?.expression) {
      try {
        const expectedMath = evaluate(step.input.expression);
        const actualMath = step.output?.result;

        if (Number(actualMath) !== Number(expectedMath)) {
          errors.push({
            type: 'INCORRECT_RESULT',
            severity: 'HIGH',
            stepId: step.stepId,
            tool: step.tool,
            expected: String(expectedMath),
            actual: String(actualMath),
            explanation: `Calculation for expression "${step.input.expression}" produced ${actualMath}, but verified mathematical value is ${expectedMath}.`,
            recommendation: 'Validate arithmetic evaluation and prevent output corruption in agent context.',
          });
        }
      } catch (err) {
        // Expression couldn't be independently evaluated
      }
    }
  }

  // -------------------------------------------------------------
  // RULE 1 & RULE 7: Required Step & Partial Completion Check
  // -------------------------------------------------------------
  const mentionsCalculation = /calculate|multiply|\*|\+|divide|\/|sum|total|\d+\s*[x×*+\-\/]\s*\d+/i.test(taskText);
  const mentionsFileWriting = /save|write|create file|into file|in [a-zA-Z0-9_\-\.]+\.(txt|json|md|csv)/i.test(taskText);
  const mentionsFileReading = /read|check file|inspect file|contents of/i.test(taskText);
  const mentionsDbQuery = /database|query|students|collection|records|find/i.test(taskText);

  const usedTools = steps.map((s) => s.tool);
  const hasCalculator = usedTools.includes('calculator');
  const hasFileWriter = usedTools.includes('file_writer');
  const hasFileReader = usedTools.includes('file_reader');
  const hasDbQuery = usedTools.includes('database_query');

  if (mentionsCalculation && mentionsFileWriting) {
    if (!hasCalculator && !hasFileWriter) {
      errors.push({
        type: 'MISSING_STEP',
        severity: 'CRITICAL',
        stepId: null,
        tool: null,
        expected: 'Calculator tool execution followed by File Writer tool execution',
        actual: 'No relevant tools were executed',
        explanation: 'The task requires performing a calculation and saving the output to a file, but neither tool was called.',
        recommendation: 'Ensure agent decomposes composite tasks into sequential tool invocations.',
      });
    } else if (hasCalculator && !hasFileWriter) {
      errors.push({
        type: 'PARTIAL_COMPLETION',
        severity: 'HIGH',
        stepId: null,
        tool: 'file_writer',
        expected: 'Calculator tool followed by File Writer to save result',
        actual: 'Calculator executed, but file_writer was skipped',
        explanation: 'The calculation succeeded, but the requested file write step was never performed.',
        recommendation: 'Enable multi-turn continuity so the agent finishes remaining actions before completion.',
      });
    } else if (!hasCalculator && hasFileWriter) {
      errors.push({
        type: 'MISSING_STEP',
        severity: 'MEDIUM',
        stepId: null,
        tool: 'calculator',
        expected: 'Precise calculation via calculator tool before saving',
        actual: 'File written directly without verified calculator tool step',
        explanation: 'The agent wrote to the file without using the calculator tool to evaluate the expression.',
        recommendation: 'Prompt the agent to always use the calculator tool for arithmetic instead of hallucinating raw numbers.',
      });
    }
  } else if (mentionsCalculation && !hasCalculator && totalSteps === 0) {
    errors.push({
      type: 'MISSING_STEP',
      severity: 'HIGH',
      stepId: null,
      tool: 'calculator',
      expected: 'Calculator tool execution',
      actual: 'No calculation tool used',
      explanation: 'Calculation was requested but no tool execution occurred.',
      recommendation: 'Direct agent to use the registered calculator tool for computational tasks.',
    });
  } else if (mentionsFileReading && !hasFileReader && !hasFileWriter) {
    errors.push({
      type: 'MISSING_STEP',
      severity: 'MEDIUM',
      stepId: null,
      tool: 'file_reader',
      expected: 'File Reader tool execution',
      actual: 'No file reader step found',
      explanation: 'Task requested reading a file, but file_reader was not executed.',
      recommendation: 'Provide the filename to the file_reader tool.',
    });
  }

  // -------------------------------------------------------------
  // RULE 2: Tool Usage (Wrong Tool Detection)
  // -------------------------------------------------------------
  if (mentionsDbQuery && !hasDbQuery && (hasFileReader || hasFileWriter)) {
    errors.push({
      type: 'WRONG_TOOL',
      severity: 'HIGH',
      stepId: steps[0]?.stepId || 1,
      tool: steps[0]?.tool || 'file_reader',
      expected: 'database_query tool for querying structured records',
      actual: `${steps[0]?.tool} was used instead`,
      explanation: 'A database query was requested, but a filesystem tool was used instead of the database_query tool.',
      recommendation: 'Use database_query when querying structured database collections.',
    });
  }

  // -------------------------------------------------------------
  // RULE 6: False Success Check
  // -------------------------------------------------------------
  const isAgentReportingSuccess = /(successfully|completed|saved|done|calculated|result is|finished)/i.test(finalResponse);
  if (isAgentReportingSuccess && (failedSteps > 0 || errors.some((e) => e.severity === 'HIGH' || e.severity === 'CRITICAL'))) {
    errors.push({
      type: 'FALSE_SUCCESS',
      severity: 'CRITICAL',
      stepId: null,
      tool: null,
      expected: 'Accurate reporting of failures or missing operations',
      actual: 'Agent claimed full success despite failed or missing execution steps',
      explanation: 'The agent response reported successful completion even though one or more execution steps encountered critical errors.',
      recommendation: 'Instruct the agent to inspect tool success statuses before emitting a final success claim.',
    });
  }

  // -------------------------------------------------------------
  // RULE 8: Constraint Violation Check (e.g. file count constraints)
  // -------------------------------------------------------------
  const singleFileConstraint = /only (one|1) file|single file/i.test(taskText);
  const fileWriterSteps = steps.filter((s) => s.tool === 'file_writer');
  if (singleFileConstraint && fileWriterSteps.length > 1) {
    errors.push({
      type: 'CONSTRAINT_VIOLATION',
      severity: 'MEDIUM',
      stepId: fileWriterSteps[1].stepId,
      tool: 'file_writer',
      expected: 'Exactly 1 file write operation',
      actual: `${fileWriterSteps.length} file write operations detected`,
      explanation: `Task explicitly constrained execution to a single file, but ${fileWriterSteps.length} file writes were executed.`,
      recommendation: 'Respect explicit quantity and scope constraints defined in user prompt.',
    });
  }

  // -------------------------------------------------------------
  // AI-Based Verification (Supplementary qualitative analysis)
  // -------------------------------------------------------------
  let aiVerificationResult = null;
  try {
    const traceSummary = steps.map((s) => ({
      stepId: s.stepId,
      tool: s.tool,
      input: s.input,
      output: s.output,
      status: s.status,
    }));

    const verifierPrompt = `You are the AgentGuard Independent AI Verifier.
Evaluate the execution trace against the user's task.
User Task: "${taskText}"
Execution Trace: ${JSON.stringify(traceSummary, null, 2)}
Final Agent Response: "${finalResponse}"

Evaluate whether the agent completed the task correctly and safely.
Return ONLY valid JSON matching this schema:
{
  "verified": boolean,
  "confidenceScore": number (0-100),
  "conciseExplanation": "1-2 sentence assessment",
  "recommendations": ["1-2 actionable tips"]
}`;

    const aiRes = await sendChat({
      messages: [{ role: 'user', content: verifierPrompt }],
      tools: [],
    });

    if (aiRes.success && aiRes.content) {
      try {
        const jsonMatch = aiRes.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiVerificationResult = JSON.parse(jsonMatch[0]);
        }
      } catch (parseErr) {
        logger.warn('Failed to parse AI verifier response JSON:', parseErr.message);
      }
    }
  } catch (aiErr) {
    logger.warn('AI Verification skipped or failed:', aiErr.message);
  }

  // If AI verifier flagged an issue that was not caught by deterministic rules
  if (aiVerificationResult && aiVerificationResult.verified === false) {
    errors.push({
      type: 'INCORRECT_RESULT',
      severity: 'HIGH',
      stepId: steps[steps.length - 1]?.stepId || null,
      tool: steps[steps.length - 1]?.tool || null,
      expected: 'Accurate execution matching task intent',
      actual: aiVerificationResult.conciseExplanation || 'Verification model flagged semantic discrepancy',
      explanation: aiVerificationResult.conciseExplanation || 'Independent AI verifier identified semantic discrepancy in task fulfillment.',
      recommendation: aiVerificationResult.recommendations?.[0] || 'Review agent tool execution sequence against task requirements.',
    });
  }

  // Deduplicate errors by type and stepId
  const uniqueErrors = [];
  const seenErrorKeys = new Set();
  for (const err of errors) {
    const key = `${err.type}-${err.stepId || 'all'}-${err.tool || 'none'}`;
    if (!seenErrorKeys.has(key)) {
      seenErrorKeys.add(key);
      uniqueErrors.push(err);
      if (err.recommendation && !recommendations.includes(err.recommendation)) {
        recommendations.push(err.recommendation);
      }
    }
  }

  if (aiVerificationResult?.recommendations) {
    for (const rec of aiVerificationResult.recommendations) {
      if (!recommendations.includes(rec)) {
        recommendations.push(rec);
      }
    }
  }

  // Compute Verification Score
  let score = 100;
  for (const err of uniqueErrors) {
    switch (err.severity) {
      case 'CRITICAL':
        score -= 40;
        break;
      case 'HIGH':
        score -= 25;
        break;
      case 'MEDIUM':
        score -= 15;
        break;
      case 'LOW':
        score -= 5;
        break;
    }
  }

  if (aiVerificationResult?.confidenceScore !== undefined && typeof aiVerificationResult.confidenceScore === 'number') {
    if (uniqueErrors.length > 0) {
      score = Math.min(score, aiVerificationResult.confidenceScore);
    }
  }
  score = Math.max(0, Math.min(100, score));

  const isVerified = uniqueErrors.length === 0 && (totalSteps > 0 || !mentionsCalculation) && (!aiVerificationResult || aiVerificationResult.verified !== false);
  const status = isVerified ? 'VERIFIED' : (score > 40 && successfulSteps > 0 ? 'PARTIAL' : 'FAILED');

  const summary = isVerified
    ? 'Execution completed and verified successfully with zero detected anomalies.'
    : `Verification detected ${uniqueErrors.length} execution issue(s). System achieved a verification confidence score of ${score}%.`;

  // Persist Verification Report in MongoDB
  const report = await VerificationReport.findOneAndUpdate(
    { executionId },
    {
      executionId,
      taskId,
      verified: isVerified,
      status,
      score,
      totalSteps,
      successfulSteps,
      failedSteps,
      errorCount: uniqueErrors.length,
      errors: uniqueErrors,
      recommendations,
      summary,
      aiVerification: {
        enabled: Boolean(aiVerificationResult),
        explanation: aiVerificationResult?.conciseExplanation || null,
        rawOutput: aiVerificationResult,
      },
    },
    { upsert: true, new: true }
  );

  // Update Execution document status
  await Execution.findOneAndUpdate(
    { executionId },
    { verificationStatus: status }
  );

  logger.verifier(`Verification finished for ${executionId}: Status = ${status}, Score = ${score}%`);

  if (io) {
    io.to(executionId).emit('agent:verification-complete', {
      executionId,
      report,
    });
  }

  return report;
}

export default {
  runVerificationEngine,
};
