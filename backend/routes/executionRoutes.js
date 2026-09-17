import express from 'express';
import {
  getExecutions,
  getExecution,
  getExecutionSteps,
} from '../controllers/executionController.js';

const router = express.Router();

router.get('/', getExecutions);
router.get('/:executionId', getExecution);
router.get('/:executionId/steps', getExecutionSteps);

export default router;
