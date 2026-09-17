import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Start agent execution for a task
 */
export async function runAgent(task, executionId = null, testOptions = {}) {
  const res = await api.post('/agent/run', {
    task,
    executionId,
    testOptions,
  });
  return res.data;
}

/**
 * Get all executions with filtering & search
 */
export async function getExecutions({ status = 'ALL', verification = 'ALL', search = '', limit = 50, page = 1 } = {}) {
  const res = await api.get('/executions', {
    params: { status, verification, search, limit, page },
  });
  return res.data;
}

/**
 * Get single execution details
 */
export async function getExecution(executionId) {
  const res = await api.get(`/executions/${executionId}`);
  return res.data;
}

/**
 * Get trace steps for an execution
 */
export async function getExecutionSteps(executionId) {
  const res = await api.get(`/executions/${executionId}/steps`);
  return res.data;
}

/**
 * Get verification report for an execution
 */
export async function getVerification(executionId) {
  const res = await api.get(`/executions/${executionId}/verification`);
  return res.data;
}

/**
 * Re-run verification on an execution
 */
export async function reverifyExecution(executionId) {
  const res = await api.post(`/executions/${executionId}/reverify`);
  return res.data;
}

/**
 * Backend health check
 */
export async function getBackendHealth() {
  const res = await api.get('/health');
  return res.data;
}

/**
 * Ollama health and model check
 */
export async function getOllamaHealth() {
  const res = await api.get('/ollama/health');
  return res.data;
}

export default {
  runAgent,
  getExecutions,
  getExecution,
  getExecutionSteps,
  getVerification,
  reverifyExecution,
  getBackendHealth,
  getOllamaHealth,
};
