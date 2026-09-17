import express from 'express';
import mongoose from 'mongoose';
import { checkOllamaHealth } from '../services/ollamaService.js';

const router = express.Router();

router.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoStatus,
      nodeVersion: process.version,
    },
  });
});

router.get('/ollama/health', async (req, res) => {
  const health = await checkOllamaHealth();
  res.json(health);
});

export default router;
