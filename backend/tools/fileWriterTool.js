import fs from 'fs/promises';
import path from 'path';
import { WORKSPACE_DIR, ensureWorkspace, resolveSafePath } from './fileReaderTool.js';
import logger from '../utils/logger.js';

/**
 * Safe Sandboxed File Writer Tool
 */
export async function executeFileWriter({ filename, content, append = false }) {
  await ensureWorkspace();

  if (!filename || typeof filename !== 'string') {
    return {
      success: false,
      error: 'Missing or invalid "filename" parameter',
    };
  }

  if (content === undefined || content === null) {
    return {
      success: false,
      error: 'Missing "content" parameter to write to the file',
    };
  }

  const stringContent = typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);

  try {
    const safePath = resolveSafePath(filename);
    
    // Ensure parent subdirectories exist if filename has subpaths inside workspace
    await fs.mkdir(path.dirname(safePath), { recursive: true });

    if (append) {
      await fs.appendFile(safePath, stringContent, 'utf8');
    } else {
      await fs.writeFile(safePath, stringContent, 'utf8');
    }

    const stats = await fs.stat(safePath);
    logger.tool(`FileWriter wrote ${stats.size} bytes to "${filename}"`);

    return {
      success: true,
      filename: path.basename(filename),
      bytesWritten: Buffer.byteLength(stringContent, 'utf8'),
      totalSize: stats.size,
      message: `File "${path.basename(filename)}" successfully ${append ? 'appended' : 'created/written'}.`,
    };
  } catch (err) {
    logger.error(`FileWriter error on "${filename}":`, err.message);
    return {
      success: false,
      error: `Failed to write file "${filename}": ${err.message}`,
    };
  }
}

export const fileWriterSchema = {
  type: 'function',
  function: {
    name: 'file_writer',
    description: 'Create or overwrite a file with specific text or data content inside the controlled agent_workspace directory.',
    parameters: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'The name or relative path of the file to write (e.g. "result.txt", "report.md")',
        },
        content: {
          type: 'string',
          description: 'The text or numeric content to write into the file',
        },
        append: {
          type: 'boolean',
          description: 'If true, append to existing content instead of overwriting. Default is false.',
        },
      },
      required: ['filename', 'content'],
    },
  },
};
