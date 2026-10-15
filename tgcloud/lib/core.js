// BUNDLED from: lib/version.js, lib/logger.js, lib/database.js, lib/strings.js, lib/decorators.js, lib/loader.js, lib/tools.js, lib/client.js
// (originals in docs/original-js/)

import { api, db, fetch } from 'sdk';
import { eq } from 'sdk/db';
import { kv } from '../schema.js';
// ===== lib/version.js =====
// Ultroid-JS port of pyUltroid/version.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/version.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// __version__ = "2026.04.03"
// ultroid_version = "2.1.2"


// ===== lib/logger.js =====
// Ultroid-JS port of pyUltroid startup logging + pyUltroid/__init__.py LOGS.
// Serverless has no logging config; we wrap console with the same API.
const PASSIVE_MONITORS = []; // handlers push passive monitors here (see lib/plugins.js)
const LOGS = {
  debug: (...a) => console.log('[DEBUG]', ...a),
  info: (...a) => console.log('[INFO]', ...a),
  warning: (...a) => console.warn('[WARN]', ...a),
  warn: (...a) => console.warn('[WARN]', ...a),
  error: (...a) => console.error('[ERROR]', ...a),
  critical: (...a) => console.error('[CRITICAL]', ...a),
  exception: (e, ...a) => console.error('[EXCEPTION]', e?.stack || e, ...a),
};

// ===== lib/database.js =====
// Ultroid-JS port of pyUltroid/startup/_database.py UltroidDB + pyUltroid/dB/base.py
// Original: Redis / Mongo / SQL via udB.get_key / set_key / del_key.
// Serverless: SQLite `kv` table (see ../schema.js) via sdk `db`.

async function getKey(key, fallback = null) {
  try {
    const row = await db.select().from(kv).where(eq(kv.key, key)).get();
    return row ? row.value : fallback;
  } catch {
    return fallback;
  }
}

async function setKey(key, value) {
  await db
    .insert(kv)
    .values({ key, value })
    .onConflictDoUpdate({ target: kv.key, set: { value } })
    .run();
  return true;
}

async function delKey(key) {
  const { eq: eqOp } = await import('sdk/db');
  await db.delete(kv).where(eqOp(kv.key, key)).run();
  return true;
}

// Sync in-memory mirror used by ported plugin code that expects udB.* sync calls.
// Handlers should prefer async getKey/setKey/delKey; this keeps 1:1 call shapes.
const udB = {
  get_key: (k) => null, // async variant lives in getKey(); sync returns null by design
  set_key: () => false,
  del_key: () => false,
  getKey,
  setKey,
  delKey,
  name: 'tgcloud-sqlite',
  async ping() {
    return true;
  },
};

// Port of KeyManager (pyUltroid/dB/base.py)
class KeyManager {
  constructor(key, cast = null) {
    this._key = key;
    this._cast = cast;
  }
  async get() {
    const data = await getKey(this._key);
    if (this._cast === Array) return Array.isArray(data) ? data : data ? [data] : [];
    if (this._cast === Object) return data && typeof data === 'object' ? data : {};
    return data ?? null;
  }
  async add(item) {
    const content = (await this.get()) || (Array.isArray(item) ? [] : {});
    if (Array.isArray(content) && !content.includes(item)) {
      content.push(item);
      await setKey(this._key, content);
    } else if (content && typeof content === 'object' && item && typeof item === 'object') {
      Object.assign(content, item);
      await setKey(this._key, content);
    }
  }
  async remove(item) {
    const content = await this.get();
    if (Array.isArray(content)) {
      const i = content.indexOf(item);
      if (i >= 0) {
        content.splice(i, 1);
        await setKey(this._key, content);
      }
    } else if (content && typeof content === 'object' && content[item]) {
      delete content[item];
      await setKey(this._key, content);
    }
  }
  async contains(item) {
    const content = await this.get();
    if (Array.isArray(content)) return content.includes(item);
    if (content && typeof content === 'object') return item in content;
    return false;
  }
}

// ===== lib/strings.js =====
// Ultroid-JS port of strings/__init__.py + pyUltroid/fns/helper.py get_string
// Original loaded language YAMLs; here we keep the same keys with English defaults
// so every ported plugin keeps working. Add more languages by extending STRINGS.
const STRINGS = {
  afk_1: 'Back! Was AFK for `{}`.',
  afk_2: 'AFK off after {}.',
  afk_3: 'AFK since {}.\nReason: {}',
  afk_4: 'AFK since {}.',
  afk_5: 'AFK on.\nReason: {}',
  afk_6: 'AFK on.',
  help_2: 'Use {}help to see commands.',
  help_3: 'Inline mode is disabled. Enable it via BotFather.',
  help_4: 'Official',
  help_5: 'Addons',
  help_6: 'VCBot',
  help_7: 'Inline',
  help_8: 'Owner',
  help_9: 'Assistant',
  help_10: 'Close',
  help_11: 'Commands in `{}`:\n',
  inline_4: 'Ultroid-JS by {}.\nPlugins: {} official.\nCommands: {}',
  calc_1: 'Calculator — tap buttons.',
  calc_2: 'Restart',
  sf_8: 'Invalid expression.',
};

