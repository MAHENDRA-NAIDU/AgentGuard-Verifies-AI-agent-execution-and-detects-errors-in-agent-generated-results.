import { v4 as uuidv4 } from 'uuid';
import Task from '../models/Task.js';
import Execution from '../models/Execution.js';
import ExecutionStep from '../models/ExecutionStep.js';
import { getAllToolSchemas } from '../tools/toolRegistry.js';
import { sendChat } from './ollamaService.js';
import { executeControlledTool } from './toolExecutor.js';
import { createTraceStep, updateTraceStep } from './traceService.js';
import { runVerificationEngine } from './verificationService.js';
import logger from '../utils/logger.js';

const SYSTEM_PROMPT = `You are the AgentGuard task execution agent.
Your job is to complete the user's task using only the available controlled tools.
Never invent tool results.
Never claim a tool succeeded if the tool returned an error.
Use tools only when necessary.
After receiving a tool result, determine the next required action.
Continue until the task is completed.
Return a final concise summary after completion.`;

const MAX_STEPS = parseInt(process.env.MAX_AGENT_STEPS || '10', 10);

/**
 * Execute the autonomous AI agent loop for a user task
 */
export async function runAgentTask({ taskText, io = null, executionId = null, testOptions = {} }) {
  const finalExecutionId = executionId || uuidv4();
  const taskId = uuidv4();
  const startTime = new Date();

  logger.agent(`Starting task execution ${finalExecutionId}: "${taskText}"`);

  // 1. Create Task and Execution records
  await Task.create({
    taskId,
    taskText,
  });

  const execution = await Execution.create({
    executionId: finalExecutionId,
    taskId,
    taskText,
    status: 'RUNNING',
    startedAt: startTime,
  });

  if (io) {
    io.to(finalExecutionId).emit('agent:started', {
      executionId: finalExecutionId,
      taskId,
      taskText,
      startedAt: startTime,
    });
  }

  // 2. Prepare message history and tools
  const tools = getAllToolSchemas();
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: taskText },
  ];

  let stepId = 0;
  let isComplete = false;
  let finalResponse = '';
  let executionError = null;

  try {
    while (!isComplete && stepId < MAX_STEPS) {
      if (io) {
        io.to(finalExecutionId).emit('agent:thinking', {
          executionId: finalExecutionId,
          stepNumber: stepId + 1,
        });
      }

      logger.ollama(`Agent loop step ${stepId + 1}: querying Ollama...`);

      // Special presentation demo flag: force wrong calculation output if requested in testOptions
      let response;
      if (testOptions.forceWrongCalculation && stepId === 0) {
        response = {
          success: true,
          message: {
            role: 'assistant',
            tool_calls: [{
              function: {
                name: 'calculator',
                arguments: { expression: '50 * 20' },
              },
            }],
          },
          toolCalls: [{
            function: {
              name: 'calculator',
              arguments: { expression: '50 * 20' },
            },
          }],
        };
      } else {
        response = await sendChat({ messages, tools });
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to receive response from Ollama');
      }

      const assistantMessage = response.message;
      const toolCalls = response.toolCalls || [];

      // If the model requested tools
      if (toolCalls.length > 0) {
        messages.push(assistantMessage);

        for (const call of toolCalls) {
          stepId++;
          if (stepId > MAX_STEPS) {
            throw new Error(`Max agent step limit (${MAX_STEPS}) exceeded`);
          }

          const toolName = call.function?.name;
          let toolArgs = call.function?.arguments;

          // Parse arguments if string
          if (typeof toolArgs === 'string') {
            try {
              toolArgs = JSON.parse(toolArgs);
            } catch (pErr) {
              logger.warn(`Failed to parse tool arguments as JSON: ${toolArgs}`);
              toolArgs = {};
            }
          }

          logger.agent(`Executing tool call [Step ${stepId}]: ${toolName}`, toolArgs);

          // Handle test scenario overrides for college presentation demos
          let toolResult;
          if (testOptions.forceWrongCalculation && toolName === 'calculator') {
            // Intentionally record corrupted output for testing INCORRECT_RESULT rule
            await createTraceStep({ executionId: finalExecutionId, stepId, tool: toolName, input: toolArgs });
            toolResult = { success: true, expression: toolArgs.expression, result: 500 };
            await updateTraceStep({
              executionId: finalExecutionId,
              stepId,
              output: toolResult,
              status: 'SUCCESS',
              error: null,
              startTime: new Date(),
            });
            if (io) {
              io.to(finalExecutionId).emit('agent:step-complete', {
                executionId: finalExecutionId,
                stepId,
                tool: toolName,
                input: toolArgs,
                output: toolResult,
                status: 'SUCCESS',
                duration: 45,
              });
            }
          } else if (testOptions.forceFileWriterFailure && toolName === 'file_writer') {
            // Intentionally simulate file write error for testing TOOL_EXECUTION_FAILURE rule
            await createTraceStep({ executionId: finalExecutionId, stepId, tool: toolName, input: toolArgs });
            toolResult = { success: false, error: 'EACCES: permission denied, open "/protected/system.txt"' };
            await updateTraceStep({
              executionId: finalExecutionId,
              stepId,
              output: null,
              status: 'FAILED',
              error: toolResult.error,
              startTime: new Date(),
            });
            if (io) {
              io.to(finalExecutionId).emit('agent:step-error', {
                executionId: finalExecutionId,
                stepId,
                tool: toolName,
                input: toolArgs,
                error: toolResult.error,
                status: 'FAILED',
                duration: 35,
              });
            }
          } else {
            toolResult = await executeControlledTool({
              executionId: finalExecutionId,
              stepId,
              toolName,
              input: toolArgs,
              io,
            });
          }

          // Feed tool response back into conversation history
          messages.push({
            role: 'tool',
            content: JSON.stringify(toolResult),
            name: toolName,
          });
        }
      } else {
        // No more tool calls - agent finished reasoning and provided final text
        finalResponse = response.content || assistantMessage?.content || 'Task completed.';
        isComplete = true;
        logger.agent(`Agent reached completion: "${finalResponse.slice(0, 100)}..."`);
      }
    }

    if (stepId >= MAX_STEPS && !isComplete) {
      executionError = `Agent exceeded maximum safety step limit (${MAX_STEPS} steps)`;
      logger.warn(executionError);
    }
  } catch (err) {
    logger.error(`Error in agent execution loop:`, err.message);
    executionError = err.message;
  }

  const completedAt = new Date();
  const totalDuration = completedAt.getTime() - startTime.getTime();
  const finalStatus = executionError ? 'FAILED' : 'COMPLETED';

  // 3. Update Execution record
  await Execution.findOneAndUpdate(
    { executionId: finalExecutionId },
    {
      status: finalStatus,
      completedAt,
      totalDuration,
      finalResponse,
      error: executionError,
    }
  );

  // 4. Retrieve all recorded trace steps
  const steps = await ExecutionStep.find({ executionId: finalExecutionId }).sort({ stepId: 1 }).lean();

  // 5. Run Verification Engine
  const verificationReport = await runVerificationEngine({
    executionId: finalExecutionId,
    taskId,
    taskText,
    steps,
    finalResponse,
    io,
  });

  // 6. Broadcast completion or failure
  if (io) {
    if (finalStatus === 'COMPLETED') {
      io.to(finalExecutionId).emit('agent:completed', {
        executionId: finalExecutionId,
        taskId,
        finalResponse,
        totalDuration,
        stepCount: steps.length,
        verificationStatus: verificationReport.status,
        verificationScore: verificationReport.score,
      });
    } else {
      io.to(finalExecutionId).emit('agent:failed', {
        executionId: finalExecutionId,
        taskId,
        error: executionError,
        totalDuration,
        verificationStatus: verificationReport.status,
      });
    }
  }

  return {
    executionId: finalExecutionId,
    taskId,
    status: finalStatus,
    totalDuration,
    steps,
    finalResponse,
    verificationReport,
    error: executionError,
  };
}

export default {
  runAgentTask,
};
