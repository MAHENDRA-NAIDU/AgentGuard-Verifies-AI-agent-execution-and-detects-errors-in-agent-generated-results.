import { v4 as uuidv4 } from 'uuid';
import { runAgentTask } from '../services/agentService.js';
import logger from '../utils/logger.js';

export async function runAgent(req, res, next) {
  try {
    const { task, testOptions } = req.body;

    if (!task || typeof task !== 'string' || task.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid "task" string in the request body.',
      });
    }

    const executionId = req.body.executionId || uuidv4();
    const io = req.app.get('io');

    logger.agent(`API received run task: "${task.trim()}" (ExecutionId: ${executionId})`);

    // Run agent task in background so HTTP response is fast, while Socket.IO streams live progress
    runAgentTask({
      taskText: task.trim(),
      io,
      executionId,
      testOptions: testOptions || {},
    }).catch((err) => {
      logger.error(`Background task execution failed:`, err.message);
    });

    return res.status(202).json({
      success: true,
      message: 'Agent execution initiated',
      executionId,
      task: task.trim(),
    });
  } catch (error) {
    next(error);
  }
}

export default {
  runAgent,
};