function get_string(key, ...args) {
  let s = STRINGS[key] ?? key;
  // Support Python-style `{}` and `{0}` placeholders minimally
  let i = 0;
  s = s.replace(/\{\}/g, () => (args[i++] ?? ''));
  s = s.replace(/\{(\d+)\}/g, (_, n) => args[Number(n)] ?? '');
  return s;
}

async function getString(key, ...args) {
  return get_string(key, ...args);
}

// ===== lib/decorators.js =====
// Ultroid-JS port of pyUltroid/_misc/_decorators.py + pyUltroid/fns/tools.py helpers
// Original Python:
//   @ultroid_cmd(pattern="afk( (.*)|$)", owner_only=True)
//   @asst_cmd("start"), @callback(...), @in_pattern(...)
// Serverless JS: same registration API, backed by an in-memory registry consumed
// by tgcloud/handlers/message.js, callback_query.js, inline_query.js.
// Only Bot API updates exist here (no MTProto outgoing/incoming split).
const CMD_REGISTRY = []; // { pattern: RegExp, source, handler, flags }
const CALLBACK_REGISTRY = []; // { pattern: RegExp|string, handler }
const INLINE_REGISTRY = []; // { pattern: string|RegExp, handler, owner }
const ASST_REGISTRY = []; // { cmd: string, handler }

function compilePattern(pattern) {
  // Ultroid patterns are Python regexes matched against the message text
  // AFTER the handler prefix (e.g. ".afk hello" -> "afk hello").
  // We keep them as JS RegExp with same source where possible.
  try {
    return new RegExp(`^(?:${pattern})$`, 'is');
  } catch {
    return new RegExp('^$');
  }
}

