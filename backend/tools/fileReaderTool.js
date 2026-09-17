import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const WORKSPACE_DIR = path.resolve(__dirname, '../agent_workspace');

/**
 * Ensure the sandboxed workspace directory exists
 */
export async function ensureWorkspace() {
  try {
    await fs.mkdir(WORKSPACE_DIR, { recursive: true });
  } catch (err) {
    logger.error('Failed to create workspace directory:', err.message);
  }
}

/**
 * Validate and sanitize filename to prevent directory traversal
 */
export function resolveSafePath(filename) {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid or missing filename parameter');
  }

  // Remove leading slashes and whitespace
  const sanitized = path.normalize(filename).replace(/^(\.\.[\/\\])+/, '');
  const targetPath = path.resolve(WORKSPACE_DIR, sanitized);

  // Strict check: target must be inside WORKSPACE_DIR
  if (!targetPath.startsWith(WORKSPACE_DIR)) {
    throw new Error('Access denied: Path traversal outside agent_workspace is forbidden');
  }

  return targetPath;
}

/**
 * Safe Sandboxed File Reader Tool
 */
export async function executeFileReader({ filename }) {
  await ensureWorkspace();

  try {
    const safePath = resolveSafePath(filename);
    const content = await fs.readFile(safePath, 'utf8');
    const stats = await fs.stat(safePath);

    logger.tool(`FileReader read: "${filename}" (${stats.size} bytes)`);
    return {
      success: true,
      filename: path.basename(filename),
      content,
      size: stats.size,
    };
  } catch (err) {
    logger.error(`FileReader error on "${filename}":`, err.message);
    return {
      success: false,
      error: `Failed to read file "${filename}": ${err.message}`,
    };
  }
}

export const fileReaderSchema = {
  type: 'function',
  function: {
    name: 'file_reader',
    description: 'Read the text content of a file located within the controlled agent_workspace directory.',
    parameters: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'The name of the file to read (e.g. "result.txt", "data.json")',
        },
      },
      required: ['filename'],
    },
  },
};
