import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// Allowed query collections to prevent unauthorized internal collection scraping
const ALLOWED_COLLECTIONS = ['tasks', 'executions', 'executionsteps', 'students', 'inventory', 'logs', 'demo_records'];

/**
 * Sandboxed MongoDB Read-Only Query Tool
 */
export async function executeDatabaseQuery({ collection, filter = {}, limit = 10, projection = {} }) {
  if (!collection || typeof collection !== 'string') {
    return {
      success: false,
      error: 'Missing or invalid "collection" parameter',
    };
  }

  const cleanCollection = collection.toLowerCase().trim();

  // Safety whitelist
  if (!ALLOWED_COLLECTIONS.includes(cleanCollection)) {
    return {
      success: false,
      error: `Access denied to collection "${collection}". Allowed collections: ${ALLOWED_COLLECTIONS.join(', ')}`,
    };
  }

  try {
    const db = mongoose.connection.db;
    if (!db) {
      return {
        success: false,
        error: 'Database connection not available',
      };
    }

    const col = db.collection(cleanCollection);
    
    // Parse filter if passed as string
    let parsedFilter = filter;
    if (typeof filter === 'string') {
      try {
        parsedFilter = JSON.parse(filter);
      } catch {
        parsedFilter = {};
      }
    }

    const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 50);

    const rows = await col.find(parsedFilter).limit(safeLimit).toArray();
    const count = await col.countDocuments(parsedFilter);

    logger.tool(`Database query on "${cleanCollection}" returned ${rows.length} records (Total matching: ${count})`);

    return {
      success: true,
      collection: cleanCollection,
      count,
      returnedCount: rows.length,
      rows,
    };
  } catch (err) {
    logger.error(`Database query error on "${collection}":`, err.message);
    return {
      success: false,
      error: `Database query failed: ${err.message}`,
    };
  }
}

export const databaseSchema = {
  type: 'function',
  function: {
    name: 'database_query',
    description: 'Safely perform a read-only query on a database collection (e.g., "tasks", "executions", "students", "inventory").',
    parameters: {
      type: 'object',
      properties: {
        collection: {
          type: 'string',
          description: 'The target collection name to query, e.g. "students", "tasks", "executions"',
        },
        filter: {
          type: 'object',
          description: 'MongoDB query filter object, e.g. {"department": "CSE"}',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of records to return (1-50, default 10)',
        },
      },
      required: ['collection'],
    },
  },
};
