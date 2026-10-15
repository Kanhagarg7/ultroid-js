// Ultroid-JS port of pyUltroid/fns/tools.py (subset safe for V8 isolate)
// No filesystem, no subprocess, no sockets. Pure helpers only.
export function getAllFiles() {
  return [];
}

export function humanTime(seconds) {
  const units = [['d', 86400], ['h', 3600], ['m', 60], ['s', 1]];
  let out = [];
  for (const [u, v] of units) {
    const n = Math.floor(seconds / v);
    if (n) {
      out.push(`${n}${u}`);
      seconds %= v;
    }
  }
  return out.join(' ') || '0s';
}

export function escapeHtml(s = '') {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function parseArgs(text = '') {
  const parts = text.trim().split(/\s+/);
  return { cmd: parts[0] || '', args: parts.slice(1), raw: parts.slice(1).join(' ') };
}

export function isUrl(s = '') {
  return /^https?:\/\//i.test(s);
}

// Safe math eval for calculator plugin (original used Python eval())
export function safeEval(expr) {
  if (!/^[0-9+\-*/.%\s()]+$/.test(expr)) throw new Error('Invalid expression');
  const js = expr.replace(/÷/g, '/').replace(/x/g, '*');
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${js})`)();
}