function ultroid_cmd({ pattern, owner_only = false, groups_only = false, admins_only = false, sudo = false } = {}) {
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
function ultroidCmd(pattern, optsOrFn, maybeFn) {
  const opts = typeof optsOrFn === 'function' ? {} : optsOrFn || {};
  const fn = typeof optsOrFn === 'function' ? optsOrFn : maybeFn;
  return ultroid_cmd({ pattern, ...opts })(fn);
}

function asst_cmd(cmd) {
  return (fn) => {
    ASST_REGISTRY.push({ cmd, handler: fn });
    return fn;
  };
}

function callback(pattern) {
  return (fn) => {
    const rx = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    CALLBACK_REGISTRY.push({ pattern: rx, raw: pattern, handler: fn });
    return fn;
  };
}

function in_pattern(pattern, { owner = false } = {}) {
  return (fn) => {
    INLINE_REGISTRY.push({ pattern, handler: fn, owner });
    return fn;
  };
}

// eor / eod equivalents: edit-or-reply. On Bot API we reply (no userbot edit).
// ctx: { chatId, messageId, text } + api injected by caller.
async function eor(api, chatId, text, { replyTo } = {}) {
  return api.sendMessage({ chat_id: chatId, text, ...(replyTo ? { reply_to_message_id: replyTo } : {}) });
}

function cmdRegexReplace(s) {
  return s.replace(/[\^$\.\|\?\*\+\(\)\[\]\\]/g, '');
}

function getHelp(key) {
  return `Help: ${key}`;
}

// ===== lib/loader.js =====
// Ultroid-JS port of pyUltroid/loader.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/loader.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// import contextlib
// import glob
// import os
// from importlib import import_module
// from logging import Logger
// 
// from . import LOGS
// from .fns.tools import get_all_files
// 
// 
// class Loader:
//     def __init__(self, path="plugins", key="Official", logger: Logger = LOGS):
//         self.path = path
//         self.key = key
//         self._logger = logger
// 
//     def load(
//         self,
//         log=True,
//         func=import_module,
//         include=None,
//         exclude=None,
//         after_load=None,
//         load_all=False,
//     ):
//         _single = os.path.isfile(self.path)
//         if include:
//             if log:
//                 self._logger.info("Including: {}".format("• ".join(include)))
//             files = glob.glob(f"{self.path}/_*.py")
//             for file in include:
//                 path = f"{self.path}/{file}.py"
//                 if os.path.exists(path):
//                     files.append(path)
//         elif _single:
//             files = [self.path]
//         else:
//             if load_all:
//                 files = get_all_files(self.path, ".py")
//             else:
//                 files = glob.glob(f"{self.path}/*.py")
//             if exclude:
//                 for path in exclude:
//                     if not path.startswith("_"):
//                         with contextlib.suppress(ValueError):
//                             files.remove(f"{self.path}/{path}.py")
//         if log and not _single:
//             self._logger.info(
//                 f"• Installing {self.key} Plugins || Count : {len(files)} •"
//             )
//         for plugin in sorted(files):
//             if func == import_module:
//                 plugin = plugin.replace(".py", "").replace("/", ".").replace("\\", ".")


// ===== lib/tools.js =====
// Ultroid-JS port of pyUltroid/fns/tools.py (subset safe for V8 isolate)
// No filesystem, no subprocess, no sockets. Pure helpers only.
function getAllFiles() {
  return [];
}

function humanTime(seconds) {
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

function escapeHtml(s = '') {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseArgs(text = '') {
  const parts = text.trim().split(/\s+/);
  return { cmd: parts[0] || '', args: parts.slice(1), raw: parts.slice(1).join(' ') };
}

function isUrl(s = '') {
  return /^https?:\/\//i.test(s);
}

// Safe math eval for calculator plugin (original used Python eval())
function safeEval(expr) {
  if (!/^[0-9+\-*/.%\s()]+$/.test(expr)) throw new Error('Invalid expression');
  const js = expr.replace(/÷/g, '/').replace(/x/g, '*');
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${js})`)();
}

// ===== lib/client.js =====
// Ultroid-JS port of pyUltroid/startup/BaseClient.py UltroidClient
// Original was a Telethon client (MTProto, sessions, add_handler...).
// Serverless cannot hold MTProto connections, so this is a Bot API facade with
// the same method names used across plugins: send_message, reply, eor, etc.

class UltroidClient {
  constructor({ ownerId = null } = {}) {
    this.ownerId = ownerId;
    this._bot = true;
  }
  async sendMessage(chatId, text, opts = {}) {
    return api.sendMessage({ chat_id: chatId, text, ...opts });
  }
  async reply(message, text, opts = {}) {
    return api.sendMessage({
      chat_id: message.chat.id,
      text,
      reply_to_message_id: message.message_id,
      ...opts,
    });
  }
  async eor(message, text, opts = {}) {
    // edit-or-reply: Bot API bots cannot edit user messages; reply instead.
    return this.reply(message, text, opts);
  }
  async deleteMessage(chatId, messageId) {
    try {
      return await api.deleteMessage({ chat_id: chatId, message_id: messageId });
    } catch {
      return null;
    }
  }
}

const ultroid_bot = new UltroidClient();
const asst = new UltroidClient();
export { LOGS, getKey, setKey, delKey, udB, KeyManager, get_string, getString, CMD_REGISTRY, CALLBACK_REGISTRY, INLINE_REGISTRY, ASST_REGISTRY, PASSIVE_MONITORS, compilePattern, ultroid_cmd, ultroidCmd, asst_cmd, callback, in_pattern, eor, cmdRegexReplace, getHelp, getAllFiles, humanTime, escapeHtml, parseArgs, isUrl, safeEval, UltroidClient, ultroid_bot, asst, __version__, ultroid_version, ultroidJsVersion, Var, loadConfig, Loader };
// ===== restored: version + config + loader (hand-written, were overwritten by generator stub) =====
const __version__ = "2026.04.03";
const ultroid_version = "2.1.2";
const ultroidJsVersion = "2.1.2-js.1";
const Var = {
  API_ID: 6,
  API_HASH: 'eb06d4abfb49dc3eeb1aeb98ae0f581e',
  SESSION: null,
  REDIS_URI: null,
  REDIS_PASSWORD: null,
  BOT_TOKEN: null,
  LOG_CHANNEL: 0,
  HEROKU_APP_NAME: null,
  HEROKU_API: null,
  VC_SESSION: null,
  ADDONS: false,
  VCBOT: false,
  DATABASE_URL: null,
  MONGO_URI: null,
  TGDB_URL: null,
};
async function loadConfig() {
  const hndlr = await getKey('HNDLR');
  const dual = await getKey('DUAL_HNDLR');
  const sudo = await getKey('SUDO_HNDLR');
  const owner = await getKey('OWNER_ID');
  const logCh = await getKey('LOG_CHANNEL');
  return {
    HNDLR: hndlr || '.',
    DUAL_HNDLR: dual || '/',
    SUDO_HNDLR: sudo || hndlr || '.',
    OWNER_ID: owner || null,
    LOG_CHANNEL: logCh || 0,
  };
}
class Loader {
  constructor(path = 'plugins', key = 'Official') {
    this.path = path;
    this.key = key;
  }
  async load({ include = null, exclude = null } = {}, registry = []) {
    let files = registry;
    if (include) files = files.filter((f) => include.includes(f.name));
    if (exclude) files = files.filter((f) => !exclude.includes(f.name));
    LOGS.info(`• Installing ${this.key} Plugins || Count : ${files.length} •`);
    return files;
  }
}
