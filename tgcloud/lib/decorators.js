// Ultroid-JS port of pyUltroid/_misc/_decorators.py + pyUltroid/fns/tools.py helpers
// Original Python:
//   @ultroid_cmd(pattern="afk( (.*)|$)", owner_only=True)
//   @asst_cmd("start"), @callback(...), @in_pattern(...)
// Serverless JS: same registration API, backed by an in-memory registry consumed
// by tgcloud/handlers/message.js, callback_query.js, inline_query.js.
// Only Bot API updates exist here (no MTProto outgoing/incoming split).
export const CMD_REGISTRY = []; // { pattern: RegExp, source, handler, flags }
export const CALLBACK_REGISTRY = []; // { pattern: RegExp|string, handler }
export const INLINE_REGISTRY = []; // { pattern: string|RegExp, handler, owner }
export const ASST_REGISTRY = []; // { cmd: string, handler }

export function compilePattern(pattern) {
  // Ultroid patterns are Python regexes matched against the message text
  // AFTER the handler prefix (e.g. ".afk hello" -> "afk hello").
  // We keep them as JS RegExp with same source where possible.
  try {
    return new RegExp(`^(?:${pattern})$`, 'is');
  } catch {
    return new RegExp('^$');
  }
}

export function ultroid_cmd({ pattern, owner_only = false, groups_only = false, admins_only = false, sudo = false } = {}) {
  return (fn) => {
    fn._ultroid = { pattern, owner_only, groups_only, admins_only, sudo };
    CMD_REGISTRY.push({
      pattern: compilePattern(pattern),
      source: pattern,
      handler: fn,
      owner_only,
      groups_only,
      admins_only,
      sudo,
    });
    return fn;
  };
}

// Direct functional form (avoids decorator syntax): ultroidCmd("pattern", opts, fn)
export function ultroidCmd(pattern, optsOrFn, maybeFn) {
  const opts = typeof optsOrFn === 'function' ? {} : optsOrFn || {};
  const fn = typeof optsOrFn === 'function' ? optsOrFn : maybeFn;
  return ultroid_cmd({ pattern, ...opts })(fn);
}

export function asst_cmd(cmd) {
  return (fn) => {
    ASST_REGISTRY.push({ cmd, handler: fn });
    return fn;
  };
}

export function callback(pattern) {
  return (fn) => {
    const rx = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    CALLBACK_REGISTRY.push({ pattern: rx, raw: pattern, handler: fn });
    return fn;
  };
}

export function in_pattern(pattern, { owner = false } = {}) {
  return (fn) => {
    INLINE_REGISTRY.push({ pattern, handler: fn, owner });
    return fn;
  };
}

// eor / eod equivalents: edit-or-reply. On Bot API we reply (no userbot edit).
// ctx: { chatId, messageId, text } + api injected by caller.
export async function eor(api, chatId, text, { replyTo } = {}) {
  return api.sendMessage({ chat_id: chatId, text, ...(replyTo ? { reply_to_message_id: replyTo } : {}) });
}

export function cmdRegexReplace(s) {
  return s.replace(/[\^$\.\|\?\*\+\(\)\[\]\\]/g, '');
}

export function getHelp(key) {
  return `Help: ${key}`;
}
