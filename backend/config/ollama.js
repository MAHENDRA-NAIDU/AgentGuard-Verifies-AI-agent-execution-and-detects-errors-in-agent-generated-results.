export const ollamaConfig = {
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'qwen2.5:7b',
  timeout: 120000, // 2 minutes timeout for model responses
};

export default ollamaConfig;
