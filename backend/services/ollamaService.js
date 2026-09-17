import axios from 'axios';
import ollamaConfig from '../config/ollama.js';
import logger from '../utils/logger.js';

const client = axios.create({
  baseURL: ollamaConfig.baseUrl,
  timeout: ollamaConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Health check: verify Ollama is running and check if the configured model is available
 */
export async function checkOllamaHealth() {
  try {
    const res = await client.get('/api/tags', { timeout: 4000 });
    const models = res.data?.models || [];
    const modelNames = models.map((m) => m.name);
    
    // Check if configured model or compatible match exists
    const configuredModel = ollamaConfig.model;
    const modelFound = modelNames.some(
      (name) => name === configuredModel || name.startsWith(configuredModel.split(':')[0])
    );

    return {
      connected: true,
      baseUrl: ollamaConfig.baseUrl,
      configuredModel,
      modelAvailable: modelFound,
      availableModels: modelNames,
    };
  } catch (err) {
    logger.warn(`Ollama health check failed: ${err.message}`);
    return {
      connected: false,
      baseUrl: ollamaConfig.baseUrl,
      configuredModel: ollamaConfig.model,
      modelAvailable: false,
      availableModels: [],
      error: err.message,
    };
  }
}

/**
 * Send chat message history to Ollama local LLM with tool definitions
 */
export async function sendChat({ messages, tools = [], model = null }) {
  const targetModel = model || ollamaConfig.model;
  
  const payload = {
    model: targetModel,
    messages,
    stream: false,
    options: {
      temperature: 0.1, // Low temperature for deterministic tool calling
    },
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  logger.ollama(`Sending request to model "${targetModel}" with ${messages.length} messages and ${tools?.length || 0} tools`);

  try {
    const response = await client.post('/api/chat', payload);
    const message = response.data?.message;

    if (!message) {
      throw new Error('Empty or invalid response received from Ollama');
    }

    logger.ollama(`Received response from "${targetModel}"`);
    return {
      success: true,
      message,
      toolCalls: message.tool_calls || [],
      content: message.content || '',
    };
  } catch (err) {
    logger.error(`Ollama chat request failed:`, err.response?.data?.error || err.message);
    return {
      success: false,
      error: err.response?.data?.error || err.message,
      message: null,
      toolCalls: [],
      content: '',
    };
  }
}

export default {
  checkOllamaHealth,
  sendChat,
};
