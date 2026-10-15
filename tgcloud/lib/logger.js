// Ultroid-JS port of pyUltroid startup logging + pyUltroid/__init__.py LOGS.
// Serverless has no logging config; we wrap console with the same API.
export const LOGS = {
  debug: (...a) => console.log('[DEBUG]', ...a),
  info: (...a) => console.log('[INFO]', ...a),
  warning: (...a) => console.warn('[WARN]', ...a),
  warn: (...a) => console.warn('[WARN]', ...a),
  error: (...a) => console.error('[ERROR]', ...a),
  critical: (...a) => console.error('[CRITICAL]', ...a),
  exception: (e, ...a) => console.error('[EXCEPTION]', e?.stack || e, ...a),
};
