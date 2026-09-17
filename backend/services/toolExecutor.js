import { getToolHandler, isToolRegistered, validateToolParams } from '../tools/toolRegistry.js';
import { createTraceStep, updateTraceStep } from './traceService.js';
import logger from '../utils/logger.js';

/**
 * Universal Tool Execution Wrapper with automated tracing and real-time Socket.IO emission
 */
export async function executeControlledTool({ executionId, stepId, toolName, input = {}, io = null }) {
  const startTime = new Date();

  // 1. Initial tool registration check
  if (!isToolRegistered(toolName)) {
    const errorMsg = `Tool "${toolName}" is not registered or allowed in AgentGuard`;
    logger.error(errorMsg);

    await createTraceStep({ executionId, stepId, tool: toolName, input });
    await updateTraceStep({
      executionId,
      stepId,
      output: null,
      status: 'FAILED',
      error: errorMsg,
      startTime,
    });

    if (io) {
      io.to(executionId).emit('agent:step-error', {
        executionId,
        stepId,
        tool: toolName,
        error: errorMsg,
        duration: 0,
        status: 'FAILED',
      });
    }

    return {
      success: false,
      error: errorMsg,
    };
  }

  // 2. Validate tool parameters
  const validation = validateToolParams(toolName, input);
  if (!validation.valid) {
    logger.error(`Validation failed for tool ${toolName}: ${validation.error}`);

    await createTraceStep({ executionId, stepId, tool: toolName, input });
    await updateTraceStep({
      executionId,
      stepId,
      output: null,
      status: 'FAILED',
      error: validation.error,
      startTime,
    });

    if (io) {
      io.to(executionId).emit('agent:step-error', {
        executionId,
        stepId,
        tool: toolName,
        input,
        error: validation.error,
        duration: 0,
        status: 'FAILED',
      });
    }

    return {
      success: false,
      error: validation.error,
    };
  }

  // 3. Create trace step in DB and broadcast step-start
  await createTraceStep({ executionId, stepId, tool: toolName, input });

  if (io) {
    io.to(executionId).emit('agent:step-start', {
      executionId,
      stepId,
      tool: toolName,
      input,
      status: 'RUNNING',
      startTime,
    });
  }

  // 4. Execute tool
  try {
    const handler = getToolHandler(toolName);
    const result = await handler(input);

    const isSuccess = result?.success !== false;
    const finalStatus = isSuccess ? 'SUCCESS' : 'FAILED';
    const errorDetail = isSuccess ? null : (result?.error || 'Tool execution reported failure');

    const updatedStep = await updateTraceStep({
      executionId,
      stepId,
      output: result,
      status: finalStatus,
      error: errorDetail,
      startTime,
    });

    const duration = updatedStep?.duration || (Date.now() - startTime.getTime());

    // 5. Emit completion event
    if (io) {
      if (isSuccess) {
        io.to(executionId).emit('agent:step-complete', {
          executionId,
          stepId,
          tool: toolName,
          input,
          output: result,
          status: 'SUCCESS',
          duration,
        });
      } else {
        io.to(executionId).emit('agent:step-error', {
          executionId,
          stepId,
          tool: toolName,
          input,
          error: errorDetail,
          status: 'FAILED',
          duration,
        });
      }
    }

    return result;
  } catch (err) {
    logger.error(`Exception during tool execution [${toolName}]:`, err.message);

    const updatedStep = await updateTraceStep({
      executionId,
      stepId,
      output: null,
      status: 'FAILED',
      error: err.message,
      startTime,
    });

    const duration = updatedStep?.duration || (Date.now() - startTime.getTime());

    if (io) {
      io.to(executionId).emit('agent:step-error', {
        executionId,
        stepId,
        tool: toolName,
        input,
        error: err.message,
        status: 'FAILED',
        duration,
      });
    }

    return {
      success: false,
      error: `Tool execution exception: ${err.message}`,
    };
  }
}

export default {
  executeControlledTool,
};
