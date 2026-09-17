import { evaluate } from 'mathjs';
import logger from '../utils/logger.js';

/**
 * Safe Calculator Tool
 * Evaluates mathematical expressions safely using mathjs without eval()
 */
export async function executeCalculator({ expression }) {
  if (!expression || typeof expression !== 'string' || expression.trim() === '') {
    return {
      success: false,
      error: 'Missing or invalid "expression" parameter. Provide a valid mathematical expression string.',
    };
  }

  const cleanExpr = expression.trim();

  // Basic security check against suspicious property access or functions
  const dangerousPatterns = [/import/i, /require/i, /process/i, /global/i, /window/i, /function/i, /=>/];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(cleanExpr)) {
      return {
        success: false,
        error: 'Forbidden keywords or syntax in mathematical expression',
      };
    }
  }

  try {
    const result = evaluate(cleanExpr);
    logger.tool(`Calculator evaluated: "${cleanExpr}" = ${result}`);
    return {
      success: true,
      expression: cleanExpr,
      result: typeof result === 'object' && result !== null ? Number(result.toString()) : result,
    };
  } catch (err) {
    logger.error(`Calculator error on "${cleanExpr}":`, err.message);
    return {
      success: false,
      error: `Invalid mathematical expression: ${err.message}`,
    };
  }
}

export const calculatorSchema = {
  type: 'function',
  function: {
    name: 'calculator',
    description: 'Safely evaluate a mathematical expression (e.g., "50 * 20", "(120 / 4) + 15", "sqrt(144)"). Use this tool whenever calculations are required.',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'The mathematical expression to evaluate, e.g. "50 * 20"',
        },
      },
      required: ['expression'],
    },
  },
};
