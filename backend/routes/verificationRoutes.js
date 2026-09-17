import express from 'express';
import {
  getVerification,
  reverifyExecution,
} from '../controllers/verificationController.js';

const router = express.Router();

router.get('/:executionId/verification', getVerification);
router.post('/:executionId/reverify', reverifyExecution);

export default router;
