import { executeCalculator, calculatorSchema } from './calculatorTool.js';
import { executeFileReader, fileReaderSchema } from './fileReaderTool.js';
import { executeFileWriter, fileWriterSchema } from './fileWriterTool.js';
import { executeDatabaseQuery, databaseSchema } from './databaseTool.js';

export const TOOL_REGISTRY = {
  calculator: {
    name: 'calculator',
    schema: calculatorSchema,
    handler: executeCalculator,
    requiredParams: ['expression'],
  },
  file_reader: {
    name: 'file_reader',
    schema: fileReaderSchema,
    handler: executeFileReader,
    requiredParams: ['filename'],
  },
  file_writer: {
    name: 'file_writer',
    schema: fileWriterSchema,
    handler: executeFileWriter,
    requiredParams: ['filename', 'content'],
  },
  database_query: {
    name: 'database_query',
    schema: databaseSchema,
    handler: executeDatabaseQuery,
    requiredParams: ['collection'],
  },
};

/**
 * Get all tool schemas for Ollama / OpenAI tool format
 */
export function getAllToolSchemas() {
  return Object.values(TOOL_REGISTRY).map((t) => t.schema);
}

/**
 * Check if a tool name is registered
 */
export function isToolRegistered(toolName) {
  return Boolean(TOOL_REGISTRY[toolName]);
}

/**
 * Get tool handler function
 */
export function getToolHandler(toolName) {
  return TOOL_REGISTRY[toolName]?.handler || null;
}

/**
 * Validate incoming tool parameters against required parameters
 */
export function validateToolParams(toolName, params) {
  const tool = TOOL_REGISTRY[toolName];
  if (!tool) {
    return { valid: false, error: `Unrecognized tool "${toolName}"` };
  }

  if (!params || typeof params !== 'object') {
    return { valid: false, error: `Invalid parameters: expected object, received ${typeof params}` };
  }

  for (const requiredField of tool.requiredParams) {
    if (params[requiredField] === undefined || params[requiredField] === null || params[requiredField] === '') {
      return {
        valid: false,
        error: `Missing required parameter "${requiredField}" for tool "${toolName}"`,
      };
    }
  }

  return { valid: true };
}

export default TOOL_REGISTRY;
