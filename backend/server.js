import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

import { connectDB } from './config/db.js';
import { checkOllamaHealth } from './services/ollamaService.js';
import { ensureWorkspace } from './tools/fileReaderTool.js';
import healthRoutes from './routes/healthRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import executionRoutes from './routes/executionRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/executions', verificationRoutes);

// Error handling middleware
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.system(`Socket client connected: ${socket.id}`);

  socket.on('join:execution', (executionId) => {
    if (executionId) {
      socket.join(executionId);
      logger.system(`Client ${socket.id} joined execution room: ${executionId}`);
    }
  });

  socket.on('leave:execution', (executionId) => {
    if (executionId) {
      socket.leave(executionId);
      logger.system(`Client ${socket.id} left execution room: ${executionId}`);
    }
  });

  socket.on('disconnect', () => {
    logger.system(`Socket client disconnected: ${socket.id}`);
  });
});

/**
 * Seed initial demo records in MongoDB if not present
 */
async function seedDemoData() {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const studentsCol = db.collection('students');
    const studentCount = await studentsCol.countDocuments();
    if (studentCount === 0) {
      await studentsCol.insertMany([
        { id: 101, name: 'Alice Smith', department: 'CSE', gpa: 3.9, status: 'Active' },
        { id: 102, name: 'Bob Johnson', department: 'CSE', gpa: 3.7, status: 'Active' },
        { id: 103, name: 'Charlie Lee', department: 'ECE', gpa: 3.5, status: 'Active' },
        { id: 104, name: 'Diana Prince', department: 'CSE', gpa: 4.0, status: 'Active' },
        { id: 105, name: 'Evan Wright', department: 'ME', gpa: 3.2, status: 'Graduated' },
      ]);
      logger.system('Seeded sample demo data into "students" collection');
    }
  } catch (err) {
    logger.warn('Sample data seeding skipped:', err.message);
  }
}

// Server Startup Sequence
async function startServer() {
  console.log('\n=============================================');
  console.log('       AGENTGUARD BACKEND INITIALIZATION     ');
  console.log('=============================================');

  // 1. Connect MongoDB
  const mongoConnected = await connectDB();

  // 2. Ensure sandbox workspace exists
  await ensureWorkspace();

  // 3. Check Ollama connection
  const ollamaStatus = await checkOllamaHealth();

  // 4. Seed demo data
  if (mongoConnected) {
    await seedDemoData();
  }

  // 5. Start listening
  server.listen(PORT, () => {
    console.log('---------------------------------------------');
    console.log(` AgentGuard Server : http://localhost:${PORT}`);
    console.log(` MongoDB Status    : ${mongoConnected ? 'Connected' : 'Failed'}`);
    console.log(` Ollama Status     : ${ollamaStatus.connected ? 'Connected' : 'Disconnected'}`);
    console.log(` Ollama Model      : ${ollamaStatus.configuredModel} ${ollamaStatus.modelAvailable ? '(Available)' : '(Not Found)'}`);
    console.log('=============================================\n');
  });
}

startServer();
