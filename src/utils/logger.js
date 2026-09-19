/**
 * PseudoPoly In-Game Logger & Diagnostics
 * 
 * Features:
 * - Automatically intercepts console.log, console.warn, console.error
 * - Listens for window.onerror and unhandledrejection
 * - Automatically stores logs with timestamp in localStorage
 * - Safe circular-reference serialization
 * - Monospace viewer with level filtering (All, Errors, Warnings)
 * - One-click Copy All / Copy Errors to clipboard
 * - Persistent across reloads (circular buffer up to 400 entries)
 */

const STORAGE_KEY = 'pseudopoly_game_logs_v1';
const MAX_LOGS = 400;

let logs = [];
const listeners = new Set();
let isInitialized = false;
let saveTimeout = null;

// Safe serializer to handle objects, circular references, and DOM nodes
function safeStringify(arg) {
  if (arg === null) return 'null';
  if (arg === undefined) return 'undefined';
  if (typeof arg === 'string') return arg;
  if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
  if (arg instanceof Error) {
    return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ''}`;
  }

  const seen = new WeakSet();
  try {
    return JSON.stringify(arg, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
        if (value instanceof HTMLElement) {
          return `<${value.tagName.toLowerCase()} class="${value.className}">`;
        }
      }
      return value;
    });
  } catch (e) {
    try {
      return String(arg);
    } catch {
      return '[Unserializable Object]';
    }
  }
}

function formatTime(date = new Date()) {
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  const ms = pad(date.getMilliseconds(), 3);
  return `${h}:${m}:${s}.${ms}`;
}

function formatFullDate(date = new Date()) {
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}-${mo}-${d} ${h}:${m}:${s}`;
}

// Load logs from localStorage
function loadLogsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        logs = parsed.slice(-MAX_LOGS);
      }
    }
  } catch (e) {
    // If storage corrupted, start fresh
    logs = [];
  }
}

// Debounced save to localStorage
function scheduleSaveToStorage(immediate = false) {
  if (immediate) {
    if (saveTimeout) clearTimeout(saveTimeout);
    trySave();
    return;
  }

  if (saveTimeout) return;
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    trySave();
  }, 400);
}

function trySave() {
  try {
    const serialized = JSON.stringify(logs.slice(-MAX_LOGS));
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (e) {
    // Quota exceeded: trim older half and retry
    try {
      logs = logs.slice(-150);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch {
      // Storage unavailable or completely blocked
    }
  }
}

function addLog(level, ...args) {
  const now = new Date();
  const message = args.map(safeStringify).join(' ');

  // Extract stack if available
  let stack = null;
  for (const arg of args) {
    if (arg instanceof Error && arg.stack) {
      stack = arg.stack;
      break;
    }
  }

  const entry = {
    id: `${now.getTime()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    displayTime: formatTime(now),
    dateFormatted: formatFullDate(now),
    level: level.toUpperCase(),
    message,
    stack
  };

  logs.push(entry);
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }

  // Save to storage immediately for errors, debounced for regular logs
  scheduleSaveToStorage(level === 'ERROR');

  // Notify listeners
  listeners.forEach((fn) => {
    try {
      fn(entry, logs);
    } catch {}
  });
}

// Intercept global console and errors
export function initLogger() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  loadLogsFromStorage();

  const originalLog = console.log.bind(console);
  const originalInfo = console.info.bind(console);
  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);

  console.log = (...args) => {
    originalLog(...args);
    addLog('LOG', ...args);
  };

  console.info = (...args) => {
    originalInfo(...args);
    addLog('INFO', ...args);
  };

  console.warn = (...args) => {
    originalWarn(...args);
    addLog('WARN', ...args);
  };

  console.error = (...args) => {
    originalError(...args);
    addLog('ERROR', ...args);
  };

  window.addEventListener('error', (event) => {
    const errorMsg = event.error
      ? safeStringify(event.error)
      : `${event.message} (${event.filename}:${event.lineno}:${event.colno})`;
    addLog('ERROR', '[Uncaught Error]', errorMsg);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
      ? safeStringify(event.reason)
      : 'Unhandled Promise Rejection';
    addLog('ERROR', '[Unhandled Rejection]', reason);
  });

  // Log session startup
  addLog('INFO', `[SESSION START] PseudoPoly initialized at ${formatFullDate()}`);
}

export function getLogs() {
  return [...logs];
}

export function clearLogs() {
  logs = [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  addLog('INFO', `[LOGS CLEARED] Clean log buffer started at ${formatFullDate()}`);
  listeners.forEach((fn) => {
    try {
      fn(null, logs);
    } catch {}
  });
}

export function formatLogsAsText(filter = 'ALL') {
  let filtered = logs;
  if (filter === 'ERROR') {
    filtered = logs.filter((l) => l.level === 'ERROR');
  } else if (filter === 'WARN') {
    filtered = logs.filter((l) => l.level === 'ERROR' || l.level === 'WARN');
  }

  const header = [
    `==================================================`,
    `PSEUDOPOLY GAME LOGS & DIAGNOSTICS`,
    `Exported: ${formatFullDate()}`,
    `Total Logs: ${logs.length} | Showing: ${filtered.length} (Filter: ${filter})`,
    `Platform: ${navigator.userAgent || 'Unknown'}`,
    `==================================================\n`
  ].join('\n');

  const body = filtered
    .map((l) => {
      let line = `[${l.displayTime}] [${l.level}] ${l.message}`;
      if (l.stack && !l.message.includes(l.stack)) {
        line += `\n  Stack: ${l.stack}`;
      }
      return line;
    })
    .join('\n');

  return `${header}${body}\n\n==================== END OF LOGS ====================`;
}

export async function copyToClipboard(text) {
  if (!text) return false;

  // 1. Try standard Navigator API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fall through to fallback
    }
  }

  // 2. Fallback using temporary textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    return false;
  }
}

export function subscribeLogs(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const logger = {
  init: initLogger,
  getLogs,
  clearLogs,
  formatLogsAsText,
  copyToClipboard,
  subscribe: subscribeLogs,
  log: (...args) => addLog('LOG', ...args),
  info: (...args) => addLog('INFO', ...args),
  warn: (...args) => addLog('WARN', ...args),
  error: (...args) => addLog('ERROR', ...args)
};

export default logger;
