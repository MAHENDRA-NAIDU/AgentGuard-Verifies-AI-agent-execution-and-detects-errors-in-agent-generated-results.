const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  white: "\x1b[37m",
};

function formatTag(tag, color) {
  return `${color}[${tag}]${colors.reset}`;
}

export const logger = {
  agent: (...args) => console.log(formatTag("AGENT", colors.cyan), ...args),
  ollama: (...args) => console.log(formatTag("OLLAMA", colors.magenta), ...args),
  trace: (...args) => console.log(formatTag("TRACE", colors.blue), ...args),
  tool: (...args) => console.log(formatTag("TOOL", colors.yellow), ...args),
  verifier: (...args) => console.log(formatTag("VERIFIER", colors.green), ...args),
  system: (...args) => console.log(formatTag("SYSTEM", colors.white), ...args),
  error: (...args) => console.error(formatTag("ERROR", colors.red), ...args),
  warn: (...args) => console.warn(formatTag("WARN", colors.yellow), ...args),
};

export default logger;
