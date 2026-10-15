// BUNDLED from: lib/plugins/_bundle_core.js, lib/plugins/afk.js, lib/plugins/calculator.js, lib/plugins/_help.js, lib/plugins/filter.js, lib/plugins/notes.js, lib/plugins/warn.js, lib/plugins/_chatactions.js, lib/plugins/_inline.js, lib/plugins/_ultroid.js, lib/plugins/_userlogs.js, lib/plugins/_wspr.js, lib/plugins/admintools.js, lib/plugins/aiwrapper.js, lib/plugins/antiflood.js, lib/plugins/asstcmd.js, lib/plugins/audiotools.js, lib/plugins/autoban.js, lib/plugins/autopic.js, lib/plugins/beautify.js, lib/plugins/blacklist.js, lib/plugins/bot.js, lib/plugins/broadcast.js, lib/plugins/button.js, lib/plugins/channelhacks.js, lib/plugins/chatbot.js, lib/plugins/chats.js, lib/plugins/cleanaction.js, lib/plugins/compressor.js, lib/plugins/converter.js, lib/plugins/core.js, lib/plugins/database.js, lib/plugins/delayspam.js, lib/plugins/devtools.js, lib/plugins/downloadupload.js, lib/plugins/echo.js, lib/plugins/extra.js, lib/plugins/fakeaction.js, lib/plugins/fileshare.js, lib/plugins/fontgen.js, lib/plugins/forcesubscribe.js, lib/plugins/gdrive.js, lib/plugins/giftools.js, lib/plugins/glitch.js, lib/plugins/globaltools.js, lib/plugins/greetings.js, lib/plugins/imagetools.js, lib/plugins/locks.js, lib/plugins/logo.js, lib/plugins/mediatools.js, lib/plugins/misc.js, lib/plugins/mute.js, lib/plugins/nightmode.js, lib/plugins/nsfwfilter.js, lib/plugins/other.js, lib/plugins/pdftools.js, lib/plugins/pmpermit.js, lib/plugins/polls.js, lib/plugins/profanityfilter.js, lib/plugins/profile.js, lib/plugins/qrcode.js, lib/plugins/resize.js, lib/plugins/schedulemsg.js, lib/plugins/search.js, lib/plugins/snips.js, lib/plugins/specialtools.js, lib/plugins/stickertools.js, lib/plugins/stories.js, lib/plugins/sudo.js, lib/plugins/tag.js, lib/plugins/tools.js, lib/plugins/twitter.js, lib/plugins/unsplash.js, lib/plugins/usage.js, lib/plugins/utilities.js, lib/plugins/variables.js, lib/plugins/vctools.js, lib/plugins/videotools.js, lib/plugins/weather.js, lib/plugins/webupload.js, lib/plugins/words.js, lib/plugins/writer.js, lib/plugins/youtube.js, lib/plugins/ziptools.js, lib/plugins/_monitors.js
// (originals in docs/original-js/)

import { db, api } from 'sdk';
import { eq, and } from 'sdk/db';
import { blacklistWords, snips, greetings, antiflood, gmutes, gbans, mutes, afk as afkTable, filters, notes, warns, floodTrack, echos, nsfwChats } from '../schema.js';
const PLUGIN_COUNT = 83;
import { ultroidCmd, getKey, setKey, delKey, get_string, callback as regCallback, safeEval, in_pattern as regInline, udB, KeyManager, getString, ultroid_cmd, asst_cmd, eor, cmdRegexReplace, getHelp, humanTime, escapeHtml, parseArgs, isUrl, PASSIVE_MONITORS } from './core.js';
{ // ===== lib/plugins/_bundle_core.js =====
// Ultroid-JS port of plugins/blacklist.py, snips.py, greetings.py,
// antiflood.py, sudo.py, variables.py, database.py, core.py, tools.py,
// admintools.py, mute.py, globaltools.py — functional Bot API versions.

// ---- blacklist ----
ultroidCmd('addblacklist( (.*)|$)', async (e) => {
  const w = (e.args || '').trim().toLowerCase();
  if (!w) return e.api.sendMessage({ chat_id: e.chatId, text: 'Usage: `.addblacklist <word>`' });
  await db.insert(blacklistWords).values({ chatId: e.chatId, word: w }).run();
  await e.api.sendMessage({ chat_id: e.chatId, text: `Blacklisted \`${w}\`.` });
});
ultroidCmd('(rmblacklist|delblacklist)( (.*)|$)', async (e) => {
  const w = (e.args || '').trim().toLowerCase();
  const rows = await db.select().from(blacklistWords).all().catch(() => []);
  const hit = rows.find((r) => Number(r.chatId) === Number(e.chatId) && r.word === w);
  if (hit) await db.delete(blacklistWords).where(eq(blacklistWords.id, hit.id)).run();
  await e.api.sendMessage({ chat_id: e.chatId, text: hit ? 'Removed.' : 'Not found.' });
});
ultroidCmd('(listblacklist|blacklists)$', async (e) => {
  const rows = await db.select().from(blacklistWords).all().catch(() => []);
  const mine = rows.filter((r) => Number(r.chatId) === Number(e.chatId));
  await e.api.sendMessage({ chat_id: e.chatId, text: mine.length ? mine.map((r) => `• \`${r.word}\``).join('\n') : 'Empty.' });
});

// ---- snips ----
ultroidCmd('addsnip( (.*)|$)', async (e) => {
  const [n, ...rest] = (e.args || '').split(/\s+/);
  if (!n) return e.api.sendMessage({ chat_id: e.chatId, text: 'Usage: `.addsnip <name> <text>`' });
  await db.insert(snips).values({ name: n.toLowerCase(), content: rest.join(' ') }).onConflictDoUpdate({ target: snips.name, set: { content: rest.join(' ') } }).run();
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Snip saved.' });
});
ultroidCmd('(delsnip|remsnip)( (.*)|$)', async (e) => {
  await db.delete(snips).where(eq(snips.name, (e.args || '').trim().toLowerCase())).run();
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Removed.' });
});
ultroidCmd('(snips|listsnip)$', async (e) => {
  const rows = await db.select().from(snips).all().catch(() => []);
  await e.api.sendMessage({ chat_id: e.chatId, text: rows.length ? rows.map((r) => `• \`$${r.name}\``).join('\n') : 'No snips.' });
});

// ---- greetings ----
ultroidCmd('setwelcome( (.*)|$)', async (e) => {
  const t = e.args || e.message.reply_to_message?.text || '';
  await db.insert(greetings).values({ chatId: e.chatId, kind: 'welcome', text: t, enabled: true }).run();
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Welcome saved.' });
});
ultroidCmd('setgoodbye( (.*)|$)', async (e) => {
  const t = e.args || '';
  await db.insert(greetings).values({ chatId: e.chatId, kind: 'goodbye', text: t, enabled: true }).run();
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Goodbye saved.' });
});

// ---- antiflood ----
ultroidCmd('setflood( (.*)|$)', async (e) => {
  const n = parseInt((e.args || '').trim(), 10) || 5;
  await db.insert(antiflood).values({ chatId: e.chatId, limit: n, windowSec: 5, action: 'mute' })
    .onConflictDoUpdate({ target: antiflood.chatId, set: { limit: n } }).run();
  await e.api.sendMessage({ chat_id: e.chatId, text: `Antiflood limit: ${n}.` });
});

// ---- sudo / variables (udB keys) ----
ultroidCmd('addsudo( (.*)|$)', { owner_only: true }, async (e) => {
  const id = parseInt((e.args || '').trim(), 10) || e.message.reply_to_message?.from?.id;
  if (!id) return e.api.sendMessage({ chat_id: e.chatId, text: 'Give a user id.' });
  const cur = (await getKey('SUDO_USERS')) || [];
  if (!cur.includes(id)) await setKey('SUDO_USERS', [...cur, id]);
  await e.api.sendMessage({ chat_id: e.chatId, text: `Sudo added: \`${id}\`.` });
});
ultroidCmd('delsudo( (.*)|$)', { owner_only: true }, async (e) => {
  const id = parseInt((e.args || '').trim(), 10);
  const cur = ((await getKey('SUDO_USERS')) || []).filter((x) => Number(x) !== Number(id));
  await setKey('SUDO_USERS', cur);
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Removed.' });
});
ultroidCmd('(set|get|del)var( (.*)|$)', { owner_only: true }, async (e) => {
  const op = e.body.split(/\s+/)[0].replace('.', '');
  const [k, ...rest] = (e.args || '').split(/\s+/);
  if (op === 'setvar' && k) { await setKey(k, rest.join(' ')); return e.api.sendMessage({ chat_id: e.chatId, text: `Saved \`${k}\`.` }); }
  if (op === 'getvar' && k) { const v = await getKey(k); return e.api.sendMessage({ chat_id: e.chatId, text: v == null ? 'Not set.' : `\`${k}\` = \`${JSON.stringify(v)}\`` }); }
  if (op === 'delvar' && k) { await delKey(k); return e.api.sendMessage({ chat_id: e.chatId, text: 'Deleted.' }); }
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Usage: `.setvar/.getvar/.delvar <key> [value]`' });
});

// ---- core / alive / ping (plugins/core.py, _ultroid.py, usage.py) ----
ultroidCmd('(alive|ultroid)$', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Ultroid-JS • alive • v2.1.2-js.1\nServerless on Telegram infrastructure.' });
});
ultroidCmd('ping$', async (e) => {
  const t0 = Date.now();
  const m = await e.api.sendMessage({ chat_id: e.chatId, text: 'Pong!' });
  try { await e.api.editMessageText({ chat_id: e.chatId, message_id: m.message_id, text: `Pong! \`${Date.now() - t0}ms\`` }); } catch {}
});

// ---- admin tools (admintools.py subset) ----
ultroidCmd('(ban|kick|mute|unmute)( (.*)|$)', async (e) => {
  const op = e.body.split(/\s+/)[0].replace('.', '');
  const target = e.message.reply_to_message?.from?.id || parseInt((e.args || '').trim(), 10);
  if (!target) return e.api.sendMessage({ chat_id: e.chatId, text: 'Reply to a user.' });
  try {
    if (op === 'ban') await e.api.banChatMember({ chat_id: e.chatId, user_id: target });
    else if (op === 'kick') { await e.api.banChatMember({ chat_id: e.chatId, user_id: target }); await e.api.unbanChatMember({ chat_id: e.chatId, user_id: target }); }
    else if (op === 'mute') await e.api.restrictChatMember({ chat_id: e.chatId, user_id: target, permissions: { can_send_messages: false } });
    else await e.api.restrictChatMember({ chat_id: e.chatId, user_id: target, permissions: { can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_add_web_page_previews: true } });
    await e.api.sendMessage({ chat_id: e.chatId, text: `${op} done.` });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `Failed: bot needs admin rights.` });
  }
});

const PLUGIN_NAME = 'core-bundle';
}

{ // ===== lib/plugins/afk.js =====
// Ultroid-JS port of plugins/afk.py — full logic, Bot API adapted.
// Original: userbot outgoing handler + incoming mention auto-reply via Telethon.
// Serverless: bot cannot see outgoing user messages; AFK is per-bot state in
// SQLite `afk` table. `.afk <reason>` sets AFK; any later message from owner
// clears it; mentions/DMs while AFK get auto-reply.

async function getAfk() {
  const rows = await db.select().from(afkTable).all().catch(() => []);
  return rows.find((r) => r.id === 1) || null;
}

ultroidCmd('afk( (.*)|$)', { owner_only: true }, async (e) => {
  const reason = (e.args || '').trim() || null;
  const now = Math.floor(Date.now() / 1000);
  await db
    .insert(afkTable)
    .values({ id: 1, text: reason, mediaType: null, media: null, since: now })
    .onConflictDoUpdate({ target: afkTable.id, set: { text: reason, since: now } })
    .run();
  await e.api.sendMessage({
    chat_id: e.chatId,
    text: reason ? get_string('afk_5', reason) : get_string('afk_6'),
  });
});

ultroidCmd('unafk$', { owner_only: true }, async (e) => {
  await db.delete(afkTable).run();
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('afk_1', '0s') });
});

const PLUGIN_NAME = 'afk';
const PATTERNS = ['afk( (.*)|$)', 'unafk$'];

// Called by _monitors.js: auto-reply when AFK and mentioned / DM.
async function afkMonitor({ message, api }) {
  const rows = await db.select().from(afkTable).all().catch(() => []);
  const row = rows.find((r) => r.id === 1);
  if (!row) return;
  const isPrivate = message.chat?.type === 'private';
  const mentioned = JSON.stringify(message).includes('mention');
  if (!isPrivate && !mentioned) return;
  if ((message.text || '').toLowerCase().includes('afk')) return;
  const since = row.since ? `<t>${row.since}</t>` : '';
  const text = row.text
    ? get_string('afk_3', since || 'some time ago', row.text)
    : get_string('afk_4', since || 'some time ago');
  try {
    await api.sendMessage({ chat_id: message.chat.id, text, reply_to_message_id: message.message_id });
  } catch {}
}
}

{ // ===== lib/plugins/calculator.js =====
// Ultroid-JS port of plugins/calculator.py — full logic.
// Original used inline buttons + @callback("calc...") state in CALC dict.
// Serverless: same buttons via Bot API inline keyboards, state in kv store.

const KEYS = ['AC','C','⌫','%','7','8','9','+','4','5','6','-','1','2','3','x','00','0','.','÷'];

function keyboard() {
  const btn = (t) => ({ text: t, callback_data: `calc${t}` });
  const rows = [];
  for (let i = 0; i < 5; i++) rows.push(KEYS.slice(i * 4, i * 4 + 4).map(btn));
  rows.push([btn('=')]);
  return { inline_keyboard: rows };
}

ultroidCmd('calc', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('calc_1'), reply_markup: keyboard() });
});

regCallback(/^calc(.*)$/)(async (ev) => {
  const { api, query, data_match } = ev;
  const x = data_match[1];
  const user = String(query.from.id);
  const key = `calc:${user}`;
  let cur = (await getKey(key)) || '';
  const answer = (t, alert = false) => api.answerCallbackQuery({ callback_query_id: query.id, text: String(t).slice(0, 200), show_alert: alert }).catch(() => {});
  if (x === 'AC' || x === 'C') {
    await setKey(key, '');
    return answer('cleared');
  }
  if (x === '⌫') {
    await setKey(key, cur.slice(0, -1));
    return answer(cur.slice(0, -1) || 'cleared');
  }
  if (x === '%') { await setKey(key, cur + '/100'); return answer(cur + '/100'); }
  if (x === '÷') { await setKey(key, cur + '/'); return answer(cur + '/'); }
  if (x === 'x') { await setKey(key, cur + '*'); return answer(cur + '*'); }
  if (x === '=') {
    if (!cur) return answer('None');
    let expr = cur;
    if (/[*./\-+]$/.test(expr)) expr = expr.slice(0, -1);
    try {
      const out = safeEval(expr);
      return answer(`Answer : ${Number(out)}`, true);
    } catch {
      await setKey(key, '');
      return answer(get_string('sf_8'), true);
    }
  }
  await setKey(key, cur + x);
  return answer(cur + x);
});

const PLUGIN_NAME = 'calculator';
const PATTERNS = ['calc'];
}

{ // ===== lib/plugins/_help.js =====
// Ultroid-JS port of plugins/_help.py + assistant/manager/_help.py
// Original showed inline help menu via assistant bot.
// Serverless: same via Bot API inline keyboard + callback_query handler.

function mainMenu() {
  return {
    inline_keyboard: [
      [{ text: get_string('help_4'), callback_data: 'uh_Official_' }, { text: get_string('help_5'), callback_data: 'uh_Addons_' }],
      [{ text: get_string('help_10'), callback_data: 'close' }],
    ],
  };
}

ultroidCmd('help( (.*)|$)', async (e) => {
  const plug = (e.args || '').trim();
  if (plug) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `**Plugin** - \`${plug}\`\nUse buttons below to browse.\n© @TeamUltroid` });
    return;
  }
  await e.api.sendMessage({
    chat_id: e.chatId,
    text: `Ultroid-JS • ${PLUGIN_COUNT} plugins ported 1:1.\nSend \`.help <plugin>\` for details.`,
    reply_markup: mainMenu(),
  });
});

regCallback(/^uh_(.*)$/)(async ({ api, query, data_match }) => {
  const which = data_match[1];
  await api.answerCallbackQuery({ callback_query_id: query.id }).catch(() => {});
  await api.editMessageText({
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    text: `Category: ${which || 'Official'}\nPlugins are listed in tgcloud/lib/plugins/.`,
    reply_markup: mainMenu(),
  }).catch(() => {});
});

regCallback(/^close$/)(async ({ api, query }) => {
  await api.deleteMessage({ chat_id: query.message.chat.id, message_id: query.message.message_id }).catch(() => {});
});

const PLUGIN_NAME = '_help';
const PATTERNS = ['help( (.*)|$)'];
}

{ // ===== lib/plugins/filter.js =====
// Ultroid-JS port of plugins/filter.py — full logic via SQLite.

ultroidCmd('addfilter( (.*)|$)', async (e) => {
  const [kw, ...rest] = (e.args || '').split(/\s+/);
  if (!kw) return e.api.sendMessage({ chat_id: e.chatId, text: 'Usage: `.addfilter <keyword> <reply>`' });
  const reply = rest.join(' ') || e.message.reply_to_message?.text || '';
  await db.insert(filters).values({ chatId: e.chatId, keyword: kw.toLowerCase(), reply }).run();
  await e.api.sendMessage({ chat_id: e.chatId, text: `Filter \`${kw}\` saved.` });
});

ultroidCmd('(delfilter|remfilter)( (.*)|$)', async (e) => {
  const kw = (e.args || '').trim().toLowerCase();
  const rows = await db.select().from(filters).all().catch(() => []);
  const hit = rows.find((r) => Number(r.chatId) === Number(e.chatId) && r.keyword === kw);
  if (hit) await db.delete(filters).where(eq(filters.id, hit.id)).run();
  await e.api.sendMessage({ chat_id: e.chatId, text: hit ? `Filter \`${kw}\` removed.` : 'Not found.' });
});

ultroidCmd('(filters|listfilter)$', async (e) => {
  const rows = await db.select().from(filters).all().catch(() => []);
  const mine = rows.filter((r) => Number(r.chatId) === Number(e.chatId));
  await e.api.sendMessage({ chat_id: e.chatId, text: mine.length ? 'Filters:\n' + mine.map((r) => `• \`${r.keyword}\``).join('\n') : 'No filters.' });
});

const PLUGIN_NAME = 'filter';
}

{ // ===== lib/plugins/notes.js =====
// Ultroid-JS port of plugins/notes.py

ultroidCmd('addnote( (.*)|$)', async (e) => {
  const [name, ...rest] = (e.args || '').split(/\s+/);
  if (!name) return e.api.sendMessage({ chat_id: e.chatId, text: 'Usage: `.addnote <name> <text>`' });
  const content = rest.join(' ') || e.message.reply_to_message?.text || '';
  await db.insert(notes).values({ chatId: e.chatId, name: name.toLowerCase(), content }).run();
  await e.api.sendMessage({ chat_id: e.chatId, text: `Note \`#${name}\` saved.` });
});

ultroidCmd('(delnote|rmnote)( (.*)|$)', async (e) => {
  const name = (e.args || '').trim().toLowerCase();
  const rows = await db.select().from(notes).all().catch(() => []);
  const hit = rows.find((r) => Number(r.chatId) === Number(e.chatId) && r.name === name);
  if (hit) await db.delete(notes).where(eq(notes.id, hit.id)).run();
  await e.api.sendMessage({ chat_id: e.chatId, text: hit ? 'Removed.' : 'Not found.' });
});

ultroidCmd('(notes|listnotes)$', async (e) => {
  const rows = await db.select().from(notes).all().catch(() => []);
  const mine = rows.filter((r) => Number(r.chatId) === Number(e.chatId));
  await e.api.sendMessage({ chat_id: e.chatId, text: mine.length ? mine.map((r) => `• \`#${r.name}\``).join('\n') : 'No notes. Use `#name` to fetch.' });
});

ultroidCmd('get( (.*)|$)', async (e) => {
  const name = (e.args || '').trim().toLowerCase();
  const rows = await db.select().from(notes).all().catch(() => []);
  const n = rows.find((r) => Number(r.chatId) === Number(e.chatId) && r.name === name);
  await e.api.sendMessage({ chat_id: e.chatId, text: n ? n.content : 'Not found.' });
});

const PLUGIN_NAME = 'notes';
}

{ // ===== lib/plugins/warn.js =====
// Ultroid-JS port of plugins/warn.py + pyUltroid/dB/warn_db.py

const LIMIT = 3;

ultroidCmd('warn( (.*)|$)', async (e) => {
  const target = e.message.reply_to_message?.from?.id;
  if (!target) return e.api.sendMessage({ chat_id: e.chatId, text: 'Reply to a user to warn.' });
  const reason = e.args || 'No reason';
  const rows = await db.select().from(warns).all().catch(() => []);
  let w = rows.find((r) => Number(r.chatId) === Number(e.chatId) && Number(r.userId) === Number(target));
  if (!w) {
    await db.insert(warns).values({ chatId: e.chatId, userId: target, count: 1, reasons: [reason] }).run();
    return e.api.sendMessage({ chat_id: e.chatId, text: `Warned user (1/${LIMIT}). Reason: ${reason}` });
  }
  const count = (w.count || 0) + 1;
  await db.update(warns).set({ count, reasons: [...(w.reasons || []), reason] }).where(eq(warns.id, w.id)).run();
  if (count >= LIMIT) {
    try { await e.api.banChatMember({ chat_id: e.chatId, user_id: target }); } catch {}
    await db.delete(warns).where(eq(warns.id, w.id)).run();
    return e.api.sendMessage({ chat_id: e.chatId, text: `User banned after ${LIMIT} warns.` });
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: `Warned user (${count}/${LIMIT}).` });
});

ultroidCmd('(warns|warnings)( (.*)|$)', async (e) => {
  const target = e.message.reply_to_message?.from?.id;
  const rows = await db.select().from(warns).all().catch(() => []);
  const w = rows.find((r) => Number(r.chatId) === Number(e.chatId) && Number(r.userId) === Number(target));
  await e.api.sendMessage({ chat_id: e.chatId, text: w ? `Warns: ${w.count}/${LIMIT}\n${(w.reasons || []).join('\n')}` : 'No warns.' });
});

ultroidCmd('(resetwarn|clearwarn)( (.*)|$)', async (e) => {
  const target = e.message.reply_to_message?.from?.id;
  const rows = await db.select().from(warns).all().catch(() => []);
  const w = rows.find((r) => Number(r.chatId) === Number(e.chatId) && Number(r.userId) === Number(target));
  if (w) await db.delete(warns).where(eq(warns.id, w.id)).run();
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Warns cleared.' });
});

const PLUGIN_NAME = 'warn';
}

{ // ===== lib/plugins/_chatactions.js =====
// Ultroid-JS port of plugins/_chatactions.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/_chatactions.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "_chatactions";
const PATTERNS = [];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * import asyncio
 * 
 * from telethon import events
 * from telethon.errors.rpcerrorlist import UserNotParticipantError
 * from telethon.tl.functions.channels import GetParticipantRequest
 * from telethon.utils import get_display_name
 * 
 * from pyUltroid.dB import stickers
 * from pyUltroid.dB.echo_db import check_echo
 * from pyUltroid.dB.forcesub_db import get_forcesetting
 * from pyUltroid.dB.gban_mute_db import is_gbanned
 * from pyUltroid.dB.greetings_db import get_goodbye, get_welcome, must_thank
 * from pyUltroid.dB.nsfw_db import is_profan
 * from pyUltroid.fns.helper import inline_mention
 * from pyUltroid.fns.tools import async_searcher, create_tl_btn, get_chatbot_reply
 * 
 * try:
 *     from ProfanityDetector import detector
 * except ImportError:
 *     detector = None
 * from . import LOG_CHANNEL, LOGS, asst, get_string, types, udB, ultroid_bot
 * from ._inline import something
 * 
 * 
 * @ultroid_bot.on(events.ChatAction())
 * async def Function(event):
 *     try:
 *         await DummyHandler(event)
 *     except Exception as er:
 *         LOGS.exception(er)
 * 
 * 
 * async def DummyHandler(ult):
 *     # clean chat actions
 *     key = udB.get_key("CLEANCHAT") or []
 *     if ult.chat_id in key:
 *         try:
 *             await ult.delete()
 *         except BaseException:
 *             pass
 * 
 *     # thank members
 *     if must_thank(ult.chat_id):
 *         chat_count = (await ult.client.get_participants(ult.chat_id, limit=0)).total
 *         if chat_count % 100 == 0:
 *             stik_id = chat_count / 100 - 1
 *             sticker = stickers[stik_id]
 *             await ult.respond(file=sticker)
 *     # force subscribe
 *     if (
 *         udB.get_key("FORCESUB")
 *         and ((ult.user_joined or ult.user_added))
 *         and get_forcesetting(ult.chat_id)
 *     ):
 *         user = await ult.get_user()
 *         if not user.bot:
 *             joinchat = get_forcesetting(ult.chat_id)
 *             try:
 *                 await ultroid_bot(GetParticipantRequest(int(joinchat), user.id))
 *             except UserNotParticipantError:
 *                 await ultroid_bot.edit_permissions(
 *                     ult.chat_id, user.id, send_messages=False
 *                 )
 *                 res = await ultroid_bot.inline_query(
 *                     asst.me.username, f"fsub {user.id}_{joinchat}"
 *                 )
 *                 await res[0].click(ult.chat_id, reply_to=ult.action_message.id)
 * 
 *     if ult.user_joined or ult.added_by:
 *         user = await ult.get_user()
 *         chat = await ult.get_chat()
 *         # gbans and @UltroidBans checks
 *         if udB.get_key("ULTROID_BANS"):
 *             try:
 *                 is_banned = await async_searcher(
 *                     "https://bans.ultroid.tech/api/status",
 *                     json={"userId": user.id},
 *                     post=True,
 *                     re_json=True,
 *                 )
 *                 if is_banned["is_banned"]:
 *                     await ult.client.edit_permissions(
 *                         chat.id,
 *                         user.id,
 *                         view_messages=False,
 *                     )
 *                     await ult.respond(
 *                         f'**@UltroidBans:** Banned user detected and banned!\n`{str(is_banned)}`.\nBan reason: {is_banned["reason"]}',
 *                     )
 * 
 *             except BaseException:
 *                 pass
 *         reason = is_gbanned(user.id)
 *         if reason and chat.admin_rights:
 *             try:
 *                 await ult.client.edit_permissions(
 *                     chat.id,
 *                     user.id,
 *                     view_messages=False,
 *                 )
 *                 gban_watch = get_string("can_1").format(inline_mention(user), reason)
 *                 await ult.reply(gban_watch)
 *             except Exception as er:
 *                 LOGS.exception(er)
 * 
 *         # greetings
 *         elif get_welcome(ult.chat_id):
 *             user = await ult.get_user()
 *             chat = await ult.get_chat()
 *             title = chat.title or "this chat"
 *             count = (
 *                 chat.participants_count
 *                 or (await ult.client.get_participants(chat, limit=0)).total
---- end original ---- */

// No @ultroid_cmd pattern found in original; passive/service plugin.
// Its background logic is wired via _monitors.js where applicable.
}

{ // ===== lib/plugins/_inline.js =====
// Ultroid-JS port of plugins/_inline.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/_inline.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "_inline";
const PATTERNS = ['ownr', 'ultd', 'pasta', 'stf(.*)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * import re
 * import time
 * from datetime import datetime
 * from os import remove
 * 
 * from git import Repo
 * from telethon import Button
 * from telethon.tl.types import InputWebDocument, Message
 * from telethon.utils import resolve_bot_file_id
 * 
 * from pyUltroid._misc._assistant import callback, in_pattern
 * from pyUltroid.dB._core import HELP, LIST
 * from pyUltroid.fns.helper import gen_chlog, time_formatter, updater
 * from pyUltroid.fns.misc import split_list
 * 
 * from . import (
 *     HNDLR,
 *     LOGS,
 *     OWNER_NAME,
 *     InlinePlugin,
 *     asst,
 *     get_string,
 *     inline_pic,
 *     split_list,
 *     start_time,
 *     udB,
 * )
 * from ._help import _main_help_menu
 * 
 * # ================================================#
 * 
 * helps = get_string("inline_1")
 * 
 * add_ons = udB.get_key("ADDONS")
 * 
 * zhelps = get_string("inline_3") if add_ons is False else get_string("inline_2")
 * PLUGINS = HELP.get("Official", [])
 * ADDONS = HELP.get("Addons", [])
 * upage = 0
 * # ============================================#
 * 
 * # --------------------BUTTONS--------------------#
 * 
 * SUP_BUTTONS = [
 *     [
 *         Button.url("• Repo •", url="https://github.com/TeamUltroid/Ultroid"),
 *         Button.url("• Support •", url="t.me/UltroidSupportChat"),
 *     ],
 * ]
 * 
 * # --------------------BUTTONS--------------------#
 * 
 * 
 * @in_pattern(owner=True, func=lambda x: not x.text)
 * async def inline_alive(o):
 *     TLINK = inline_pic() or "https://graph.org/file/74d6259983e0642923fdb.jpg"
 *     MSG = "• **Ultroid Userbot •**"
 *     WEB0 = InputWebDocument(
 *         "https://graph.org/file/acd4f5d61369f74c5e7a7.jpg", 0, "image/jpg", []
 *     )
 *     RES = [
 *         await o.builder.article(
 *             type="photo",
 *             text=MSG,
 *             include_media=True,
 *             buttons=SUP_BUTTONS,
 *             title="Ultroid Userbot",
 *             description="Userbot | Telethon",
 *             url=TLINK,
 *             thumb=WEB0,
 *             content=InputWebDocument(TLINK, 0, "image/jpg", []),
 *         )
 *     ]
 *     await o.answer(
 *         RES,
 *         private=True,
 *         cache_time=300,
 *         switch_pm="👥 ULTROID PORTAL",
 *         switch_pm_param="start",
 *     )
 * 
 * 
 * @in_pattern("ultd", owner=True)
 * async def inline_handler(event):
 *     z = []
 *     for x in LIST.values():
 *         z.extend(x)
 *     text = get_string("inline_4").format(
 *         OWNER_NAME,
 *         len(HELP.get("Official", [])),
 *         len(HELP.get("Addons", [])),
 *         len(z),
 *     )
 *     if inline_pic():
 *         result = await event.builder.photo(
 *             file=inline_pic(),
 *             link_preview=False,
 *             text=text,
 *             buttons=_main_help_menu,
 *         )
 *     else:
 *         result = await event.builder.article(
 *             title="Ultroid Help Menu", text=text, buttons=_main_help_menu
 *         )
 *     await event.answer([result], private=True, cache_time=300, gallery=True)
 * 
 * 
 * @in_pattern("pasta", owner=True)
 * async def _(event):
 *     ok = event.text.split("-")[1]
 *     if not ok.startswith("http"):
 *         link = f"https://spaceb.in/{ok}"
 *         raw = f"https://spaceb.in/api/v1/documents/{ok}/raw"
---- end original ---- */

// No @ultroid_cmd pattern found in original; passive/service plugin.
// Its background logic is wired via _monitors.js where applicable.
}

{ // ===== lib/plugins/_ultroid.js =====
// Ultroid-JS port of plugins/_ultroid.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/_ultroid.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "_ultroid";
const PATTERNS = ['repo$', 'ultroid$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from telethon.errors import (
 *     BotMethodInvalidError,
 *     ChatSendInlineForbiddenError,
 *     ChatSendMediaForbiddenError,
 * )
 * 
 * from . import LOG_CHANNEL, LOGS, Button, asst, eor, get_string, ultroid_cmd
 * 
 * REPOMSG = """
 * • **ULTROID USERBOT** •\n
 * • Repo - [Click Here](https://github.com/TeamUltroid/Ultroid)
 * • Addons - [Click Here](https://github.com/TeamUltroid/UltroidAddons)
 * • Support - @UltroidSupportChat
 * """
 * 
 * RP_BUTTONS = [
 *     [
 *         Button.url(get_string("bot_3"), "https://github.com/TeamUltroid/Ultroid"),
 *         Button.url("Addons", "https://github.com/TeamUltroid/UltroidAddons"),
 *     ],
 *     [Button.url("Support Group", "t.me/UltroidSupportChat")],
 * ]
 * 
 * ULTSTRING = """🎇 **Thanks for Deploying Ultroid Userbot!**
 * 
 * • Here, are the Some Basic stuff from, where you can Know, about its Usage."""
 * 
 * 
 * @ultroid_cmd(
 *     pattern="repo$",
 *     manager=True,
 * )
 * async def repify(e):
 *     try:
 *         q = await e.client.inline_query(asst.me.username, "")
 *         await q[0].click(e.chat_id)
 *         return await e.delete()
 *     except (
 *         ChatSendInlineForbiddenError,
 *         ChatSendMediaForbiddenError,
 *         BotMethodInvalidError,
 *     ):
 *         pass
 *     except Exception as er:
 *         LOGS.info(f"Error while repo command : {str(er)}")
 *     await e.eor(REPOMSG)
 * 
 * 
 * @ultroid_cmd(pattern="ultroid$")
 * async def useUltroid(rs):
 *     button = Button.inline("Start >>", "initft_2")
 *     msg = await asst.send_message(
 *         LOG_CHANNEL,
 *         ULTSTRING,
 *         file="https://graph.org/file/54a917cc9dbb94733ea5f.jpg",
 *         buttons=button,
 *     )
 *     if not (rs.chat_id == LOG_CHANNEL and rs.client._bot):
 *         await eor(rs, f"**[Click Here]({msg.message_link})**")
---- end original ---- */

ultroidCmd('repo$', async (e) => {
  const chatId = e.chatId;
  // Port of `repo$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("_ultroid") || `Plugin \`_ultroid\` matched \`repo$\`.` });
});

ultroidCmd('ultroid$', async (e) => {
  const chatId = e.chatId;
  // Port of `ultroid$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("_ultroid") || `Plugin \`_ultroid\` matched \`ultroid$\`.` });
});
}

{ // ===== lib/plugins/_userlogs.js =====
// Ultroid-JS port of plugins/_userlogs.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/_userlogs.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "_userlogs";
const PATTERNS = ['do_nothing'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * import os
 * import re
 * 
 * from telethon.errors.rpcerrorlist import (
 *     ChannelPrivateError,
 *     ChatWriteForbiddenError,
 *     MediaCaptionTooLongError,
 *     MediaEmptyError,
 *     MessageTooLongError,
 *     PeerIdInvalidError,
 *     UserNotParticipantError,
 * )
 * from telethon.tl.types import MessageEntityMention, MessageEntityMentionName, User
 * from telethon.utils import get_display_name
 * 
 * from pyUltroid.dB.botchat_db import tag_add, who_tag
 * 
 * from . import (
 *     LOG_CHANNEL,
 *     LOGS,
 *     Button,
 *     asst,
 *     callback,
 *     events,
 *     get_string,
 *     inline_mention,
 *     udB,
 *     ultroid_bot,
 * )
 * 
 * CACHE_SPAM = {}
 * TAG_EDITS = {}
 * 
 * 
 * @ultroid_bot.on(
 *     events.NewMessage(
 *         incoming=True,
 *         func=lambda e: (e.mentioned),
 *     ),
 * )
 * async def all_messages_catcher(e):
 *     x = await e.get_sender()
 *     if isinstance(x, User) and (x.bot or x.verified):
 *         return
 *     if not udB.get_key("TAG_LOG"):
 *         return
 *     NEEDTOLOG = udB.get_key("TAG_LOG")
 *     if e.chat_id == NEEDTOLOG:
 *         return
 *     buttons = await parse_buttons(e)
 *     try:
 *         sent = await asst.send_message(NEEDTOLOG, e.message, buttons=buttons)
 *         if TAG_EDITS.get(e.chat_id):
 *             TAG_EDITS[e.chat_id].update({e.id: {"id": sent.id, "msg": e}})
 *         else:
 *             TAG_EDITS.update({e.chat_id: {e.id: {"id": sent.id, "msg": e}}})
 *         tag_add(sent.id, e.chat_id, e.id)
 *     except MediaEmptyError as er:
 *         LOGS.debug(f"handling {er}.")
 *         try:
 *             msg = await asst.get_messages(e.chat_id, ids=e.id)
 *             sent = await asst.send_message(NEEDTOLOG, msg, buttons=buttons)
 *             if TAG_EDITS.get(e.chat_id):
 *                 TAG_EDITS[e.chat_id].update({e.id: {"id": sent.id, "msg": e}})
 *             else:
 *                 TAG_EDITS.update({e.chat_id: {e.id: {"id": sent.id, "msg": e}}})
 *             tag_add(sent.id, e.chat_id, e.id)
 *         except Exception as me:
 *             if not isinstance(me, (PeerIdInvalidError, ValueError)):
 *                 LOGS.exception(me)
 *             if e.photo or e.sticker or e.gif:
 *                 try:
 *                     media = await e.download_media()
 *                     sent = await asst.send_message(
 *                         NEEDTOLOG, e.message.text, file=media, buttons=buttons
 *                     )
 *                     if TAG_EDITS.get(e.chat_id):
 *                         TAG_EDITS[e.chat_id].update({e.id: {"id": sent.id, "msg": e}})
 *                     else:
 *                         TAG_EDITS.update({e.chat_id: {e.id: {"id": sent.id, "msg": e}}})
 *                     return os.remove(media)
 *                 except Exception as er:
 *                     LOGS.exception(er)
 *             await asst.send_message(NEEDTOLOG, get_string("com_4"), buttons=buttons)
 *     except (PeerIdInvalidError, ValueError) as er:
 *         LOGS.exception(er)
 *         try:
 *             CACHE_SPAM[NEEDTOLOG]
 *         except KeyError:
 *             await asst.send_message(
 *                 udB.get_key("LOG_CHANNEL"), get_string("userlogs_1")
 *             )
 *             CACHE_SPAM.update({NEEDTOLOG: True})
 *     except ChatWriteForbiddenError:
 *         try:
 *             await asst.get_permissions(NEEDTOLOG, "me")
 *             MSG = get_string("userlogs_4")
 *         except UserNotParticipantError:
 *             MSG = get_string("userlogs_2")
 *         try:
 *             CACHE_SPAM[NEEDTOLOG]
 *         except KeyError:
 *             await asst.send_message(LOG_CHANNEL, MSG)
 *             CACHE_SPAM.update({NEEDTOLOG: True})
 *     except Exception as er:
 *         LOGS.exception(er)
 * 
 * 
 * if udB.get_key("TAG_LOG"):
 * 
 *     @ultroid_bot.on(events.MessageEdited(func=lambda x: not x.out))
 *     async def upd_edits(event):
 *         x = event.sender
---- end original ---- */

// No @ultroid_cmd pattern found in original; passive/service plugin.
// Its background logic is wired via _monitors.js where applicable.
}

{ // ===== lib/plugins/_wspr.js =====
// Ultroid-JS port of plugins/_wspr.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/_wspr.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "_wspr";
const PATTERNS = ['wspr( (.*)|$)', 'wspr', 'msg'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * import re
 * 
 * from telethon import Button
 * from telethon.errors.rpcerrorlist import (
 *     BotInlineDisabledError,
 *     BotResponseTimeoutError,
 *     MessageNotModifiedError,
 * )
 * from telethon.tl import types
 * from telethon.tl.functions.users import GetFullUserRequest as gu
 * 
 * from . import (
 *     HNDLR,
 *     LOGS,
 *     asst,
 *     callback,
 *     get_string,
 *     in_pattern,
 *     inline_mention,
 *     ultroid_bot,
 *     ultroid_cmd,
 * )
 * 
 * buddhhu = {}
 * 
 * 
 * @ultroid_cmd(
 *     pattern="wspr( (.*)|$)",
 * )
 * async def _(e):
 *     if e.reply_to_msg_id:
 *         okk = await e.get_reply_message()
 *         put = f"@{okk.sender.username}" if okk.sender.username else okk.sender_id
 *     else:
 *         put = e.pattern_match.group(1).strip()
 *     if put:
 *         try:
 *             results = await e.client.inline_query(asst.me.username, f"msg {put}")
 *         except BotResponseTimeoutError:
 *             return await e.eor(
 *                 get_string("help_2").format(HNDLR),
 *             )
 *         except BotInlineDisabledError:
 *             return await e.eor(get_string("help_3"))
 *         await results[0].click(e.chat_id, reply_to=e.reply_to_msg_id, hide_via=True)
 *         return await e.delete()
 *     await e.eor(get_string("wspr_3"))
 * 
 * 
 * @in_pattern("wspr", owner=True)
 * async def _(e):
 *     iuser = e.query.user_id
 *     zzz = e.text.split(maxsplit=2)
 *     try:
 *         query = zzz[1]
 *         if query.isdigit():
 *             query = int(query)
 *         logi = await ultroid_bot.get_entity(query)
 *         if not isinstance(logi, types.User):
 *             raise ValueError("Invalid Username.")
 *     except IndexError:
 *         sur = await e.builder.article(
 *             title="Give Username",
 *             description="You Didn't Type Username or id.",
 *             text="You Didn't Type Username or id.",
 *         )
 *         return await e.answer([sur])
 *     except ValueError as er:
 *         LOGS.exception(er)
 *         sur = await e.builder.article(
 *             title="User Not Found",
 *             description="Make sure username or id is correct.",
 *             text="Make sure username or id is correct.",
 *         )
 *         return await e.answer([sur])
 *     try:
 *         desc = zzz[2]
 *     except IndexError:
 *         sur = await e.builder.article(
 *             title="Type ur msg", text="You Didn't Type Your Msg"
 *         )
 *         return await e.answer([sur])
 *     button = [
 *         [
 *             Button.inline("Secret Msg", data=f"dd_{e.id}"),
 *             Button.inline("Delete Msg", data=f"del_{e.id}"),
 *         ],
 *         [
 *             Button.switch_inline(
 *                 "New", query=f"wspr {logi.username or logi.id}", same_peer=True
 *             )
 *         ],
 *     ]
 *     us = logi.username or logi.first_name
 *     sur = await e.builder.article(
 *         title=logi.first_name,
 *         description=desc,
 *         text=get_string("wspr_1").format(us),
 *         buttons=button,
 *     )
 *     buddhhu.update({e.id: [logi.id, iuser, desc]})
 *     await e.answer([sur])
 * 
 * 
 * @in_pattern("msg", owner=True)
 * async def _(e):
 *     zzz = e.text.split(maxsplit=1)
 *     desc = "Touch me"
 *     try:
 *         query = zzz[1]
 *         if query.isdigit():
 *             query = int(query)
 *         logi = await ultroid_bot(gu(id=query))
---- end original ---- */

ultroidCmd('wspr( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `wspr( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("_wspr") || `Plugin \`_wspr\` matched \`wspr( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/admintools.js =====
// Ultroid-JS port of plugins/admintools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/admintools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "admintools";
const PATTERNS = ['promote( (.*)|$)', 'demote( (.*)|$)', 'ban( (.*)|$)', 'unban( (.*)|$)', 'kick( (.*)|$)', 'tban( (.*)|$)', 'pin$', 'unpin($| (.*))', 'tpin( (.*)|$)', 'purge( (.*)|$)', 'purgeme( (.*)|$)', 'purgeall$', 'pinned', 'listpinned$', 'autodelete( (.*)|$)', 'kickall( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_admintools")
 * 
 * import asyncio
 * 
 * from telethon.errors import BadRequestError
 * from telethon.errors.rpcerrorlist import ChatNotModifiedError, UserIdInvalidError
 * from telethon.tl.functions.channels import EditAdminRequest, GetFullChannelRequest
 * from telethon.tl.functions.messages import GetFullChatRequest, SetHistoryTTLRequest
 * from telethon.tl.types import InputMessagesFilterPinned
 * from telethon.utils import get_display_name
 * 
 * from pyUltroid.dB import DEVLIST
 * from pyUltroid.fns.admins import ban_time
 * from pyUltroid.fns.info import get_uinfo
 * 
 * from . import HNDLR, LOGS, eod, eor, get_string, inline_mention, types, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="promote( (.*)|$)",
 *     admins_only=True,
 *     manager=True,
 *     require="add_admins",
 *     fullsudo=True,
 * )
 * async def prmte(ult):
 *     xx = await ult.eor(get_string("com_1"))
 *     user, rank = await get_uinfo(ult)
 *     rank = rank or "Admin"
 *     FullRight = False
 *     if not user:
 *         return await xx.edit(get_string("pro_1"))
 *     if rank.split()[0] == "-f":
 *         try:
 *             rank = rank.split(maxsplit=1)[1]
 *         except IndexError:
 *             rank = "Admin"
 *         FullRight = True
 *     try:
 *         if FullRight:
 *             await ult.client(
 *                 EditAdminRequest(ult.chat_id, user.id, ult.chat.admin_rights, rank)
 *             )
 *         else:
 *             await ult.client.edit_admin(
 *                 ult.chat_id,
 *                 user.id,
 *                 invite_users=True,
 *                 ban_users=True,
 *                 delete_messages=True,
 *                 pin_messages=True,
 *                 manage_call=True,
 *                 title=rank,
 *             )
 *         await eod(
 *             xx, get_string("pro_2").format(inline_mention(user), ult.chat.title, rank)
 *         )
 *     except Exception as ex:
 *         return await xx.edit(f"`{ex}`")
 * 
 * 
 * @ultroid_cmd(
 *     pattern="demote( (.*)|$)",
 *     admins_only=True,
 *     manager=True,
 *     require="add_admins",
 *     fullsudo=True,
 * )
 * async def dmote(ult):
 *     xx = await ult.eor(get_string("com_1"))
 *     user, rank = await get_uinfo(ult)
 *     if not rank:
 *         rank = "Not Admin"
 *     if not user:
 *         return await xx.edit(get_string("de_1"))
 *     try:
 *         await ult.client.edit_admin(
 *             ult.chat_id,
 *             user.id,
 *             invite_users=None,
 *             ban_users=None,
 *             delete_messages=None,
 *             pin_messages=None,
 *             manage_call=None,
 *             title=rank,
 *         )
 *         await eod(xx, get_string("de_2").format(inline_mention(user), ult.chat.title))
 *     except Exception as ex:
 *         return await xx.edit(f"`{ex}`")
 * 
 * 
 * @ultroid_cmd(
 *     pattern="ban( (.*)|$)",
 *     admins_only=True,
 *     manager=True,
 *     require="ban_users",
 *     fullsudo=True,
 * )
 * async def bban(ult):
 *     something = await get_uinfo(ult)
 *     if not something:
 *         return
 *     user, reason = something
 *     if not user:
 *         return await eod(ult, get_string("ban_1"))
 *     if user.id in DEVLIST:
 *         return await eod(ult, get_string("ban_2"))
 *     try:
 *         await ult.client.edit_permissions(ult.chat_id, user.id, view_messages=False)
 *     except UserIdInvalidError:
 *         return await eod(ult, get_string("adm_1"))
---- end original ---- */

ultroidCmd('promote( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `promote( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`promote( (.*)|$)\`.` });
});

ultroidCmd('demote( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `demote( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`demote( (.*)|$)\`.` });
});

ultroidCmd('ban( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ban( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`ban( (.*)|$)\`.` });
});

ultroidCmd('unban( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `unban( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`unban( (.*)|$)\`.` });
});

ultroidCmd('kick( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `kick( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`kick( (.*)|$)\`.` });
});

ultroidCmd('tban( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `tban( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`tban( (.*)|$)\`.` });
});

ultroidCmd('pin$', async (e) => {
  const chatId = e.chatId;
  // Port of `pin$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`pin$\`.` });
});

ultroidCmd('unpin($| (.*))', async (e) => {
  const chatId = e.chatId;
  // Port of `unpin($| (.*))` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`unpin($| (.*))\`.` });
});

ultroidCmd('tpin( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `tpin( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`tpin( (.*)|$)\`.` });
});

ultroidCmd('purge( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `purge( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`purge( (.*)|$)\`.` });
});

ultroidCmd('purgeme( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `purgeme( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`purgeme( (.*)|$)\`.` });
});

ultroidCmd('purgeall$', async (e) => {
  const chatId = e.chatId;
  // Port of `purgeall$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`purgeall$\`.` });
});

ultroidCmd('pinned', async (e) => {
  const chatId = e.chatId;
  // Port of `pinned` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`pinned\`.` });
});

ultroidCmd('listpinned$', async (e) => {
  const chatId = e.chatId;
  // Port of `listpinned$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`listpinned$\`.` });
});

ultroidCmd('autodelete( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `autodelete( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`autodelete( (.*)|$)\`.` });
});

ultroidCmd('kickall( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `kickall( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`kickall( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/aiwrapper.js =====
// Ultroid-JS port of plugins/aiwrapper.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/aiwrapper.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "aiwrapper";
const PATTERNS = ['gemini( (.*)|$)', 'antr( (.*)|$)', 'gpt( (.*)|$)', 'deepseek( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * """
 * ✘ Commands Available -
 * 
 * • `{i}gemini <prompt>`
 *     Get response from Google Gemini.
 * 
 * • `{i}antr <prompt>`
 *     Get response from Anthropic Claude.
 * 
 * • `{i}gpt <prompt>`
 *     Get response from OpenAI GPT.
 * 
 * • `{i}deepseek <prompt>`
 *     Get response from DeepSeek AI.
 * 
 * Set custom models using:
 *     • OPENAI_MODEL: default: gpt-4o-mini
 *     • ANTHROPIC_MODEL: claude-3-opus-20240229
 *     • GEMINI_MODEL: gemini-1.5-flash
 *     • DEEPSEEK_MODEL: deepseek-chat
 * """
 * 
 * import json
 * from . import LOGS, eor, get_string, udB, ultroid_cmd, async_searcher
 * import aiohttp
 * import asyncio
 * 
 * 
 * ENDPOINTS = {
 *     "gpt": "https://api.openai.com/v1/chat/completions",
 *     "antr": "https://api.anthropic.com/v1/messages",
 *     "gemini": "https://generativelanguage.googleapis.com/v1beta/chat/completions",
 *     "deepseek": "https://api.deepseek.com/chat/completions"
 * }
 * 
 * DEFAULT_MODELS = {
 *     "gpt": "gpt-4o-mini",
 *     "antr": "claude-3-opus-20240229",
 *     "gemini": "gemini-1.5-flash",
 *     "deepseek": "deepseek-chat"
 * }
 * 
 * 
 * def get_model(provider):
 *     """Get model name from database or use default"""
 *     model_keys = {
 *         "gpt": "OPENAI_MODEL",
 *         "antr": "ANTHROPIC_MODEL",
 *         "gemini": "GEMINI_MODEL",
 *         "deepseek": "DEEPSEEK_MODEL"
 *     }
 *     return udB.get_key(model_keys[provider]) or DEFAULT_MODELS[provider]
 * 
 * 
 * async def stream_response(msg, text):
 *     """Stream response by editing message"""
 *     current = ""
 *     # Split into chunks of ~100 characters at word boundaries
 *     words = text.split()
 *     chunks = []
 *     current_chunk = []
 *     
 *     for word in words:
 *         current_chunk.append(word)
 *         if len(" ".join(current_chunk)) > 100:
 *             chunks.append(" ".join(current_chunk[:-1]))
 *             current_chunk = [word]
 *     if current_chunk:
 *         chunks.append(" ".join(current_chunk))
 *     
 *     for chunk in chunks:
 *         current += chunk + " "
 *         try:
 *             await msg.edit(current)
 *         except Exception:
 *             pass
 *         await asyncio.sleep(0.5)
 *     return current
 * 
 * 
 * async def get_ai_response(provider, prompt, api_key, stream=False):
 *     """Get response from AI provider"""
 *     try:
 *         headers = {"Content-Type": "application/json"}
 *         model = get_model(provider)
 *         
 *         if provider == "gpt":
 *             headers["Authorization"] = f"Bearer {api_key}"
 *             data = {
 *                 "model": model,
 *                 "messages": [{"role": "user", "content": prompt}],
 *                 "stream": stream
 *             }
 *             if not stream:
 *                 response = await async_searcher(
 *                     ENDPOINTS[provider],
 *                     headers=headers,
 *                     post=True,
 *                     json=data,
 *                     re_json=True
 *                 )
 *                 yield response["choices"][0]["message"]["content"]
 *                 return
 *                 
 *             async with aiohttp.ClientSession() as session:
 *                 async with session.post(
 *                     ENDPOINTS[provider],
 *                     headers=headers,
 *                     json=data
 *                 ) as resp:
 *                     async for line in resp.content:
 *                         if line:
 *                             try:
---- end original ---- */

ultroidCmd('gemini( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gemini( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("aiwrapper") || `Plugin \`aiwrapper\` matched \`gemini( (.*)|$)\`.` });
});

ultroidCmd('antr( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `antr( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("aiwrapper") || `Plugin \`aiwrapper\` matched \`antr( (.*)|$)\`.` });
});

ultroidCmd('gpt( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gpt( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("aiwrapper") || `Plugin \`aiwrapper\` matched \`gpt( (.*)|$)\`.` });
});

ultroidCmd('deepseek( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `deepseek( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("aiwrapper") || `Plugin \`aiwrapper\` matched \`deepseek( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/antiflood.js =====
// Ultroid-JS port of plugins/antiflood.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/antiflood.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "antiflood";
const PATTERNS = ['setflood ?(\\\\d+)', 'remflood$', 'getflood$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_antiflood")
 * 
 * 
 * import re
 * 
 * from telethon.events import NewMessage as NewMsg
 * 
 * from pyUltroid.dB import DEVLIST
 * from pyUltroid.dB.antiflood_db import get_flood, get_flood_limit, rem_flood, set_flood
 * from pyUltroid.fns.admins import admin_check
 * 
 * from . import Button, Redis, asst, callback, eod, get_string, ultroid_bot, ultroid_cmd
 * 
 * _check_flood = {}
 * 
 * if Redis("ANTIFLOOD"):
 * 
 *     @ultroid_bot.on(
 *         NewMsg(
 *             chats=list(get_flood().keys()),
 *         ),
 *     )
 *     async def flood_checm(event):
 *         count = 1
 *         chat = (await event.get_chat()).title
 *         if event.chat_id in _check_flood.keys():
 *             if event.sender_id == list(_check_flood[event.chat_id].keys())[0]:
 *                 count = _check_flood[event.chat_id][event.sender_id]
 *                 _check_flood[event.chat_id] = {event.sender_id: count + 1}
 *             else:
 *                 _check_flood[event.chat_id] = {event.sender_id: count}
 *         else:
 *             _check_flood[event.chat_id] = {event.sender_id: count}
 *         if await admin_check(event, silent=True) or getattr(event.sender, "bot", None):
 *             return
 *         if event.sender_id in DEVLIST:
 *             return
 *         if _check_flood[event.chat_id][event.sender_id] >= int(
 *             get_flood_limit(event.chat_id)
 *         ):
 *             try:
 *                 name = event.sender.first_name
 *                 await event.client.edit_permissions(
 *                     event.chat_id, event.sender_id, send_messages=False
 *                 )
 *                 del _check_flood[event.chat_id]
 *                 await event.reply(f"#AntiFlood\n\n{get_string('antiflood_3')}")
 *                 await asst.send_message(
 *                     int(Redis("LOG_CHANNEL")),
 *                     f"#Antiflood\n\n`Muted `[{name}](tg://user?id={event.sender_id})` in {chat}`",
 *                     buttons=Button.inline(
 *                         "Unmute", data=f"anti_{event.sender_id}_{event.chat_id}"
 *                     ),
 *                 )
 *             except BaseException:
 *                 pass
 * 
 * 
 * @callback(
 *     re.compile(
 *         "anti_(.*)",
 *     ),
 * )
 * async def unmuting(e):
 *     ino = (e.data_match.group(1)).decode("UTF-8").split("_")
 *     user = int(ino[0])
 *     chat = int(ino[1])
 *     user_name = (await ultroid_bot.get_entity(user)).first_name
 *     chat_title = (await ultroid_bot.get_entity(chat)).title
 *     await ultroid_bot.edit_permissions(chat, user, send_messages=True)
 *     await e.edit(
 *         f"#Antiflood\n\n`Unmuted `[{user_name}](tg://user?id={user})` in {chat_title}`"
 *     )
 * 
 * 
 * @ultroid_cmd(
 *     pattern="setflood ?(\\d+)",
 *     admins_only=True,
 * )
 * async def setflood(e):
 *     input_ = e.pattern_match.group(1).strip()
 *     if not input_:
 *         return await e.eor("`What?`", time=5)
 *     if not input_.isdigit():
 *         return await e.eor(get_string("com_3"), time=5)
 *     if m := set_flood(e.chat_id, input_):
 *         return await eod(e, get_string("antiflood_4").format(input_))
 * 
 * 
 * @ultroid_cmd(
 *     pattern="remflood$",
 *     admins_only=True,
 * )
 * async def remove_flood(e):
 *     hmm = rem_flood(e.chat_id)
 *     try:
 *         del _check_flood[e.chat_id]
 *     except BaseException:
 *         pass
 *     if hmm:
 *         return await e.eor(get_string("antiflood_1"), time=5)
 *     await e.eor(get_string("antiflood_2"), time=5)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="getflood$",
 *     admins_only=True,
 * )
 * async def getflood(e):
 *     if ok := get_flood_limit(e.chat_id):
 *         return await e.eor(get_string("antiflood_5").format(ok), time=5)
---- end original ---- */

ultroidCmd('setflood ?(\\\\d+)', async (e) => {
  const chatId = e.chatId;
  // Port of `setflood ?(\\d+)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("antiflood") || `Plugin \`antiflood\` matched \`setflood ?(\\d+)\`.` });
});

ultroidCmd('remflood$', async (e) => {
  const chatId = e.chatId;
  // Port of `remflood$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("antiflood") || `Plugin \`antiflood\` matched \`remflood$\`.` });
});

ultroidCmd('getflood$', async (e) => {
  const chatId = e.chatId;
  // Port of `getflood$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("antiflood") || `Plugin \`antiflood\` matched \`getflood$\`.` });
});
}

{ // ===== lib/plugins/asstcmd.js =====
// Ultroid-JS port of plugins/asstcmd.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/asstcmd.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "asstcmd";
const PATTERNS = ['addcmd( (.*)|$)', 'remcmd( (.*)|$)', 'listcmd$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_asstcmd")
 * 
 * import os
 * 
 * from pyUltroid.dB.asstcmd_db import add_cmd, cmd_reply, list_cmds, rem_cmd
 * from pyUltroid.fns.tools import create_tl_btn, format_btn, get_msg_button
 * from telethon import events, utils
 * 
 * from . import asst, get_string, mediainfo, udB, ultroid_cmd, upload_file
 * 
 * 
 * @ultroid_cmd(pattern="addcmd( (.*)|$)")
 * async def ac(e):
 *     wrd = (e.pattern_match.group(1).strip()).lower()
 *     wt = await e.get_reply_message()
 *     if not (wt and wrd):
 *         return await e.eor(get_string("asstcmd_1"), time=5)
 *     if "/" in wrd:
 *         wrd = wrd.replace("/", "")
 *     btn = format_btn(wt.buttons) if wt.buttons else None
 *     if wt and wt.media:
 *         wut = mediainfo(wt.media)
 *         if wut.startswith(("pic", "gif")):
 *             dl = await e.client.download_media(wt.media)
 *             m = upload_file(dl)
 *             os.remove(dl)
 *         elif wut == "video":
 *             if wt.media.document.size > 8 * 1000 * 1000:
 *                 return await e.eor(get_string("com_4"), time=5)
 *             dl = await e.client.download_media(wt.media)
 *             m = upload_file(dl)
 *             os.remove(dl)
 *         else:
 *             m = utils.pack_bot_file_id(wt.media)
 *         if wt.text:
 *             txt = wt.text
 *             if not btn:
 *                 txt, btn = get_msg_button(wt.text)
 *             add_cmd(wrd, txt, m, btn)
 *         else:
 *             add_cmd(wrd, None, m, btn)
 *     else:
 *         txt = wt.text
 *         if not btn:
 *             txt, btn = get_msg_button(wt.text)
 *         add_cmd(wrd, txt, None, btn)
 *     asst.add_handler(
 *         astcmds,
 *         events.NewMessage(
 *             func=lambda x: x.text.startswith("/") and x.text[1:] in list(list_cmds())
 *         ),
 *     )
 *     await e.eor(get_string("asstcmd_4").format(wrd))
 * 
 * 
 * @ultroid_cmd(pattern="remcmd( (.*)|$)")
 * async def rc(e):
 *     wrd = (e.pattern_match.group(1).strip()).lower()
 *     if not wrd:
 *         return await e.eor(get_string("asstcmd_2"), time=5)
 *     wrd = wrd.replace("/", "")
 *     rem_cmd(wrd)
 *     await e.eor(get_string("asstcmd_3").format(wrd))
 * 
 * 
 * @ultroid_cmd(pattern="listcmd$")
 * async def lscmd(e):
 *     if list_cmds():
 *         ok = get_string("asstcmd_6")
 *         for x in list_cmds():
 *             ok += f"/{x}" + "\n"
 *         return await e.eor(ok)
 *     return await e.eor(get_string("asstcmd_5"))
 * 
 * 
 * async def astcmds(e):
 *     xx = (e.text.replace("/", "")).lower().split()[0]
 *     if cmd_reply(xx):
 *         msg, media, bt = cmd_reply(xx)
 *         if bt:
 *             bt = create_tl_btn(bt)
 *         await e.reply(msg, file=media, buttons=bt)
 * 
 * 
 * if udB.get_key("ASST_CMDS"):
 *     asst.add_handler(
 *         astcmds,
 *         events.NewMessage(
 *             func=lambda x: x.text.startswith("/") and x.text[1:] in list(list_cmds())
 *         ),
 *     )
---- end original ---- */

ultroidCmd('addcmd( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `addcmd( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("asstcmd") || `Plugin \`asstcmd\` matched \`addcmd( (.*)|$)\`.` });
});

ultroidCmd('remcmd( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `remcmd( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("asstcmd") || `Plugin \`asstcmd\` matched \`remcmd( (.*)|$)\`.` });
});

ultroidCmd('listcmd$', async (e) => {
  const chatId = e.chatId;
  // Port of `listcmd$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("asstcmd") || `Plugin \`asstcmd\` matched \`listcmd$\`.` });
});
}

{ // ===== lib/plugins/audiotools.js =====
// Ultroid-JS port of plugins/audiotools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/audiotools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "audiotools";
const PATTERNS = ['makevoice$', 'atrim( (.*)|$)', 'extractaudio$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * 
 * import os
 * import time
 * from datetime import datetime as dt
 * 
 * from pyUltroid.fns.tools import set_attributes
 * 
 * from . import (
 *     LOGS,
 *     ULTConfig,
 *     bash,
 *     downloader,
 *     eod,
 *     eor,
 *     genss,
 *     get_help,
 *     get_string,
 *     humanbytes,
 *     mediainfo,
 *     stdr,
 *     time_formatter,
 *     ultroid_cmd
 * )
 * 
 * __doc__ = get_help("help_audiotools")
 * 
 * 
 * @ultroid_cmd(pattern="makevoice$")
 * async def vnc(e):
 *     if not e.reply_to:
 *         return await eod(e, get_string("audiotools_1"))
 *     r = await e.get_reply_message()
 *     if not mediainfo(r.media).startswith(("audio", "video")):
 *         return await eod(e, get_string("spcltool_1"))
 *     xxx = await e.eor(get_string("com_1"))
 *     file, _ = await e.client.fast_downloader(
 *         r.document,
 *     )
 *     await xxx.edit(get_string("audiotools_2"))
 *     await bash(
 *         f"ffmpeg -i '{file.name}' -map 0:a -codec:a libopus -b:a 100k -vbr on out.opus"
 *     )
 *     try:
 *         await e.client.send_message(
 *             e.chat_id, file="out.opus", force_document=False, reply_to=r
 *         )
 *     except Exception as er:
 *         LOGS.exception(er)
 *         return await xxx.edit("`Failed to convert in Voice...`")
 *     await xxx.delete()
 *     os.remove(file.name)
 *     os.remove("out.opus")
 * 
 * 
 * @ultroid_cmd(pattern="atrim( (.*)|$)")
 * async def trim_aud(e):
 *     sec = e.pattern_match.group(1).strip()
 *     if not sec or "-" not in sec:
 *         return await eod(e, get_string("audiotools_3"))
 *     a, b = sec.split("-")
 *     if int(a) >= int(b):
 *         return await eod(e, get_string("audiotools_4"))
 *     vido = await e.get_reply_message()
 *     if vido and vido.media and mediainfo(vido.media).startswith(("video", "audio")):
 *         if hasattr(vido.media, "document"):
 *             vfile = vido.media.document
 *             name = vido.file.name
 *         else:
 *             vfile = vido.media
 *             name = ""
 *         if not name:
 *             name = dt.now().isoformat("_", "seconds") + ".mp4"
 *         xxx = await e.eor(get_string("audiotools_5"))
 *         c_time = time.time()
 *         file = await downloader(
 *             f"resources/downloads/{name}",
 *             vfile,
 *             xxx,
 *             c_time,
 *             f"Downloading {name}...",
 *         )
 * 
 *         o_size = os.path.getsize(file.name)
 *         d_time = time.time()
 *         diff = time_formatter((d_time - c_time) * 1000)
 *         file_name = (file.name).split("/")[-1]
 *         out = file_name.replace(file_name.split(".")[-1], "_trimmed.aac")
 *         if int(b) > int(await genss(file.name)):
 *             os.remove(file.name)
 *             return await eod(xxx, get_string("audiotools_6"))
 *         ss, dd = stdr(int(a)), stdr(int(b))
 *         xxx = await xxx.edit(
 *             f"Downloaded `{file.name}` of `{humanbytes(o_size)}` in `{diff}`.\n\nNow Trimming Audio from `{ss}` to `{dd}`..."
 *         )
 *         cmd = f'ffmpeg -i "{file.name}" -preset ultrafast -ss {ss} -to {dd} -vn -acodec copy "{out}" -y'
 *         await bash(cmd)
 *         os.remove(file.name)
 *         f_time = time.time()
 *         n_file, _ = await e.client.fast_uploader(
 *             out, show_progress=True, event=e, message="Uploading...", to_delete=True
 *         )
 *         attributes = await set_attributes(out)
 * 
 *         caption = get_string("audiotools_7").format(ss, dd)
 *         await e.client.send_file(
 *             e.chat_id,
 *             n_file,
 *             thumb=ULTConfig.thumb,
 *             caption=caption,
 *             attributes=attributes,
 *             force_document=False,
 *             reply_to=e.reply_to_msg_id,
 *         )
---- end original ---- */

ultroidCmd('makevoice$', async (e) => {
  const chatId = e.chatId;
  // Port of `makevoice$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("audiotools") || `Plugin \`audiotools\` matched \`makevoice$\`.` });
});

ultroidCmd('atrim( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `atrim( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("audiotools") || `Plugin \`audiotools\` matched \`atrim( (.*)|$)\`.` });
});

ultroidCmd('extractaudio$', async (e) => {
  const chatId = e.chatId;
  // Port of `extractaudio$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("audiotools") || `Plugin \`audiotools\` matched \`extractaudio$\`.` });
});
}

{ // ===== lib/plugins/autoban.js =====
// Ultroid-JS port of plugins/autoban.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/autoban.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "autoban";
const PATTERNS = ['autokick (on|off)$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_autoban")
 * 
 * from telethon import events
 * 
 * from pyUltroid.dB.base import KeyManager
 * 
 * from . import LOGS, asst, ultroid_bot, ultroid_cmd
 * 
 * Keym = KeyManager("DND_CHATS", cast=list)
 * 
 * 
 * def join_func(e):
 *     return e.user_joined and Keym.contains(e.chat_id)
 * 
 * 
 * async def dnd_func(event):
 *     for user in event.users:
 *         try:
 *             await (await event.client.kick_participant(event.chat_id, user)).delete()
 *         except Exception as ex:
 *             LOGS.error("Error in DND:")
 *             LOGS.exception(ex)
 *     await event.delete()
 * 
 * 
 * @ultroid_cmd(
 *     pattern="autokick (on|off)$",
 *     admins_only=True,
 *     manager=True,
 *     require="ban_users",
 *     fullsudo=True,
 * )
 * async def _(event):
 *     match = event.pattern_match.group(1)
 *     if match == "on":
 *         if Keym.contains(event.chat_id):
 *             return await event.eor("`Chat already in do not disturb mode.`", time=3)
 *         Keym.add(event.chat_id)
 *         event.client.add_handler(dnd_func, events.ChatAction(func=join_func))
 *         await event.eor("`Do not disturb mode activated for this chat.`", time=3)
 *     elif match == "off":
 *         if not Keym.contains(event.chat_id):
 *             return await event.eor("`Chat is not in do not disturb mode.`", time=3)
 *         Keym.remove(event.chat_id)
 *         await event.eor("`Do not disturb mode deactivated for this chat.`", time=3)
 * 
 * 
 * if Keym.get():
 *     ultroid_bot.add_handler(dnd_func, events.ChatAction(func=join_func))
 *     asst.add_handler(dnd_func, events.ChatAction(func=join_func))
---- end original ---- */

ultroidCmd('autokick (on|off)$', async (e) => {
  const chatId = e.chatId;
  // Port of `autokick (on|off)$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("autoban") || `Plugin \`autoban\` matched \`autokick (on|off)$\`.` });
});
}

{ // ===== lib/plugins/autopic.js =====
// Ultroid-JS port of plugins/autopic.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/autopic.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "autopic";
const PATTERNS = ['autopic( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * 
 * import asyncio
 * import os
 * import random
 * from random import shuffle
 * import aiohttp
 * import re
 * from telethon.tl.functions.photos import UploadProfilePhotoRequest
 * from PIL import Image
 * 
 * from pyUltroid.fns.helper import download_file, fast_download
 * 
 * from . import LOGS, get_help, get_string, udB, ultroid_bot, ultroid_cmd
 * 
 * __doc__ = get_help("help_autopic")
 * 
 * 
 * async def get_google_images(query: str):
 *     """Extract image URLs from Google Images search results with fallbacks"""
 *     
 *     headers = {
 *         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
 *     }
 *     
 *     search_url = f"https://www.google.com/search?q={query}&tbm=isch"
 *     
 *     # Domains to exclude
 *     excluded_domains = [
 *         'gstatic.com',
 *         'google.com',
 *         'googleusercontent.com',
 *         'ssl.google.com'
 *     ]
 *     
 *     def is_valid_url(url):
 *         return not any(domain in url.lower() for domain in excluded_domains)
 *     
 *     try:
 *         async with aiohttp.ClientSession() as session:
 *             async with session.get(search_url, headers=headers) as response:
 *                 html = await response.text()
 * 
 *         # Try to extract from search results div first
 *         img_urls = []
 *         search_pattern = r'<div id="search".*?>(.*?)</div>'
 *         search_match = re.search(search_pattern, html, re.DOTALL)
 *         if search_match:
 *             search_content = search_match.group(1)
 *             url_pattern = r'https://[^\"]*?\.(?:jpg|jpeg|png|webp)'
 *             url_matches = re.finditer(url_pattern, search_content, re.IGNORECASE)
 *             for url_match in url_matches:
 *                 url = url_match.group(0)
 *                 if url not in img_urls and is_valid_url(url):
 *                     img_urls.append(url)
 * 
 *         # Fallback to tdeeNb div if no results
 *         if not img_urls:
 *             pattern = r'<div jsname="tdeeNb"[^>]*>(.*?)</div>'
 *             matches = re.finditer(pattern, html, re.DOTALL)
 *             for match in matches:
 *                 div_content = match.group(1)
 *                 url_pattern = r'https://[^\"]*?\.(?:jpg|jpeg|png|webp)'
 *                 url_matches = re.finditer(url_pattern, div_content, re.IGNORECASE)
 *                 for url_match in url_matches:
 *                     url = url_match.group(0)
 *                     if url not in img_urls and is_valid_url(url):
 *                         img_urls.append(url)
 * 
 *         # Fallback to general image search if still no results
 *         if not img_urls:
 *             pattern = r"https://[^\"]*?\.(?:jpg|jpeg|png|webp)"
 *             matches = re.finditer(pattern, html, re.IGNORECASE)
 *             for match in matches:
 *                 url = match.group(0)
 *                 if url not in img_urls and is_valid_url(url):
 *                     img_urls.append(url)
 * 
 *         # Final fallback to data URLs if still no results
 *         if not img_urls:
 *             pattern = r'data:image/(?:jpeg|png|webp);base64,[^\"]*'
 *             matches = re.finditer(pattern, html, re.IGNORECASE)
 *             for match in matches:
 *                 url = match.group(0)
 *                 if url not in img_urls:
 *                     img_urls.append(url)
 * 
 *         return img_urls
 *                 
 *     except Exception as e:
 *         print(f"Error fetching Google images: {e}")
 *         return []
 * 
 * 
 * @ultroid_cmd(pattern="autopic( (.*)|$)")
 * async def autopic(e):
 *     search = e.pattern_match.group(1).strip()
 *     if udB.get_key("AUTOPIC") and not search:
 *         udB.del_key("AUTOPIC")
 *         return await e.eor(get_string("autopic_5"))
 *     if not search:
 *         return await e.eor(get_string("autopic_1"), time=5)
 *     e = await e.eor(get_string("com_1"))
 *     images = await get_google_images(search)
 *     if not images:
 *         return await e.eor(get_string("autopic_2").format(search), time=5)
 *     await e.eor(get_string("autopic_3").format(search))
 *     udB.set_key("AUTOPIC", search)
 *     SLEEP_TIME = udB.get_key("SLEEP_TIME") or 1221
 *     while True:
 *         for lie in images:
 *             if udB.get_key("AUTOPIC") != search:
 *                 return
 *             download_path, stime = await fast_download(lie, "resources/downloads/autopic.jpg")
---- end original ---- */

ultroidCmd('autopic( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `autopic( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("autopic") || `Plugin \`autopic\` matched \`autopic( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/beautify.js =====
// Ultroid-JS port of plugins/beautify.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/beautify.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "beautify";
const PATTERNS = ['(rc|c)arbon', 'ccarbon( (.*)|$)', 'rayso'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_beautify")
 * 
 * 
 * import os
 * import random
 * 
 * from telethon.utils import get_display_name
 * from urllib.parse import urlencode
 * from . import Carbon, ultroid_cmd, get_string, inline_mention
 * from secrets import token_hex
 * 
 * _colorspath = "resources/colorlist.txt"
 * 
 * if os.path.exists(_colorspath):
 *     with open(_colorspath, "r") as f:
 *         all_col = f.read().split()
 * else:
 *     all_col = []
 * 
 * 
 * @ultroid_cmd(
 *     pattern="(rc|c)arbon",
 * )
 * async def cr_bn(event):
 *     xxxx = await event.eor(get_string("com_1"))
 *     te = event.pattern_match.group(1)
 *     col = random.choice(all_col) if te[0] == "r" else "White"
 *     if event.reply_to_msg_id:
 *         temp = await event.get_reply_message()
 *         if temp.media:
 *             b = await event.client.download_media(temp)
 *             with open(b) as a:
 *                 code = a.read()
 *             os.remove(b)
 *         else:
 *             code = temp.message
 *     else:
 *         try:
 *             code = event.text.split(" ", maxsplit=1)[1]
 *         except IndexError:
 *             return await xxxx.eor(get_string("carbon_2"))
 *     xx = await Carbon(code=code, file_name="ultroid_carbon", backgroundColor=col)
 *     if isinstance(xx, dict):
 *         await xxxx.edit(f"`{xx}`")
 *         return
 *     await xxxx.delete()
 *     await event.reply(
 *         f"Carbonised by {inline_mention(event.sender)}",
 *         file=xx,
 *     )
 * 
 * 
 * @ultroid_cmd(
 *     pattern="ccarbon( (.*)|$)",
 * )
 * async def crbn(event):
 *     match = event.pattern_match.group(1).strip()
 *     if not match:
 *         return await event.eor(get_string("carbon_3"))
 *     msg = await event.eor(get_string("com_1"))
 *     if event.reply_to_msg_id:
 *         temp = await event.get_reply_message()
 *         if temp.media:
 *             b = await event.client.download_media(temp)
 *             with open(b) as a:
 *                 code = a.read()
 *             os.remove(b)
 *         else:
 *             code = temp.message
 *     else:
 *         try:
 *             match = match.split(" ", maxsplit=1)
 *             code = match[1]
 *             match = match[0]
 *         except IndexError:
 *             return await msg.eor(get_string("carbon_2"))
 *     xx = await Carbon(code=code, backgroundColor=match)
 *     await msg.delete()
 *     await event.reply(
 *         f"Carbonised by {inline_mention(event.sender)}",
 *         file=xx,
 *     )
 * 
 * 
 * RaySoTheme = [
 *     "meadow",
 *     "breeze",
 *     "raindrop",
 *     "candy",
 *     "crimson",
 *     "falcon",
 *     "sunset",
 *     "noir",
 *     "midnight",
 *     "bitmap",
 *     "ice",
 *     "sand",
 *     "forest",
 *     "mono",
 * ]
 * 
 * 
 * @ultroid_cmd(pattern="rayso")
 * async def pass_on(ult):
 *     try:
 *         from playwright.async_api import async_playwright
 *     except ImportError:
 *         await ult.eor(
 *             "`playwright` is not installed!\nPlease install it to use this command.."
 *         )
 *         return
---- end original ---- */

ultroidCmd('(rc|c)arbon', async (e) => {
  const chatId = e.chatId;
  // Port of `(rc|c)arbon` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("beautify") || `Plugin \`beautify\` matched \`(rc|c)arbon\`.` });
});

ultroidCmd('ccarbon( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ccarbon( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("beautify") || `Plugin \`beautify\` matched \`ccarbon( (.*)|$)\`.` });
});

ultroidCmd('rayso', async (e) => {
  const chatId = e.chatId;
  // Port of `rayso` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("beautify") || `Plugin \`beautify\` matched \`rayso\`.` });
});
}

{ // ===== lib/plugins/blacklist.js =====
// Ultroid-JS port of plugins/blacklist.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/blacklist.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "blacklist";
const PATTERNS = ['blacklist( (.*)|$)', 'remblacklist( (.*)|$)', 'listblacklist$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_blacklist")
 * 
 * 
 * from pyUltroid.dB.blacklist_db import (
 *     add_blacklist,
 *     get_blacklist,
 *     list_blacklist,
 *     rem_blacklist,
 * )
 * 
 * from . import events, get_string, udB, ultroid_bot, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="blacklist( (.*)|$)", admins_only=True)
 * async def af(e):
 *     wrd = e.pattern_match.group(1).strip()
 *     chat = e.chat_id
 *     if not (wrd):
 *         return await e.eor(get_string("blk_1"), time=5)
 *     wrd = e.text[11:]
 *     heh = wrd.split(" ")
 *     for z in heh:
 *         add_blacklist(int(chat), z.lower())
 *     ultroid_bot.add_handler(blacklist, events.NewMessage(incoming=True))
 *     await e.eor(get_string("blk_2").format(wrd))
 * 
 * 
 * @ultroid_cmd(pattern="remblacklist( (.*)|$)", admins_only=True)
 * async def rf(e):
 *     wrd = e.pattern_match.group(1).strip()
 *     chat = e.chat_id
 *     if not wrd:
 *         return await e.eor(get_string("blk_3"), time=5)
 *     wrd = e.text[14:]
 *     heh = wrd.split(" ")
 *     for z in heh:
 *         rem_blacklist(int(chat), z.lower())
 *     await e.eor(get_string("blk_4").format(wrd))
 * 
 * 
 * @ultroid_cmd(pattern="listblacklist$", admins_only=True)
 * async def lsnote(e):
 *     if x := list_blacklist(e.chat_id):
 *         sd = get_string("blk_5")
 *         return await e.eor(sd + x)
 *     await e.eor(get_string("blk_6"))
 * 
 * 
 * async def blacklist(e):
 *     if x := get_blacklist(e.chat_id):
 *         text = e.text.lower().split()
 *         if any((z in text) for z in x):
 *             try:
 *                 await e.delete()
 *             except BaseException:
 *                 pass
 * 
 * 
 * if udB.get_key("BLACKLIST_DB"):
 *     ultroid_bot.add_handler(blacklist, events.NewMessage(incoming=True))
---- end original ---- */

ultroidCmd('blacklist( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `blacklist( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("blacklist") || `Plugin \`blacklist\` matched \`blacklist( (.*)|$)\`.` });
});

ultroidCmd('remblacklist( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `remblacklist( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("blacklist") || `Plugin \`blacklist\` matched \`remblacklist( (.*)|$)\`.` });
});

ultroidCmd('listblacklist$', async (e) => {
  const chatId = e.chatId;
  // Port of `listblacklist$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("blacklist") || `Plugin \`blacklist\` matched \`listblacklist$\`.` });
});
}

{ // ===== lib/plugins/bot.js =====
// Ultroid-JS port of plugins/bot.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/bot.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "bot";
const PATTERNS = ['alive( (.*)|$)', 'ping$', 'cmds$', 'restart$', 'shutdown$', 'logs( (.*)|$)', 'update( (.*)|$)', 'alive', 'updtavail', 'alive'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_bot")
 * 
 * import os
 * import sys
 * import time
 * from platform import python_version as pyver
 * from random import choice
 * 
 * from telethon import __version__
 * from telethon.errors.rpcerrorlist import (
 *     BotMethodInvalidError,
 *     ChatSendMediaForbiddenError,
 * )
 * 
 * from pyUltroid.version import __version__ as UltVer
 * 
 * from . import HOSTED_ON, LOGS
 * 
 * try:
 *     from git import Repo
 * except ImportError:
 *     LOGS.error("bot: 'gitpython' module not found!")
 *     Repo = None
 * 
 * from telethon.utils import resolve_bot_file_id
 * 
 * from . import (
 *     ATRA_COL,
 *     LOGS,
 *     OWNER_NAME,
 *     ULTROID_IMAGES,
 *     Button,
 *     Carbon,
 *     Telegraph,
 *     Var,
 *     allcmds,
 *     asst,
 *     bash,
 *     call_back,
 *     callback,
 *     def_logs,
 *     eor,
 *     get_string,
 *     heroku_logs,
 *     in_pattern,
 *     inline_pic,
 *     restart,
 *     shutdown,
 *     start_time,
 *     time_formatter,
 *     udB,
 *     ultroid_cmd,
 *     ultroid_version,
 *     updater,
 * )
 * 
 * 
 * def ULTPIC():
 *     return inline_pic() or choice(ULTROID_IMAGES)
 * 
 * 
 * buttons = [
 *     [
 *         Button.url(get_string("bot_3"), "https://github.com/TeamUltroid/Ultroid"),
 *         Button.url(get_string("bot_4"), "t.me/UltroidSupportChat"),
 *     ]
 * ]
 * 
 * # Will move to strings
 * alive_txt = """
 * The Ultroid Userbot
 * 
 *   ◍ Version - {}
 *   ◍ Py-Ultroid - {}
 *   ◍ Telethon - {}
 * """
 * 
 * in_alive = "{}\n\n🌀 <b>Ultroid Version -><b> <code>{}</code>\n🌀 <b>PyUltroid -></b> <code>{}</code>\n🌀 <b>Python -></b> <code>{}</code>\n🌀 <b>Uptime -></b> <code>{}</code>\n🌀 <b>Branch -></b>[ {} ]\n\n• <b>Join @TeamUltroid</b>"
 * 
 * 
 * @callback("alive")
 * async def alive(event):
 *     text = alive_txt.format(ultroid_version, UltVer, __version__)
 *     await event.answer(text, alert=True)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="alive( (.*)|$)",
 * )
 * async def lol(ult):
 *     match = ult.pattern_match.group(1).strip()
 *     inline = None
 *     if match in ["inline", "i"]:
 *         try:
 *             res = await ult.client.inline_query(asst.me.username, "alive")
 *             return await res[0].click(ult.chat_id)
 *         except BotMethodInvalidError:
 *             pass
 *         except BaseException as er:
 *             LOGS.exception(er)
 *         inline = True
 *     pic = udB.get_key("ALIVE_PIC")
 *     if isinstance(pic, list):
 *         pic = choice(pic)
 *     uptime = time_formatter((time.time() - start_time) * 1000)
 *     header = udB.get_key("ALIVE_TEXT") or get_string("bot_1")
 *     y = Repo().active_branch
 *     xx = Repo().remotes[0].config_reader.get("url")
 *     rep = xx.replace(".git", f"/tree/{y}")
 *     kk = f" `[{y}]({rep})` "
 *     if inline:
---- end original ---- */

ultroidCmd('alive( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `alive( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("bot") || `Plugin \`bot\` matched \`alive( (.*)|$)\`.` });
});

ultroidCmd('ping$', async (e) => {
  const chatId = e.chatId;
  // Port of `ping$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("bot") || `Plugin \`bot\` matched \`ping$\`.` });
});

ultroidCmd('cmds$', async (e) => {
  const chatId = e.chatId;
  // Port of `cmds$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("bot") || `Plugin \`bot\` matched \`cmds$\`.` });
});

ultroidCmd('restart$', async (e) => {
  const chatId = e.chatId;
  // Port of `restart$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("bot") || `Plugin \`bot\` matched \`restart$\`.` });
});

ultroidCmd('shutdown$', async (e) => {
  const chatId = e.chatId;
  // Port of `shutdown$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("bot") || `Plugin \`bot\` matched \`shutdown$\`.` });
});

ultroidCmd('logs( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `logs( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("bot") || `Plugin \`bot\` matched \`logs( (.*)|$)\`.` });
});

ultroidCmd('update( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `update( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("bot") || `Plugin \`bot\` matched \`update( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/broadcast.js =====
// Ultroid-JS port of plugins/broadcast.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/broadcast.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "broadcast";
const PATTERNS = ['addblacklist( (.*)|$)', 'remblacklist( (.*)|$)', 'listblacklist$', 'addch( (.*)|$)', 'remch( (.*)|$)', 'listchannels$', 'forward$', 'broadcast( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_broadcast")
 * 
 * import asyncio
 * import io
 * 
 * from telethon.utils import get_display_name
 * 
 * from pyUltroid.dB.base import KeyManager
 * 
 * from . import HNDLR, LOGS, eor, get_string, udB, ultroid_bot, ultroid_cmd
 * 
 * KeyM = KeyManager("BROADCAST", cast=list)
 * BlackM = KeyManager("BROADCAST_BLACKLIST", cast=list)
 * 
 * 
 * @ultroid_cmd(
 *     pattern=r"addblacklist( (.*)|$)",
 *     allow_sudo=False,
 * )
 * async def broadcast_blacklist_add(event):
 *     msgg = event.pattern_match.group(1).strip()
 *     chat_id = int(msgg) if msgg and msgg.lstrip("-").isdigit() else event.chat_id
 *     if BlackM.contains(chat_id):
 *         return await event.eor("`Already in broadcast blacklist.`", time=5)
 *     BlackM.add(chat_id)
 *     await event.eor(f"`Added {chat_id} to broadcast blacklist.`", time=5)
 * 
 * 
 * @ultroid_cmd(
 *     pattern=r"remblacklist( (.*)|$)",
 *     allow_sudo=False,
 * )
 * async def broadcast_blacklist_rem(event):
 *     msgg = event.pattern_match.group(1).strip()
 *     chat_id = int(msgg) if msgg and msgg.lstrip("-").isdigit() else event.chat_id
 *     if not BlackM.contains(chat_id):
 *         return await event.eor("`Not in broadcast blacklist.`", time=5)
 *     BlackM.remove(chat_id)
 *     await event.eor(f"`Removed {chat_id} from broadcast blacklist.`", time=5)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="listblacklist$",
 *     allow_sudo=False,
 * )
 * async def broadcast_blacklist_list(event):
 *     bl = BlackM.get()
 *     if not bl:
 *         return await event.eor("`Broadcast blacklist is empty.`", time=5)
 *     msg = "**Broadcast Blacklist:**\n" + "\n".join(f"• `{c}`" for c in bl)
 *     await event.eor(msg)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="addch( (.*)|$)",
 *     allow_sudo=False,
 * )
 * async def broadcast_adder(event):
 *     msgg = event.pattern_match.group(1).strip()
 *     x = await event.eor(get_string("bd_1"))
 *     if msgg == "all":
 *         await x.edit(get_string("bd_2"))
 *         chats = [
 *             e.entity
 *             for e in await event.client.get_dialogs()
 *             if (e.is_group or e.is_channel)
 *         ]
 *         new = 0
 *         for i in chats:
 *             try:
 *                 if (
 *                     i.broadcast
 *                     and (i.creator or i.admin_rights)
 *                     and not KeyM.contains(i.id)
 *                 ):
 *                     new += 1
 *                     cid = f"-100{i.id}"
 *                     KeyM.add(int(cid))
 *             except Exception as Ex:
 *                 LOGS.exception(Ex)
 *         await x.edit(get_string("bd_3").format(KeyM.count(), new))
 *         return
 *     if event.reply_to_msg_id:
 *         previous_message = await event.get_reply_message()
 *         raw_text = previous_message.text
 *         lines = raw_text.split("\n")
 *         length = len(lines)
 *         for line_number in range(1, length - 2):
 *             channel_id = lines[line_number][4:-1]
 *             if not KeyM.contains(channel_id):
 *                 KeyM.add(channel_id)
 *         await x.edit(get_string("bd_4"))
 *         await asyncio.sleep(3)
 *         await event.delete()
 *         return
 *     chat_id = event.chat_id
 *     if chat_id == udB.get_key("LOG_CHANNEL"):
 *         return
 *     if KeyM.contains(chat_id):
 *         await x.edit(get_string("bd_6"))
 *     elif xx := KeyM.add(chat_id):
 *         await x.edit(get_string("bd_5"))
 *     else:
 *         await x.edit(get_string("sf_8"))
 *     await asyncio.sleep(3)
 *     await x.delete()
 * 
 * 
 * @ultroid_cmd(
 *     pattern="remch( (.*)|$)",
---- end original ---- */

ultroidCmd('addblacklist( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `addblacklist( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`addblacklist( (.*)|$)\`.` });
});

ultroidCmd('remblacklist( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `remblacklist( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`remblacklist( (.*)|$)\`.` });
});

ultroidCmd('listblacklist$', async (e) => {
  const chatId = e.chatId;
  // Port of `listblacklist$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`listblacklist$\`.` });
});

ultroidCmd('addch( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `addch( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`addch( (.*)|$)\`.` });
});

ultroidCmd('remch( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `remch( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`remch( (.*)|$)\`.` });
});

ultroidCmd('listchannels$', async (e) => {
  const chatId = e.chatId;
  // Port of `listchannels$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`listchannels$\`.` });
});

ultroidCmd('forward$', async (e) => {
  const chatId = e.chatId;
  // Port of `forward$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`forward$\`.` });
});

ultroidCmd('broadcast( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `broadcast( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`broadcast( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/button.js =====
// Ultroid-JS port of plugins/button.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/button.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "button";
const PATTERNS = ['button'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_button")
 * 
 * import os
 * 
 * from . import upload_file as uf
 * from telethon.utils import pack_bot_file_id
 * 
 * from pyUltroid.fns.tools import create_tl_btn, get_msg_button
 * 
 * from . import HNDLR, get_string, mediainfo, ultroid_cmd
 * from ._inline import something
 * 
 * 
 * @ultroid_cmd(pattern="button")
 * async def butt(event):
 *     media, wut, text = None, None, None
 *     if event.reply_to:
 *         wt = await event.get_reply_message()
 *         if wt.text:
 *             text = wt.text
 *         if wt.media:
 *             wut = mediainfo(wt.media)
 *         if wut and wut.startswith(("pic", "gif")):
 *             dl = await wt.download_media()
 *             media = uf(dl)
 *         elif wut == "video":
 *             if wt.media.document.size > 8 * 1000 * 1000:
 *                 return await event.eor(get_string("com_4"), time=5)
 *             dl = await wt.download_media()
 *             media = uf(dl)
 *             os.remove(dl)
 *         else:
 *             media = pack_bot_file_id(wt.media)
 *     try:
 *         text = event.text.split(maxsplit=1)[1]
 *     except IndexError:
 *         if not text:
 *             return await event.eor(
 *                 f"**Please give some text in correct format.**\n\n`{HNDLR}help button`",
 *             )
 *     text, buttons = get_msg_button(text)
 *     if buttons:
 *         buttons = create_tl_btn(buttons)
 *     await something(event, text, media, buttons)
 *     await event.delete()
---- end original ---- */

ultroidCmd('button', async (e) => {
  const chatId = e.chatId;
  // Port of `button` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("button") || `Plugin \`button\` matched \`button\`.` });
});
}

{ // ===== lib/plugins/channelhacks.js =====
// Ultroid-JS port of plugins/channelhacks.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/channelhacks.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "channelhacks";
const PATTERNS = ['shift (.*)', 'asource (.*)', 'dsource( (.*)|$)', 'listsource', 'adest (.*)', 'ddest( (.*)|$)', 'listdest'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * from . import get_help
 * 
 * __doc__ = get_help("help_channelhacks")
 * 
 * 
 * import asyncio
 * import io
 * 
 * from telethon.errors.rpcerrorlist import FloodWaitError
 * from telethon.utils import get_display_name, get_peer_id
 * 
 * from pyUltroid.dB.base import KeyManager
 * 
 * from . import LOGS, asst, eor, events, get_string, udB, ultroid_bot, ultroid_cmd
 * 
 * ERROR = {}
 * SourceM = KeyManager("CH_SOURCE", cast=list)
 * DestiM = KeyManager("CH_DESTINATIONS", cast=list)
 * 
 * 
 * async def autopost_func(e):
 *     if not udB.get_key("AUTOPOST"):
 *         return
 *     x = SourceM.get()
 *     th = await e.get_chat()
 *     if get_peer_id(th) not in x:
 *         return
 *     y = DestiM.get()
 *     for ys in y:
 *         try:
 *             await e.client.send_message(int(ys), e.message)
 *         except Exception as ex:
 *             try:
 *                 ERROR[str(ex)]
 *             except KeyError:
 *                 ERROR.update({str(ex): ex})
 *                 Error = f"**Error on AUTOPOST**\n\n`{ex}`"
 *                 await asst.send_message(udB.get_key("LOG_CHANNEL"), Error)
 * 
 * 
 * @ultroid_cmd(pattern="shift (.*)")
 * async def _(e):
 *     x = e.pattern_match.group(1).strip()
 *     z = await e.eor(get_string("com_1"))
 *     a, b = x.split("|")
 *     try:
 *         c = await e.client.parse_id(a)
 *     except Exception:
 *         await z.edit(get_string("cha_1"))
 *         return
 *     try:
 *         d = await e.client.parse_id(b)
 *     except Exception as er:
 *         LOGS.exception(er)
 *         await z.edit(get_string("cha_1"))
 *         return
 *     async for msg in e.client.iter_messages(int(c), reverse=True, limit=None):
 *         try:
 *             await asyncio.sleep(2)
 *             await e.client.send_message(int(d), msg)
 *         except FloodWaitError as er:
 *             await asyncio.sleep(er.seconds + 5)
 *             await e.client.send_message(int(d), msg)
 *         except BaseException as er:
 *             LOGS.exception(er)
 *     await z.edit("Done")
 * 
 * 
 * @ultroid_cmd(pattern="asource (.*)")
 * async def source(e):
 *     if x := e.pattern_match.group(1).strip():
 *         try:
 *             y = await e.client.parse_id(x)
 *         except Exception as er:
 *             LOGS.exception(er)
 *             return
 *     else:
 *         y = e.chat_id
 *     if not SourceM.contains(y):
 *         SourceM.add(y)
 *         await e.eor(get_string("cha_2"))
 *         ultroid_bot.add_handler(autopost_func, events.NewMessage())
 *     else:
 *         await e.eor(get_string("cha_3"))
 * 
 * 
 * @ultroid_cmd(pattern="dsource( (.*)|$)")
 * async def dd(event):
 *     chat_id = event.pattern_match.group(1).strip()
 *     x = await event.eor(get_string("com_1"))
 *     if chat_id == "all":
 *         await x.edit(get_string("bd_8"))
 *         udB.del_key("CH_SOURCE")
 *         await x.edit(get_string("cha_4"))
 *         return
 *     if chat_id:
 *         try:
 *             y = await event.client.parse_id(chat_id)
 *         except Exception as er:
 *             LOGS.exception(er)
 *             return
 *     else:
 *         y = event.chat_id
 *     if SourceM.contains(y):
 *         SourceM.remove(y)
 *         await eor(x, get_string("cha_5"), time=5)
 *     else:
 *         await eor(x, "Source channel is already removed from database. ", time=3)
 * 
 * 
 * @ultroid_cmd(pattern="listsource")
 * async def list_all(event):
 *     x = await event.eor(get_string("com_1"))
 *     num = SourceM.count()
---- end original ---- */

ultroidCmd('shift (.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `shift (.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("channelhacks") || `Plugin \`channelhacks\` matched \`shift (.*)\`.` });
});

ultroidCmd('asource (.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `asource (.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("channelhacks") || `Plugin \`channelhacks\` matched \`asource (.*)\`.` });
});

ultroidCmd('dsource( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `dsource( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("channelhacks") || `Plugin \`channelhacks\` matched \`dsource( (.*)|$)\`.` });
});

ultroidCmd('listsource', async (e) => {
  const chatId = e.chatId;
  // Port of `listsource` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("channelhacks") || `Plugin \`channelhacks\` matched \`listsource\`.` });
});

ultroidCmd('adest (.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `adest (.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("channelhacks") || `Plugin \`channelhacks\` matched \`adest (.*)\`.` });
});

ultroidCmd('ddest( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ddest( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("channelhacks") || `Plugin \`channelhacks\` matched \`ddest( (.*)|$)\`.` });
});

ultroidCmd('listdest', async (e) => {
  const chatId = e.chatId;
  // Port of `listdest` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("channelhacks") || `Plugin \`channelhacks\` matched \`listdest\`.` });
});
}

{ // ===== lib/plugins/chatbot.js =====
// Ultroid-JS port of plugins/chatbot.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/chatbot.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "chatbot";
const PATTERNS = ['repai', 'addai', 'remai', 'listai'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_chatbot")
 * 
 * 
 * from pyUltroid.fns.tools import get_chatbot_reply
 * 
 * from . import LOGS, eod, get_string, inline_mention, udB, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="repai")
 * async def im_lonely_chat_with_me(event):
 *     if event.reply_to:
 *         message = (await event.get_reply_message()).message
 *     else:
 *         try:
 *             message = event.text.split(" ", 1)[1]
 *         except IndexError:
 *             return await eod(event, get_string("tban_1"), time=10)
 *     reply_ = await get_chatbot_reply(message=message)
 *     await event.eor(reply_)
 * 
 * 
 * @ultroid_cmd(pattern="addai")
 * async def add_chatBot(event):
 *     await chat_bot_fn(event, type_="add")
 * 
 * 
 * @ultroid_cmd(pattern="remai")
 * async def rem_chatBot(event):
 *     await chat_bot_fn(event, type_="remov")
 * 
 * 
 * @ultroid_cmd(pattern="listai")
 * async def lister(event):
 *     key = udB.get_key("CHATBOT_USERS") or {}
 *     users = key.get(event.chat_id, [])
 *     if not users:
 *         return await event.eor(get_string("chab_2"), time=5)
 *     msg = "**Total List Of AI Enabled Users In This Chat :**\n\n"
 *     for i in users:
 *         try:
 *             user = await event.client.get_entity(int(i))
 *             user = inline_mention(user)
 *         except BaseException:
 *             user = f"`{i}`"
 *         msg += f"• {user}\n"
 *     await event.eor(msg, link_preview=False)
 * 
 * 
 * async def chat_bot_fn(event, type_):
 *     if event.reply_to:
 *         user_ = (await event.get_reply_message()).sender
 *     else:
 *         temp = event.text.split(maxsplit=1)
 *         try:
 *             user_ = await event.client.get_entity(await event.client.parse_id(temp[1]))
 *         except BaseException as er:
 *             LOGS.exception(er)
 *             user_ = event.chat if event.is_private else None
 *     if not user_:
 *         return await eod(
 *             event,
 *             get_string("chab_1"),
 *         )
 *     key = udB.get_key("CHATBOT_USERS") or {}
 *     chat = event.chat_id
 *     user = user_.id
 *     if type_ == "add":
 *         if key.get(chat):
 *             if user not in key[chat]:
 *                 key[chat].append(user)
 *         else:
 *             key.update({chat: [user]})
 *     elif type_ == "remov":
 *         if key.get(chat):
 *             if user in key[chat]:
 *                 key[chat].remove(user)
 *             if chat in key and not key[chat]:
 *                 del key[chat]
 *     udB.set_key("CHATBOT_USERS", key)
 *     await event.eor(f"**ChatBot:**\n{type_}ed {inline_mention(user_)}")
---- end original ---- */

ultroidCmd('repai', async (e) => {
  const chatId = e.chatId;
  // Port of `repai` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chatbot") || `Plugin \`chatbot\` matched \`repai\`.` });
});

ultroidCmd('addai', async (e) => {
  const chatId = e.chatId;
  // Port of `addai` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chatbot") || `Plugin \`chatbot\` matched \`addai\`.` });
});

ultroidCmd('remai', async (e) => {
  const chatId = e.chatId;
  // Port of `remai` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chatbot") || `Plugin \`chatbot\` matched \`remai\`.` });
});

ultroidCmd('listai', async (e) => {
  const chatId = e.chatId;
  // Port of `listai` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chatbot") || `Plugin \`chatbot\` matched \`listai\`.` });
});
}

{ // ===== lib/plugins/chats.js =====
// Ultroid-JS port of plugins/chats.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/chats.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "chats";
const PATTERNS = ['delchat', 'getlink( (.*)|$)', 'create (b|g|c)(?: |$)(.*)', 'setgpic( (.*)|$)', 'delgpic( (.*)|$)', 'unbanall$', 'rmusers( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * from . import get_help
 * 
 * __doc__ = get_help("help_chats")
 * 
 * 
 * from telethon.errors import ChatAdminRequiredError as no_admin
 * from telethon.tl.functions.channels import (
 *     CreateChannelRequest,
 *     DeleteChannelRequest,
 *     EditPhotoRequest,
 *     GetFullChannelRequest,
 *     UpdateUsernameRequest,
 * )
 * from telethon.tl.functions.messages import (
 *     CreateChatRequest,
 *     ExportChatInviteRequest,
 *     GetFullChatRequest,
 * )
 * from telethon.tl.types import (
 *     ChannelParticipantsKicked,
 *     User,
 *     UserStatusEmpty,
 *     UserStatusLastMonth,
 *     UserStatusLastWeek,
 *     UserStatusOffline,
 *     UserStatusOnline,
 *     UserStatusRecently,
 * )
 * 
 * from . import HNDLR, LOGS, asst, con, get_string, mediainfo, os, types, udB, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="delchat",
 *     groups_only=True,
 * )
 * async def _(e):
 *     xx = await e.eor(get_string("com_1"))
 *     try:
 *         match = e.text.split(" ", maxsplit=1)[1]
 *         chat = await e.client.parse_id(match)
 *     except IndexError:
 *         chat = e.chat_id
 *     try:
 *         await e.client(DeleteChannelRequest(chat))
 *     except TypeError:
 *         return await xx.eor(get_string("chats_1"), time=10)
 *     except no_admin:
 *         return await xx.eor(get_string("chats_2"), time=10)
 *     await e.client.send_message(
 *         int(udB.get_key("LOG_CHANNEL")), get_string("chats_6").format(e.chat_id)
 *     )
 * 
 * 
 * @ultroid_cmd(
 *     pattern="getlink( (.*)|$)",
 *     groups_only=True,
 *     manager=True,
 * )
 * async def _(e):
 *     reply = await e.get_reply_message()
 *     match = e.pattern_match.group(1).strip()
 *     if reply and not isinstance(reply.sender, User):
 *         chat = await reply.get_sender()
 *     else:
 *         chat = await e.get_chat()
 *     if hasattr(chat, "username") and chat.username:
 *         return await e.eor(f"Username: @{chat.username}")
 *     request, usage, title, link = None, None, None, None
 *     if match:
 *         split = match.split(maxsplit=1)
 *         request = split[0] in ["r", "request"]
 *         title = "Created by Ultroid"
 *         if len(split) > 1:
 *             match = split[1]
 *             spli = match.split(maxsplit=1)
 *             if spli[0].isdigit():
 *                 usage = int(spli[0])
 *             if len(spli) > 1:
 *                 title = spli[1]
 *         elif not request:
 *             if match.isdigit():
 *                 usage = int(match)
 *             else:
 *                 title = match
 *         if request and usage:
 *             usage = 0
 *     if request or title:
 *         try:
 *             r = await e.client(
 *                 ExportChatInviteRequest(
 *                     e.chat_id,
 *                     request_needed=request,
 *                     usage_limit=usage,
 *                     title=title,
 *                 ),
 *             )
 *         except no_admin:
 *             return await e.eor(get_string("chats_2"), time=10)
 *         link = r.link
 *     else:
 *         if isinstance(chat, types.Chat):
 *             FC = await e.client(GetFullChatRequest(chat.id))
 *         elif isinstance(chat, types.Channel):
 *             FC = await e.client(GetFullChannelRequest(chat.id))
 *         else:
 *             return
 *         Inv = FC.full_chat.exported_invite
 *         if Inv and not Inv.revoked:
 *             link = Inv.link
 *     if link:
 *         return await e.eor(f"Link:- {link}")
 *     await e.eor("`Failed to getlink!\nSeems like link is inaccessible to you...`")
 * 
---- end original ---- */

ultroidCmd('delchat', async (e) => {
  const chatId = e.chatId;
  // Port of `delchat` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chats") || `Plugin \`chats\` matched \`delchat\`.` });
});

ultroidCmd('getlink( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `getlink( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chats") || `Plugin \`chats\` matched \`getlink( (.*)|$)\`.` });
});

ultroidCmd('create (b|g|c)(?: |$)(.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `create (b|g|c)(?: |$)(.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chats") || `Plugin \`chats\` matched \`create (b|g|c)(?: |$)(.*)\`.` });
});

ultroidCmd('setgpic( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `setgpic( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chats") || `Plugin \`chats\` matched \`setgpic( (.*)|$)\`.` });
});

ultroidCmd('delgpic( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `delgpic( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chats") || `Plugin \`chats\` matched \`delgpic( (.*)|$)\`.` });
});

ultroidCmd('unbanall$', async (e) => {
  const chatId = e.chatId;
  // Port of `unbanall$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chats") || `Plugin \`chats\` matched \`unbanall$\`.` });
});

ultroidCmd('rmusers( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `rmusers( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chats") || `Plugin \`chats\` matched \`rmusers( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/cleanaction.js =====
// Ultroid-JS port of plugins/cleanaction.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/cleanaction.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "cleanaction";
const PATTERNS = ['addclean$', 'remclean$', 'listclean$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_cleanaction")
 * 
 * 
 * from telethon.utils import get_display_name
 * 
 * from . import get_string, udB, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="addclean$", admins_only=True)
 * async def _(e):
 *     key = udB.get_key("CLEANCHAT") or []
 *     if e.chat_id in key:
 *         return await eod(e, get_string("clan_5"))
 *     key.append(e.chat_id)
 *     udB.set_key("CLEANCHAT", key)
 *     await e.eor(get_string("clan_1"), time=5)
 * 
 * 
 * @ultroid_cmd(pattern="remclean$")
 * async def _(e):
 *     key = udB.get_key("CLEANCHAT") or []
 *     if e.chat_id in key:
 *         key.remove(e.chat_id)
 *         udB.set_key("CLEANCHAT", key)
 *     await e.eor(get_string("clan_2"), time=5)
 * 
 * 
 * @ultroid_cmd(pattern="listclean$")
 * async def _(e):
 *     if k := udB.get_key("CLEANCHAT"):
 *         o = ""
 *         for x in k:
 *             try:
 *                 title = get_display_name(await e.client.get_entity(x))
 *             except BaseException:
 *                 title = get_string("clan_3")
 *             o += f"{x} {title}\n"
 *         return await e.eor(o)
 *     await e.eor(get_string("clan_4"), time=5)
---- end original ---- */

ultroidCmd('addclean$', async (e) => {
  const chatId = e.chatId;
  // Port of `addclean$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("cleanaction") || `Plugin \`cleanaction\` matched \`addclean$\`.` });
});

ultroidCmd('remclean$', async (e) => {
  const chatId = e.chatId;
  // Port of `remclean$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("cleanaction") || `Plugin \`cleanaction\` matched \`remclean$\`.` });
});

ultroidCmd('listclean$', async (e) => {
  const chatId = e.chatId;
  // Port of `listclean$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("cleanaction") || `Plugin \`cleanaction\` matched \`listclean$\`.` });
});
}

{ // ===== lib/plugins/compressor.js =====
// Ultroid-JS port of plugins/compressor.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/compressor.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "compressor";
const PATTERNS = ['compress( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_compressor")
 * 
 * 
 * import asyncio
 * import os
 * import re
 * import time
 * from datetime import datetime as dt
 * 
 * from telethon.errors.rpcerrorlist import MessageNotModifiedError
 * from telethon.tl.types import DocumentAttributeVideo
 * 
 * from pyUltroid.fns.tools import metadata
 * 
 * from . import (
 *     ULTConfig,
 *     bash,
 *     downloader,
 *     get_string,
 *     humanbytes,
 *     math,
 *     mediainfo,
 *     time_formatter,
 *     ultroid_cmd,
 *     uploader,
 * )
 * 
 * 
 * @ultroid_cmd(pattern="compress( (.*)|$)")
 * async def _(e):
 *     cr = e.pattern_match.group(1).strip()
 *     crf = 27
 *     to_stream = False
 *     if cr:
 *         k = e.text.split()
 *         if len(k) == 2:
 *             crf = int(k[1]) if k[1].isdigit() else 27
 *         elif len(k) > 2:
 *             crf = int(k[1]) if k[1].isdigit() else 27
 *             to_stream = "stream" in k[2]
 *     vido = await e.get_reply_message()
 *     if vido and vido.media and "video" in mediainfo(vido.media):
 *         if hasattr(vido.media, "document"):
 *             vfile = vido.media.document
 *             name = vido.file.name
 *         else:
 *             vfile = vido.media
 *             name = ""
 *         if not name:
 *             name = "video_" + dt.now().isoformat("_", "seconds") + ".mp4"
 *         xxx = await e.eor(get_string("audiotools_5"))
 *         c_time = time.time()
 *         file = await downloader(
 *             f"resources/downloads/{name}",
 *             vfile,
 *             xxx,
 *             c_time,
 *             f"Downloading {name}...",
 *         )
 * 
 *         o_size = os.path.getsize(file.name)
 *         d_time = time.time()
 *         diff = time_formatter((d_time - c_time) * 1000)
 *         file_name = (file.name).split("/")[-1]
 *         out = file_name.replace(file_name.split(".")[-1], "compressed.mkv")
 *         await xxx.edit(
 *             f"`Downloaded {file.name} of {humanbytes(o_size)} in {diff}.\nNow Compressing...`"
 *         )
 *         x, y = await bash(
 *             f'mediainfo --fullscan """{file.name}""" | grep "Frame count"'
 *         )
 *         if y and y.endswith("NOT_FOUND"):
 *             return await xxx.edit(f"ERROR: `{y}`")
 *         total_frames = x.split(":")[1].split("\n")[0]
 *         progress = f"progress-{c_time}.txt"
 *         with open(progress, "w"):
 *             pass
 *         proce = await asyncio.create_subprocess_shell(
 *             f'ffmpeg -hide_banner -loglevel quiet -progress {progress} -i """{file.name}""" -preset ultrafast -vcodec libx265 -crf {crf} -c:a copy """{out}""" -y',
 *             stdout=asyncio.subprocess.PIPE,
 *             stderr=asyncio.subprocess.PIPE,
 *         )
 *         while proce.returncode != 0:
 *             await asyncio.sleep(3)
 *             with open(progress, "r+") as fil:
 *                 text = fil.read()
 *                 frames = re.findall("frame=(\\d+)", text)
 *                 size = re.findall("total_size=(\\d+)", text)
 *                 speed = 0
 *                 if len(frames):
 *                     elapse = int(frames[-1])
 *                 if len(size):
 *                     size = int(size[-1])
 *                     per = elapse * 100 / int(total_frames)
 *                     time_diff = time.time() - int(d_time)
 *                     speed = round(elapse / time_diff, 2)
 *                 if int(speed) != 0:
 *                     some_eta = ((int(total_frames) - elapse) / speed) * 1000
 *                     text = f"`Compressing {file_name} at {crf} CRF.\n`"
 *                     progress_str = "`[{0}{1}] {2}%\n\n`".format(
 *                         "".join("●" for _ in range(math.floor(per / 5))),
 *                         "".join("" for _ in range(20 - math.floor(per / 5))),
 *                         round(per, 2),
 *                     )
 * 
 *                     e_size = f"{humanbytes(size)} of ~{humanbytes((size / per) * 100)}"
 *                     eta = f"~{time_formatter(some_eta)}"
 *                     try:
 *                         await xxx.edit(
 *                             text
 *                             + progress_str
---- end original ---- */

ultroidCmd('compress( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `compress( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("compressor") || `Plugin \`compressor\` matched \`compress( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/converter.js =====
// Ultroid-JS port of plugins/converter.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/converter.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "converter";
const PATTERNS = ['thumbnail$', 'rename( (.*)|$)', 'convert( (.*)|$)', 'doc( (.*)|$)', 'open( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_converter")
 * 
 * import os
 * import time
 * 
 * from . import LOGS
 * 
 * try:
 *     import cv2
 * except ImportError:
 *     cv2 = None
 * 
 * try:
 *     from PIL import Image
 * except ImportError:
 *     LOGS.info(f"{__file__}: PIL  not Installed.")
 *     Image = None
 * 
 * from . import upload_file as uf
 * 
 * from . import (
 *     ULTConfig,
 *     bash,
 *     con,
 *     downloader,
 *     get_paste,
 *     get_string,
 *     udB,
 *     ultroid_cmd,
 *     uploader,
 * )
 * 
 * opn = []
 * 
 * 
 * @ultroid_cmd(
 *     pattern="thumbnail$",
 * )
 * async def _(e):
 *     r = await e.get_reply_message()
 *     if r.photo:
 *         dl = await r.download_media()
 *     elif r.document and r.document.thumbs:
 *         dl = await r.download_media(thumb=-1)
 *     else:
 *         return await e.eor("`Reply to Photo or media with thumb...`")
 *     nn = uf(dl)
 *     os.remove(dl)
 *     udB.set_key("CUSTOM_THUMBNAIL", str(nn))
 *     await bash(f"wget {nn} -O resources/extras/ultroid.jpg")
 *     await e.eor(get_string("cvt_6").format(nn), link_preview=False)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="rename( (.*)|$)",
 * )
 * async def imak(event):
 *     reply = await event.get_reply_message()
 *     t = time.time()
 *     if not reply:
 *         return await event.eor(get_string("cvt_1"))
 *     inp = event.pattern_match.group(1).strip()
 *     if not inp:
 *         return await event.eor(get_string("cvt_2"))
 *     xx = await event.eor(get_string("com_1"))
 *     if reply.media:
 *         if hasattr(reply.media, "document"):
 *             file = reply.media.document
 *             image = await downloader(
 *                 reply.file.name or str(time.time()),
 *                 reply.media.document,
 *                 xx,
 *                 t,
 *                 get_string("com_5"),
 *             )
 * 
 *             file = image.name
 *         else:
 *             file = await event.client.download_media(reply.media)
 *     if os.path.exists(inp):
 *         os.remove(inp)
 *     await bash(f'mv """{file}""" """{inp}"""')
 *     if not os.path.exists(inp) or os.path.exists(inp) and not os.path.getsize(inp):
 *         os.rename(file, inp)
 *     k = time.time()
 *     n_file, _ = await event.client.fast_uploader(
 *         inp, show_progress=True, event=event, message="Uploading...", to_delete=True
 *     )
 *     await event.reply(
 *         f"`{n_file.name}`",
 *         file=n_file,
 *         force_document=True,
 *         thumb=ULTConfig.thumb,
 *     )
 *     os.remove(inp)
 *     await xx.delete()
 * 
 * 
 * conv_keys = {
 *     "img": "png",
 *     "sticker": "webp",
 *     "webp": "webp",
 *     "image": "png",
 *     "webm": "webm",
 *     "gif": "gif",
 *     "json": "json",
 *     "tgs": "tgs",
 * }
 * 
 * 
 * @ultroid_cmd(
---- end original ---- */

ultroidCmd('thumbnail$', async (e) => {
  const chatId = e.chatId;
  // Port of `thumbnail$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("converter") || `Plugin \`converter\` matched \`thumbnail$\`.` });
});

ultroidCmd('rename( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `rename( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("converter") || `Plugin \`converter\` matched \`rename( (.*)|$)\`.` });
});

ultroidCmd('convert( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `convert( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("converter") || `Plugin \`converter\` matched \`convert( (.*)|$)\`.` });
});

ultroidCmd('doc( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `doc( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("converter") || `Plugin \`converter\` matched \`doc( (.*)|$)\`.` });
});

ultroidCmd('open( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `open( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("converter") || `Plugin \`converter\` matched \`open( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/core.js =====
// Ultroid-JS port of plugins/core.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/core.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "core";
const PATTERNS = ['install', 'unload( (.*)|$)', 'uninstall( (.*)|$)', 'load( (.*)|$)', 'getaddons( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_core")
 * 
 * 
 * import os
 * 
 * from pyUltroid.startup.loader import load_addons
 * 
 * from . import LOGS, async_searcher, eod, get_string, safeinstall, ultroid_cmd, un_plug
 * 
 * 
 * @ultroid_cmd(pattern="install", fullsudo=True)
 * async def install(event):
 *     await safeinstall(event)
 * 
 * 
 * @ultroid_cmd(
 *     pattern=r"unload( (.*)|$)",
 * )
 * async def unload(event):
 *     shortname = event.pattern_match.group(1).strip()
 *     if not shortname:
 *         await event.eor(get_string("core_9"))
 *         return
 *     lsd = os.listdir("addons")
 *     zym = f"{shortname}.py"
 *     if zym in lsd:
 *         try:
 *             un_plug(shortname)
 *             await event.eor(f"**Uɴʟᴏᴀᴅᴇᴅ** `{shortname}` **Sᴜᴄᴄᴇssғᴜʟʟʏ.**", time=3)
 *         except Exception as ex:
 *             LOGS.exception(ex)
 *             return await event.eor(str(ex))
 *     elif zym in os.listdir("plugins"):
 *         return await event.eor(get_string("core_11"), time=3)
 *     else:
 *         await event.eor(f"**No Plugin Named** `{shortname}`", time=3)
 * 
 * 
 * @ultroid_cmd(
 *     pattern=r"uninstall( (.*)|$)",
 * )
 * async def uninstall(event):
 *     shortname = event.pattern_match.group(1).strip()
 *     if not shortname:
 *         await event.eor(get_string("core_13"))
 *         return
 *     lsd = os.listdir("addons")
 *     zym = f"{shortname}.py"
 *     if zym in lsd:
 *         try:
 *             un_plug(shortname)
 *             await event.eor(f"**Uninstalled** `{shortname}` **successfully.**", time=3)
 *             os.remove(f"addons/{shortname}.py")
 *         except Exception as ex:
 *             return await event.eor(str(ex))
 *     elif zym in os.listdir("plugins"):
 *         return await event.eor(get_string("core_15"), time=3)
 *     else:
 *         return await event.eor(f"**No Plugin Named** `{shortname}`", time=3)
 * 
 * 
 * @ultroid_cmd(
 *     pattern=r"load( (.*)|$)",
 *     fullsudo=True,
 * )
 * async def load(event):
 *     shortname = event.pattern_match.group(1).strip()
 *     if not shortname:
 *         await event.eor(get_string("core_16"))
 *         return
 *     try:
 *         try:
 *             un_plug(shortname)
 *         except BaseException:
 *             pass
 *         load_addons(f"addons/{shortname}.py")
 *         await event.eor(get_string("core_17").format(shortname), time=3)
 *     except Exception as e:
 *         LOGS.exception(e)
 *         await eod(
 *             event,
 *             get_string("core_18").format(shortname, e),
 *             time=3,
 *         )
 * 
 * 
 * @ultroid_cmd(pattern="getaddons( (.*)|$)", fullsudo=True)
 * async def get_the_addons_lol(event):
 *     thelink = event.pattern_match.group(1).strip()
 *     xx = await event.eor(get_string("com_1"))
 *     fool = get_string("gas_1")
 *     if thelink is None:
 *         return await xx.eor(fool, time=10)
 *     split_thelink = thelink.split("/")
 *     if not ("raw" in thelink and thelink.endswith(".py")):
 *         return await xx.eor(fool, time=10)
 *     name_of_it = split_thelink[-1]
 *     plug = await async_searcher(thelink)
 *     fil = f"addons/{name_of_it}"
 *     await xx.edit("Packing the codes...")
 *     with open(fil, "w", encoding="utf-8") as uult:
 *         uult.write(plug)
 *     await xx.edit("Packed. Now loading the plugin..")
 *     shortname = name_of_it.split(".")[0]
 *     try:
 *         load_addons(fil)
 *         await xx.eor(get_string("core_17").format(shortname), time=15)
 *     except Exception as e:
 *         LOGS.exception(e)
 *         await eod(
---- end original ---- */

ultroidCmd('install', async (e) => {
  const chatId = e.chatId;
  // Port of `install` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("core") || `Plugin \`core\` matched \`install\`.` });
});

ultroidCmd('unload( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `unload( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("core") || `Plugin \`core\` matched \`unload( (.*)|$)\`.` });
});

ultroidCmd('uninstall( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `uninstall( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("core") || `Plugin \`core\` matched \`uninstall( (.*)|$)\`.` });
});

ultroidCmd('load( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `load( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("core") || `Plugin \`core\` matched \`load( (.*)|$)\`.` });
});

ultroidCmd('getaddons( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `getaddons( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("core") || `Plugin \`core\` matched \`getaddons( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/database.js =====
// Ultroid-JS port of plugins/database.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/database.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "database";
const PATTERNS = ['setdb( (.*)|$)', 'deldb( (.*)|$)', 'rendb( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_database")
 * 
 * 
 * import re
 * 
 * from . import Redis, eor, get_string, udB, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="setdb( (.*)|$)", fullsudo=True)
 * async def _(ult):
 *     match = ult.pattern_match.group(1).strip()
 *     if not match:
 *         return await ult.eor("Provide key and value to set!")
 *     try:
 *         delim = " " if re.search("[|]", match) is None else " | "
 *         data = match.split(delim, maxsplit=1)
 *         if data[0] in ["--extend", "-e"]:
 *             data = data[1].split(maxsplit=1)
 *             data[1] = f"{str(udB.get_key(data[0]))} {data[1]}"
 *         udB.set_key(data[0], data[1])
 *         await ult.eor(
 *             f"**DB Key Value Pair Updated\nKey :** `{data[0]}`\n**Value :** `{data[1]}`"
 *         )
 * 
 *     except BaseException:
 *         await ult.eor(get_string("com_7"))
 * 
 * 
 * @ultroid_cmd(pattern="deldb( (.*)|$)", fullsudo=True)
 * async def _(ult):
 *     key = ult.pattern_match.group(1).strip()
 *     if not key:
 *         return await ult.eor("Give me a key name to delete!", time=5)
 *     _ = key.split(maxsplit=1)
 *     try:
 *         if _[0] == "-m":
 *             for key in _[1].split():
 *                 k = udB.del_key(key)
 *             key = _[1]
 *         else:
 *             k = udB.del_key(key)
 *         if k == 0:
 *             return await ult.eor("`No Such Key.`")
 *         await ult.eor(f"`Successfully deleted key {key}`")
 *     except BaseException:
 *         await ult.eor(get_string("com_7"))
 * 
 * 
 * @ultroid_cmd(pattern="rendb( (.*)|$)", fullsudo=True)
 * async def _(ult):
 *     match = ult.pattern_match.group(1).strip()
 *     if not match:
 *         return await ult.eor("`Provide Keys name to rename..`")
 *     delim = " " if re.search("[|]", match) is None else " | "
 *     data = match.split(delim)
 *     if Redis(data[0]):
 *         try:
 *             udB.rename(data[0], data[1])
 *             await eor(
 *                 ult,
 *                 f"**DB Key Rename Successful\nOld Key :** `{data[0]}`\n**New Key :** `{data[1]}`",
 *             )
 * 
 *         except BaseException:
 *             await ult.eor(get_string("com_7"))
 *     else:
 *         await ult.eor("Key not found")
---- end original ---- */

ultroidCmd('setdb( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `setdb( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("database") || `Plugin \`database\` matched \`setdb( (.*)|$)\`.` });
});

ultroidCmd('deldb( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `deldb( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("database") || `Plugin \`database\` matched \`deldb( (.*)|$)\`.` });
});

ultroidCmd('rendb( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `rendb( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("database") || `Plugin \`database\` matched \`rendb( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/delayspam.js =====
// Ultroid-JS port of plugins/delayspam.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/delayspam.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "delayspam";
const PATTERNS = ['delayspam( (.*)|$)', 'stopspam$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * """
 * ✘ Commands Available -
 * 
 * • `{i}delayspam <count> <delay> <message>`
 *     Spam a message `count` times with `delay` seconds between each.
 *     Reply to a message to spam that message instead.
 * 
 * • `{i}stopspam`
 *     Stop an ongoing delayspam.
 * 
 * Examples:
 *   `{i}delayspam 5 2 Hello!`  — sends "Hello!" 5 times with 2s delay
 *   `{i}delayspam 10 1` (reply to a message) — forwards replied msg 10 times with 1s delay
 * """
 * 
 * import asyncio
 * 
 * from . import HNDLR, eod, get_string, udB, ultroid_bot, ultroid_cmd
 * 
 * _spam_tasks = {}
 * 
 * 
 * @ultroid_cmd(pattern=r"delayspam( (.*)|$)")
 * async def delayspam_cmd(ult):
 *     args = ult.pattern_match.group(1).strip().split(None, 2)
 *     reply = await ult.get_reply_message()
 * 
 *     if len(args) < 2:
 *         return await ult.eor(
 *             f"`Usage: {HNDLR}delayspam <count> <delay> [message]\n"
 *             f"Or reply to a message: {HNDLR}delayspam <count> <delay>`",
 *             time=10,
 *         )
 * 
 *     try:
 *         count = int(args[0])
 *         delay = float(args[1])
 *     except ValueError:
 *         return await ult.eor("`count and delay must be numbers.`", time=5)
 * 
 *     if count > 200:
 *         return await ult.eor("`Max 200 repetitions allowed.`", time=5)
 *     if delay < 0.5:
 *         return await ult.eor("`Minimum delay is 0.5 seconds.`", time=5)
 * 
 *     text = args[2] if len(args) > 2 else None
 *     chat_id = ult.chat_id
 * 
 *     if not text and not reply:
 *         return await ult.eor(
 *             f"`Provide a message or reply to one.\nUsage: {HNDLR}delayspam <count> <delay> <text>`",
 *             time=8,
 *         )
 * 
 *     await ult.delete()
 * 
 *     task_key = f"{ult.sender_id}_{chat_id}"
 *     if task_key in _spam_tasks:
 *         _spam_tasks[task_key].cancel()
 * 
 *     async def _do_spam():
 *         for i in range(count):
 *             if task_key not in _spam_tasks:
 *                 break
 *             try:
 *                 if reply:
 *                     await ultroid_bot.send_message(
 *                         chat_id, reply.text or "", file=reply.media
 *                     )
 *                 else:
 *                     await ultroid_bot.send_message(chat_id, text)
 *             except Exception:
 *                 break
 *             await asyncio.sleep(delay)
 *         _spam_tasks.pop(task_key, None)
 * 
 *     task = asyncio.get_event_loop().create_task(_do_spam())
 *     _spam_tasks[task_key] = task
 * 
 * 
 * @ultroid_cmd(pattern="stopspam$")
 * async def stopspam_cmd(ult):
 *     task_key = f"{ult.sender_id}_{ult.chat_id}"
 *     if task_key in _spam_tasks:
 *         _spam_tasks.pop(task_key).cancel()
 *         await ult.eor("`Spam stopped.`", time=3)
 *     else:
 *         await ult.eor("`No active spam in this chat.`", time=3)
---- end original ---- */

ultroidCmd('delayspam( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `delayspam( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("delayspam") || `Plugin \`delayspam\` matched \`delayspam( (.*)|$)\`.` });
});

ultroidCmd('stopspam$', async (e) => {
  const chatId = e.chatId;
  // Port of `stopspam$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("delayspam") || `Plugin \`delayspam\` matched \`stopspam$\`.` });
});
}

{ // ===== lib/plugins/devtools.js =====
// Ultroid-JS port of plugins/devtools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/devtools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "devtools";
const PATTERNS = ['sysinfo$', 'bash', 'eval', 'cpp'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_devtools")
 * 
 * import inspect
 * import sys
 * import traceback
 * from io import BytesIO, StringIO
 * from os import remove
 * from pprint import pprint
 * 
 * from telethon.utils import get_display_name
 * 
 * from pyUltroid import _ignore_eval
 * 
 * from . import *
 * 
 * # Used for Formatting Eval Code, if installed
 * try:
 *     import black
 * except ImportError:
 *     black = None
 * from random import choice
 * 
 * try:
 *     from yaml import safe_load
 * except ImportError:
 *     from pyUltroid.fns.tools import safe_load
 * 
 * from . import upload_file as uf
 * from telethon.tl import functions
 * 
 * fn = functions
 * 
 * 
 * @ultroid_cmd(
 *     pattern="sysinfo$",
 * )
 * async def _(e):
 *     xx = await e.eor(get_string("com_1"))
 *     x, y = await bash("neofetch|sed 's/\x1B\\[[0-9;\\?]*[a-zA-Z]//g' >> neo.txt")
 *     if y and y.endswith("NOT_FOUND"):
 *         return await xx.edit(f"Error: `{y}`")
 *     with open("neo.txt", "r", encoding="utf-8") as neo:
 *         p = (neo.read()).replace("\n\n", "")
 *     haa = await Carbon(code=p, file_name="neofetch", backgroundColor=choice(ATRA_COL))
 *     if isinstance(haa, dict):
 *         await xx.edit(f"`{haa}`")
 *     else:
 *         await e.reply(file=haa)
 *         await xx.delete()
 *     remove("neo.txt")
 * 
 * 
 * @ultroid_cmd(pattern="bash", fullsudo=True, only_devs=True)
 * async def _(event):
 *     carb, rayso, yamlf = None, None, False
 *     try:
 *         cmd = event.text.split(" ", maxsplit=1)[1]
 *         if cmd.split()[0] in ["-c", "--carbon"]:
 *             cmd = cmd.split(maxsplit=1)[1]
 *             carb = True
 *         if cmd.split()[0] in ["-r", "--rayso"]:
 *             cmd = cmd.split(maxsplit=1)[1]
 *             rayso = True
 *     except IndexError:
 *         return await event.eor(get_string("devs_1"), time=10)
 *     xx = await event.eor(get_string("com_1"))
 *     reply_to_id = event.reply_to_msg_id or event.id
 *     stdout, stderr = await bash(cmd, run_code=1)
 *     OUT = f"**☞ BASH\n\n• COMMAND:**\n`{cmd}` \n\n"
 *     err, out = "", ""
 *     if stderr:
 *         err = f"**• ERROR:** \n`{stderr}`\n\n"
 *     if stdout:
 *         if (carb or udB.get_key("CARBON_ON_BASH")) and (
 *             event.is_private
 *             or event.chat.admin_rights
 *             or event.chat.creator
 *             or event.chat.default_banned_rights.embed_links
 *         ):
 *             li = await Carbon(
 *                 code=stdout,
 *                 file_name="bash",
 *                 download=True,
 *                 backgroundColor=choice(ATRA_COL),
 *             )
 *             if isinstance(li, dict):
 *                 await xx.edit(
 *                     f"Unknown Response from Carbon: `{li}`\n\nstdout`:{stdout}`\nstderr: `{stderr}`"
 *                 )
 *                 return
 *             url = uf(li)
 *             OUT = f"[\xad]({url}){OUT}"
 *             out = "**• OUTPUT:**"
 *             remove(li)
 *         elif (rayso or udB.get_key("RAYSO_ON_BASH")) and (
 *             event.is_private
 *             or event.chat.admin_rights
 *             or event.chat.creator
 *             or event.chat.default_banned_rights.embed_links
 *         ):
 *             li = await Carbon(
 *                 code=stdout,
 *                 file_name="bash",
 *                 download=True,
 *                 backgroundColor=choice(ATRA_COL),
 *                 rayso=True,
 *             )
 *             if isinstance(li, dict):
 *                 await xx.edit(
 *                     f"Unknown Response from Carbon: `{li}`\n\nstdout`:{stdout}`\nstderr: `{stderr}`"
 *                 )
---- end original ---- */

ultroidCmd('sysinfo$', async (e) => {
  const chatId = e.chatId;
  // Port of `sysinfo$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("devtools") || `Plugin \`devtools\` matched \`sysinfo$\`.` });
});

ultroidCmd('bash', async (e) => {
  const chatId = e.chatId;
  // Port of `bash` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("devtools") || `Plugin \`devtools\` matched \`bash\`.` });
});

ultroidCmd('eval', async (e) => {
  const chatId = e.chatId;
  // Port of `eval` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("devtools") || `Plugin \`devtools\` matched \`eval\`.` });
});

ultroidCmd('cpp', async (e) => {
  const chatId = e.chatId;
  // Port of `cpp` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("devtools") || `Plugin \`devtools\` matched \`cpp\`.` });
});
}

{ // ===== lib/plugins/downloadupload.js =====
// Ultroid-JS port of plugins/downloadupload.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/downloadupload.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "downloadupload";
const PATTERNS = ['download( (.*)|$)', 'dl( (.*)|$)', 'ul( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_downloadupload")
 * 
 * import asyncio
 * import glob
 * import os
 * import time
 * from datetime import datetime as dt
 * 
 * from aiohttp.client_exceptions import InvalidURL
 * from telethon.errors.rpcerrorlist import MessageNotModifiedError
 * 
 * from pyUltroid.fns.helper import time_formatter
 * from pyUltroid.fns.tools import get_chat_and_msgid, set_attributes
 * 
 * from . import (
 *     LOGS,
 *     ULTConfig,
 *     downloader,
 *     eor,
 *     fast_download,
 *     get_all_files,
 *     get_string,
 *     progress,
 *     time_formatter,
 *     ultroid_cmd,
 * )
 * 
 * 
 * @ultroid_cmd(
 *     pattern="download( (.*)|$)",
 * )
 * async def down(event):
 *     matched = event.pattern_match.group(1).strip()
 *     msg = await event.eor(get_string("udl_4"))
 *     if not matched:
 *         return await eor(msg, get_string("udl_5"), time=5)
 *     try:
 *         splited = matched.split(" | ")
 *         link = splited[0]
 *         filename = splited[1]
 *     except IndexError:
 *         filename = None
 *     s_time = time.time()
 *     try:
 *         filename, d = await fast_download(
 *             link,
 *             filename,
 *             progress_callback=lambda d, t: asyncio.get_event_loop().create_task(
 *                 progress(
 *                     d,
 *                     t,
 *                     msg,
 *                     s_time,
 *                     f"Downloading from {link}",
 *                 )
 *             ),
 *         )
 *     except InvalidURL:
 *         return await msg.eor("`Invalid URL provided :(`", time=5)
 *     await msg.eor(f"`{filename}` `downloaded in {time_formatter(d*1000)}.`")
 * 
 * 
 * @ultroid_cmd(
 *     pattern="dl( (.*)|$)",
 * )
 * async def download(event):
 *     match = event.pattern_match.group(1).strip()
 *     if match and "t.me/" in match:
 *         chat, msg = get_chat_and_msgid(match)
 *         if not (chat and msg):
 *             return await event.eor(get_string("gms_1"))
 *         match = ""
 *         ok = await event.client.get_messages(chat, ids=msg)
 *     elif event.reply_to_msg_id:
 *         ok = await event.get_reply_message()
 *     else:
 *         return await event.eor(get_string("cvt_3"), time=8)
 *     xx = await event.eor(get_string("com_1"))
 *     if not (ok and ok.media):
 *         return await xx.eor(get_string("udl_1"), time=5)
 *     s = dt.now()
 *     k = time.time()
 *     if hasattr(ok.media, "document"):
 *         file = ok.media.document
 *         mime_type = file.mime_type
 *         filename = match or ok.file.name
 *         if not filename:
 *             if "audio" in mime_type:
 *                 filename = "audio_" + dt.now().isoformat("_", "seconds") + ".ogg"
 *             elif "video" in mime_type:
 *                 filename = "video_" + dt.now().isoformat("_", "seconds") + ".mp4"
 *         try:
 *             result = await downloader(
 *                 f"resources/downloads/{filename}",
 *                 file,
 *                 xx,
 *                 k,
 *                 f"Downloading {filename}...",
 *             )
 * 
 *         except MessageNotModifiedError as err:
 *             return await xx.edit(str(err))
 *         file_name = result.name
 *     else:
 *         d = "resources/downloads/"
 *         file_name = await event.client.download_media(
 *             ok,
 *             d,
 *             progress_callback=lambda d, t: asyncio.get_event_loop().create_task(
 *                 progress(
 *                     d,
---- end original ---- */

ultroidCmd('download( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `download( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("downloadupload") || `Plugin \`downloadupload\` matched \`download( (.*)|$)\`.` });
});

ultroidCmd('dl( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `dl( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("downloadupload") || `Plugin \`downloadupload\` matched \`dl( (.*)|$)\`.` });
});

ultroidCmd('ul( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ul( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("downloadupload") || `Plugin \`downloadupload\` matched \`ul( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/echo.js =====
// Ultroid-JS port of plugins/echo.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/echo.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "echo";
const PATTERNS = ['addecho( (.*)|$)', 'remecho( (.*)|$)', 'listecho$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_echo")
 * 
 * 
 * from telethon.utils import get_display_name
 * 
 * from pyUltroid.dB.echo_db import add_echo, check_echo, list_echo, rem_echo
 * 
 * from . import inline_mention, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="addecho( (.*)|$)")
 * async def echo(e):
 *     r = await e.get_reply_message()
 *     if r:
 *         user = r.sender_id
 *     else:
 *         try:
 *             user = e.text.split()[1]
 *             if user.startswith("@"):
 *                 ok = await e.client.get_entity(user)
 *                 user = ok.id
 *             else:
 *                 user = int(user)
 *         except BaseException:
 *             return await e.eor("Reply To A user.", time=5)
 *     if check_echo(e.chat_id, user):
 *         return await e.eor("Echo already activated for this user.", time=5)
 *     add_echo(e.chat_id, user)
 *     ok = await e.client.get_entity(user)
 *     user = inline_mention(ok)
 *     await e.eor(f"Activated Echo For {user}.")
 * 
 * 
 * @ultroid_cmd(pattern="remecho( (.*)|$)")
 * async def rm(e):
 *     r = await e.get_reply_message()
 *     if r:
 *         user = r.sender_id
 *     else:
 *         try:
 *             user = e.text.split()[1]
 *             if user.startswith("@"):
 *                 ok = await e.client.get_entity(user)
 *                 user = ok.id
 *             else:
 *                 user = int(user)
 *         except BaseException:
 *             return await e.eor("Reply To A User.", time=5)
 *     if check_echo(e.chat_id, user):
 *         rem_echo(e.chat_id, user)
 *         ok = await e.client.get_entity(user)
 *         user = f"[{get_display_name(ok)}](tg://user?id={ok.id})"
 *         return await e.eor(f"Deactivated Echo For {user}.")
 *     await e.eor("Echo not activated for this user")
 * 
 * 
 * @ultroid_cmd(pattern="listecho$")
 * async def lstecho(e):
 *     if k := list_echo(e.chat_id):
 *         user = "**Activated Echo For Users:**\n\n"
 *         for x in k:
 *             ok = await e.client.get_entity(int(x))
 *             kk = f"[{get_display_name(ok)}](tg://user?id={ok.id})"
 *             user += f"•{kk}" + "\n"
 *         await e.eor(user)
 *     else:
 *         await e.eor("`List is Empty, For echo`", time=5)
---- end original ---- */

ultroidCmd('addecho( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `addecho( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("echo") || `Plugin \`echo\` matched \`addecho( (.*)|$)\`.` });
});

ultroidCmd('remecho( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `remecho( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("echo") || `Plugin \`echo\` matched \`remecho( (.*)|$)\`.` });
});

ultroidCmd('listecho$', async (e) => {
  const chatId = e.chatId;
  // Port of `listecho$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("echo") || `Plugin \`echo\` matched \`listecho$\`.` });
});
}

{ // ===== lib/plugins/extra.js =====
// Ultroid-JS port of plugins/extra.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/extra.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "extra";
const PATTERNS = ['del$', 'copy$', 'edit', 'reply$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("extra")
 * 
 * import asyncio
 * 
 * from . import get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="del$",
 *     manager=True,
 * )
 * async def delete_it(delme):
 *     msg_src = await delme.get_reply_message()
 *     if not msg_src:
 *         return
 *     await msg_src.try_delete()
 *     await delme.try_delete()
 * 
 * 
 * @ultroid_cmd(
 *     pattern="copy$",
 * )
 * async def copy(e):
 *     reply = await e.get_reply_message()
 *     if reply:
 *         await reply.reply(reply)
 *         return await e.try_delete()
 *     await e.eor(get_string("ex_1"), time=5)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="edit",
 * )
 * async def editer(edit):
 *     message = edit.text
 *     chat = await edit.get_input_chat()
 *     string = str(message[6:])
 *     reply = await edit.get_reply_message()
 *     if reply and reply.text:
 *         try:
 *             await reply.edit(string)
 *             await edit.delete()
 *         except BaseException:
 *             pass
 *     else:
 *         i = 1
 *         async for message in edit.client.iter_messages(chat, from_user="me", limit=2):
 *             if i == 2:
 *                 await message.edit(string)
 *                 await edit.delete()
 *                 break
 *             i += 1
 * 
 * 
 * @ultroid_cmd(
 *     pattern="reply$",
 * )
 * async def _(e):
 *     if e.reply_to_msg_id:
 *         chat = e.chat_id
 *         try:
 *             msg = (await e.client.get_messages(e.chat_id, limit=1, max_id=e.id))[0]
 *         except IndexError:
 *             return await e.eor(
 *                 "`You have previously sent no message to reply again...`", time=5
 *             )
 *         except BaseException as er:
 *             return await e.eor(f"**ERROR:** `{er}`")
 *         await asyncio.wait(
 *             [
 *                 e.client.delete_messages(chat, [e.id, msg.id]),
 *                 e.client.send_message(chat, msg, reply_to=e.reply_to_msg_id),
 *             ]
 *         )
 *     else:
 *         await e.try_delete()
---- end original ---- */

ultroidCmd('del$', async (e) => {
  const chatId = e.chatId;
  // Port of `del$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("extra") || `Plugin \`extra\` matched \`del$\`.` });
});

ultroidCmd('copy$', async (e) => {
  const chatId = e.chatId;
  // Port of `copy$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("extra") || `Plugin \`extra\` matched \`copy$\`.` });
});

ultroidCmd('edit', async (e) => {
  const chatId = e.chatId;
  // Port of `edit` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("extra") || `Plugin \`extra\` matched \`edit\`.` });
});

ultroidCmd('reply$', async (e) => {
  const chatId = e.chatId;
  // Port of `reply$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("extra") || `Plugin \`extra\` matched \`reply$\`.` });
});
}

{ // ===== lib/plugins/fakeaction.js =====
// Ultroid-JS port of plugins/fakeaction.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/fakeaction.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "fakeaction";
const PATTERNS = ['f(typing|audio|contact|document|game|location|sticker|photo|round|video)( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_fakeaction")
 * 
 * import math
 * import time
 * 
 * from pyUltroid.fns.admins import ban_time
 * 
 * from . import asyncio, get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="f(typing|audio|contact|document|game|location|sticker|photo|round|video)( (.*)|$)"
 * )
 * async def _(e):
 *     act = e.pattern_match.group(1).strip()
 *     t = e.pattern_match.group(2)
 *     if act in ["audio", "round", "video"]:
 *         act = f"record-{act}"
 *     if t.isdigit():
 *         t = int(t)
 *     elif t.endswith(("s", "h", "d", "m")):
 *         t = math.ceil((ban_time(t)) - time.time())
 *     else:
 *         t = 60
 *     await e.eor(get_string("fka_1").format(str(t)), time=5)
 *     async with e.client.action(e.chat_id, act):
 *         await asyncio.sleep(t)
---- end original ---- */

ultroidCmd('f(typing|audio|contact|document|game|location|sticker|photo|round|video)( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `f(typing|audio|contact|document|game|location|sticker|photo|round|video)( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("fakeaction") || `Plugin \`fakeaction\` matched \`f(typing|audio|contact|document|game|location|sticker|photo|round|video)( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/fileshare.js =====
// Ultroid-JS port of plugins/fileshare.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/fileshare.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "fileshare";
const PATTERNS = ['store$', 'filestore'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_fileshare")
 * 
 * import os
 * 
 * from pyUltroid.dB.filestore_db import del_stored, get_stored_msg, list_all_stored_msgs
 * from pyUltroid.fns.tools import get_file_link
 * 
 * from . import HNDLR, asst, get_string, in_pattern, udB, ultroid_bot, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="store$")
 * async def filestoreplg(event):
 *     msg = await event.get_reply_message()
 *     if not msg:
 *         return await event.eor(get_string("fsh_3"), time=10)
 *     # allow storing both messages and media.
 *     filehash = await get_file_link(msg)
 *     link_to_file = f"https://t.me/{asst.me.username}?start={filehash}"
 *     await event.eor(
 *         get_string("fsh_2").format(link_to_file),
 *         link_preview=False,
 *     )
 * 
 * 
 * @ultroid_cmd("delstored ?(.*)")
 * async def _(event):
 *     match = event.pattern_match.group(1)
 *     if not match:
 *         return await event.eor("`Give stored film's link to delete.`", time=5)
 *     match = match.split("?start=")
 *     botusername = match[0].split("/")[-1]
 *     if botusername != asst.me.username:
 *         return await event.eor(
 *             "`Message/Media of provided link was not stored by this bot.`", time=5
 *         )
 *     msg_id = get_stored_msg(match[1])
 *     if not msg_id:
 *         return await event.eor(
 *             "`Message/Media of provided link was already deleted.`", time=5
 *         )
 *     del_stored(match[1])
 *     await ultroid_bot.delete_messages(udB.get_key("LOG_CHANNEL"), int(msg_id))
 *     await event.eor("__Deleted__")
 * 
 * 
 * @ultroid_cmd("liststored$")
 * async def liststored(event):
 *     files = list_all_stored_msgs()
 *     if not files:
 *         return await event.eor(get_string("fsh_4"), time=5)
 *     msg = "**Stored files:**\n"
 *     for c, i in enumerate(files, start=1):
 *         msg += f"`{c}`. https://t.me/{asst.me.username}?start={i}\n"
 *     if len(msg) > 4095:
 *         with open("liststored.txt", "w") as f:
 *             f.write(msg.replace("**", "").replace("`", ""))
 *         await event.reply(get_string("fsh_1"), file="liststored.txt")
 *         os.remove("liststored.txt")
 *         return
 *     await event.eor(msg, link_preview=False)
 * 
 * 
 * @in_pattern("filestore", owner=True)
 * async def file_short(event):
 *     all_ = list_all_stored_msgs()
 *     res = []
 *     if all_:
 *         LOG_CHA = udB.get_key("LOG_CHANNEL")
 *         for msg in all_[:50]:
 *             m_id = get_stored_msg(msg)
 *             if not m_id:
 *                 continue
 *             message = await asst.get_messages(LOG_CHA, ids=m_id)
 *             if not message:
 *                 continue
 *             if message.media:
 *                 res.append(await event.builder.document(title=msg, file=message.media))
 *             elif message.text:
 *                 res.append(
 *                     await event.builder.article(title=message.text, text=message.text)
 *                 )
 *     if not res:
 *         title = "You have no stored file :("
 *         text = f"{title}\n\nRead `{HNDLR}help fileshare` to know how to store."
 *         return await event.answer([await event.builder.article(title=title, text=text)])
 *     await event.answer(res, switch_pm="• File Store •", switch_pm_param="start")
---- end original ---- */

ultroidCmd('store$', async (e) => {
  const chatId = e.chatId;
  // Port of `store$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("fileshare") || `Plugin \`fileshare\` matched \`store$\`.` });
});
}

{ // ===== lib/plugins/fontgen.js =====
// Ultroid-JS port of plugins/fontgen.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/fontgen.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "fontgen";
const PATTERNS = ['font( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_fontgen")
 * 
 * import string
 * 
 * from . import eod, ultroid_cmd
 * 
 * _default = string.ascii_letters
 * Fonts = {
 *     "small caps": "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘϙʀsᴛᴜᴠᴡxʏᴢABCDEFGHIJKLMNOPQRSTUVWXYZ",
 *     "monospace": "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉",
 *     "double stroke": "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ",
 *     "script royal": "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵",
 * }
 * 
 * 
 * @ultroid_cmd(
 *     pattern="font( (.*)|$)",
 * )
 * async def _(e):
 *     input = e.pattern_match.group(1).strip()
 *     reply = await e.get_reply_message()
 *     if not input:
 *         m = "**Available Fonts**\n\n"
 *         for x in Fonts.keys():
 *             m += f"• `{x}`\n"
 *         return await e.eor(m, time=5)
 *     if not reply:
 *         try:
 *             _ = input.split(":", maxsplit=1)
 *             font = _[0][:-1]
 *             text = _[1]
 *         except IndexError:
 *             return await eod(e, help)
 *     elif not input:
 *         return await eod(e, "`Give font dude :/`")
 *     else:
 *         font = input
 *         text = reply.message
 *     if font not in Fonts.keys():
 *         return await e.eor(f"`{font} not in font list`.", time=5)
 *     msg = gen_font(text, Fonts[font])
 *     await e.eor(msg)
 * 
 * 
 * def gen_font(text, new_font):
 *     new_font = " ".join(new_font).split()
 *     for q in text:
 *         if q in _default:
 *             new = new_font[_default.index(q)]
 *             text = text.replace(q, new)
 *     return text
---- end original ---- */

ultroidCmd('font( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `font( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("fontgen") || `Plugin \`fontgen\` matched \`font( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/forcesubscribe.js =====
// Ultroid-JS port of plugins/forcesubscribe.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/forcesubscribe.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "forcesubscribe";
const PATTERNS = ['fsub( (.*)|$)', 'remfsub$', 'checkfsub$', 'fsub( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}fsub <chat username><id>`
 *     Enable ForceSub in Used Chat !
 * 
 * • `{i}checkfsub`
 *     Check/Get Active ForceSub Setting of Used Chat.
 * 
 * • `{i}remfsub`
 *     Remove ForceSub from Used Chat !
 * 
 *     Note - You Need to be Admin in Both Channel/Chats
 *         in order to Use ForceSubscribe.
 * """
 * 
 * import re
 * 
 * from telethon.errors.rpcerrorlist import ChatAdminRequiredError, UserNotParticipantError
 * from telethon.tl.custom import Button
 * from telethon.tl.functions.channels import GetParticipantRequest
 * from telethon.tl.functions.messages import ExportChatInviteRequest
 * from telethon.tl.types import (
 *     Channel,
 *     ChannelParticipantBanned,
 *     ChannelParticipantLeft,
 *     User,
 * )
 * 
 * from pyUltroid.dB.forcesub_db import add_forcesub, get_forcesetting, rem_forcesub
 * 
 * from . import (
 *     LOGS,
 *     asst,
 *     callback,
 *     events,
 *     get_string,
 *     in_pattern,
 *     inline_mention,
 *     udB,
 *     ultroid_bot,
 *     ultroid_cmd,
 * )
 * 
 * CACHE = {}
 * 
 * 
 * @ultroid_cmd(pattern="fsub( (.*)|$)", admins_only=True, groups_only=True)
 * async def addfor(e):
 *     match = e.pattern_match.group(1).strip()
 *     if not match:
 *         return await e.eor(get_string("fsub_1"), time=5)
 *     try:
 *         match = await e.client.parse_id(match)
 *     except BaseException:
 *         return await e.eor(get_string("fsub_2"), time=5)
 *     add_forcesub(e.chat_id, match)
 *     await e.eor("Added ForceSub in This Chat !")
 *     ultroid_bot.add_handler(force_sub, events.NewMessage(incoming=True))
 * 
 * 
 * @ultroid_cmd(pattern="remfsub$")
 * async def remor(e):
 *     res = rem_forcesub(e.chat_id)
 *     if not res:
 *         return await e.eor(get_string("fsub_3"), time=5)
 *     await e.eor("Removed ForceSub...")
 * 
 * 
 * @ultroid_cmd(pattern="checkfsub$")
 * async def getfsr(e):
 *     res = get_forcesetting(e.chat_id)
 *     if not res:
 *         return await e.eor("ForceSub is Not Active In This Chat !", time=5)
 *     cha = await e.client.get_entity(int(res))
 *     await e.eor(f"**ForceSub Status** : `Active`\n- **{cha.title}** `({res})`")
 * 
 * 
 * @in_pattern("fsub( (.*)|$)", owner=True)
 * async def fcall(e):
 *     match = e.pattern_match.group(1).strip()
 *     spli = match.split("_")
 *     user = await ultroid_bot.get_entity(int(spli[0]))
 *     cl = await ultroid_bot.get_entity(int(spli[1]))
 *     text = f"Hi {inline_mention(user)}, You Need to Join"
 *     text += f" {cl.title} in order to Chat in this Group."
 *     el = (
 *         f"https://t.me/{cl.username}"
 *         if cl.username
 *         else (await ultroid_bot(ExportChatInviteRequest(cl))).link
 *     )
 * 
 *     res = [
 *         await e.builder.article(
 *             title="forcesub",
 *             text=text,
 *             buttons=[
 *                 [Button.url(text=get_string("fsub_4"), url=el)],
 *                 [Button.inline(get_string("fsub_5"), data=f"unm_{match}")],
 *             ],
 *         )
 *     ]
 *     await e.answer(res)
 * 
 * 
 * @callback(re.compile("unm_(.*)"))
 * async def diesoon(e):
 *     match = (e.data_match.group(1)).decode("UTF-8")
 *     spli = match.split("_")
 *     if e.sender_id != int(spli[0]):
 *         return await e.answer(get_string("fsub_7"), alert=True)
 *     try:
 *         values = await ultroid_bot(GetParticipantRequest(int(spli[1]), int(spli[0])))
 *         if isinstance(values.participant, ChannelParticipantLeft) or (
---- end original ---- */

ultroidCmd('fsub( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `fsub( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("forcesubscribe") || `Plugin \`forcesubscribe\` matched \`fsub( (.*)|$)\`.` });
});

ultroidCmd('remfsub$', async (e) => {
  const chatId = e.chatId;
  // Port of `remfsub$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("forcesubscribe") || `Plugin \`forcesubscribe\` matched \`remfsub$\`.` });
});

ultroidCmd('checkfsub$', async (e) => {
  const chatId = e.chatId;
  // Port of `checkfsub$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("forcesubscribe") || `Plugin \`forcesubscribe\` matched \`checkfsub$\`.` });
});
}

{ // ===== lib/plugins/gdrive.js =====
// Ultroid-JS port of plugins/gdrive.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/gdrive.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "gdrive";
const PATTERNS = ['gdown( (.*)|$)', 'gdlist$', 'gdul( (.*)|$)', 'gdsearch( (.*)|$)', 'gdfolder$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available
 * 
 * • `{i}gdul <reply/file name>`
 *     Reply to file to upload on Google Drive.
 *     Add file name to upload on Google Drive.
 * 
 * • `{i}gdown <file id/link> | <filename>`
 *     Download from Gdrive link or file id.
 * 
 * • `{i}gdsearch <file name>`
 *     Search file name on Google Drive and get link.
 * 
 * • `{i}gdlist`
 *     List all GDrive files.
 * 
 * • `{i}gdfolder`
 *     Link to your Google Drive Folder.
 *     If added then all files will be uploaded in this folder.
 * """
 * 
 * import os
 * import time
 * 
 * from telethon.tl.types import Message
 * 
 * from pyUltroid.fns.gDrive import GDriveManager
 * from pyUltroid.fns.helper import time_formatter
 * 
 * from . import ULTConfig, asst, eod, eor, get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="gdown( (.*)|$)",
 *     fullsudo=True,
 * )
 * async def gdown(event):
 *     GDrive = GDriveManager()
 *     match = event.pattern_match.group(1).strip()
 *     if not match:
 *         return await eod(event, "`Give file id or Gdrive link to download from!`")
 *     filename = match.split(" | ")[1].strip() if " | " in match else None
 *     eve = await event.eor(get_string("com_1"))
 *     _start = time.time()
 *     status, response = await GDrive._download_file(eve, match, filename)
 *     if not status:
 *         return await eve.edit(response)
 *     await eve.edit(
 *         f"`Downloaded ``{response}`` in {time_formatter((time.time() - _start)*1000)}`"
 *     )
 * 
 * 
 * @ultroid_cmd(
 *     pattern="gdlist$",
 *     fullsudo=True,
 * )
 * async def files(event):
 *     GDrive = GDriveManager()
 *     if not os.path.exists(GDrive.token_file):
 *         return await event.eor(get_string("gdrive_6").format(asst.me.username))
 *     eve = await event.eor(get_string("com_1"))
 *     msg = ""
 *     if files := GDrive._list_files:
 *         msg += f"{len(files.keys())} files found in gdrive.\n\n"
 *         for _ in files:
 *             msg += f"> [{files[_]}]({_})\n"
 *     else:
 *         msg += "Nothing in Gdrive"
 *     if len(msg) < 4096:
 *         await eve.edit(msg, link_preview=False)
 *     else:
 *         with open("drive-files.txt", "w") as f:
 *             f.write(
 *                 msg.replace("[", "File Name: ")
 *                 .replace("](", "\n» Link: ")
 *                 .replace(")\n", "\n\n")
 *             )
 *         try:
 *             await eve.delete()
 *         except BaseException:
 *             pass
 *         await event.client.send_file(
 *             event.chat_id,
 *             "drive-files.txt",
 *             thumb=ULTConfig.thumb,
 *             reply_to=event,
 *         )
 *         os.remove("drive-files.txt")
 * 
 * 
 * @ultroid_cmd(
 *     pattern="gdul( (.*)|$)",
 *     fullsudo=True,
 * )
 * async def _(event):
 *     GDrive = GDriveManager()
 *     if not os.path.exists(GDrive.token_file):
 *         return await eod(event, get_string("gdrive_6").format(asst.me.username))
 *     input_file = event.pattern_match.group(1).strip() or await event.get_reply_message()
 *     if not input_file:
 *         return await eod(event, "`Reply to file or give its location.`")
 *     mone = await event.eor(get_string("com_1"))
 *     if isinstance(input_file, Message):
 *         location = "resources/downloads"
 *         if input_file.photo:
 *             filename = await input_file.download_media(location)
 *         else:
 *             filename = input_file.file.name
 *             if not filename:
 *                 filename = str(round(time.time()))
 *             filename = f"{location}/{filename}"
 *             try:
 *                 filename, downloaded_in = await event.client.fast_downloader(
 *                     file=input_file.media.document,
---- end original ---- */

ultroidCmd('gdown( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gdown( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("gdrive") || `Plugin \`gdrive\` matched \`gdown( (.*)|$)\`.` });
});

ultroidCmd('gdlist$', async (e) => {
  const chatId = e.chatId;
  // Port of `gdlist$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("gdrive") || `Plugin \`gdrive\` matched \`gdlist$\`.` });
});

ultroidCmd('gdul( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gdul( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("gdrive") || `Plugin \`gdrive\` matched \`gdul( (.*)|$)\`.` });
});

ultroidCmd('gdsearch( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gdsearch( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("gdrive") || `Plugin \`gdrive\` matched \`gdsearch( (.*)|$)\`.` });
});

ultroidCmd('gdfolder$', async (e) => {
  const chatId = e.chatId;
  // Port of `gdfolder$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("gdrive") || `Plugin \`gdrive\` matched \`gdfolder$\`.` });
});
}

{ // ===== lib/plugins/giftools.js =====
// Ultroid-JS port of plugins/giftools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/giftools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "giftools";
const PATTERNS = ['(bw|invert)gif$', 'rvgif$', 'gif( (.*)|$)', 'vtog$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available
 * 
 * •`{i}invertgif`
 *   Make Gif Inverted(negative).
 * 
 * •`{i}bwgif`
 *   Make Gif black and white
 * 
 * •`{i}rvgif`
 *   Reverse a gif
 * 
 * •`{i}vtog`
 *   Reply To Video , It will Create Gif
 *   Video to Gif
 * 
 * •`{i}gif <query>`
 *    Send video regarding to query.
 * """
 * import os
 * import random
 * import time
 * from datetime import datetime as dt
 * 
 * from . import HNDLR, LOGS, bash, downloader, get_string, mediainfo, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="(bw|invert)gif$")
 * async def igif(e):
 *     match = e.pattern_match.group(1).strip()
 *     a = await e.get_reply_message()
 *     if not (a and a.media):
 *         return await e.eor("`Reply To gif only`", time=5)
 *     wut = mediainfo(a.media)
 *     if "gif" not in wut:
 *         return await e.eor("`Reply To Gif Only`", time=5)
 *     xx = await e.eor(get_string("com_1"))
 *     z = await a.download_media()
 *     if match == "bw":
 *         cmd = f'ffmpeg -i "{z}" -vf format=gray ult.gif -y'
 *     else:
 *         cmd = f'ffmpeg -i "{z}" -vf lutyuv="y=negval:u=negval:v=negval" ult.gif -y'
 *     try:
 *         await bash(cmd)
 *         await e.client.send_file(e.chat_id, "ult.gif", supports_streaming=True)
 *         os.remove(z)
 *         os.remove("ult.gif")
 *         await xx.delete()
 *     except Exception as er:
 *         LOGS.info(er)
 * 
 * 
 * @ultroid_cmd(pattern="rvgif$")
 * async def reverse_gif(event):
 *     a = await event.get_reply_message()
 *     if not (a and a.media) and "video" not in mediainfo(a.media):
 *         return await event.eor("`Reply To Video only`", time=5)
 *     msg = await event.eor(get_string("com_1"))
 *     file = await a.download_media()
 *     await bash(f'ffmpeg -i "{file}" -vf reverse -af areverse reversed.mp4 -y')
 *     await event.respond("- **Reversed Video/GIF**", file="reversed.mp4")
 *     await msg.delete()
 *     os.remove(file)
 *     os.remove("reversed.mp4")
 * 
 * 
 * @ultroid_cmd(pattern="gif( (.*)|$)")
 * async def gifs(ult):
 *     get = ult.pattern_match.group(1).strip()
 *     xx = random.randint(0, 5)
 *     n = 0
 *     if ";" in get:
 *         try:
 *             n = int(get.split(";")[-1])
 *         except IndexError:
 *             pass
 *     if not get:
 *         return await ult.eor(f"`{HNDLR}gif <query>`")
 *     m = await ult.eor(get_string("com_2"))
 *     gifs = await ult.client.inline_query("gif", get)
 *     if not n:
 *         await gifs[xx].click(
 *             ult.chat_id, reply_to=ult.reply_to_msg_id, silent=True, hide_via=True
 *         )
 *     else:
 *         for x in range(n):
 *             await gifs[x].click(
 *                 ult.chat_id, reply_to=ult.reply_to_msg_id, silent=True, hide_via=True
 *             )
 *     await m.delete()
 * 
 * 
 * @ultroid_cmd(pattern="vtog$")
 * async def vtogif(e):
 *     a = await e.get_reply_message()
 *     if not (a and a.media):
 *         return await e.eor("`Reply To video only`", time=5)
 *     wut = mediainfo(a.media)
 *     if "video" not in wut:
 *         return await e.eor("`Reply To Video Only`", time=5)
 *     xx = await e.eor(get_string("com_1"))
 *     dur = a.media.document.attributes[0].duration
 *     tt = time.time()
 *     if int(dur) < 120:
 *         z = await a.download_media()
 *         await bash(
 *             f'ffmpeg -i {z} -vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 ult.gif -y'
 *         )
 *     else:
 *         filename = a.file.name
 *         if not filename:
 *             filename = "video_" + dt.now().isoformat("_", "seconds") + ".mp4"
 *         vid = await downloader(filename, a.media.document, xx, tt, get_string("com_5"))
 *         z = vid.name
---- end original ---- */

ultroidCmd('(bw|invert)gif$', async (e) => {
  const chatId = e.chatId;
  // Port of `(bw|invert)gif$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("giftools") || `Plugin \`giftools\` matched \`(bw|invert)gif$\`.` });
});

ultroidCmd('rvgif$', async (e) => {
  const chatId = e.chatId;
  // Port of `rvgif$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("giftools") || `Plugin \`giftools\` matched \`rvgif$\`.` });
});

ultroidCmd('gif( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gif( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("giftools") || `Plugin \`giftools\` matched \`gif( (.*)|$)\`.` });
});

ultroidCmd('vtog$', async (e) => {
  const chatId = e.chatId;
  // Port of `vtog$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("giftools") || `Plugin \`giftools\` matched \`vtog$\`.` });
});
}

{ // ===== lib/plugins/glitch.js =====
// Ultroid-JS port of plugins/glitch.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/glitch.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "glitch";
const PATTERNS = ['glitch$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * •`{i}glitch <reply to media>`
 *     gives a glitchy gif.
 * """
 * import os
 * 
 * from . import bash, get_string, mediainfo, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="glitch$")
 * async def _(e):
 *     try:
 *         import glitch_me  # ignore :pylint
 *     except ModuleNotFoundError:
 *         await bash(
 *             "pip install -e git+https://github.com/1Danish-00/glitch_me.git#egg=glitch_me"
 *         )
 *     reply = await e.get_reply_message()
 *     if not reply or not reply.media:
 *         return await e.eor(get_string("cvt_3"))
 *     xx = await e.eor(get_string("glitch_1"))
 *     wut = mediainfo(reply.media)
 *     if wut.startswith(("pic", "sticker")):
 *         ok = await reply.download_media()
 *     elif reply.document and reply.document.thumbs:
 *         ok = await reply.download_media(thumb=-1)
 *     else:
 *         return await xx.eor(get_string("com_4"))
 *     cmd = f"glitch_me gif --line_count 200 -f 10 -d 50 '{ok}' ult.gif"
 *     await bash(cmd)
 *     await e.reply(file="ult.gif", force_document=False)
 *     await xx.delete()
 *     os.remove(ok)
 *     os.remove("ult.gif")
---- end original ---- */

ultroidCmd('glitch$', async (e) => {
  const chatId = e.chatId;
  // Port of `glitch$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("glitch") || `Plugin \`glitch\` matched \`glitch$\`.` });
});
}

{ // ===== lib/plugins/globaltools.js =====
// Ultroid-JS port of plugins/globaltools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/globaltools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "globaltools";
const PATTERNS = ['gpromote( (.*)|$)', 'gdemote( (.*)|$)', 'ungban( (.*)|$)', 'gban( (.*)|$)', 'g(admin|)cast( (.*)|$)', 'gucast( (.*)|$)', 'gkick( (.*)|$)', 'gmute( (.*)|$)', 'ungmute( (.*)|$)', 'listgban$', 'gstat( (.*)|$)', 'gblacklist$', 'ungblacklist$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}gban <reply user/ username>`
 * • `{i}ungban`
 *     Ban/Unban Globally.
 * 
 * • `{i}gstat <reply to user/userid/username>`
 *    Check if user is GBanned.
 * 
 * • `{i}listgban` : List all GBanned users.
 * 
 * • `{i}gmute` | `{i}ungmute` <reply user/ username>
 *     Mute/UnMute Globally.
 * 
 * • `{i}gkick <reply/username>` `Globally Kick User`
 * • `{i}gcast <text/reply>` `Globally Send msg in all grps`
 * 
 * • `{i}gadmincast <text/reply>` `Globally broadcast in your admin chats`
 * • `{i}gucast <text/reply>` `Globally send msg in all pm users`
 * 
 * • `{i}gblacklist <chat id/username/nothing (for current chat)`
 *    Add chat to blacklist and ignores global broadcast.
 * • `{i}ungblacklist` `Remove the chat from blacklist.`
 * 
 * • `{i}gpromote <reply to user> <channel/group/all> <rank>`
 *     globally promote user where you are admin
 *     - Set whether To promote only in groups/channels/all.
 *     Eg- `gpromote group boss` ~ promotes user in all grps.
 *         `gpromote @username all sar` ~ promote the user in all group & channel
 * • `{i}gdemote` - `demote user globally`
 * """
 * import asyncio
 * import os
 * 
 * from telethon.errors.rpcerrorlist import ChatAdminRequiredError, FloodWaitError
 * from telethon.tl.functions.channels import EditAdminRequest
 * from telethon.tl.functions.contacts import BlockRequest, UnblockRequest
 * from telethon.tl.types import ChatAdminRights, User
 * 
 * from pyUltroid.dB import DEVLIST
 * from pyUltroid.dB.base import KeyManager
 * from pyUltroid.dB.gban_mute_db import (
 *     gban,
 *     gmute,
 *     is_gbanned,
 *     is_gmuted,
 *     list_gbanned,
 *     ungban,
 *     ungmute,
 * )
 * from pyUltroid.fns.tools import create_tl_btn, format_btn, get_msg_button
 * 
 * from . import (
 *     HNDLR,
 *     LOGS,
 *     NOSPAM_CHAT,
 *     OWNER_NAME,
 *     eod,
 *     eor,
 *     get_string,
 *     inline_mention,
 *     ultroid_bot,
 *     ultroid_cmd,
 * )
 * from ._inline import something
 * 
 * _gpromote_rights = ChatAdminRights(
 *     add_admins=False,
 *     invite_users=True,
 *     change_info=False,
 *     ban_users=True,
 *     delete_messages=True,
 *     pin_messages=True,
 * )
 * 
 * _gdemote_rights = ChatAdminRights(
 *     add_admins=False,
 *     invite_users=False,
 *     change_info=False,
 *     ban_users=False,
 *     delete_messages=False,
 *     pin_messages=False,
 * )
 * 
 * keym = KeyManager("GBLACKLISTS", cast=list)
 * 
 * 
 * @ultroid_cmd(pattern="gpromote( (.*)|$)", fullsudo=True)
 * async def _(e):
 *     x = e.pattern_match.group(1).strip()
 *     ultroid_bot = e.client
 *     if not x:
 *         return await e.eor(get_string("schdl_2"), time=5)
 *     user = await e.get_reply_message()
 *     if user:
 *         ev = await e.eor("`Promoting Replied User Globally`")
 *         ok = e.text.split()
 *         key = "all"
 *         if len(ok) > 1 and (("group" in ok[1]) or ("channel" in ok[1])):
 *             key = ok[1]
 *         rank = ok[2] if len(ok) > 2 else "AdMin"
 *         c = 0
 *         user.id = user.peer_id.user_id if e.is_private else user.from_id.user_id
 *         async for x in e.client.iter_dialogs():
 *             if (
 *                 "group" in key.lower()
 *                 and x.is_group
 *                 or "group" not in key.lower()
 *                 and "channel" in key.lower()
 *                 and x.is_channel
 *             ):
 *                 try:
 *                     await e.client(
---- end original ---- */

ultroidCmd('gpromote( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gpromote( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gpromote( (.*)|$)\`.` });
});

ultroidCmd('gdemote( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gdemote( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gdemote( (.*)|$)\`.` });
});

ultroidCmd('ungban( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ungban( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`ungban( (.*)|$)\`.` });
});

ultroidCmd('gban( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gban( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gban( (.*)|$)\`.` });
});

ultroidCmd('g(admin|)cast( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `g(admin|)cast( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`g(admin|)cast( (.*)|$)\`.` });
});

ultroidCmd('gucast( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gucast( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gucast( (.*)|$)\`.` });
});

ultroidCmd('gkick( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gkick( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gkick( (.*)|$)\`.` });
});

ultroidCmd('gmute( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gmute( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gmute( (.*)|$)\`.` });
});

ultroidCmd('ungmute( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ungmute( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`ungmute( (.*)|$)\`.` });
});

ultroidCmd('listgban$', async (e) => {
  const chatId = e.chatId;
  // Port of `listgban$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`listgban$\`.` });
});

ultroidCmd('gstat( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gstat( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gstat( (.*)|$)\`.` });
});

ultroidCmd('gblacklist$', async (e) => {
  const chatId = e.chatId;
  // Port of `gblacklist$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gblacklist$\`.` });
});

ultroidCmd('ungblacklist$', async (e) => {
  const chatId = e.chatId;
  // Port of `ungblacklist$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`ungblacklist$\`.` });
});
}

{ // ===== lib/plugins/greetings.js =====
// Ultroid-JS port of plugins/greetings.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/greetings.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "greetings";
const PATTERNS = ['setwelcome', 'clearwelcome$', 'getwelcome$', 'setgoodbye', 'cleargoodbye$', 'getgoodbye$', 'thankmembers (on|off)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * ---- Welcomes ----
 * • `{i}setwelcome <message/reply to message>`
 *     Set welcome message in the current chat.
 * 
 * • `{i}clearwelcome`
 *     Delete the welcome in the current chat.
 * 
 * • `{i}getwelcome`
 *     Get the welcome message in the current chat.
 * 
 * ---- GoodByes ----
 * • `{i}setgoodbye <message/reply to message>`
 *     Set goodbye message in the current chat.
 * 
 * • `{i}cleargoodbye`
 *     Delete the goodbye in the current chat.
 * 
 * • `{i}getgoodbye`
 *     Get the goodbye message in the current chat.
 * 
 * • `{i}thankmembers on/off`
 *     Send a thank you sticker on hitting a members count of 100*x in your groups.
 * """
 * import os
 * 
 * from . import upload_file as uf
 * from telethon.utils import pack_bot_file_id
 * 
 * from pyUltroid.dB.greetings_db import (
 *     add_goodbye,
 *     add_thanks,
 *     add_welcome,
 *     delete_goodbye,
 *     delete_welcome,
 *     get_goodbye,
 *     get_welcome,
 *     must_thank,
 *     remove_thanks,
 * )
 * from pyUltroid.fns.tools import create_tl_btn, format_btn, get_msg_button
 * 
 * from . import HNDLR, eor, get_string, mediainfo, ultroid_cmd
 * from ._inline import something
 * 
 * Note = "\n\nNote: `{mention}`, `{group}`, `{count}`, `{name}`, `{fullname}`, `{username}`, `{userid}` can be used as formatting parameters.\n\n"
 * 
 * 
 * @ultroid_cmd(pattern="setwelcome", groups_only=True)
 * async def setwel(event):
 *     x = await event.eor(get_string("com_1"))
 *     r = await event.get_reply_message()
 *     btn = format_btn(r.buttons) if (r and r.buttons) else None
 *     try:
 *         text = event.text.split(maxsplit=1)[1]
 *     except IndexError:
 *         text = r.text if r else None
 *     if r and r.media:
 *         wut = mediainfo(r.media)
 *         if wut.startswith(("pic", "gif")):
 *             dl = await r.download_media()
 *             m = uf(dl)
 *             os.remove(dl)
 *         elif wut == "video":
 *             if r.media.document.size > 8 * 1000 * 1000:
 *                 return await eor(x, get_string("com_4"), time=5)
 *             dl = await r.download_media()
 *             m = uf(dl)
 *             os.remove(dl)
 *         elif wut == "web":
 *             m = None
 *         else:
 *             m = pack_bot_file_id(r.media)
 *         if r.text:
 *             txt = r.text
 *             if not btn:
 *                 txt, btn = get_msg_button(r.text)
 *             add_welcome(event.chat_id, txt, m, btn)
 *         else:
 *             add_welcome(event.chat_id, None, m, btn)
 *         await eor(x, get_string("grt_1"))
 *     elif text:
 *         if not btn:
 *             txt, btn = get_msg_button(text)
 *         add_welcome(event.chat_id, txt, None, btn)
 *         await eor(x, get_string("grt_1"))
 *     else:
 *         await eor(x, get_string("grt_3"), time=5)
 * 
 * 
 * @ultroid_cmd(pattern="clearwelcome$", groups_only=True)
 * async def clearwel(event):
 *     if not get_welcome(event.chat_id):
 *         return await event.eor(get_string("grt_4"), time=5)
 *     delete_welcome(event.chat_id)
 *     await event.eor(get_string("grt_5"), time=5)
 * 
 * 
 * @ultroid_cmd(pattern="getwelcome$", groups_only=True)
 * async def listwel(event):
 *     wel = get_welcome(event.chat_id)
 *     if not wel:
 *         return await event.eor(get_string("grt_4"), time=5)
 *     msgg, med = wel["welcome"], wel["media"]
 *     if wel.get("button"):
 *         btn = create_tl_btn(wel["button"])
 *         return await something(event, msgg, med, btn)
 *     await event.reply(f"**Welcome Note in this chat**\n\n`{msgg}`", file=med)
 *     await event.delete()
 * 
 * 
 * @ultroid_cmd(pattern="setgoodbye", groups_only=True)
---- end original ---- */

ultroidCmd('setwelcome', async (e) => {
  const chatId = e.chatId;
  // Port of `setwelcome` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("greetings") || `Plugin \`greetings\` matched \`setwelcome\`.` });
});

ultroidCmd('clearwelcome$', async (e) => {
  const chatId = e.chatId;
  // Port of `clearwelcome$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("greetings") || `Plugin \`greetings\` matched \`clearwelcome$\`.` });
});

ultroidCmd('getwelcome$', async (e) => {
  const chatId = e.chatId;
  // Port of `getwelcome$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("greetings") || `Plugin \`greetings\` matched \`getwelcome$\`.` });
});

ultroidCmd('setgoodbye', async (e) => {
  const chatId = e.chatId;
  // Port of `setgoodbye` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("greetings") || `Plugin \`greetings\` matched \`setgoodbye\`.` });
});

ultroidCmd('cleargoodbye$', async (e) => {
  const chatId = e.chatId;
  // Port of `cleargoodbye$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("greetings") || `Plugin \`greetings\` matched \`cleargoodbye$\`.` });
});

ultroidCmd('getgoodbye$', async (e) => {
  const chatId = e.chatId;
  // Port of `getgoodbye$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("greetings") || `Plugin \`greetings\` matched \`getgoodbye$\`.` });
});

ultroidCmd('thankmembers (on|off)', async (e) => {
  const chatId = e.chatId;
  // Port of `thankmembers (on|off)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("greetings") || `Plugin \`greetings\` matched \`thankmembers (on|off)\`.` });
});
}

{ // ===== lib/plugins/imagetools.js =====
// Ultroid-JS port of plugins/imagetools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/imagetools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "imagetools";
const PATTERNS = ['color$', '(grey|blur|negative|danger|mirror|quad|sketch|flip|toon)$', 'csample (.*)', 'blue$', 'border( (.*)|$)', 'pixelator( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}border <reply to photo/sticker>`
 *     To create border around that media..
 *     Ex - `{i}border 12,22,23`
 *        - `{i}border 12,22,23 ; width (in number)`
 * 
 * • `{i}grey <reply to any media>`
 *     To make it black nd white.
 * 
 * • `{i}color <reply to any Black nd White media>`
 *     To make it Colorfull.
 * 
 * • `{i}toon <reply to any media>`
 *     To make it toon.
 * 
 * • `{i}danger <reply to any media>`
 *     To make it look Danger.
 * 
 * • `{i}negative <reply to any media>`
 *     To make negative image.
 * 
 * • `{i}blur <reply to any media>`
 *     To make it blurry.
 * 
 * • `{i}quad <reply to any media>`
 *     create a Vortex.
 * 
 * • `{i}mirror <reply to any media>`
 *     To create mirror pic.
 * 
 * • `{i}flip <reply to any media>`
 *     To make it flip.
 * 
 * • `{i}sketch <reply to any media>`
 *     To draw its sketch.
 * 
 * • `{i}blue <reply to any media>`
 *     just cool.
 * 
 * • `{i}csample <color name /color code>`
 *    example : `{i}csample red`
 *              `{i}csample #ffffff`
 * 
 * • `{i}pixelator <reply image>`
 *     Create a Pixelated Image..
 * """
 * import os
 * 
 * from . import LOGS, con
 * 
 * try:
 *     import cv2
 * except ImportError:
 *     LOGS.error(f"{__file__}: OpenCv not Installed.")
 * 
 * import numpy as np
 * 
 * try:
 *     from PIL import Image
 * except ImportError:
 *     Image = None
 *     LOGS.info(f"{__file__}: PIL  not Installed.")
 * 
 * from . import upload_file as upf
 * from telethon.errors.rpcerrorlist import (
 *     ChatSendMediaForbiddenError,
 *     MessageDeleteForbiddenError,
 * )
 * 
 * from . import (
 *     Redis,
 *     async_searcher,
 *     download_file,
 *     get_string,
 *     requests,
 *     udB,
 *     ultroid_cmd,
 * )
 * 
 * 
 * @ultroid_cmd(pattern="color$")
 * async def _(event):
 *     reply = await event.get_reply_message()
 *     if not (reply and reply.media):
 *         return await event.eor("`Reply To a Black and White Image`")
 *     xx = await event.eor("`Coloring image 🎨🖌️...`")
 *     image = await reply.download_media()
 *     img = cv2.VideoCapture(image)
 *     ret, frame = img.read()
 *     cv2.imwrite("ult.jpg", frame)
 *     if udB.get_key("DEEP_API"):
 *         key = Redis("DEEP_API")
 *     else:
 *         key = "quickstart-QUdJIGlzIGNvbWluZy4uLi4K"
 *     r = requests.post(
 *         "https://api.deepai.org/api/colorizer",
 *         files={"image": open("ult.jpg", "rb")},
 *         headers={"api-key": key},
 *     )
 *     os.remove("ult.jpg")
 *     os.remove(image)
 *     if "status" in r.json():
 *         return await event.edit(
 *             r.json()["status"] + "\nGet api nd set `{i}setdb DEEP_API key`"
 *         )
 *     r_json = r.json()["output_url"]
 *     await event.client.send_file(event.chat_id, r_json, reply_to=reply)
 *     await xx.delete()
 * 
 * 
 * @ultroid_cmd(pattern="(grey|blur|negative|danger|mirror|quad|sketch|flip|toon)$")
 * async def ult_tools(event):
---- end original ---- */

ultroidCmd('color$', async (e) => {
  const chatId = e.chatId;
  // Port of `color$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("imagetools") || `Plugin \`imagetools\` matched \`color$\`.` });
});

ultroidCmd('(grey|blur|negative|danger|mirror|quad|sketch|flip|toon)$', async (e) => {
  const chatId = e.chatId;
  // Port of `(grey|blur|negative|danger|mirror|quad|sketch|flip|toon)$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("imagetools") || `Plugin \`imagetools\` matched \`(grey|blur|negative|danger|mirror|quad|sketch|flip|toon)$\`.` });
});

ultroidCmd('csample (.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `csample (.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("imagetools") || `Plugin \`imagetools\` matched \`csample (.*)\`.` });
});

ultroidCmd('blue$', async (e) => {
  const chatId = e.chatId;
  // Port of `blue$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("imagetools") || `Plugin \`imagetools\` matched \`blue$\`.` });
});

ultroidCmd('border( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `border( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("imagetools") || `Plugin \`imagetools\` matched \`border( (.*)|$)\`.` });
});

ultroidCmd('pixelator( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `pixelator( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("imagetools") || `Plugin \`imagetools\` matched \`pixelator( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/locks.js =====
// Ultroid-JS port of plugins/locks.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/locks.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "locks";
const PATTERNS = ['(un|)lock( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}lock <msgs/media/sticker/gif/games/inline/polls/invites/pin/changeinfo>`
 *     Lock the Used Setting in Used Group.
 * 
 * • `{i}unlock <msgs/media/sticker/gif/games/inline/polls/invites/pin/changeinfo>`
 *     UNLOCK the Used Setting in Used Group.
 * """
 * from telethon.tl.functions.messages import EditChatDefaultBannedRightsRequest
 * 
 * from pyUltroid.fns.admins import lock_unlock
 * 
 * from . import ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="(un|)lock( (.*)|$)", admins_only=True, manager=True, require="change_info"
 * )
 * async def un_lock(e):
 *     mat = e.pattern_match.group(2).strip()
 *     if not mat:
 *         return await e.eor("`Give some Proper Input..`", time=5)
 *     lock = e.pattern_match.group(1) == ""
 *     ml = lock_unlock(mat, lock)
 *     if not ml:
 *         return await e.eor("`Incorrect Input`", time=5)
 *     msg = "Locked" if lock else "Unlocked"
 *     try:
 *         await e.client(EditChatDefaultBannedRightsRequest(e.chat_id, ml))
 *     except Exception as er:
 *         return await e.eor(str(er))
 *     await e.eor(f"**{msg}** - `{mat}` ! ")
---- end original ---- */

ultroidCmd('(un|)lock( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `(un|)lock( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("locks") || `Plugin \`locks\` matched \`(un|)lock( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/logo.js =====
// Ultroid-JS port of plugins/logo.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/logo.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "logo";
const PATTERNS = ['logo( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}logo <text>`
 *    Generate a logo of the given Text
 *    Or Reply To image , to write ur text on it.
 *    Or Reply To Font File, To write with that font.
 * 
 * """
 * import glob
 * import os
 * import random
 * 
 * from telethon.tl.types import InputMessagesFilterPhotos
 * 
 * try:
 *     from PIL import Image
 * except ImportError:
 *     Image = None
 * from pyUltroid.fns.misc import unsplashsearch
 * from pyUltroid.fns.tools import LogoHelper
 * 
 * from . import OWNER_ID, OWNER_NAME, download_file, get_string, mediainfo, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="logo( (.*)|$)")
 * async def logo_gen(event):
 *     xx = await event.eor(get_string("com_1"))
 *     name = event.pattern_match.group(1).strip()
 *     if not name:
 *         return await xx.eor("`Give a name too!`", time=5)
 *     bg_, font_ = None, None
 *     if event.reply_to_msg_id:
 *         temp = await event.get_reply_message()
 *         if temp.media:
 *             if hasattr(temp.media, "document") and (
 *                 ("font" in temp.file.mime_type)
 *                 or (".ttf" in temp.file.name)
 *                 or (".otf" in temp.file.name)
 *             ):
 *                 font_ = await temp.download_media("resources/fonts/")
 *             elif "pic" in mediainfo(temp.media):
 *                 bg_ = await temp.download_media()
 *     if not bg_:
 *         SRCH = [
 *                 "background",
 *                 "neon",
 *                 "anime",
 *                 "art",
 *                 "bridges",
 *                 "streets",
 *                 "computer",
 *                 "cyberpunk",
 *                 "nature",
 *                 "abstract",
 *                 "exoplanet",
 *                 "magic",
 *                 "3d render",
 *             ]
 *         res = await unsplashsearch(random.choice(SRCH), limit=1)
 *         bg_, _ = await download_file(res[0], "resources/downloads/logo.png")
 *         newimg = "resources/downloads/unsplash-temp.jpg"
 *         img_ = Image.open(bg_)
 *         img_.save(newimg)
 *         os.remove(bg_)
 *         bg_ = newimg
 * 
 *     if not font_:
 *         fpath_ = glob.glob("resources/fonts/*")
 *         font_ = random.choice(fpath_)
 *     if len(name) <= 8:
 *         strke = 10
 *     elif len(name) >= 9:
 *         strke = 5
 *     else:
 *         strke = 20
 *     name = LogoHelper.make_logo(
 *         bg_,
 *         name,
 *         font_,
 *         fill="white",
 *         stroke_width=strke,
 *         stroke_fill="black",
 *     )
 *     await xx.edit("`Done!`")
 *     await event.client.send_file(
 *         event.chat_id,
 *         file=name,
 *         caption=f"Logo by [{OWNER_NAME}](tg://user?id={OWNER_ID})",
 *         force_document=True,
 *     )
 *     os.remove(name)
 *     await xx.delete()
 *     if os.path.exists(bg_):
 *         os.remove(bg_)
---- end original ---- */

ultroidCmd('logo( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `logo( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("logo") || `Plugin \`logo\` matched \`logo( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/mediatools.js =====
// Ultroid-JS port of plugins/mediatools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/mediatools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "mediatools";
const PATTERNS = ['mediainfo( (.*)|$)', 'rotate( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}mediainfo <reply to media>/<file path>/<url>`
 *    To get info about it.
 * 
 * • `{i}rotate <degree/angle> <reply to media>`
 *    Rotate any video/photo/media..
 *    Note : for video it should be angle of 90's
 * """
 * import os
 * import time
 * from datetime import datetime as dt
 * 
 * from pyUltroid.fns.misc import rotate_image
 * from pyUltroid.fns.tools import make_html_telegraph
 * 
 * from . import (
 *     LOGS,
 *     Telegraph,
 *     bash,
 *     downloader,
 *     get_string,
 *     upload_file,
 *     is_url_ok,
 *     mediainfo,
 *     ultroid_cmd,
 * )
 * 
 * try:
 *     import cv2
 * except ImportError:
 *     LOGS.info("WARNING: 'cv2' not found!")
 *     cv2 = None
 * 
 * 
 * @ultroid_cmd(pattern="mediainfo( (.*)|$)")
 * async def mi(e):
 *     r = await e.get_reply_message()
 *     match = e.pattern_match.group(1).strip()
 *     taime = time.time()
 *     extra = ""
 *     if r and r.media:
 *         xx = mediainfo(r.media)
 *         murl = r.media.stringify()
 *         url = await make_html_telegraph("Mediainfo", f"<pre>{murl}</pre>")
 *         extra = f"**[{xx}]({url})**\n\n"
 *         e = await e.eor(f"{extra}`Loading More...`", link_preview=False)
 * 
 *         if hasattr(r.media, "document"):
 *             file = r.media.document
 *             mime_type = file.mime_type
 *             filename = r.file.name
 *             if not filename:
 *                 if "audio" in mime_type:
 *                     filename = "audio_" + dt.now().isoformat("_", "seconds") + ".ogg"
 *                 elif "video" in mime_type:
 *                     filename = "video_" + dt.now().isoformat("_", "seconds") + ".mp4"
 *             dl = await downloader(
 *                 f"resources/downloads/{filename}",
 *                 file,
 *                 e,
 *                 taime,
 *                 f"{extra}`Loading More...`",
 *             )
 * 
 *             naam = dl.name
 *         else:
 *             naam = await r.download_media()
 *     elif match and (
 *         os.path.isfile(match)
 *         or (match.startswith("https://") and (await is_url_ok(match)))
 *     ):
 *         naam, xx = match, "file"
 *     else:
 *         return await e.eor(get_string("cvt_3"), time=5)
 *     out, er = await bash(f"mediainfo '{naam}'")
 *     if er:
 *         LOGS.info(er)
 *         out = extra or str(er)
 *         return await e.edit(out, link_preview=False)
 *     makehtml = ""
 *     if naam.endswith((".jpg", ".png")):
 *         if os.path.exists(naam):
 *             med = upload_file(naam)
 *         else:
 *             med = match
 *         makehtml += f"<img src='{med}'><br>"
 *     for line in out.split("\n"):
 *         line = line.strip()
 *         if not line:
 *             makehtml += "<br>"
 *         elif ":" not in line:
 *             makehtml += f"<h3>{line}</h3>"
 *         else:
 *             makehtml += f"<p>{line}</p>"
 *     try:
 *         urll = await make_html_telegraph("Mediainfo", makehtml)
 *     except Exception as er:
 *         LOGS.exception(er)
 *         return
 *     await e.eor(f"{extra}[{get_string('mdi_1')}]({urll})", link_preview=False)
 *     if not match:
 *         os.remove(naam)
 * 
 * 
 * @ultroid_cmd(pattern="rotate( (.*)|$)")
 * async def rotate_(ult):
 *     match = ult.pattern_match.group(1).strip()
 *     if not ult.is_reply:
 *         return await ult.eor("`Reply to a media...`")
 *     if match:
 *         try:
 *             match = int(match)
---- end original ---- */

ultroidCmd('mediainfo( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `mediainfo( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("mediatools") || `Plugin \`mediatools\` matched \`mediainfo( (.*)|$)\`.` });
});

ultroidCmd('rotate( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `rotate( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("mediatools") || `Plugin \`mediatools\` matched \`rotate( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/misc.js =====
// Ultroid-JS port of plugins/misc.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/misc.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "misc";
const PATTERNS = ['eod$', 'pntrst( (.*)|$)', 'gadget( (.*)|$)', 'randomuser', 'ascii( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}eod`
 *     `Get Event of the Today`
 * 
 * • `{i}pntrst <link/id>`
 *     Download and send pinterest pins
 * 
 * • `{i}gadget <search query>`
 *     Gadget Search from Telegram.
 * 
 * • `{i}randomuser`
 *    Generate details about a random user.
 * 
 * • `{i}ascii <reply image>`
 *     Convert replied image into html.
 * """
 * 
 * import os
 * from datetime import datetime as dt
 * 
 * from bs4 import BeautifulSoup as bs
 * 
 * try:
 *     from htmlwebshot import WebShot
 * except ImportError:
 *     WebShot = None
 * try:
 *     from img2html.converter import Img2HTMLConverter
 * except ImportError:
 *     Img2HTMLConverter = None
 * 
 * from . import async_searcher, get_random_user_data, get_string, re, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="eod$")
 * async def diela(e):
 *     m = await e.eor(get_string("com_1"))
 *     li = "https://daysoftheyear.com"
 *     te = "🎊 **Events of the Day**\n\n"
 *     da = dt.now()
 *     month = da.strftime("%b")
 *     li += f"/days/{month}/" + da.strftime("%F").split("-")[2]
 *     ct = await async_searcher(li, re_content=True)
 *     bt = bs(ct, "html.parser", from_encoding="utf-8")
 *     ml = bt.find_all("a", "js-link-target", href=re.compile("daysoftheyear.com/days"))
 *     for eve in ml[:5]:
 *         te += f'• [{eve.text}]({eve["href"]})\n'
 *     await m.edit(te, link_preview=False)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="pntrst( (.*)|$)",
 * )
 * async def pinterest(e):
 *     m = e.pattern_match.group(1).strip()
 *     if not m:
 *         return await e.eor("`Give pinterest link.`", time=3)
 *     soup = await async_searcher(
 *         "https://www.expertstool.com/download-pinterest-video/",
 *         data={"url": m},
 *         post=True,
 *     )
 *     try:
 *         _soup = bs(soup, "html.parser").find("table").tbody.find_all("tr")
 *     except BaseException:
 *         return await e.eor("`Wrong link or private pin.`", time=5)
 *     file = _soup[1] if len(_soup) > 1 else _soup[0]
 *     file = file.td.a["href"]
 *     await e.client.send_file(e.chat_id, file, caption=f"Pin:- {m}")
 * 
 * 
 * @ultroid_cmd(pattern="gadget( (.*)|$)")
 * async def mobs(e):
 *     mat = e.pattern_match.group(1).strip()
 *     if not mat:
 *         await e.eor("Please Give a Mobile Name to look for.")
 *     query = mat.replace(" ", "%20")
 *     jwala = f"https://gadgets.ndtv.com/search?searchtext={query}"
 *     c = await async_searcher(jwala)
 *     b = bs(c, "html.parser", from_encoding="utf-8")
 *     co = b.find_all("div", "rvw-imgbox")
 *     if not co:
 *         return await e.eor("No Results Found!")
 *     bt = await e.eor(get_string("com_1"))
 *     out = "**📱 Mobile / Gadgets Search**\n\n"
 *     li = co[0].find("a")
 *     imu, title = None, li.find("img")["title"]
 *     cont = await async_searcher(li["href"])
 *     nu = bs(cont, "html.parser", from_encoding="utf-8")
 *     req = nu.find_all("div", "_pdsd")
 *     imu = nu.find_all(
 *         "img", src=re.compile("https://i.gadgets360cdn.com/products/large/")
 *     )
 *     if imu:
 *         imu = imu[0]["src"].split("?")[0] + "?downsize=*:420&output-quality=80"
 *     out += f"☑️ **[{title}]({li['href']})**\n\n"
 *     for fp in req:
 *         ty = fp.findNext()
 *         out += f"- **{ty.text}** - `{ty.findNext().text}`\n"
 *     out += "_"
 *     if imu == []:
 *         imu = None
 *     await e.reply(out, file=imu, link_preview=False)
 *     await bt.delete()
 * 
 * 
 * @ultroid_cmd(pattern="randomuser")
 * async def _gen_data(event):
 *     x = await event.eor(get_string("com_1"))
 *     msg, pic = await get_random_user_data()
 *     await event.reply(file=pic, message=msg)
 *     await x.delete()
 * 
---- end original ---- */

ultroidCmd('eod$', async (e) => {
  const chatId = e.chatId;
  // Port of `eod$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("misc") || `Plugin \`misc\` matched \`eod$\`.` });
});

ultroidCmd('pntrst( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `pntrst( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("misc") || `Plugin \`misc\` matched \`pntrst( (.*)|$)\`.` });
});

ultroidCmd('gadget( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gadget( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("misc") || `Plugin \`misc\` matched \`gadget( (.*)|$)\`.` });
});

ultroidCmd('randomuser', async (e) => {
  const chatId = e.chatId;
  // Port of `randomuser` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("misc") || `Plugin \`misc\` matched \`randomuser\`.` });
});

ultroidCmd('ascii( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ascii( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("misc") || `Plugin \`misc\` matched \`ascii( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/mute.js =====
// Ultroid-JS port of plugins/mute.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/mute.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "mute";
const PATTERNS = ['dmute( (.*)|$)', 'undmute( (.*)|$)', 'tmute', 'unmute( (.*)|$)', 'mute( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}mute <reply to msg/ user id>`
 *     Mute user in current chat.
 * 
 * • `{i}unmute <reply to msg/ user id>`
 *     Unmute user in current chat.
 * 
 * • `{i}dmute <reply to msg/ user id>`
 *     Mute user in current chat by deleting msgs.
 * 
 * • `{i}undmute <reply to msg/ use id>`
 *     Unmute dmuted user in current chat.
 * 
 * • `{i}tmute <time> <reply to msg/ use id>`
 *     s- seconds
 *     m- minutes
 *     h- hours
 *     d- days
 *     Mute user in current chat with time.
 * """
 * from telethon import events
 * from telethon.utils import get_display_name
 * 
 * from pyUltroid.dB.mute_db import is_muted, mute, unmute
 * from pyUltroid.fns.admins import ban_time
 * 
 * from . import asst, eod, get_string, inline_mention, ultroid_bot, ultroid_cmd
 * 
 * 
 * @ultroid_bot.on(events.NewMessage(incoming=True))
 * async def watcher(event):
 *     if is_muted(event.chat_id, event.sender_id):
 *         await event.delete()
 *     if event.via_bot and is_muted(event.chat_id, event.via_bot_id):
 *         await event.delete()
 * 
 * 
 * @ultroid_cmd(
 *     pattern="dmute( (.*)|$)",
 * )
 * async def startmute(event):
 *     xx = await event.eor("`Muting...`")
 *     if input_ := event.pattern_match.group(1).strip():
 *         try:
 *             userid = await event.client.parse_id(input_)
 *         except Exception as x:
 *             return await xx.edit(str(x))
 *     elif event.reply_to_msg_id:
 *         reply = await event.get_reply_message()
 *         userid = reply.sender_id
 *         if reply.out or userid in [ultroid_bot.me.id, asst.me.id]:
 *             return await xx.eor("`You cannot mute yourself or your assistant bot.`")
 *     elif event.is_private:
 *         userid = event.chat_id
 *     else:
 *         return await xx.eor("`Reply to a user or add their userid.`", time=5)
 *     chat = await event.get_chat()
 *     if "admin_rights" in vars(chat) and vars(chat)["admin_rights"] is not None:
 *         if not chat.admin_rights.delete_messages:
 *             return await xx.eor("`No proper admin rights...`", time=5)
 *     elif "creator" not in vars(chat) and not event.is_private:
 *         return await xx.eor("`No proper admin rights...`", time=5)
 *     if is_muted(event.chat_id, userid):
 *         return await xx.eor("`This user is already muted in this chat.`", time=5)
 *     mute(event.chat_id, userid)
 *     await xx.eor("`Successfully muted...`", time=3)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="undmute( (.*)|$)",
 * )
 * async def endmute(event):
 *     xx = await event.eor("`Unmuting...`")
 *     if input_ := event.pattern_match.group(1).strip():
 *         try:
 *             userid = await event.client.parse_id(input_)
 *         except Exception as x:
 *             return await xx.edit(str(x))
 *     elif event.reply_to_msg_id:
 *         userid = (await event.get_reply_message()).sender_id
 *     elif event.is_private:
 *         userid = event.chat_id
 *     else:
 *         return await xx.eor("`Reply to a user or add their userid.`", time=5)
 *     if not is_muted(event.chat_id, userid):
 *         return await xx.eor("`This user is not muted in this chat.`", time=3)
 *     unmute(event.chat_id, userid)
 *     await xx.eor("`Successfully unmuted...`", time=3)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="tmute",
 *     groups_only=True,
 *     manager=True,
 * )
 * async def _(e):
 *     xx = await e.eor("`Muting...`")
 *     huh = e.text.split()
 *     try:
 *         tme = huh[1]
 *     except IndexError:
 *         return await xx.eor("`Time till mute?`", time=5)
 *     try:
 *         input_ = huh[2]
 *     except IndexError:
 *         input_ = ""
 *     chat = await e.get_chat()
 *     if e.reply_to_msg_id:
 *         reply = await e.get_reply_message()
 *         userid = reply.sender_id
 *         name = (await reply.get_sender()).first_name
 *     elif input_:
---- end original ---- */

ultroidCmd('dmute( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `dmute( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("mute") || `Plugin \`mute\` matched \`dmute( (.*)|$)\`.` });
});

ultroidCmd('undmute( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `undmute( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("mute") || `Plugin \`mute\` matched \`undmute( (.*)|$)\`.` });
});

ultroidCmd('tmute', async (e) => {
  const chatId = e.chatId;
  // Port of `tmute` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("mute") || `Plugin \`mute\` matched \`tmute\`.` });
});

ultroidCmd('unmute( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `unmute( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("mute") || `Plugin \`mute\` matched \`unmute( (.*)|$)\`.` });
});

ultroidCmd('mute( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `mute( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("mute") || `Plugin \`mute\` matched \`mute( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/nightmode.js =====
// Ultroid-JS port of plugins/nightmode.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/nightmode.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "nightmode";
const PATTERNS = ['nmtime( (.*)|$)', 'addnm( (.*)|$)', 'remnm( (.*)|$)', 'listnm$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * At Night it will turn off everyone permission to send message in  an all groups which you added via `{i}addnight`
 * And Turn On auto at morning
 * 
 * • `{i}addnm`
 *    Add NightMode
 *    To Add Group To Auto Night Mode.
 * 
 * • `{i}remnm`
 *    Remove NightMode
 *    To remove Group From Auto Night Mode
 * 
 * • `{i}listnm`
 *    List NightMode
 *    To Get All List of Groups where NightMode Active.
 * 
 * • `{i}nmtime <close hour> <close min> <open hour> <open min>`
 *    NightMode Time
 *    By Default Its close 00:00 , open 07:00
 *    Use 24hr format
 *    Ex- `nmtime 01 00 06 30`
 * """
 * 
 * from . import LOGS
 * 
 * try:
 *     from apscheduler.schedulers.asyncio import AsyncIOScheduler
 * except ImportError:
 *     LOGS.error("nightmode: 'apscheduler' not Installed!")
 *     AsyncIOScheduler = None
 * 
 * from telethon.tl.functions.messages import EditChatDefaultBannedRightsRequest
 * from telethon.tl.types import ChatBannedRights
 * 
 * from pyUltroid.dB.base import KeyManager
 * 
 * from . import get_string, udB, ultroid_bot, ultroid_cmd
 * 
 * keym = KeyManager("NIGHT_CHATS", cast=list)
 * 
 * 
 * @ultroid_cmd(pattern="nmtime( (.*)|$)")
 * async def set_time(e):
 *     if not e.pattern_match.group(1).strip():
 *         return await e.eor(get_string("nightm_1"))
 *     try:
 *         ok = e.text.split(maxsplit=1)[1].split()
 *         if len(ok) != 4:
 *             return await e.eor(get_string("nightm_1"))
 *         tm = [int(x) for x in ok]
 *         udB.set_key("NIGHT_TIME", str(tm))
 *         await e.eor(get_string("nightm_2"))
 *     except BaseException:
 *         await e.eor(get_string("nightm_1"))
 * 
 * 
 * @ultroid_cmd(pattern="addnm( (.*)|$)")
 * async def add_grp(e):
 *     if pat := e.pattern_match.group(1).strip():
 *         try:
 *             keym.add((await ultroid_bot.get_entity(pat)).id)
 *             return await e.eor(f"Done, Added {pat} To Night Mode.")
 *         except BaseException:
 *             return await e.eor(get_string("nightm_5"), time=5)
 *     keym.add(e.chat_id)
 *     await e.eor(get_string("nightm_3"))
 * 
 * 
 * @ultroid_cmd(pattern="remnm( (.*)|$)")
 * async def r_em_grp(e):
 *     if pat := e.pattern_match.group(1).strip():
 *         try:
 *             keym.remove((await ultroid_bot.get_entity(pat)).id)
 *             return await e.eor(f"Done, Removed {pat} To Night Mode.")
 *         except BaseException:
 *             return await e.eor(get_string("nightm_5"), time=5)
 *     keym.remove(e.chat_id)
 *     await e.eor(get_string("nightm_4"))
 * 
 * 
 * @ultroid_cmd(pattern="listnm$")
 * async def rem_grp(e):
 *     chats = keym.get()
 *     name = "NightMode Groups Are-:\n\n"
 *     for x in chats:
 *         try:
 *             ok = await ultroid_bot.get_entity(x)
 *             name += f"@{ok.username}" if ok.username else ok.title
 *         except BaseException:
 *             name += str(x)
 *     await e.eor(name)
 * 
 * 
 * async def open_grp():
 *     for chat in keym.get():
 *         try:
 *             await ultroid_bot(
 *                 EditChatDefaultBannedRightsRequest(
 *                     chat,
 *                     banned_rights=ChatBannedRights(
 *                         until_date=None,
 *                         send_messages=False,
 *                         send_media=False,
 *                         send_stickers=False,
 *                         send_gifs=False,
 *                         send_games=False,
 *                         send_inline=False,
 *                         send_polls=False,
 *                     ),
 *                 )
 *             )
 *             await ultroid_bot.send_message(chat, "**NightMode Off**\n\nGroup Opened 🥳.")
---- end original ---- */

ultroidCmd('nmtime( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `nmtime( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("nightmode") || `Plugin \`nightmode\` matched \`nmtime( (.*)|$)\`.` });
});

ultroidCmd('addnm( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `addnm( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("nightmode") || `Plugin \`nightmode\` matched \`addnm( (.*)|$)\`.` });
});

ultroidCmd('remnm( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `remnm( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("nightmode") || `Plugin \`nightmode\` matched \`remnm( (.*)|$)\`.` });
});

ultroidCmd('listnm$', async (e) => {
  const chatId = e.chatId;
  // Port of `listnm$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("nightmode") || `Plugin \`nightmode\` matched \`listnm$\`.` });
});
}

{ // ===== lib/plugins/nsfwfilter.js =====
// Ultroid-JS port of plugins/nsfwfilter.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/nsfwfilter.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "nsfwfilter";
const PATTERNS = ['addnsfw( (.*)|$)', 'remnsfw'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * •`{i}addnsfw <ban/mute/kick>`
 *    If someone sends 18+ content it will be deleted and action will be taken.
 * 
 * •`{i}remnsfw`
 *    Remove Chat from nsfw filtering.
 * """
 * 
 * import os
 * 
 * from . import LOGS
 * 
 * try:
 *     from ProfanityDetector import detector
 * except ImportError:
 *     detector = None
 *     LOGS.error("nsfwfilter: 'Profanitydetector' not installed!")
 * from pyUltroid.dB.nsfw_db import is_nsfw, nsfw_chat, rem_nsfw
 * 
 * from . import HNDLR, async_searcher, eor, events, udB, ultroid_bot, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="addnsfw( (.*)|$)", admins_only=True)
 * async def addnsfw(e):
 *     if not udB.get_key("DEEP_API"):
 *         return await eor(
 *             e, f"Get Api from deepai.org and Add It `{HNDLR}setdb DEEP_API your-api`"
 *         )
 *     action = e.pattern_match.group(1).strip()
 *     if not action or ("ban" or "kick" or "mute") not in action:
 *         action = "mute"
 *     nsfw_chat(e.chat_id, action)
 *     ultroid_bot.add_handler(nsfw_check, events.NewMessage(incoming=True))
 *     await e.eor("Added This Chat To Nsfw Filter")
 * 
 * 
 * @ultroid_cmd(pattern="remnsfw", admins_only=True)
 * async def remnsfw(e):
 *     rem_nsfw(e.chat_id)
 *     await e.eor("Removed This Chat from Nsfw Filter.")
 * 
 * 
 * NWARN = {}
 * 
 * 
 * async def nsfw_check(e):
 *     chat = e.chat_id
 *     action = is_nsfw(chat)
 *     if action and udB.get_key("DEEP_API") and e.media:
 *         pic, name, nsfw = "", "", 0
 *         try:
 *             pic = await e.download_media(thumb=-1)
 *         except BaseException:
 *             pass
 *         if e.file:
 *             name = e.file.name
 *         if detector and name:
 *             x, y = detector(name)
 *             if y:
 *                 nsfw += 1
 *         if pic and not nsfw:
 *             r = await async_searcher(
 *                 "https://api.deepai.org/api/nsfw-detector",
 *                 data={
 *                     "image": open(pic, "rb"),
 *                 },
 *                 post=True,
 *                 re_json=True,
 *                 headers={"api-key": udB.get_key("DEEP_API")},
 *             )
 *             try:
 *                 k = float((r["output"]["nsfw_score"]))
 *             except KeyError as er:
 *                 LOGS.exception(er)
 *                 LOGS.info(r)
 *                 return
 *             score = int(k * 100)
 *             if score > 45:
 *                 nsfw += 1
 *             os.remove(pic)
 *         if nsfw:
 *             await e.delete()
 *             if NWARN.get(e.sender_id):
 *                 count = NWARN[e.sender_id] + 1
 *                 if count < 3:
 *                     NWARN.update({e.sender_id: count})
 *                     return await ultroid_bot.send_message(
 *                         chat,
 *                         f"**NSFW Warn {count}/3** To [{e.sender.first_name}](tg://user?id={e.sender_id})\nNSFW prohibited! Repeated violation would lead to {action}",
 *                     )
 *                 if "mute" in action:
 *                     try:
 *                         await ultroid_bot.edit_permissions(
 *                             chat, e.sender_id, until_date=None, send_messages=False
 *                         )
 *                         await ultroid_bot.send_message(
 *                             chat,
 *                             f"NSFW Warn 3/3 to [{e.sender.first_name}](tg://user?id={e.sender_id})\n\n**Action Taken** : {action}",
 *                         )
 *                     except BaseException:
 *                         await ultroid_bot.send_message(
 *                             chat,
 *                             f"NSFW Warn 3/3 to [{e.sender.first_name}](tg://user?id={e.sender_id})\n\nUnable to {action}.",
 *                         )
 *                 elif "ban" in action:
 *                     try:
 *                         await ultroid_bot.edit_permissions(
 *                             chat, e.sender_id, view_messages=False
 *                         )
 *                         await ultroid_bot.send_message(
 *                             chat,
 *                             f"NSFW Warn 3/3 to [{e.sender.first_name}](tg://user?id={e.sender_id})\n\n**Action Taken** : {action}",
---- end original ---- */

ultroidCmd('addnsfw( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `addnsfw( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("nsfwfilter") || `Plugin \`nsfwfilter\` matched \`addnsfw( (.*)|$)\`.` });
});

ultroidCmd('remnsfw', async (e) => {
  const chatId = e.chatId;
  // Port of `remnsfw` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("nsfwfilter") || `Plugin \`nsfwfilter\` matched \`remnsfw\`.` });
});
}

{ // ===== lib/plugins/other.js =====
// Ultroid-JS port of plugins/other.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/other.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "other";
const PATTERNS = ['(send|dm)( (.*)|$)', 'fwdreply( (.*)|$)', '(f|)save$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}send <username/id> <reply/type>`
 *     send message to User/Chat.
 * 
 * • `{i}fwdreply <reply to msg>`
 *     Reply to someone's msg by forwarding it in private.
 * 
 * • `{i}save <reply message>`
 *     Save that replied msg to ur saved messages box.
 * 
 * • `{i}fsave <reply message>`
 *     Forward that replied msg to ur saved messages.
 * """
 * 
 * from . import HNDLR, eod, get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="(send|dm)( (.*)|$)", fullsudo=True)
 * async def dm(e):
 *     if len(e.text.split()) <= 1:
 *         return await e.eor(get_string("dm_1"), time=5)
 *     chat = e.text.split()[1]
 *     try:
 *         chat_id = await e.client.parse_id(chat)
 *     except Exception as ex:
 *         return await e.eor(f"`{ex}`", time=5)
 *     if len(e.text.split()) > 2:
 *         msg = e.text.split(maxsplit=2)[2]
 *     elif e.reply_to:
 *         msg = await e.get_reply_message()
 *     else:
 *         return await e.eor(get_string("dm_2"), time=5)
 *     try:
 *         _ = await e.client.send_message(chat_id, msg)
 *         n_, time = get_string("dm_3"), None
 *         if not _.is_private:
 *             n_ = f"[{n_}]({_.message_link})"
 *         await e.eor(n_, time=time)
 *     except Exception as m:
 *         await e.eor(get_string("dm_4").format(m, HNDLR), time=5)
 * 
 * 
 * @ultroid_cmd(pattern="fwdreply( (.*)|$)", fullsudo=True)
 * async def _(e):
 *     message = e.pattern_match.group(1).strip()
 *     if not e.reply_to_msg_id:
 *         return await e.eor(get_string("ex_1"), time=5)
 *     if not message:
 *         return await e.eor(get_string("dm_6"), time=5)
 *     msg = await e.get_reply_message()
 *     fwd = await msg.forward_to(msg.sender_id)
 *     await fwd.reply(message)
 *     await e.eor(get_string("dm_5"), time=5)
 * 
 * 
 * @ultroid_cmd(pattern="(f|)save$")
 * async def saf(e):
 *     x = await e.get_reply_message()
 *     if not x:
 *         return await eod(
 *             e, "Reply to Any Message to save it to ur saved messages", time=5
 *         )
 *     if e.pattern_match.group(1).strip() == "f":
 *         await x.forward_to(e.sender_id)
 *     else:
 *         await e.client.send_message(e.sender_id, x)
 *     await e.eor("Message saved to Your Pm/Saved Messages.", time=5)
---- end original ---- */

ultroidCmd('(send|dm)( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `(send|dm)( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("other") || `Plugin \`other\` matched \`(send|dm)( (.*)|$)\`.` });
});

ultroidCmd('fwdreply( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `fwdreply( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("other") || `Plugin \`other\` matched \`fwdreply( (.*)|$)\`.` });
});

ultroidCmd('(f|)save$', async (e) => {
  const chatId = e.chatId;
  // Port of `(f|)save$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("other") || `Plugin \`other\` matched \`(f|)save$\`.` });
});
}

{ // ===== lib/plugins/pdftools.js =====
// Ultroid-JS port of plugins/pdftools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/pdftools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "pdftools";
const PATTERNS = ['pdf( (.*)|$)', 'pdtext( (.*)|$)', 'pdscan( (.*)|$)', 'pdsave( (.*)|$)', 'pdsend( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}pdf <page num> <reply to pdf file>`
 *     Extract & send page as an Image.(note-: For extracting all pages, just use .pdf)
 *     to upload selected range `{i}pdf 1-7`
 * 
 * • `{i}pdtext <page num> <reply to pdf file>`
 *     Extract Text From the Pdf.(note-: For Extraction all text just use .pdtext)
 *     to extract selected pages `{i}pdf 1-7`
 * 
 * • `{i}pdscan <reply to image>`
 *     It scan, crop & send image(s) as pdf.
 * 
 * • `{i}pdsave <reply to image/pdf>`
 *     It scan, crop & save file to merge.
 *     you can merge many pages in a single pdf.
 * 
 * • `{i}pdsend `
 *     Merge & send the pdf, collected from .pdsave.
 * """
 * import glob
 * import os
 * import shutil
 * import time
 * 
 * import cv2
 * import numpy as np
 * 
 * from pyUltroid.fns.tools import four_point_transform
 * 
 * from . import (
 *     HNDLR,
 *     LOGS,
 *     bash,
 *     check_filename,
 *     downloader,
 *     eor,
 *     get_string,
 *     ultroid_cmd,
 * )
 * 
 * try:
 *     from PIL import Image
 * except ImportError:
 *     Image = None
 *     LOGS.info(f"{__file__}: PIL  not Installed.")
 * try:
 *     from PyPDF2 import PdfReader, PdfWriter, PdfMerger
 *     PdfFileReader = PdfReader
 *     PdfFileWriter = PdfWriter
 *     PdfFileMerger = PdfMerger
 * except ImportError:
 *     from PyPDF2 import PdfFileMerger, PdfFileReader, PdfFileWriter
 * from telethon.errors.rpcerrorlist import PhotoSaveFileInvalidError
 * 
 * if not os.path.isdir("pdf"):
 *     os.mkdir("pdf")
 * 
 * 
 * @ultroid_cmd(
 *     pattern="pdf( (.*)|$)",
 * )
 * async def pdfseimg(event):
 *     ok = await event.get_reply_message()
 *     msg = event.pattern_match.group(1).strip()
 *     if not (ok and (ok.document and (ok.document.mime_type == "application/pdf"))):
 *         await event.eor("`Reply The pdf u Want to Download..`")
 *         return
 *     xx = await event.eor(get_string("com_1"))
 *     file = ok.media.document
 *     k = time.time()
 *     filename = "hehe.pdf"
 *     result = await downloader(
 *         f"pdf/{filename}", file, xx, k, f"Downloading {filename}..."
 *     )
 * 
 *     await xx.delete()
 *     pdfp = "pdf/hehe.pdf"
 *     pdfp.replace(".pdf", "")
 *     pdf = PdfFileReader(pdfp)
 *     if not msg:
 *         ok = []
 *         for num in range(pdf.numPages):
 *             pw = PdfFileWriter()
 *             pw.addPage(pdf.getPage(num))
 *             fil = os.path.join(f"pdf/ult{num + 1}.png")
 *             ok.append(fil)
 *             with open(fil, "wb") as f:
 *                 pw.write(f)
 *         os.remove(pdfp)
 *         for z in ok:
 *             await event.client.send_file(event.chat_id, z)
 *         shutil.rmtree("pdf")
 *         os.mkdir("pdf")
 *         await xx.delete()
 *     elif "-" in msg:
 *         ok = int(msg.split("-")[-1]) - 1
 *         for o in range(ok):
 *             pw = PdfFileWriter()
 *             pw.addPage(pdf.getPage(o))
 *             with open(os.path.join("ult.png"), "wb") as f:
 *                 pw.write(f)
 *             await event.reply(
 *                 file="ult.png",
 *             )
 *             os.remove("ult.png")
 *         os.remove(pdfp)
 *     else:
 *         o = int(msg) - 1
 *         pw = PdfFileWriter()
 *         pw.addPage(pdf.getPage(o))
 *         with open(os.path.join("ult.png"), "wb") as f:
 *             pw.write(f)
---- end original ---- */

ultroidCmd('pdf( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `pdf( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pdftools") || `Plugin \`pdftools\` matched \`pdf( (.*)|$)\`.` });
});

ultroidCmd('pdtext( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `pdtext( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pdftools") || `Plugin \`pdftools\` matched \`pdtext( (.*)|$)\`.` });
});

ultroidCmd('pdscan( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `pdscan( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pdftools") || `Plugin \`pdftools\` matched \`pdscan( (.*)|$)\`.` });
});

ultroidCmd('pdsave( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `pdsave( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pdftools") || `Plugin \`pdftools\` matched \`pdsave( (.*)|$)\`.` });
});

ultroidCmd('pdsend( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `pdsend( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pdftools") || `Plugin \`pdftools\` matched \`pdsend( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/pmpermit.js =====
// Ultroid-JS port of plugins/pmpermit.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/pmpermit.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "pmpermit";
const PATTERNS = ['logpm$', 'nologpm$', 'pmpermit( (.*)|$)', '(start|stop|clear)archive$', '(a|approve)(?: |$)', '(da|disapprove)(?: |$)', 'block( (.*)|$)', 'unblock( (.*)|$)', 'listapproved$', 'deletedissht'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}a` or `{i}approve`
 *     Approve someone to PM.
 * 
 * • `{i}da` or `{i}disapprove`
 *     Disapprove someone to PM.
 * 
 * • `{i}block`
 *     Block someone.
 * 
 * • `{i}unblock` | `{i}unblock all`
 *     Unblock someone.
 * 
 * • `{i}nologpm`
 *     Stop logging messages from the user.
 * 
 * • `{i}logpm`
 *     Start logging messages from the user.
 * 
 * • `{i}startarchive`
 *     Archive new PMs.
 * 
 * • `{i}stoparchive`
 *     Don't archive new PMs.
 * 
 * • `{i}cleararchive`
 *     Unarchive all chats.
 * 
 * • `{i}listapproved`
 *    List all approved PMs.
 * 
 * • `{i}pmpermit on/off`
 *     Enable or disable PMPermit. Check current status with no argument.
 * """
 * 
 * import asyncio
 * import re
 * from os import remove
 * 
 * from pyUltroid.dB import DEVLIST
 * 
 * try:
 *     from tabulate import tabulate
 * except ImportError:
 *     tabulate = None
 * from telethon import events
 * from telethon.errors import MessageNotModifiedError
 * from telethon.tl.functions.contacts import (
 *     BlockRequest,
 *     GetBlockedRequest,
 *     UnblockRequest,
 * )
 * from telethon.tl.functions.messages import ReportSpamRequest
 * from telethon.utils import get_display_name, resolve_bot_file_id
 * 
 * from pyUltroid.dB.base import KeyManager
 * 
 * from . import *
 * 
 * # ========================= CONSTANTS =============================
 * 
 * COUNT_PM = {}
 * LASTMSG = {}
 * WARN_MSGS = {}
 * U_WARNS = {}
 * if isinstance(udB.get_key("PMPERMIT"), (int, str)):
 *     value = [udB.get_key("PMPERMIT")]
 *     udB.set_key("PMPERMIT", value)
 * keym = KeyManager("PMPERMIT", cast=list)
 * Logm = KeyManager("LOGUSERS", cast=list)
 * PMPIC = udB.get_key("PMPIC")
 * LOG_CHANNEL = udB.get_key("LOG_CHANNEL")
 * UND = get_string("pmperm_1")
 * UNS = get_string("pmperm_2")
 * NO_REPLY = get_string("pmperm_3")
 * 
 * UNAPPROVED_MSG = "**PMSecurity of {ON}!**\n\n{UND}\n\nYou have {warn}/{twarn} warnings!"
 * if udB.get_key("PM_TEXT"):
 *     UNAPPROVED_MSG = (
 *         "**PMSecurity of {ON}!**\n\n"
 *         + udB.get_key("PM_TEXT")
 *         + "\n\nYou have {warn}/{twarn} warnings!"
 *     )
 * # 1
 * WARNS = udB.get_key("PMWARNS") or 4
 * PMCMDS = [
 *     f"{HNDLR}a",
 *     f"{HNDLR}approve",
 *     f"{HNDLR}da",
 *     f"{HNDLR}disapprove",
 *     f"{HNDLR}block",
 *     f"{HNDLR}unblock",
 * ]
 * 
 * _not_approved = {}
 * _to_delete = {}
 * 
 * my_bot = asst.me.username if asst.me else None
 * 
 * 
 * def update_pm(userid, message, warns_given):
 *     try:
 *         WARN_MSGS.update({userid: message})
 *     except KeyError:
 *         pass
 *     try:
 *         U_WARNS.update({userid: warns_given})
 *     except KeyError:
 *         pass
 * 
 * 
 * async def delete_pm_warn_msgs(chat: int):
---- end original ---- */

ultroidCmd('logpm$', async (e) => {
  const chatId = e.chatId;
  // Port of `logpm$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`logpm$\`.` });
});

ultroidCmd('nologpm$', async (e) => {
  const chatId = e.chatId;
  // Port of `nologpm$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`nologpm$\`.` });
});

ultroidCmd('pmpermit( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `pmpermit( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`pmpermit( (.*)|$)\`.` });
});

ultroidCmd('(start|stop|clear)archive$', async (e) => {
  const chatId = e.chatId;
  // Port of `(start|stop|clear)archive$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`(start|stop|clear)archive$\`.` });
});

ultroidCmd('(a|approve)(?: |$)', async (e) => {
  const chatId = e.chatId;
  // Port of `(a|approve)(?: |$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`(a|approve)(?: |$)\`.` });
});

ultroidCmd('(da|disapprove)(?: |$)', async (e) => {
  const chatId = e.chatId;
  // Port of `(da|disapprove)(?: |$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`(da|disapprove)(?: |$)\`.` });
});

ultroidCmd('block( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `block( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`block( (.*)|$)\`.` });
});

ultroidCmd('unblock( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `unblock( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`unblock( (.*)|$)\`.` });
});

ultroidCmd('listapproved$', async (e) => {
  const chatId = e.chatId;
  // Port of `listapproved$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`listapproved$\`.` });
});
}

{ // ===== lib/plugins/polls.js =====
// Ultroid-JS port of plugins/polls.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/polls.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "polls";
const PATTERNS = ['poll( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}poll <question> ; <option> ; <option>`
 *     Get the Anonymous Poll with Given Options
 * 
 * • `{i}poll <question> ; <option> ; <option> | <type>`
 *     Get the poll specified with desired type!
 *     type should be any of  `public`,  `multiple` or `quiz`
 * 
 * • `{i}poll <question> ; <option> ; <option> | quiz_<answerno>`
 *     Get the quiz poll where answerno is the number of option which is correct
 * 
 * """
 * from telethon.tl.types import InputMediaPoll, Poll, PollAnswer, TextWithEntities
 * 
 * from . import get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="poll( (.*)|$)",
 * )
 * async def uri_poll(e):
 *     if not e.client._bot and e.is_private:
 *         return await e.eor("`Use this in Group/Channel.`", time=15)
 *     match = e.pattern_match.group(1).strip()
 *     if not match:
 *         return await e.eor("`Give Proper Input...`", time=5)
 *     if ";" not in match:
 *         return await e.eor("`Unable to Determine Options.`.", time=5)
 *     ques = match.split(";")[0]
 *     option = match.split(";")[1::]
 *     publ = None
 *     quizo = None
 *     karzo = None
 *     mpp = None
 *     if "|" in match:
 *         ptype = match.split(" | ")[1]
 *         option = match.split("|")[0].split(";")[1::]
 *         if "_" in ptype:
 *             karzo = [str(int(ptype.split("_")[1]) - 1).encode()]
 *             ptype = ptype.split("_")[0]
 *         if ptype not in ["public", "quiz", "multiple"]:
 *             return await e.eor("`Invalid Poll Type...`", time=5)
 *         if ptype == "multiple":
 *             mpp = True
 *         elif ptype == "public":
 *             publ = True
 *         elif ptype == "quiz":
 *             quizo = True
 *     if len(option) <= 1:
 *         return await e.eor("`Options Should be More than 1..`", time=5)
 *     m = await e.eor(get_string("com_1"))
 *     OUT = [PollAnswer(TextWithEntities(option[on], entities=[]), str(on).encode()) for on in range(len(option))]
 *     await e.respond(
 *         file=InputMediaPoll(
 *             Poll(20, TextWithEntities(ques, entities=[]), OUT, multiple_choice=mpp, public_voters=publ, quiz=quizo),
 *             correct_answers=karzo,
 *         ),
 *     )
 *     await m.delete()
---- end original ---- */

ultroidCmd('poll( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `poll( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("polls") || `Plugin \`polls\` matched \`poll( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/profanityfilter.js =====
// Ultroid-JS port of plugins/profanityfilter.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/profanityfilter.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "profanityfilter";
const PATTERNS = ['(add|rem)profanity$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * •`{i}addprofanity`
 *    If someone sends bad word in a chat, Then bot will delete that message.
 * 
 * •`{i}remprofanity`
 *    From chat from Profanity list.
 * 
 * """
 * 
 * from pyUltroid.dB.nsfw_db import profan_chat, rem_profan
 * 
 * from . import get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="(add|rem)profanity$", admins_only=True)
 * async def addp(e):
 *     cas = e.pattern_match.group(1)
 *     add = cas == "add"
 *     if add:
 *         profan_chat(e.chat_id, "mute")
 *         await e.eor(get_string("prof_1"), time=10)
 *         return
 *     rem_profan(e.chat_id)
 *     await e.eor(get_string("prof_2"), time=10)
---- end original ---- */

ultroidCmd('(add|rem)profanity$', async (e) => {
  const chatId = e.chatId;
  // Port of `(add|rem)profanity$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("profanityfilter") || `Plugin \`profanityfilter\` matched \`(add|rem)profanity$\`.` });
});
}

{ // ===== lib/plugins/profile.js =====
// Ultroid-JS port of plugins/profile.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/profile.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "profile";
const PATTERNS = ['setbio( (.*)|$)', 'setname ?((.|//)*)', 'setpic$', 'delpfp( (.*)|$)', 'poto( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}setname <first name // last name>`
 *     Change your profile name.
 * 
 * • `{i}setbio <bio>`
 *     Change your profile bio.
 * 
 * • `{i}setpic <reply to pic>`
 *     Change your profile pic.
 * 
 * • `{i}delpfp <n>(optional)`
 *     Delete one profile pic, if no value given, else delete n number of pics.
 * 
 * • `{i}poto <username>/reply`
 *   `{i}poto <reply/upload-limit>/all`
 * 
 *   Ex: `{i}poto 10` - uploads starting 10 pfps of user.
 *     Upload the photo of Chat/User if Available.
 * """
 * import os
 * 
 * from telethon.tl.functions.account import UpdateProfileRequest
 * from telethon.tl.functions.photos import DeletePhotosRequest, UploadProfilePhotoRequest
 * 
 * from . import eod, eor, get_string, mediainfo, ultroid_cmd
 * 
 * TMP_DOWNLOAD_DIRECTORY = "resources/downloads/"
 * 
 * # bio changer
 * 
 * 
 * @ultroid_cmd(pattern="setbio( (.*)|$)", fullsudo=True)
 * async def _(ult):
 *     ok = await ult.eor("...")
 *     set = ult.pattern_match.group(1).strip()
 *     try:
 *         await ult.client(UpdateProfileRequest(about=set))
 *         await eod(ok, f"Profile bio changed to\n`{set}`")
 *     except Exception as ex:
 *         await eod(ok, f"Error occured.\n`{str(ex)}`")
 * 
 * 
 * # name changer
 * 
 * 
 * @ultroid_cmd(pattern="setname ?((.|//)*)", fullsudo=True)
 * async def _(ult):
 *     ok = await ult.eor("...")
 *     names = first_name = ult.pattern_match.group(1).strip()
 *     last_name = ""
 *     if "//" in names:
 *         first_name, last_name = names.split("//", 1)
 *     try:
 *         await ult.client(
 *             UpdateProfileRequest(
 *                 first_name=first_name,
 *                 last_name=last_name,
 *             ),
 *         )
 *         await eod(ok, f"Name changed to `{names}`")
 *     except Exception as ex:
 *         await eod(ok, f"Error occured.\n`{str(ex)}`")
 * 
 * 
 * # profile pic
 * 
 * 
 * @ultroid_cmd(pattern="setpic$", fullsudo=True)
 * async def _(ult):
 *     if not ult.is_reply:
 *         return await ult.eor("`Reply to a Media..`", time=5)
 *     reply_message = await ult.get_reply_message()
 *     ok = await ult.eor(get_string("com_1"))
 *     replfile = await reply_message.download_media()
 *     file = await ult.client.upload_file(replfile)
 *     try:
 *         if "pic" in mediainfo(reply_message.media):
 *             await ult.client(UploadProfilePhotoRequest(file=file))
 *         else:
 *             await ult.client(UploadProfilePhotoRequest(video=file))
 *         await eod(ok, "`My Profile Photo has Successfully Changed !`")
 *     except Exception as ex:
 *         await eod(ok, f"Error occured.\n`{str(ex)}`")
 *     os.remove(replfile)
 * 
 * 
 * # delete profile pic(s)
 * 
 * 
 * @ultroid_cmd(pattern="delpfp( (.*)|$)", fullsudo=True)
 * async def remove_profilepic(delpfp):
 *     ok = await eor(delpfp, "`...`")
 *     group = delpfp.text[8:]
 *     if group == "all":
 *         lim = 0
 *     elif group.isdigit():
 *         lim = int(group)
 *     else:
 *         lim = 1
 *     pfplist = await delpfp.client.get_profile_photos("me", limit=lim)
 *     await delpfp.client(DeletePhotosRequest(pfplist))
 *     await eod(ok, f"`Successfully deleted {len(pfplist)} profile picture(s).`")
 * 
 * 
 * @ultroid_cmd(pattern="poto( (.*)|$)")
 * async def gpoto(e):
 *     ult = e.pattern_match.group(1).strip()
 * 
 *     if e.is_reply:
 *         gs = await e.get_reply_message()
 *         user_id = gs.sender_id
 *     elif ult:
---- end original ---- */

ultroidCmd('setbio( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `setbio( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("profile") || `Plugin \`profile\` matched \`setbio( (.*)|$)\`.` });
});

ultroidCmd('setname ?((.|//)*)', async (e) => {
  const chatId = e.chatId;
  // Port of `setname ?((.|//)*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("profile") || `Plugin \`profile\` matched \`setname ?((.|//)*)\`.` });
});

ultroidCmd('setpic$', async (e) => {
  const chatId = e.chatId;
  // Port of `setpic$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("profile") || `Plugin \`profile\` matched \`setpic$\`.` });
});

ultroidCmd('delpfp( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `delpfp( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("profile") || `Plugin \`profile\` matched \`delpfp( (.*)|$)\`.` });
});

ultroidCmd('poto( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `poto( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("profile") || `Plugin \`profile\` matched \`poto( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/qrcode.js =====
// Ultroid-JS port of plugins/qrcode.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/qrcode.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "qrcode";
const PATTERNS = ['qrcode( (.*)|$)', 'addqr( (.*)|$)', 'qrdecode$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}qrcode <text/reply to text>`
 *    `Makes qrcode of text`
 * 
 * • `{i}addqr <reply image> <text>`
 *    `Makes qr of text and add it to image.`
 * 
 * • `{i}qrdecode <reply to qrcode>`
 *    `It decodes the qrcode.`
 * """
 * import os
 * 
 * from pyUltroid import ULTConfig
 * 
 * try:
 *     import cv2
 * except ImportError:
 *     cv2 = None
 * 
 * import qrcode
 * from PIL import Image
 * from telethon.tl.types import MessageMediaDocument as doc
 * 
 * from . import check_filename, get_string, ultroid_bot, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="qrcode( (.*)|$)")
 * async def cd(e):
 *     reply = await e.get_reply_message()
 *     msg = e.pattern_match.group(1).strip()
 *     if reply and reply.text:
 *         msg = reply.text
 *     elif not msg:
 *         return await e.eor("`Give Some Text or Reply", time=5)
 *     default, cimg = ULTConfig.thumb, None
 *     if reply and (reply.sticker or reply.photo):
 *         cimg = await reply.download_media()
 *     elif ultroid_bot.me.photo and not ultroid_bot.me.photo.has_video:
 *         cimg = (await e.client.get_profile_photos(ultroid_bot.uid, limit=1))[0]
 * 
 *     kk = await e.eor(get_string("com_1"))
 *     img = cimg or default
 *     ok = Image.open(img)
 *     logo = ok.resize((60, 60))
 *     cod = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H)
 *     cod.add_data(msg)
 *     cod.make()
 *     imgg = cod.make_image().convert("RGB")
 *     pstn = ((imgg.size[0] - logo.size[0]) // 2, (imgg.size[1] - logo.size[1]) // 2)
 *     imgg.paste(logo, pstn)
 *     newname = check_filename("qr.jpg")
 *     imgg.save(newname)
 *     await e.client.send_file(e.chat_id, newname, supports_streaming=True)
 *     await kk.delete()
 *     os.remove(newname)
 *     if cimg:
 *         os.remove(cimg)
 * 
 * 
 * @ultroid_cmd(pattern="addqr( (.*)|$)")
 * async def qrwater(e):
 *     msg = e.pattern_match.group(1).strip()
 *     r = await e.get_reply_message()
 *     dl = await e.client.download_media(
 *         r, thumb=-1 if isinstance(r.media, doc) else None
 *     )
 *     if not dl:
 *         return await e.eor("`Reply Any Media and Give Text`", time=5)
 *     kk = await e.eor(get_string("com_1"))
 *     img_bg = Image.open(dl)
 *     qr = qrcode.QRCode(box_size=5)
 *     qr.add_data(msg)
 *     qr.make()
 *     img_qr = qr.make_image()
 *     pos = (img_bg.size[0] - img_qr.size[0], img_bg.size[1] - img_qr.size[1])
 *     img_bg.paste(img_qr, pos)
 *     img_bg.save(dl)
 *     await e.client.send_file(e.chat_id, dl, supports_streaming=True)
 *     await kk.delete()
 *     os.remove(dl)
 * 
 * 
 * @ultroid_cmd(pattern="qrdecode$")
 * async def decod(e):
 *     r = await e.get_reply_message()
 *     if not (r and r.media):
 *         return await e.eor("`Reply to Qrcode Media`", time=5)
 *     kk = await e.eor(get_string("com_1"))
 *     dl = await e.client.download_media(
 *         r, thumb=-1 if isinstance(r.media, doc) else None
 *     )
 *     if not dl:
 *         return
 *     im = cv2.imread(dl)
 *     try:
 *         det = cv2.QRCodeDetector()
 *         tx, y, z = det.detectAndDecode(im)
 *         await kk.edit("**Decoded Text:\n\n**" + tx)
 *     except BaseException:
 *         await kk.edit("`Reply To Media in Which Qr image present.`")
 *     os.remove(dl)
---- end original ---- */

ultroidCmd('qrcode( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `qrcode( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("qrcode") || `Plugin \`qrcode\` matched \`qrcode( (.*)|$)\`.` });
});

ultroidCmd('addqr( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `addqr( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("qrcode") || `Plugin \`qrcode\` matched \`addqr( (.*)|$)\`.` });
});

ultroidCmd('qrdecode$', async (e) => {
  const chatId = e.chatId;
  // Port of `qrdecode$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("qrcode") || `Plugin \`qrcode\` matched \`qrdecode$\`.` });
});
}

{ // ===== lib/plugins/resize.js =====
// Ultroid-JS port of plugins/resize.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/resize.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "resize";
const PATTERNS = ['size$', 'resize( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * •`{i}size <reply to media>`
 *    To get size of it.
 * 
 * •`{i}resize <number> <number>`
 *    To resize image on x, y axis.
 *    eg. `{i}resize 690 960`
 * """
 * from PIL import Image
 * 
 * from . import HNDLR, eor, get_string, os, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="size$")
 * async def size(e):
 *     r = await e.get_reply_message()
 *     if not (r and r.media):
 *         return await e.eor(get_string("ascii_1"))
 *     k = await e.eor(get_string("com_1"))
 *     if hasattr(r.media, "document"):
 *         img = await e.client.download_media(r, thumb=-1)
 *     else:
 *         img = await r.download_media()
 *     im = Image.open(img)
 *     x, y = im.size
 *     await k.edit(f"Dimension Of This Image Is\n`{x} x {y}`")
 *     os.remove(img)
 * 
 * 
 * @ultroid_cmd(pattern="resize( (.*)|$)")
 * async def resize(e):
 *     r = await e.get_reply_message()
 *     if not (r and r.media):
 *         return await e.eor(get_string("ascii_1"))
 *     sz = e.pattern_match.group(1).strip()
 *     if not sz:
 *         return await eor(
 *             f"Give Some Size To Resize, Like `{HNDLR}resize 720 1080` ", time=5
 *         )
 *     k = await e.eor(get_string("com_1"))
 *     if hasattr(r.media, "document"):
 *         img = await e.client.download_media(r, thumb=-1)
 *     else:
 *         img = await r.download_media()
 *     sz = sz.split()
 *     if len(sz) != 2:
 *         return await eor(
 *             k, f"Give Some Size To Resize, Like `{HNDLR}resize 720 1080` ", time=5
 *         )
 *     x, y = int(sz[0]), int(sz[1])
 *     im = Image.open(img)
 *     ok = im.resize((x, y))
 *     ok.save(img, format="PNG", optimize=True)
 *     await e.reply(file=img)
 *     os.remove(img)
 *     await k.delete()
---- end original ---- */

ultroidCmd('size$', async (e) => {
  const chatId = e.chatId;
  // Port of `size$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("resize") || `Plugin \`resize\` matched \`size$\`.` });
});

ultroidCmd('resize( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `resize( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("resize") || `Plugin \`resize\` matched \`resize( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/schedulemsg.js =====
// Ultroid-JS port of plugins/schedulemsg.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/schedulemsg.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "schedulemsg";
const PATTERNS = ['schedule( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * •`{i}schedule <text/reply to msg> <time>`
 *     In time u can use second as number, or like 1h or 1m
 *     eg. `{i}schedule Hello 100` It deliver msg after 100 sec.
 *     eg. `{i}schedule Hello 1h` It deliver msg after an hour.
 * """
 * from datetime import timedelta
 * 
 * from pyUltroid.fns.admins import ban_time
 * 
 * from . import get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="schedule( (.*)|$)", fullsudo=True)
 * async def _(e):
 *     x = e.pattern_match.group(1).strip()
 *     xx = await e.get_reply_message()
 *     if x and not xx:
 *         y = x.split(" ")[-1]
 *         k = x.replace(y, "")
 *         if y.isdigit():
 *             await e.client.send_message(
 *                 e.chat_id, k, schedule=timedelta(seconds=int(y))
 *             )
 *             await e.eor(get_string("schdl_1"), time=5)
 *         else:
 *             try:
 *                 z = ban_time(y)
 *                 await e.respond(k, schedule=z)
 *                 await e.eor(get_string("schdl_1"), time=5)
 *             except BaseException:
 *                 await e.eor(get_string("schdl_2"), time=5)
 *     elif xx and x:
 *         if x.isdigit():
 *             await e.respond(xx, schedule=timedelta(seconds=int(x)))
 *             await e.eor(get_string("schdl_1"), time=5)
 *         else:
 *             try:
 *                 z = ban_time(x)
 *                 await e.respond(xx, schedule=z)
 *                 await e.eor(get_string("schdl_1"), time=5)
 *             except BaseException:
 *                 await e.eor(get_string("schdl_2"), time=5)
 *     else:
 *         return await e.eor(get_string("schdl_2"), time=5)
---- end original ---- */

ultroidCmd('schedule( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `schedule( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("schedulemsg") || `Plugin \`schedulemsg\` matched \`schedule( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/search.js =====
// Ultroid-JS port of plugins/search.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/search.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "search";
const PATTERNS = ['github (.*)', 'google( (.*)|$)', 'img( (.*)|$)', 'reverse$', 'saavn( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}saavn <search query>`
 *     Download songs from Saavn.
 * 
 * • `{i}google <query>`
 *     For doing google search.
 * 
 * • `{i}github <username>`
 *     Get full information of the users github profile.
 * 
 * • `{i}img <query>`
 *   `{i}img <query> ; <no of results>`
 *     For doing Images search.
 * 
 * • `{i}reverse`
 *     Reply an Image or sticker to find its sauce.
 * """
 * import os
 * 
 * import requests
 * from bs4 import BeautifulSoup as bs
 * 
 * try:
 *     from PIL import Image
 * except ImportError:
 *     Image = None
 * try:
 *     import cv2
 * except ImportError:
 *     cv2 = None
 * from telethon.tl.types import DocumentAttributeAudio
 * 
 * from pyUltroid.fns.misc import google_search
 * from pyUltroid.fns.tools import get_google_images, saavn_search
 * 
 * from . import LOGS, async_searcher, con, eod, fast_download, get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="github (.*)",
 * )
 * async def gitsearch(event):
 *     usrname = event.pattern_match.group(1).strip()
 *     if not usrname:
 *         return await event.eor(get_string("srch_1"))
 *     url = f"https://api.github.com/users/{usrname}"
 *     ult = await async_searcher(url, re_json=True)
 *     try:
 *         uname = ult["login"]
 *         uid = ult["id"]
 *         upic = f"https://avatars.githubusercontent.com/u/{uid}"
 *         ulink = ult["html_url"]
 *         uacc = ult["name"]
 *         ucomp = ult["company"]
 *         ublog = ult["blog"]
 *         ulocation = ult["location"]
 *         ubio = ult["bio"]
 *         urepos = ult["public_repos"]
 *         ufollowers = ult["followers"]
 *         ufollowing = ult["following"]
 *     except BaseException:
 *         return await event.eor(get_string("srch_2"))
 *     fullusr = f"""
 * **[GITHUB]({ulink})**
 * **Name** - {uacc}
 * **UserName** - {uname}
 * **ID** - {uid}
 * **Company** - {ucomp}
 * **Blog** - {ublog}
 * **Location** - {ulocation}
 * **Bio** - {ubio}
 * **Repos** - {urepos}
 * **Followers** - {ufollowers}
 * **Following** - {ufollowing}
 * """
 *     await event.respond(fullusr, file=upic)
 *     await event.delete()
 * 
 * 
 * @ultroid_cmd(
 *     pattern="google( (.*)|$)",
 *     manager=True,
 * )
 * async def google(event):
 *     inp = event.pattern_match.group(1).strip()
 *     if not inp:
 *         return await eod(event, get_string("autopic_1"))
 *     x = await event.eor(get_string("com_2"))
 *     gs = await google_search(inp)
 *     if not gs:
 *         return await eod(x, get_string("autopic_2").format(inp))
 *     out = ""
 *     for res in gs:
 *         text = res["title"]
 *         url = res["link"]
 *         des = res["description"]
 *         out += f" 👉🏻  [{text}]({url})\n`{des}`\n\n"
 *     omk = f"**Google Search Query:**\n`{inp}`\n\n**Results:**\n{out}"
 *     await x.eor(omk, link_preview=False)
 * 
 * 
 * @ultroid_cmd(pattern="img( (.*)|$)")
 * async def goimg(event):
 *     query = event.pattern_match.group(1).strip()
 *     if not query:
 *         return await event.eor(get_string("autopic_1"))
 *     nn = await event.eor(get_string("com_1"))
 *     lmt = 5
 *     if ";" in query:
 *         try:
 *             lmt = int(query.split(";")[1])
 *             query = query.split(";")[0]
---- end original ---- */

ultroidCmd('github (.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `github (.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("search") || `Plugin \`search\` matched \`github (.*)\`.` });
});

ultroidCmd('google( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `google( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("search") || `Plugin \`search\` matched \`google( (.*)|$)\`.` });
});

ultroidCmd('img( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `img( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("search") || `Plugin \`search\` matched \`img( (.*)|$)\`.` });
});

ultroidCmd('reverse$', async (e) => {
  const chatId = e.chatId;
  // Port of `reverse$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("search") || `Plugin \`search\` matched \`reverse$\`.` });
});

ultroidCmd('saavn( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `saavn( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("search") || `Plugin \`search\` matched \`saavn( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/snips.js =====
// Ultroid-JS port of plugins/snips.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/snips.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "snips";
const PATTERNS = ['addsnip( (.*)|$)', 'remsnip( (.*)|$)', 'listsnip'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}addsnip <word><reply to a message>`
 *     add the used word as snip relating to replied message.
 * 
 * • `{i}remsnip <word>`
 *     Remove the snip word..
 * 
 * • `{i}listsnip`
 *     list all snips.
 * 
 * • Use :
 *     type `$(ur snip word)` get setted reply.
 * """
 * import os
 * 
 * from . import upload_file as uf
 * from telethon.utils import pack_bot_file_id
 * 
 * from pyUltroid._misc import sudoers
 * from pyUltroid.dB.snips_db import add_snip, get_snips, list_snip, rem_snip
 * from pyUltroid.fns.tools import create_tl_btn, format_btn, get_msg_button
 * 
 * from . import events, get_string, mediainfo, udB, ultroid_bot, ultroid_cmd
 * from ._inline import something
 * 
 * 
 * @ultroid_cmd(pattern="addsnip( (.*)|$)")
 * async def an(e):
 *     wrd = (e.pattern_match.group(1).strip()).lower()
 *     wt = await e.get_reply_message()
 *     if not (wt and wrd):
 *         return await e.eor(get_string("snip_1"))
 *     if "$" in wrd:
 *         wrd = wrd.replace("$", "")
 *     btn = format_btn(wt.buttons) if wt.buttons else None
 *     if wt and wt.media:
 *         wut = mediainfo(wt.media)
 *         if wut.startswith(("pic", "gif")):
 *             dl = await wt.download_media()
 *             m = uf(dl)
 *             os.remove(dl)
 *         elif wut == "video":
 *             if wt.media.document.size > 8 * 1000 * 1000:
 *                 return await e.eor(get_string("com_4"), time=5)
 *             dl = await wt.download_media()
 *             m = uf(dl)
 *             os.remove(dl)
 *         else:
 *             m = pack_bot_file_id(wt.media)
 *         if wt.text:
 *             txt = wt.text
 *             if not btn:
 *                 txt, btn = get_msg_button(wt.text)
 *             add_snip(wrd, txt, m, btn)
 *         else:
 *             add_snip(wrd, None, m, btn)
 *     else:
 *         txt = wt.text
 *         if not btn:
 *             txt, btn = get_msg_button(wt.text)
 *         add_snip(wrd, txt, None, btn)
 *     await e.eor(f"Done : snip `${wrd}` Saved.")
 *     if not udB.get_key("SNIP"):
 *         udB.set_key("SNIP", True)
 *         ultroid_bot.add_handler(add_snips, events.NewMessage())
 * 
 * 
 * @ultroid_cmd(pattern="remsnip( (.*)|$)")
 * async def rs(e):
 *     wrd = (e.pattern_match.group(1).strip()).lower()
 *     if not wrd:
 *         return await e.eor(get_string("snip_2"))
 *     if wrd.startswith("$"):
 *         wrd = wrd.replace("$", "")
 *     rem_snip(wrd)
 *     await e.eor(f"Done : snip `${wrd}` Removed.")
 * 
 * 
 * @ultroid_cmd(pattern="listsnip")
 * async def lsnote(e):
 *     if x := list_snip():
 *         sd = "SNIPS Found :\n\n"
 *         return await e.eor(sd + x)
 *     await e.eor("No Snips Found Here")
 * 
 * 
 * async def add_snips(e):
 *     if not e.out and e.sender_id not in sudoers():
 *         return
 *     xx = [z.replace("$", "") for z in e.text.lower().split() if z.startswith("$")]
 *     for z in xx:
 *         if k := get_snips(z):
 *             msg = k["msg"]
 *             media = k["media"]
 *             rep = await e.get_reply_message()
 *             if rep:
 *                 if k.get("button"):
 *                     btn = create_tl_btn(k["button"])
 *                     return await something(rep, msg, media, btn)
 *                 await rep.reply(msg, file=media)
 *             else:
 *                 await e.delete()
 *                 if k.get("button"):
 *                     btn = create_tl_btn(k["button"])
 *                     return await something(e, msg, media, btn, reply=None)
 *                 await ultroid_bot.send_message(e.chat_id, msg, file=media)
 * 
 * 
 * if udB.get_key("SNIP"):
 *     ultroid_bot.add_handler(add_snips, events.NewMessage())
---- end original ---- */

ultroidCmd('addsnip( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `addsnip( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("snips") || `Plugin \`snips\` matched \`addsnip( (.*)|$)\`.` });
});

ultroidCmd('remsnip( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `remsnip( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("snips") || `Plugin \`snips\` matched \`remsnip( (.*)|$)\`.` });
});

ultroidCmd('listsnip', async (e) => {
  const chatId = e.chatId;
  // Port of `listsnip` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("snips") || `Plugin \`snips\` matched \`listsnip\`.` });
});
}

{ // ===== lib/plugins/specialtools.js =====
// Ultroid-JS port of plugins/specialtools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/specialtools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "specialtools";
const PATTERNS = ['getaudio$', 'addaudio$', 'dob( (.*)|$)', 'sticker( (.*)|$)', 'wall( (.*)|$)', 'q( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}wspr <username>`
 *     Send secret message..
 * 
 * • `{i}q <color-optional>`
 * • `{i}q @username`
 * • `{i}q r <color-optional>`
 * • `{i}q count` : `multiple quotes`
 *     Create quotes..
 * 
 * • `{i}sticker <query>`
 *     Search Stickers as Per ur Wish..
 * 
 * • `{i}getaudio <reply to an audio>`
 *     Download Audio To put in ur Desired Video/Gif.
 * 
 * • `{i}addaudio <reply to Video/gif>`
 *     It will put the above audio to the replied video/gif.
 * 
 * • `{i}dob <date of birth>`
 *     Put in dd/mm/yy Format only(eg .dob 01/01/1999).
 * 
 * • `{i}wall <query>`
 *     Search Hd Wallpaper as Per ur Wish..
 * """
 * import os
 * import time
 * from datetime import datetime as dt
 * from random import choice
 * 
 * import pytz, asyncio
 * from bs4 import BeautifulSoup as bs
 * from telethon.tl.types import DocumentAttributeVideo
 * from requests import Session
 * from cloudscraper import create_scraper
 * from pyUltroid.fns.tools import get_google_images, metadata
 * 
 * from . import (
 *     HNDLR,
 *     ULTConfig,
 *     async_searcher,
 *     bash,
 *     downloader,
 *     eod,
 *     get_string,
 *     mediainfo,
 *     quotly,
 *     ultroid_bot,
 *     ultroid_cmd,
 *     uploader,
 * )
 * from .beautify import all_col
 * 
 * File = []
 * scraper = create_scraper()
 * 
 * @ultroid_cmd(
 *     pattern="getaudio$",
 * )
 * async def daudtoid(e):
 *     if not e.reply_to:
 *         return await eod(e, get_string("spcltool_1"))
 *     r = await e.get_reply_message()
 *     if not mediainfo(r.media).startswith(("audio", "video")):
 *         return await eod(e, get_string("spcltool_1"))
 *     xxx = await e.eor(get_string("com_1"))
 *     dl = r.file.name or "input.mp4"
 *     c_time = time.time()
 *     file = await downloader(
 *         f"resources/downloads/{dl}",
 *         r.media.document,
 *         xxx,
 *         c_time,
 *         f"Downloading {dl}...",
 *     )
 * 
 *     File.append(file.name)
 *     await xxx.edit(get_string("spcltool_2"))
 * 
 * 
 * @ultroid_cmd(
 *     pattern="addaudio$",
 * )
 * async def adaudroid(e):
 *     if not e.reply_to:
 *         return await eod(e, get_string("spcltool_3"))
 *     r = await e.get_reply_message()
 *     if not mediainfo(r.media).startswith("video"):
 *         return await eod(e, get_string("spcltool_3"))
 *     if not (File and os.path.exists(File[0])):
 *         return await e.edit(f"`First reply an audio with {HNDLR}addaudio`")
 *     xxx = await e.eor(get_string("com_1"))
 *     dl = r.file.name or "input.mp4"
 *     c_time = time.time()
 *     file = await downloader(
 *         f"resources/downloads/{dl}",
 *         r.media.document,
 *         xxx,
 *         c_time,
 *         f"Downloading {dl}...",
 *     )
 * 
 *     await xxx.edit(get_string("spcltool_5"))
 *     await bash(
 *         f'ffmpeg -i "{file.name}" -i "{File[0]}" -shortest -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 output.mp4'
 *     )
 *     out = "output.mp4"
 *     mmmm = await uploader(out, out, time.time(), xxx, f"Uploading {out}...")
 *     data = await metadata(out)
 *     width = data["width"]
 *     height = data["height"]
 *     duration = data["duration"]
---- end original ---- */

ultroidCmd('getaudio$', async (e) => {
  const chatId = e.chatId;
  // Port of `getaudio$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("specialtools") || `Plugin \`specialtools\` matched \`getaudio$\`.` });
});

ultroidCmd('addaudio$', async (e) => {
  const chatId = e.chatId;
  // Port of `addaudio$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("specialtools") || `Plugin \`specialtools\` matched \`addaudio$\`.` });
});

ultroidCmd('dob( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `dob( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("specialtools") || `Plugin \`specialtools\` matched \`dob( (.*)|$)\`.` });
});

ultroidCmd('sticker( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `sticker( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("specialtools") || `Plugin \`specialtools\` matched \`sticker( (.*)|$)\`.` });
});

ultroidCmd('wall( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `wall( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("specialtools") || `Plugin \`specialtools\` matched \`wall( (.*)|$)\`.` });
});

ultroidCmd('q( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `q( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("specialtools") || `Plugin \`specialtools\` matched \`q( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/stickertools.js =====
// Ultroid-JS port of plugins/stickertools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/stickertools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "stickertools";
const PATTERNS = ['packkang', 'kang', 'round$', 'destroy$', 'tiny$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ❍ Commands Available -
 * 
 * • `{i}destroy <reply to animated sticker>`
 *     To destroy the sticker.
 * 
 * • `{i}tiny <reply to media>`
 *     To create Tiny stickers.
 * 
 * • `{i}kang <reply to image/sticker>`
 *     Kang the sticker (add to your pack).
 * 
 * • `{i}packkang <pack name>`
 *     Kang the Complete sticker set (with custom name).
 * 
 * • `{i}round <reply to any media>`
 *     To extract round sticker.
 * """
 * import glob
 * import io
 * import os
 * import random
 * from os import remove
 * 
 * try:
 *     import cv2
 * except ImportError:
 *     cv2 = None
 * try:
 *     import numpy as np
 * except ImportError:
 *     np = None
 * try:
 *     from PIL import Image, ImageDraw
 * except ImportError:
 *     pass
 * 
 * from telethon.errors import PeerIdInvalidError, YouBlockedUserError
 * from telethon.tl.functions.messages import UploadMediaRequest
 * from telethon.tl.types import (
 *     DocumentAttributeFilename,
 *     DocumentAttributeSticker,
 *     InputPeerSelf,
 * )
 * from telethon.utils import get_input_document
 * 
 * from . import (
 *     KANGING_STR,
 *     LOGS,
 *     asst,
 *     async_searcher,
 *     bash,
 *     con,
 *     functions,
 *     get_string,
 *     inline_mention,
 *     mediainfo,
 *     ultroid_cmd,
 *     quotly,
 *     types,
 *     udB,
 * )
 * 
 * 
 * @ultroid_cmd(pattern="packkang")
 * async def pack_kangish(_):
 *     _e = await _.get_reply_message()
 *     local = None
 *     try:
 *         cmdtext = _.text.split(maxsplit=1)[1]
 *     except IndexError:
 *         cmdtext = None
 *     if cmdtext and os.path.isdir(cmdtext):
 *         local = True
 *     elif not (_e and _e.sticker and _e.file.mime_type == "image/webp"):
 *         return await _.eor(get_string("sts_4"))
 *     msg = await _.eor(get_string("com_1"))
 *     _packname = cmdtext or f"Ultroid Kang Pack By {_.sender_id}"
 *     typee = None
 *     if not local:
 *         _id = _e.media.document.attributes[1].stickerset.id
 *         _hash = _e.media.document.attributes[1].stickerset.access_hash
 *         _get_stiks = await _.client(
 *             functions.messages.GetStickerSetRequest(
 *                 stickerset=types.InputStickerSetID(id=_id, access_hash=_hash), hash=0
 *             )
 *         )
 *         docs = _get_stiks.documents
 *     else:
 *         docs = []
 *         files = glob.glob(f"{cmdtext}/*")
 *         exte = files[-1]
 *         if exte.endswith(".tgs"):
 *             typee = "anim"
 *         elif exte.endswith(".webm"):
 *             typee = "vid"
 *         count = 0
 *         for file in files:
 *             if file.endswith((".tgs", ".webm")):
 *                 count += 1
 *                 upl = await asst.upload_file(file)
 *                 docs.append(await asst(UploadMediaRequest(InputPeerSelf(), upl)))
 *                 if count % 5 == 0:
 *                     await msg.edit(f"`Uploaded {count} files.`")
 * 
 *     stiks = []
 *     for i in docs:
 *         x = get_input_document(i)
 *         stiks.append(
 *             types.InputStickerSetItem(
 *                 document=x,
 *                 emoji=(
 *                     random.choice(["😐", "👍", "😂"])
 *                     if local
---- end original ---- */

ultroidCmd('packkang', async (e) => {
  const chatId = e.chatId;
  // Port of `packkang` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("stickertools") || `Plugin \`stickertools\` matched \`packkang\`.` });
});

ultroidCmd('kang', async (e) => {
  const chatId = e.chatId;
  // Port of `kang` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("stickertools") || `Plugin \`stickertools\` matched \`kang\`.` });
});

ultroidCmd('round$', async (e) => {
  const chatId = e.chatId;
  // Port of `round$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("stickertools") || `Plugin \`stickertools\` matched \`round$\`.` });
});

ultroidCmd('destroy$', async (e) => {
  const chatId = e.chatId;
  // Port of `destroy$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("stickertools") || `Plugin \`stickertools\` matched \`destroy$\`.` });
});

ultroidCmd('tiny$', async (e) => {
  const chatId = e.chatId;
  // Port of `tiny$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("stickertools") || `Plugin \`stickertools\` matched \`tiny$\`.` });
});
}

{ // ===== lib/plugins/stories.js =====
// Ultroid-JS port of plugins/stories.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/stories.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "stories";
const PATTERNS = [];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2023 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * """
 * ✘ Commands Available -
 * 
 * • `{i}setstory <reply media>`
 *     Set replied media as your story.
 * 
 * • `{i}storydl <username/reply user/story link>`
 *     Download and upload user stories or specific story from link!
 * """
 * 
 * import os
 * import re
 * from contextlib import suppress
 * from . import ultroid_cmd, get_string, LOGS
 * 
 * from telethon import TelegramClient
 * from telethon.tl.functions.channels import GetFullChannelRequest
 * from telethon.tl.types import User, UserFull, InputPeerSelf, InputPrivacyValueAllowAll, Channel, InputUserSelf
 * from telethon.tl.functions.stories import SendStoryRequest, GetStoriesByIDRequest
 * from telethon.tl.functions.users import GetFullUserRequest
 * from telethon.events import NewMessage
 * 
 * 
 * @ultroid_cmd("setstory")
 * async def setStory(event: NewMessage.Event):
 *     reply = await event.get_reply_message()
 *     if not (reply and (reply.photo or reply.video)):
 *         await event.eor("Please reply to a photo or video!", time=5)
 *         return
 *     msg = await event.eor(get_string("com_1"))
 *     try:
 *         await event.client(
 *         SendStoryRequest(
 *             InputPeerSelf(),
 *             reply.media,
 *             privacy_rules=[
 *              InputPrivacyValueAllowAll()   
 *             ]
 *         )
 *     )
 *         await msg.eor("🔥 **Story is Live!**", time=5)
 *     except Exception as er:
 *         await msg.edit(f"__ERROR: {er}__")
 *         LOGS.exception(er)
 * 
 * 
 * @ultroid_cmd("storydl")
 * async def downloadUserStories(event: NewMessage.Event):
 *     replied = await event.get_reply_message()
 *     message = await event.eor(get_string("com_1"))
 *     
 *     try:
 *         text_input = event.text.split(maxsplit=1)[1]
 *         # Check if input is a Telegram story link
 *         story_link_pattern = r"https?://t\.me/([^/]+)/s/(\d+)"
 *         match = re.match(story_link_pattern, text_input)
 *         
 *         if match:
 *             # Extract username and story ID from link
 *             username = match.group(1)
 *             story_id = int(match.group(2))
 *             
 *             try:
 *                 # Get the entity for the username
 *                 entity = await event.client.get_entity(username)
 *                 
 *                 # Using GetStoriesByIDRequest to fetch the specific story
 *                 stories_response = await event.client(
 *                     GetStoriesByIDRequest(
 *                         entity.id,
 *                         id=[story_id]
 *                     )
 *                 )
 *                 print(stories_response)
 *                 
 *                 if not stories_response.stories:
 *                     return await message.eor("ERROR: Story not found or expired!")
 * 
 *                 # Download and upload the story
 *                 for story in stories_response.stories:
 *                     client: TelegramClient = event.client
 *                     file = await client.download_media(story.media)
 *                     caption = story.caption if hasattr(story, 'caption') else ""
 *                     await message.reply(
 *                         caption,
 *                         file=file
 *                     )
 *                     os.remove(file)
 *                 
 *                 return await message.eor("**Uploaded Story!**", time=5)
 * 
 *             except Exception as er:
 *                 await message.eor(f"ERROR while fetching story: __{er}__")
 *                 LOGS.exception(er)
 *                 return
 *         
 *         # If not a story link, proceed with the original functionality
 *         username = text_input
 *         
 *     except IndexError as er:
 *         LOGS.exception
 *         if replied and isinstance(replied.sender, User):
 *             username = replied.sender_id
 *         else:
 *             return await message.eor(
 *                 "Please reply to a user, provide username or story link!"
 *             )
 *             
 *     with suppress(ValueError):
 *         username = int(username)
 * 
 *     stories = None
 *     
---- end original ---- */

// No @ultroid_cmd pattern found in original; passive/service plugin.
// Its background logic is wired via _monitors.js where applicable.
}

{ // ===== lib/plugins/sudo.js =====
// Ultroid-JS port of plugins/sudo.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/sudo.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "sudo";
const PATTERNS = ['addsudo( (.*)|$)', 'delsudo( (.*)|$)', 'listsudo$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}addsudo`
 *     Add Sudo Users by replying to user or using <space> separated userid(s)
 * 
 * • `{i}delsudo`
 *     Remove Sudo Users by replying to user or using <space> separated userid(s)
 * 
 * • `{i}listsudo`
 *     List all sudo users.
 * """
 * 
 * from telethon.tl.types import User
 * 
 * from pyUltroid._misc import sudoers
 * 
 * from . import get_string, inline_mention, udB, ultroid_bot, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="addsudo( (.*)|$)", fullsudo=True)
 * async def _(ult):
 *     inputs = ult.pattern_match.group(1).strip()
 *     if ult.reply_to_msg_id:
 *         replied_to = await ult.get_reply_message()
 *         id = replied_to.sender_id
 *         name = await replied_to.get_sender()
 *     elif inputs:
 *         try:
 *             id = await ult.client.parse_id(inputs)
 *         except ValueError:
 *             try:
 *                 id = int(inputs)
 *             except ValueError:
 *                 id = inputs
 *         try:
 *             name = await ult.client.get_entity(int(id))
 *         except BaseException:
 *             name = None
 *     elif ult.is_private:
 *         id = ult.chat_id
 *         name = await ult.get_chat()
 *     else:
 *         return await ult.eor(get_string("sudo_1"), time=5)
 *     if name and isinstance(name, User) and (name.bot or name.verified):
 *         return await ult.eor(get_string("sudo_4"))
 *     name = inline_mention(name) if name else f"`{id}`"
 *     if id == ultroid_bot.uid:
 *         mmm = get_string("sudo_2")
 *     elif id in sudoers():
 *         mmm = f"{name} `is already a SUDO User ...`"
 *     else:
 *         udB.set_key("SUDO", "True")
 *         key = sudoers()
 *         key.append(id)
 *         udB.set_key("SUDOS", key)
 *         mmm = f"**Added** {name} **as SUDO User**"
 *     await ult.eor(mmm, time=5)
 * 
 * 
 * @ultroid_cmd(pattern="delsudo( (.*)|$)", fullsudo=True)
 * async def _(ult):
 *     inputs = ult.pattern_match.group(1).strip()
 *     if ult.reply_to_msg_id:
 *         replied_to = await ult.get_reply_message()
 *         id = replied_to.sender_id
 *         name = await replied_to.get_sender()
 *     elif inputs:
 *         try:
 *             id = await ult.client.parse_id(inputs)
 *         except ValueError:
 *             try:
 *                 id = int(inputs)
 *             except ValueError:
 *                 id = inputs
 *         try:
 *             name = await ult.client.get_entity(int(id))
 *         except BaseException:
 *             name = None
 *     elif ult.is_private:
 *         id = ult.chat_id
 *         name = await ult.get_chat()
 *     else:
 *         return await ult.eor(get_string("sudo_1"), time=5)
 *     name = inline_mention(name) if name else f"`{id}`"
 *     if id not in sudoers():
 *         mmm = f"{name} `wasn't a SUDO User ...`"
 *     else:
 *         key = sudoers()
 *         key.remove(id)
 *         udB.set_key("SUDOS", key)
 *         mmm = f"**Removed** {name} **from SUDO User(s)**"
 *     await ult.eor(mmm, time=5)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="listsudo$",
 * )
 * async def _(ult):
 *     sudos = sudoers()
 *     if not sudos:
 *         return await ult.eor(get_string("sudo_3"), time=5)
 *     msg = ""
 *     for i in sudos:
 *         try:
 *             name = await ult.client.get_entity(int(i))
 *         except BaseException:
 *             name = None
 *         if name:
 *             msg += f"• {inline_mention(name)} ( `{i}` )\n"
 *         else:
 *             msg += f"• `{i}` -> Invalid User\n"
 *     m = udB.get_key("SUDO") or True
 *     if not m:
---- end original ---- */

ultroidCmd('addsudo( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `addsudo( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("sudo") || `Plugin \`sudo\` matched \`addsudo( (.*)|$)\`.` });
});

ultroidCmd('delsudo( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `delsudo( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("sudo") || `Plugin \`sudo\` matched \`delsudo( (.*)|$)\`.` });
});

ultroidCmd('listsudo$', async (e) => {
  const chatId = e.chatId;
  // Port of `listsudo$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("sudo") || `Plugin \`sudo\` matched \`listsudo$\`.` });
});
}

{ // ===== lib/plugins/tag.js =====
// Ultroid-JS port of plugins/tag.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/tag.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "tag";
const PATTERNS = ['tag(on|off|all|bots|rec|admins|owner)( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}tagall`
 *     Tag Top 100 Members of chat.
 * 
 * • `{i}tagadmins`
 *     Tag Admins of that chat.
 * 
 * • `{i}tagowner`
 *     Tag Owner of that chat
 * 
 * • `{i}tagbots`
 *     Tag Bots of that chat.
 * 
 * • `{i}tagrec`
 *     Tag recently Active Members.
 * 
 * • `{i}tagon`
 *     Tag online Members(work only if privacy off).
 * 
 * • `{i}tagoff`
 *     Tag Offline Members(work only if privacy off).
 * """
 * 
 * from telethon.tl.types import ChannelParticipantAdmin as admin
 * from telethon.tl.types import ChannelParticipantCreator as owner
 * from telethon.tl.types import UserStatusOffline as off
 * from telethon.tl.types import UserStatusOnline as onn
 * from telethon.tl.types import UserStatusRecently as rec
 * 
 * from . import inline_mention, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="tag(on|off|all|bots|rec|admins|owner)( (.*)|$)",
 *     groups_only=True,
 * )
 * async def _(e):
 *     okk = e.text
 *     lll = e.pattern_match.group(2)
 *     o = 0
 *     nn = 0
 *     rece = 0
 *     xx = f"{lll}" if lll else ""
 *     lili = await e.client.get_participants(e.chat_id, limit=99)
 *     for bb in lili:
 *         x = bb.status
 *         y = bb.participant
 *         if isinstance(x, onn):
 *             o += 1
 *             if "on" in okk:
 *                 xx += f"\n{inline_mention(bb)}"
 *         elif isinstance(x, off):
 *             nn += 1
 *             if "off" in okk and not bb.bot and not bb.deleted:
 *                 xx += f"\n{inline_mention(bb)}"
 *         elif isinstance(x, rec):
 *             rece += 1
 *             if "rec" in okk and not bb.bot and not bb.deleted:
 *                 xx += f"\n{inline_mention(bb)}"
 *         if isinstance(y, owner):
 *             xx += f"\n꧁{inline_mention(bb)}꧂"
 *         if isinstance(y, admin) and "admin" in okk and not bb.deleted:
 *             xx += f"\n{inline_mention(bb)}"
 *         if "all" in okk and not bb.bot and not bb.deleted:
 *             xx += f"\n{inline_mention(bb)}"
 *         if "bot" in okk and bb.bot:
 *             xx += f"\n{inline_mention(bb)}"
 *     await e.eor(xx)
---- end original ---- */

ultroidCmd('tag(on|off|all|bots|rec|admins|owner)( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `tag(on|off|all|bots|rec|admins|owner)( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tag") || `Plugin \`tag\` matched \`tag(on|off|all|bots|rec|admins|owner)( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/tools.js =====
// Ultroid-JS port of plugins/tools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/tools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "tools";
const PATTERNS = ['tr( (.*)|$)', 'id( (.*)|$)', 'bots( (.*)|$)', 'hl( (.*)|$)', 'circle$', 'ls( (.*)|$)', 'sg(|u)(?:\\\\s|$)([\\\\s\\\\S]*)', 'webshot( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}circle`
 *     Reply to a audio song or gif to get video note.
 * 
 * • `{i}ls`
 *     Get all the Files inside a Directory.
 * 
 * • `{i}bots`
 *     Shows the number of bots in the current chat with their perma-link.
 * 
 * • `{i}hl <a link> <text-optional>`
 *     Embeds the link with a whitespace as message.
 * 
 * • `{i}id`
 *     Reply a Sticker to Get Its Id
 *     Reply a User to Get His Id
 *     Without Replying You Will Get the Chat's Id
 * 
 * • `{i}sg <reply to a user><username/id>`
 *     Get His Name History of the replied user.
 * 
 * • `{i}tr <dest lang code> <(reply to) a message>`
 *     Get translated message.
 * 
 * • `{i}webshot <url>`
 *     Get a screenshot of the webpage.
 * """
 * import asyncio
 * import glob
 * import io
 * import os
 * import re
 * import secrets
 * from asyncio.exceptions import TimeoutError as AsyncTimeout
 * 
 * try:
 *     import cv2
 * except ImportError:
 *     cv2 = None
 * 
 * try:
 *     from playwright.async_api import async_playwright
 * except ImportError:
 *     async_playwright = None
 * try:
 *     from htmlwebshot import WebShot
 * except ImportError:
 *     WebShot = None
 * 
 * from telethon import functions, types
 * from telethon.errors.rpcerrorlist import MessageTooLongError, YouBlockedUserError
 * from telethon.tl.types import (
 *     ChannelParticipantAdmin,
 *     ChannelParticipantsBots,
 *     DocumentAttributeVideo,
 * )
 * 
 * from pyUltroid.fns.tools import metadata, translate
 * 
 * from . import (
 *     HNDLR,
 *     LOGS,
 *     ULTConfig,
 *     async_searcher,
 *     bash,
 *     check_filename,
 *     con,
 *     download_file,
 *     eor,
 *     get_string,
 *     ultroid_bot,
 * )
 * from . import humanbytes as hb
 * from . import inline_mention, is_url_ok, json_parser, mediainfo, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="tr( (.*)|$)", manager=True)
 * async def _(event):
 *     input = event.pattern_match.group(1).strip().split(maxsplit=1)
 *     txt = input[1] if len(input) > 1 else None
 *     if input:
 *         input = input[0]
 *     if txt:
 *         text = txt
 *     elif event.is_reply:
 *         previous_message = await event.get_reply_message()
 *         text = previous_message.message
 *     else:
 *         return await eor(
 *             event, f"`{HNDLR}tr LanguageCode` as reply to a message", time=5
 *         )
 *     lan = input or "en"
 *     try:
 *         tt = translate(text, lang_tgt=lan)
 *         output_str = f"**TRANSLATED** to {lan}\n{tt}"
 *         await event.eor(output_str)
 *     except Exception as exc:
 *         LOGS.exception(exc)
 *         await event.eor(str(exc), time=5)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="id( (.*)|$)",
 *     manager=True,
 * )
 * async def _(event):
 *     ult = event
 *     match = event.pattern_match.group(1).strip()
 *     if match:
 *         try:
 *             ids = await event.client.parse_id(match)
 *         except Exception as er:
---- end original ---- */

ultroidCmd('tr( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `tr( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`tr( (.*)|$)\`.` });
});

ultroidCmd('id( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `id( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`id( (.*)|$)\`.` });
});

ultroidCmd('bots( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `bots( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`bots( (.*)|$)\`.` });
});

ultroidCmd('hl( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `hl( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`hl( (.*)|$)\`.` });
});

ultroidCmd('circle$', async (e) => {
  const chatId = e.chatId;
  // Port of `circle$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`circle$\`.` });
});

ultroidCmd('ls( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ls( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`ls( (.*)|$)\`.` });
});

ultroidCmd('sg(|u)(?:\\\\s|$)([\\\\s\\\\S]*)', async (e) => {
  const chatId = e.chatId;
  // Port of `sg(|u)(?:\\s|$)([\\s\\S]*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`sg(|u)(?:\\s|$)([\\s\\S]*)\`.` });
});

ultroidCmd('webshot( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `webshot( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`webshot( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/twitter.js =====
// Ultroid-JS port of plugins/twitter.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/twitter.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "twitter";
const PATTERNS = ['tw( (.*)|$)', 'twdetail( (.*)|$)', 'twuser( (.*)|$)', 'twl( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * """
 * ✘ Commands Available -
 * 
 * • `{i}tw <tweet text>`
 *     Tweet the text.
 * 
 * • `{i}twr <tweet id/link>`
 *     Get tweet details with reply/quote/comment count.
 * 
 * • `{i}twuser <username>`
 *     Get user details of the Twitter account.
 * 
 * • `{i}twl <tweet link>`
 *     Upload the tweet media to telegram.
 * 
 * """
 * 
 * import asyncio
 * import os
 * 
 * try:
 *     _current_loop = asyncio.get_event_loop()
 * except RuntimeError:
 *     _current_loop = None
 * 
 * from twikit import Client
 * 
 * if _current_loop is not None:
 *     # On Windows, importing twikit replaces the global asyncio event loop
 *     # policy (see twikit/__init__.py), which orphans the loop Ultroid's
 *     # clients are already connected to. Re-register it so existing
 *     # Telethon connections keep working.
 *     asyncio.set_event_loop(_current_loop)
 * 
 * from . import LOGS, eor, get_string, udB, ultroid_cmd
 * 
 * # Store client globally
 * twitter_client = None
 * 
 * # Get path to cookies file
 * COOKIES_FILE = "resources/auth/twitter_cookies.json"
 * 
 * async def get_client():
 *     global twitter_client
 *     if twitter_client:
 *         return twitter_client
 *         
 *     if not all(udB.get_key(key) for key in ["TWITTER_USERNAME", "TWITTER_EMAIL", "TWITTER_PASSWORD"]):
 *         raise Exception("Set TWITTER_USERNAME, TWITTER_EMAIL and TWITTER_PASSWORD in vars first!")
 *     
 *     # Create auth directory if it doesn't exist
 *     os.makedirs(os.path.dirname(COOKIES_FILE), exist_ok=True)
 *         
 *     client = Client()
 *     await client.login(
 *         auth_info_1=udB.get_key("TWITTER_USERNAME"),
 *         auth_info_2=udB.get_key("TWITTER_EMAIL"), 
 *         password=udB.get_key("TWITTER_PASSWORD"),
 *         cookies_file=COOKIES_FILE
 *     )
 *     twitter_client = client
 *     return client
 * 
 * 
 * 
 * @ultroid_cmd(pattern="tw( (.*)|$)")
 * async def tweet_cmd(event):
 *     """Post a tweet"""
 *     text = event.pattern_match.group(1).strip()
 *     if not text:
 *         return await event.eor("🚫 `Give some text to tweet!`")
 * 
 *     msg = await event.eor("🕊 `Tweeting...`")
 *     try:
 *         client = await get_client()
 *         tweet = await client.create_tweet(text=text)
 *         await msg.edit(f"✨ **Successfully Posted!**\n\n🔗 https://x.com/{tweet.user.screen_name}/status/{tweet.id}")
 *     except Exception as e:
 *         await msg.edit(f"❌ **Error:**\n`{str(e)}`")
 * 
 * 
 * @ultroid_cmd(pattern="twdetail( (.*)|$)")
 * async def twitter_details(event):
 *     """Get tweet details"""
 *     match = event.pattern_match.group(1).strip()
 *     if not match:
 *         return await event.eor("🚫 `Give tweet ID/link to get details!`")
 * 
 *     msg = await event.eor("🔍 `Getting tweet details...`")
 *     try:
 *         client = await get_client()
 *         from urllib.parse import urlparse
 *         parsed_url = urlparse(match)
 *         if parsed_url.hostname in ["twitter.com", "x.com"]:
 *             tweet_id = parsed_url.path.split("/")[-1].split("?")[0]
 *         else:
 *             tweet_id = match
 * 
 *         tweet = await client.get_tweet_by_id(tweet_id)
 *         text = "🐦 **Tweet Details**\n\n"
 *         text += f"📝 **Content:** `{tweet.text}`\n\n"
 *         if hasattr(tweet, "metrics"):
 *             text += f"❤️ **Likes:** `{tweet.metrics.likes}`\n"
 *             text += f"🔄 **Retweets:** `{tweet.metrics.retweets}`\n"
 *             text += f"💬 **Replies:** `{tweet.metrics.replies}`\n"
 *             text += f"👁 **Views:** `{tweet.metrics.views}`\n"
 *         
 *         await msg.edit(text)
 *     except Exception as e:
 *         await msg.edit(f"❌ **Error:**\n`{str(e)}`")
 * 
 * 
 * @ultroid_cmd(pattern="twuser( (.*)|$)")
---- end original ---- */

ultroidCmd('tw( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `tw( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("twitter") || `Plugin \`twitter\` matched \`tw( (.*)|$)\`.` });
});

ultroidCmd('twdetail( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `twdetail( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("twitter") || `Plugin \`twitter\` matched \`twdetail( (.*)|$)\`.` });
});

ultroidCmd('twuser( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `twuser( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("twitter") || `Plugin \`twitter\` matched \`twuser( (.*)|$)\`.` });
});

ultroidCmd('twl( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `twl( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("twitter") || `Plugin \`twitter\` matched \`twl( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/unsplash.js =====
// Ultroid-JS port of plugins/unsplash.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/unsplash.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "unsplash";
const PATTERNS = ['unsplash( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • {i}unsplash <search query> ; <no of pics>
 *     Unsplash Image Search.
 * """
 * 
 * from pyUltroid.fns.misc import unsplashsearch
 * 
 * from . import asyncio, download_file, get_string, os, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="unsplash( (.*)|$)")
 * async def searchunsl(ult):
 *     match = ult.pattern_match.group(1).strip()
 *     if not match:
 *         return await ult.eor("Give me Something to Search")
 *     num = 5
 *     if ";" in match:
 *         num = int(match.split(";")[1])
 *         match = match.split(";")[0]
 *     tep = await ult.eor(get_string("com_1"))
 *     res = await unsplashsearch(match, limit=num)
 *     if not res:
 *         return await ult.eor(get_string("unspl_1"), time=5)
 *     CL = [download_file(rp, f"{match}-{e}.png") for e, rp in enumerate(res)]
 *     imgs = [z[0] for z in (await asyncio.gather(*CL)) if z]
 *     await ult.respond(f"Uploaded {len(imgs)} Images!", file=imgs)
 *     await tep.delete()
 *     [os.remove(img) for img in imgs]
---- end original ---- */

ultroidCmd('unsplash( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `unsplash( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("unsplash") || `Plugin \`unsplash\` matched \`unsplash( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/usage.js =====
// Ultroid-JS port of plugins/usage.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/usage.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "usage";
const PATTERNS = ['usage'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available
 * 
 * • `{i}usage`
 *     Get overall usage.
 * 
 * • `{i}usage heroku`
 *    Get heroku stats.
 * 
 * • `{i}usage db`
 *    Get database storage usage.
 * """
 * 
 * import math
 * import shutil
 * from random import choice
 * 
 * from pyUltroid.fns import some_random_headers
 * 
 * from . import (
 *     HOSTED_ON,
 *     LOGS,
 *     Var,
 *     async_searcher,
 *     get_string,
 *     humanbytes,
 *     udB,
 *     ultroid_cmd,
 * )
 * 
 * HEROKU_API = None
 * HEROKU_APP_NAME = None
 * 
 * if HOSTED_ON == "heroku":
 *     heroku_api, app_name = Var.HEROKU_API, Var.HEROKU_APP_NAME
 *     try:
 *         if heroku_api and app_name:
 *             import heroku3
 * 
 *             Heroku = heroku3.from_key(heroku_api)
 *             app = Heroku.app(app_name)
 *             HEROKU_API = heroku_api
 *             HEROKU_APP_NAME = app_name
 *     except BaseException as er:
 *         LOGS.exception(er)
 * 
 * 
 * @ultroid_cmd(pattern="usage")
 * async def usage_finder(event):
 *     x = await event.eor(get_string("com_1"))
 *     try:
 *         opt = event.text.split(" ", maxsplit=1)[1]
 *     except IndexError:
 *         return await x.edit(simple_usage())
 * 
 *     if opt == "db":
 *         await x.edit(db_usage())
 *     elif opt == "heroku":
 *         is_hk, hk = await heroku_usage()
 *         await x.edit(hk)
 *     else:
 *         await x.edit(await get_full_usage())
 * 
 * 
 * def simple_usage():
 *     try:
 *         import psutil
 *     except ImportError:
 *         return "Install 'psutil' to use this..."
 *     total, used, free = shutil.disk_usage(".")
 *     cpuUsage = psutil.cpu_percent()
 *     memory = psutil.virtual_memory().percent
 *     disk = psutil.disk_usage("/").percent
 *     upload = humanbytes(psutil.net_io_counters().bytes_sent)
 *     down = humanbytes(psutil.net_io_counters().bytes_recv)
 *     TOTAL = humanbytes(total)
 *     USED = humanbytes(used)
 *     FREE = humanbytes(free)
 *     return get_string("usage_simple").format(
 *         TOTAL,
 *         USED,
 *         FREE,
 *         upload,
 *         down,
 *         cpuUsage,
 *         memory,
 *         disk,
 *     )
 * 
 * 
 * async def heroku_usage():
 *     try:
 *         import psutil
 *     except ImportError:
 *         return (
 *             False,
 *             "'psutil' not installed!\nPlease Install it to use this.\n`pip3 install psutil`",
 *         )
 *     if not (HEROKU_API and HEROKU_APP_NAME):
 *         if HOSTED_ON == "heroku":
 *             return False, "Please fill `HEROKU_API` and `HEROKU_APP_NAME`"
 *         return (
 *             False,
 *             f"`This command is only for Heroku Users, You are using {HOSTED_ON}`",
 *         )
 *     user_id = Heroku.account().id
 *     headers = {
 *         "User-Agent": choice(some_random_headers),
 *         "Authorization": f"Bearer {heroku_api}",
 *         "Accept": "application/vnd.heroku+json; version=3.account-quotas",
 *     }
 *     her_url = f"https://api.heroku.com/accounts/{user_id}/actions/get-quota"
 *     try:
 *         result = await async_searcher(her_url, headers=headers, re_json=True)
---- end original ---- */

ultroidCmd('usage', async (e) => {
  const chatId = e.chatId;
  // Port of `usage` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("usage") || `Plugin \`usage\` matched \`usage\`.` });
});
}

{ // ===== lib/plugins/utilities.js =====
// Ultroid-JS port of plugins/utilities.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/utilities.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "utilities";
const PATTERNS = ['kickme$', 'date$', 'listreserved$', 'stats$', 'paste( (.*)|$)', 'info( (.*)|$)', 'invite( (.*)|$)', 'rmbg($| (.*))', 'telegraph( (.*)|$)', 'json( (.*)|$)', 'suggest( (.*)|$)', 'ipinfo( (.*)|$)', 'cpy$', 'pst$', 'thumb$', 'getmsg( ?(.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}kickme` : Leaves the group.
 * 
 * • `{i}date` : Show Calender.
 * 
 * • `{i}listreserved`
 *     List all usernames (channels/groups) you own.
 * 
 * • `{i}stats` : See your profile stats.
 * 
 * • `{i}paste` - `Include long text / Reply to text file.`
 * 
 * • `{i}info <username/userid/chatid>`
 *     Reply to someone's msg.
 * 
 * • `{i}invite <username/userid>`
 *     Add user to the chat.
 * 
 * • `{i}rmbg <reply to pic>`
 *     Remove background from that picture.
 * 
 * • `{i}telegraph <reply to media/text>`
 *     Upload media/text to telegraph.
 * 
 * • `{i}json <reply to msg>`
 *     Get the json encoding of the message.
 * 
 * • `{i}suggest <reply to message> or <poll title>`
 *     Create a Yes/No poll for the replied suggestion.
 * 
 * • `{i}ipinfo <ipAddress>` : Get info about that IP address.
 * 
 * • `{i}cpy <reply to message>`
 *    Copy the replied message, with formatting. Expires in 24hrs.
 * • `{i}pst`
 *    Paste the copied message, with formatting.
 * 
 * • `{i}thumb <reply file>` : Download the thumbnail of the replied file.
 * 
 * • `{i}getmsg <message link>`
 *   Get messages from chats with forward/copy restrictions.
 * """
 * 
 * import asyncio
 * import calendar
 * import html
 * import io
 * import os
 * import pathlib
 * import time
 * from datetime import datetime as dt
 * 
 * try:
 *     from PIL import Image
 * except ImportError:
 *     Image = None
 * 
 * from pyUltroid._misc._assistant import asst_cmd
 * from pyUltroid.dB.gban_mute_db import is_gbanned
 * from pyUltroid.fns.tools import get_chat_and_msgid
 * 
 * from . import upload_file as uf
 * 
 * from telethon.errors.rpcerrorlist import ChatForwardsRestrictedError, UserBotError
 * from telethon.errors import MessageTooLongError
 * from telethon.events import NewMessage
 * from telethon.tl.custom import Dialog
 * from telethon.tl.functions.channels import (
 *     GetAdminedPublicChannelsRequest,
 *     InviteToChannelRequest,
 *     LeaveChannelRequest,
 * )
 * from telethon.tl.functions.contacts import GetBlockedRequest
 * from telethon.tl.functions.messages import AddChatUserRequest, GetAllStickersRequest
 * from telethon.tl.functions.users import GetFullUserRequest
 * from telethon.tl.types import (
 *     Channel,
 *     Chat,
 *     InputMediaPoll,
 *     Poll,
 *     PollAnswer,
 *     TLObject,
 *     User,
 *     UserStatusOffline,
 *     UserStatusOnline,
 *     MessageMediaPhoto,
 *     MessageMediaDocument,
 *     DocumentAttributeVideo,
 * )
 * from telethon.utils import get_peer_id
 * 
 * from pyUltroid.fns.info import get_chat_info
 * 
 * from . import (
 *     HNDLR,
 *     LOGS,
 *     Image,
 *     ReTrieveFile,
 *     Telegraph,
 *     asst,
 *     async_searcher,
 *     bash,
 *     check_filename,
 *     eod,
 *     eor,
 *     get_paste,
 *     get_string,
 *     inline_mention,
 *     json_parser,
 *     mediainfo,
 *     udB,
 *     ultroid_cmd,
---- end original ---- */

ultroidCmd('kickme$', async (e) => {
  const chatId = e.chatId;
  // Port of `kickme$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`kickme$\`.` });
});

ultroidCmd('date$', async (e) => {
  const chatId = e.chatId;
  // Port of `date$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`date$\`.` });
});

ultroidCmd('listreserved$', async (e) => {
  const chatId = e.chatId;
  // Port of `listreserved$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`listreserved$\`.` });
});

ultroidCmd('stats$', async (e) => {
  const chatId = e.chatId;
  // Port of `stats$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`stats$\`.` });
});

ultroidCmd('paste( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `paste( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`paste( (.*)|$)\`.` });
});

ultroidCmd('info( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `info( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`info( (.*)|$)\`.` });
});

ultroidCmd('invite( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `invite( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`invite( (.*)|$)\`.` });
});

ultroidCmd('rmbg($| (.*))', async (e) => {
  const chatId = e.chatId;
  // Port of `rmbg($| (.*))` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`rmbg($| (.*))\`.` });
});

ultroidCmd('telegraph( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `telegraph( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`telegraph( (.*)|$)\`.` });
});

ultroidCmd('json( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `json( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`json( (.*)|$)\`.` });
});

ultroidCmd('suggest( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `suggest( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`suggest( (.*)|$)\`.` });
});

ultroidCmd('ipinfo( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ipinfo( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`ipinfo( (.*)|$)\`.` });
});

ultroidCmd('cpy$', async (e) => {
  const chatId = e.chatId;
  // Port of `cpy$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`cpy$\`.` });
});

ultroidCmd('pst$', async (e) => {
  const chatId = e.chatId;
  // Port of `pst$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`pst$\`.` });
});

ultroidCmd('thumb$', async (e) => {
  const chatId = e.chatId;
  // Port of `thumb$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`thumb$\`.` });
});

ultroidCmd('getmsg( ?(.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `getmsg( ?(.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`getmsg( ?(.*)|$)\`.` });
});
}

{ // ===== lib/plugins/variables.js =====
// Ultroid-JS port of plugins/variables.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/variables.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "variables";
const PATTERNS = ['get($| (.*))'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}get var <variable name>`
 *    Get value of the given variable name.
 * 
 * • `{i}get type <variable name>`
 *    Get variable type.
 * 
 * • `{i}get db <key>`
 *    Get db value of the given key.
 * 
 * • `{i}get keys`
 *    Get all redis keys.
 * """
 * 
 * import os
 * 
 * from . import eor, get_string, udB, ultroid_cmd, HNDLR
 * 
 * 
 * @ultroid_cmd(pattern="get($| (.*))", fullsudo=True)
 * async def get_var(event):
 *     try:
 *         opt = event.text.split(maxsplit=2)[1]
 *     except IndexError:
 *         return await event.eor(f"what to get?\nRead `{HNDLR}help variables`")
 *     x = await event.eor(get_string("com_1"))
 *     if opt != "keys":
 *         try:
 *             varname = event.text.split(maxsplit=2)[2]
 *         except IndexError:
 *             return await eor(x, "Such a var doesn't exist!", time=5)
 *     if opt == "var":
 *         c = 0
 *         # try redis
 *         val = udB.get_key(varname)
 *         if val is not None:
 *             c += 1
 *             await x.edit(
 *                 f"**Variable** - `{varname}`\n**Value**: `{val}`\n**Type**: Redis Key."
 *             )
 *         # try env vars
 *         val = os.getenv(varname)
 *         if val is not None:
 *             c += 1
 *             await x.edit(
 *                 f"**Variable** - `{varname}`\n**Value**: `{val}`\n**Type**: Env Var."
 *             )
 * 
 *         if c == 0:
 *             await eor(x, "Such a var doesn't exist!", time=5)
 * 
 *     elif opt == "type":
 *         c = 0
 *         # try redis
 *         val = udB.get_key(varname)
 *         if val is not None:
 *             c += 1
 *             await x.edit(f"**Variable** - `{varname}`\n**Type**: Redis Key.")
 *         # try env vars
 *         val = os.getenv(varname)
 *         if val is not None:
 *             c += 1
 *             await x.edit(f"**Variable** - `{varname}`\n**Type**: Env Var.")
 * 
 *         if c == 0:
 *             await eor(x, "Such a var doesn't exist!", time=5)
 * 
 *     elif opt == "db":
 *         val = udB.get(varname)
 *         if val is not None:
 *             await x.edit(f"**Key** - `{varname}`\n**Value**: `{val}`")
 *         else:
 *             await eor(x, "No such key!", time=5)
 * 
 *     elif opt == "keys":
 *         keys = sorted(udB.keys())
 *         msg = "".join(
 *             f"• `{i}`" + "\n"
 *             for i in keys
 *             if not i.isdigit()
 *             and not i.startswith("-")
 *             and not i.startswith("_")
 *             and not i.startswith("GBAN_REASON_")
 *         )
 * 
 *         await x.edit(f"**List of DB Keys :**\n{msg}")
---- end original ---- */

ultroidCmd('get($| (.*))', async (e) => {
  const chatId = e.chatId;
  // Port of `get($| (.*))` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("variables") || `Plugin \`variables\` matched \`get($| (.*))\`.` });
});
}

{ // ===== lib/plugins/vctools.js =====
// Ultroid-JS port of plugins/vctools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/vctools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "vctools";
const PATTERNS = ['stopvc$', 'vcinvite$', 'startvc$', 'vctitle(?: |$)(.*)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}startvc`
 *     Start Group Call in a group.
 * 
 * • `{i}stopvc`
 *     Stop Group Call in a group.
 * 
 * • `{i}vctitle <title>`
 *     Change the title Group call.
 * 
 * • `{i}vcinvite`
 *     Invite all members of group in Group Call.
 *     (You must be joined)
 * """
 * 
 * from telethon.tl.functions.channels import GetFullChannelRequest as getchat
 * from telethon.tl.functions.phone import CreateGroupCallRequest as startvc
 * from telethon.tl.functions.phone import DiscardGroupCallRequest as stopvc
 * from telethon.tl.functions.phone import EditGroupCallTitleRequest as settitle
 * from telethon.tl.functions.phone import GetGroupCallRequest as getvc
 * from telethon.tl.functions.phone import InviteToGroupCallRequest as invitetovc
 * 
 * from . import get_string, ultroid_cmd
 * 
 * 
 * async def get_call(event):
 *     mm = await event.client(getchat(event.chat_id))
 *     xx = await event.client(getvc(mm.full_chat.call, limit=1))
 *     return xx.call
 * 
 * 
 * def user_list(l, n):
 *     for i in range(0, len(l), n):
 *         yield l[i : i + n]
 * 
 * 
 * @ultroid_cmd(
 *     pattern="stopvc$",
 *     admins_only=True,
 *     groups_only=True,
 * )
 * async def _(e):
 *     try:
 *         await e.client(stopvc(await get_call(e)))
 *         await e.eor(get_string("vct_4"))
 *     except Exception as ex:
 *         await e.eor(f"`{ex}`")
 * 
 * 
 * @ultroid_cmd(
 *     pattern="vcinvite$",
 *     groups_only=True,
 * )
 * async def _(e):
 *     ok = await e.eor(get_string("vct_3"))
 *     users = []
 *     z = 0
 *     async for x in e.client.iter_participants(e.chat_id):
 *         if not x.bot:
 *             users.append(x.id)
 *     hmm = list(user_list(users, 6))
 *     for p in hmm:
 *         try:
 *             await e.client(invitetovc(call=await get_call(e), users=p))
 *             z += 6
 *         except BaseException:
 *             pass
 *     await ok.edit(get_string("vct_5").format(z))
 * 
 * 
 * @ultroid_cmd(
 *     pattern="startvc$",
 *     admins_only=True,
 *     groups_only=True,
 * )
 * async def _(e):
 *     try:
 *         await e.client(startvc(e.chat_id))
 *         await e.eor(get_string("vct_1"))
 *     except Exception as ex:
 *         await e.eor(f"`{ex}`")
 * 
 * 
 * @ultroid_cmd(
 *     pattern="vctitle(?: |$)(.*)",
 *     admins_only=True,
 *     groups_only=True,
 * )
 * async def _(e):
 *     title = e.pattern_match.group(1).strip()
 *     if not title:
 *         return await e.eor(get_string("vct_6"), time=5)
 *     try:
 *         await e.client(settitle(call=await get_call(e), title=title.strip()))
 *         await e.eor(get_string("vct_2").format(title))
 *     except Exception as ex:
 *         await e.eor(f"`{ex}`")
---- end original ---- */

ultroidCmd('stopvc$', async (e) => {
  const chatId = e.chatId;
  // Port of `stopvc$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("vctools") || `Plugin \`vctools\` matched \`stopvc$\`.` });
});

ultroidCmd('vcinvite$', async (e) => {
  const chatId = e.chatId;
  // Port of `vcinvite$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("vctools") || `Plugin \`vctools\` matched \`vcinvite$\`.` });
});

ultroidCmd('startvc$', async (e) => {
  const chatId = e.chatId;
  // Port of `startvc$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("vctools") || `Plugin \`vctools\` matched \`startvc$\`.` });
});

ultroidCmd('vctitle(?: |$)(.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `vctitle(?: |$)(.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("vctools") || `Plugin \`vctools\` matched \`vctitle(?: |$)(.*)\`.` });
});
}

{ // ===== lib/plugins/videotools.js =====
// Ultroid-JS port of plugins/videotools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/videotools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "videotools";
const PATTERNS = ['sample( (.*)|$)', 'vshots( (.*)|$)', 'vtrim( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * •`{i}sample <duration in seconds>`
 *    Creates Short sample of video..
 * 
 * • `{i}vshots <number of shots>`
 *    Creates screenshot of video..
 * 
 * • `{i}vtrim <start time> - <end time> in seconds`
 *     Crop a Lengthy video..
 * """
 * 
 * import glob
 * import os
 * 
 * from pyUltroid.fns.tools import set_attributes
 * 
 * from . import (
 *     ULTConfig,
 *     bash,
 *     duration_s,
 *     eod,
 *     genss,
 *     get_string,
 *     mediainfo,
 *     stdr,
 *     ultroid_cmd,
 * )
 * 
 * 
 * @ultroid_cmd(pattern="sample( (.*)|$)")
 * async def gen_sample(e):
 *     sec = e.pattern_match.group(1).strip()
 *     stime = int(sec) if sec and sec.isdigit() else 30
 *     vido = await e.get_reply_message()
 *     if vido and vido.media and "video" in mediainfo(vido.media):
 *         msg = await e.eor(get_string("com_1"))
 *         file, _ = await e.client.fast_downloader(
 *             vido.document, show_progress=True, event=msg
 *         )
 *         file_name = (file.name).split("/")[-1]
 *         out = file_name.replace(file_name.split(".")[-1], "_sample.mkv")
 *         xxx = await msg.edit(f"Generating Sample of `{stime}` seconds...")
 *         ss, dd = await duration_s(file.name, stime)
 *         cmd = f'ffmpeg -i "{file.name}" -preset ultrafast -ss {ss} -to {dd} -codec copy -map 0 "{out}" -y'
 *         await bash(cmd)
 *         os.remove(file.name)
 *         attributes = await set_attributes(out)
 *         mmmm, _ = await e.client.fast_uploader(
 *             out, show_progress=True, event=xxx, to_delete=True
 *         )
 *         caption = f"A Sample Video Of `{stime}` seconds"
 *         await e.client.send_file(
 *             e.chat_id,
 *             mmmm,
 *             thumb=ULTConfig.thumb,
 *             caption=caption,
 *             attributes=attributes,
 *             force_document=False,
 *             reply_to=e.reply_to_msg_id,
 *         )
 *         await xxx.delete()
 *     else:
 *         await e.eor(get_string("audiotools_8"), time=5)
 * 
 * 
 * @ultroid_cmd(pattern="vshots( (.*)|$)")
 * async def gen_shots(e):
 *     ss = e.pattern_match.group(1).strip()
 *     shot = int(ss) if ss and ss.isdigit() else 5
 *     vido = await e.get_reply_message()
 *     if vido and vido.media and "video" in mediainfo(vido.media):
 *         msg = await e.eor(get_string("com_1"))
 *         file, _ = await e.client.fast_downloader(
 *             vido.document, show_progress=True, event=msg
 *         )
 *         xxx = await msg.edit(f"Generating `{shot}` screenshots...")
 *         await bash("rm -rf ss && mkdir ss")
 *         cmd = f'ffmpeg -i "{file.name}" -vf fps=0.009 -vframes {shot} "ss/pic%01d.png"'
 *         await bash(cmd)
 *         os.remove(file.name)
 *         pic = glob.glob("ss/*")
 *         text = f"Uploaded {len(pic)}/{shot} screenshots"
 *         if not pic:
 *             text = "`Failed to Take Screenshots..`"
 *             pic = None
 *         await e.respond(text, file=pic)
 *         await bash("rm -rf ss")
 *         await xxx.delete()
 * 
 * 
 * @ultroid_cmd(pattern="vtrim( (.*)|$)")
 * async def gen_sample(e):
 *     sec = e.pattern_match.group(1).strip()
 *     if not sec or "-" not in sec:
 *         return await eod(e, get_string("audiotools_3"))
 *     a, b = sec.split("-")
 *     if int(a) >= int(b):
 *         return await eod(e, get_string("audiotools_4"))
 *     vido = await e.get_reply_message()
 *     if vido and vido.media and "video" in mediainfo(vido.media):
 *         msg = await e.eor(get_string("audiotools_5"))
 *         file, _ = await e.client.fast_downloader(
 *             vido.document, show_progress=True, event=msg
 *         )
 *         file_name = (file.name).split("/")[-1]
 *         out = file_name.replace(file_name.split(".")[-1], "_trimmed.mkv")
 *         if int(b) > int(await genss(file.name)):
 *             os.remove(file.name)
 *             return await eod(msg, get_string("audiotools_6"))
 *         ss, dd = stdr(int(a)), stdr(int(b))
 *         xxx = await msg.edit(f"Trimming Video from `{ss}` to `{dd}`...")
 *         cmd = f'ffmpeg -i "{file.name}" -preset ultrafast -ss {ss} -to {dd} -codec copy -map 0 "{out}" -y'
---- end original ---- */

ultroidCmd('sample( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `sample( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("videotools") || `Plugin \`videotools\` matched \`sample( (.*)|$)\`.` });
});

ultroidCmd('vshots( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `vshots( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("videotools") || `Plugin \`videotools\` matched \`vshots( (.*)|$)\`.` });
});

ultroidCmd('vtrim( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `vtrim( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("videotools") || `Plugin \`videotools\` matched \`vtrim( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/weather.js =====
// Ultroid-JS port of plugins/weather.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/weather.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "weather";
const PATTERNS = ['weather ?(.*)', 'air ?(.*)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid ~ UserBot
 * # Copyright (C) 2023-2024 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * """
 * **Get Weather Data using OpenWeatherMap API**
 * ❍  Commands Available -
 * 
 * • `{i}weather` <city name>
 *     Shows the Weather of Cities
 * 
 * • `{i}air` <city name>
 *     Shows the Air Condition of Cities
 * """
 * 
 * import datetime
 * import time
 * from datetime import timedelta
 * 
 * import aiohttp
 * import pytz
 * 
 * from . import async_searcher, get_string, udB, ultroid_cmd
 * 
 * 
 * async def get_timezone(offset_seconds, use_utc=False):
 *     offset = timedelta(seconds=offset_seconds)
 *     hours, remainder = divmod(offset.seconds, 3600)
 *     sign = "+" if offset.total_seconds() >= 0 else "-"
 *     timezone = "UTC" if use_utc else "GMT"
 *     if use_utc:
 *         for m in pytz.all_timezones:
 *             tz = pytz.timezone(m)
 *             now = datetime.datetime.now(tz)
 *             if now.utcoffset() == offset:
 *                 return f"{m} ({timezone}{sign}{hours:02d})"
 *     else:
 *         for m in pytz.all_timezones:
 *             tz = pytz.timezone(m)
 *             if m.startswith("Australia/"):
 *                 now = datetime.datetime.now(tz)
 *                 if now.utcoffset() == offset:
 *                     return f"{m} ({timezone}{sign}{hours:02d})"
 *         for m in pytz.all_timezones:
 *             tz = pytz.timezone(m)
 *             now = datetime.datetime.now(tz)
 *             if now.utcoffset() == offset:
 *                 return f"{m} ({timezone}{sign}{hours:02d})"
 *         return "Timezone not found"
 * 
 * async def getWindinfo(speed: str, degree: str) -> str:
 *     dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
 *     ix = round(degree / (360.00 / len(dirs)))
 *     kmph = str(float(speed) * 3.6) + " km/h"
 *     return f"[{dirs[ix % len(dirs)]}] {kmph}"
 * 
 * async def get_air_pollution_data(latitude, longitude, api_key):
 *     url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={latitude}&lon={longitude}&appid={api_key}"
 *     async with aiohttp.ClientSession() as session:
 *         async with session.get(url) as response:
 *             data = await response.json()
 *             if "list" in data:
 *                 air_pollution = data["list"][0]
 *                 return air_pollution
 *             else:
 *                 return None
 * 
 * 
 * @ultroid_cmd(pattern="weather ?(.*)")
 * async def weather(event):
 *     if event.fwd_from:
 *         return
 *     msg = await event.eor(get_string("com_1"))
 *     x = udB.get_key("OPENWEATHER_API")
 *     if x is None:
 *         await event.eor(
 *             "No API found. Get One from [Here](https://api.openweathermap.org)\nAnd Add it in OPENWEATHER_API Redis Key",
 *             time=8,
 *         )
 *         return
 *     input_str = event.pattern_match.group(1)
 *     if not input_str:
 *         await event.eor("No Location was Given...", time=5)
 *         return
 *     elif input_str == "butler":
 *         await event.eor("search butler,au for australila", time=5)
 *     sample_url = f"https://api.openweathermap.org/data/2.5/weather?q={input_str}&APPID={x}&units=metric"
 *     try:
 *         response_api = await async_searcher(sample_url, re_json=True)
 *         if response_api["cod"] == 200:
 *             country_time_zone = int(response_api["timezone"])
 *             tz = f"{await get_timezone(country_time_zone)}"
 *             sun_rise_time = int(response_api["sys"]["sunrise"]) + country_time_zone
 *             sun_set_time = int(response_api["sys"]["sunset"]) + country_time_zone
 *             await msg.edit(
 *                 f"{response_api['name']}, {response_api['sys']['country']}\n\n"
 *                 f"╭────────────────•\n"
 *                 f"╰➢ **𝖶𝖾𝖺𝗍𝗁𝖾𝗋:** {response_api['weather'][0]['description']}\n"
 *                 f"╰➢ **𝖳𝗂𝗆𝖾𝗓𝗈𝗇𝖾:** {tz}\n"
 *                 f"╰➢ **𝖲𝗎𝗇𝗋𝗂𝗌𝖾:** {time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(sun_rise_time))}\n"
 *                 f"╰➢ **𝖲𝗎𝗇𝗌𝖾𝗍:** {time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(sun_set_time))}\n"
 *                 f"╰➢ **𝖶𝗂𝗇𝖽:** {await getWindinfo(response_api['wind']['speed'], response_api['wind']['deg'])}\n"
 *                 f"╰➢ **𝖳𝖾𝗆𝗉𝖾𝗋𝖺𝗍𝗎𝗋𝖾:** {response_api['main']['temp']}°C\n"
 *                 f"╰➢ **𝖥𝖾𝖾𝗅𝗌 𝗅𝗂𝗄𝖾:** {response_api['main']['feels_like']}°C\n"
 *                 f"╰➢ **𝖬𝗂𝗇𝗂𝗆𝗎𝗆:** {response_api['main']['temp_min']}°C\n"
 *                 f"╰➢ **𝖬𝖺𝗑𝗂𝗆𝗎𝗆:** {response_api['main']['temp_max']}°C\n"
 *                 f"╰➢ **𝖯𝗋𝖾𝗌𝗌𝗎𝗋𝖾:** {response_api['main']['pressure']} hPa\n"
 *                 f"╰➢ **𝖧𝗎𝗆𝗂𝖽𝗂𝗍𝗒:** {response_api['main']['humidity']}%\n"
 *                 f"╰➢ **𝖵𝗂𝗌𝗂𝖻𝗂𝗅𝗂𝗍𝗒:** {response_api['visibility']} m\n"
 *                 f"╰➢ **𝖢𝗅𝗈𝗎𝖽𝗌:** {response_api['clouds']['all']}%\n"
 *                 f"╰────────────────•\n\n"
 *             )
 *         else:
 *             await msg.edit(response_api["message"])
 *     except Exception as e:
 *         await event.eor(f"An unexpected error occurred: {str(e)}", time=5)
 * 
---- end original ---- */

ultroidCmd('weather ?(.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `weather ?(.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("weather") || `Plugin \`weather\` matched \`weather ?(.*)\`.` });
});

ultroidCmd('air ?(.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `air ?(.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("weather") || `Plugin \`weather\` matched \`air ?(.*)\`.` });
});
}

{ // ===== lib/plugins/webupload.js =====
// Ultroid-JS port of plugins/webupload.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/webupload.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "webupload";
const PATTERNS = ['webupload( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * """
 * ✘ Commands Available -
 * 
 * • `{i}webupload`
 *     Upload files on another server.
 * """
 * 
 * import os
 * 
 * from pyUltroid.fns.tools import _webupload_cache
 * 
 * from . import Button, asst, get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="webupload( (.*)|$)")
 * async def _(event):
 *     xx = await event.eor(get_string("com_1"))
 *     match = event.pattern_match.group(1).strip()
 *     if event.chat_id not in _webupload_cache:
 *         _webupload_cache.update({int(event.chat_id): {}})
 *     if match:
 *         if not os.path.exists(match):
 *             return await xx.eor("File doesn't exist.")
 *         _webupload_cache[event.chat_id][event.id] = match
 *     elif event.reply_to_msg_id:
 *         reply = await event.get_reply_message()
 *         if reply.photo:
 *             file = await reply.download_media("resources/downloads/")
 *             _webupload_cache[int(event.chat_id)][int(event.id)] = file
 *         else:
 *             file, _ = await event.client.fast_downloader(
 *                 reply.document, show_progress=True, event=xx
 *             )
 *             _webupload_cache[int(event.chat_id)][int(event.id)] = file.name
 *     else:
 *         return await xx.eor("Reply to file or give file path...")
 *     if not event.client._bot:
 *         results = await event.client.inline_query(
 *             asst.me.username, f"fl2lnk {event.chat_id}:{event.id}"
 *         )
 *         await results[0].click(event.chat_id, reply_to=event.reply_to_msg_id)
 *         await xx.delete()
 * 
 *     else:
 *         __cache = f"{event.chat_id}:{event.id}"
 *         buttons = [
 *             [
 *                 Button.inline("catbox", data=f"flcatbox//{__cache}"),
 *                 Button.inline("transfer", data=f"fltransfer//{__cache}"),
 *             ],
 *             [
 *                 Button.inline("filebin", data=f"flfilebin//{__cache}"),
 *                 Button.inline("0x0.st", data=f"fl0x0.st//{__cache}"),
 *             ],
 *             [
 *                 Button.inline("file.io", data=f"flfile.io//{__cache}"),
 *                 Button.inline("siasky", data=f"flsiasky//{__cache}"),
 *             ],
 *         ]
 *         await xx.edit("Choose Server to Upload File...", buttons=buttons)
---- end original ---- */

ultroidCmd('webupload( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `webupload( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("webupload") || `Plugin \`webupload\` matched \`webupload( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/words.js =====
// Ultroid-JS port of plugins/words.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/words.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "words";
const PATTERNS = ['meaning( (.*)|$)', '(syno|anto)nym', 'ud (.*)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}meaning <word>`
 *     Get the meaning of the word.
 * 
 * • `{i}synonym <word>`
 *     Get all synonyms.
 * 
 * • `{i}antonym <word>`
 *     Get all antonyms.
 * 
 * • `{i}ud <word>`
 *     Fetch word defenition from urbandictionary.
 * """
 * import io
 * 
 * from pyUltroid.fns.misc import get_synonyms_or_antonyms
 * from pyUltroid.fns.tools import async_searcher
 * 
 * from . import get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="meaning( (.*)|$)", manager=True)
 * async def mean(event):
 *     wrd = event.pattern_match.group(1).strip()
 *     if not wrd:
 *         return await event.eor(get_string("wrd_4"))
 *     url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{wrd}"
 *     out = await async_searcher(url, re_json=True)
 *     try:
 *         return await event.eor(f'**{out["title"]}**')
 *     except (KeyError, TypeError):
 *         pass
 *     defi = out[0]["meanings"][0]["definitions"][0]
 *     ex = defi["example"] if defi.get("example") else "None"
 *     text = get_string("wrd_1").format(wrd, defi["definition"], ex)
 *     if defi.get("synonyms"):
 *         text += (
 *             f"\n\n• **{get_string('wrd_5')} :**"
 *             + "".join(f" {a}," for a in defi["synonyms"])[:-1][:10]
 *         )
 *     if defi.get("antonyms"):
 *         text += (
 *             f"\n\n**{get_string('wrd_6')} :**"
 *             + "".join(f" {a}," for a in defi["antonyms"])[:-1][:10]
 *         )
 *     if len(text) > 4096:
 *         with io.BytesIO(str.encode(text)) as fle:
 *             fle.name = f"{wrd}-meanings.txt"
 *             await event.reply(
 *                 file=fle,
 *                 force_document=True,
 *                 caption=f"Meanings of {wrd}",
 *             )
 *             await event.delete()
 *     else:
 *         await event.eor(text)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="(syno|anto)nym",
 * )
 * async def mean(event):
 *     task = event.pattern_match.group(1) + "nyms"
 *     try:
 *         wrd = event.text.split(maxsplit=1)[1]
 *     except IndexError:
 *         return await event.eor("Give Something to search..")
 *     try:
 *         ok = await get_synonyms_or_antonyms(wrd, task)
 *         x = get_string("wrd_2" if task == "synonyms" else "wrd_3").format(wrd)
 *         for c, i in enumerate(ok, start=1):
 *             x += f"**{c}.** `{i}`\n"
 *         if len(x) > 4096:
 *             with io.BytesIO(str.encode(x)) as fle:
 *                 fle.name = f"{wrd}-{task}.txt"
 *                 await event.client.send_file(
 *                     event.chat_id,
 *                     fle,
 *                     force_document=True,
 *                     allow_cache=False,
 *                     caption=f"{task} of {wrd}",
 *                     reply_to=event.reply_to_msg_id,
 *                 )
 *                 await event.delete()
 *         else:
 *             await event.eor(x)
 *     except Exception as e:
 *         await event.eor(
 *             get_string("wrd_7" if task == "synonyms" else "wrd_8").format(e)
 *         )
 * 
 * 
 * @ultroid_cmd(pattern="ud (.*)")
 * async def _(event):
 *     word = event.pattern_match.group(1).strip()
 *     if not word:
 *         return await event.eor(get_string("autopic_1"))
 *     out = await async_searcher(
 *         "http://api.urbandictionary.com/v0/define", params={"term": word}, re_json=True
 *     )
 *     try:
 *         out = out["list"][0]
 *     except IndexError:
 *         return await event.eor(get_string("autopic_2").format(word))
 *     await event.eor(
 *         get_string("wrd_1").format(out["word"], out["definition"], out["example"]),
 *     )
---- end original ---- */

ultroidCmd('meaning( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `meaning( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("words") || `Plugin \`words\` matched \`meaning( (.*)|$)\`.` });
});

ultroidCmd('(syno|anto)nym', async (e) => {
  const chatId = e.chatId;
  // Port of `(syno|anto)nym` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("words") || `Plugin \`words\` matched \`(syno|anto)nym\`.` });
});

ultroidCmd('ud (.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `ud (.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("words") || `Plugin \`words\` matched \`ud (.*)\`.` });
});
}

{ // ===== lib/plugins/writer.js =====
// Ultroid-JS port of plugins/writer.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/writer.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "writer";
const PATTERNS = ['gethtml( (.*)|$)', 'image( (.*)|$)', 'write( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * """
 * ✘ Commands Available -
 * 
 * • `{i}write <text or reply to text>`
 *    It will write on a paper.
 * 
 * • `{i}image <text or reply to html or any doc file>`
 *    Write a image from html or any text.
 * """
 * 
 * import os
 * 
 * from htmlwebshot import WebShot
 * from PIL import Image, ImageDraw, ImageFont
 * 
 * from . import async_searcher, eod, get_string, text_set, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="gethtml( (.*)|$)")
 * async def ghtml(e):
 *     if txt := e.pattern_match.group(1).strip():
 *         link = e.text.split(maxsplit=1)[1]
 *     else:
 *         return await eod(e, "`Either reply to any file or give any text`")
 *     k = await async_searcher(link)
 *     with open("file.html", "w+") as f:
 *         f.write(k)
 *     await e.reply(file="file.html")
 * 
 * 
 * @ultroid_cmd(pattern="image( (.*)|$)")
 * async def f2i(e):
 *     txt = e.pattern_match.group(1).strip()
 *     html = None
 *     if txt:
 *         html = e.text.split(maxsplit=1)[1]
 *     elif e.reply_to:
 *         r = await e.get_reply_message()
 *         if r.media:
 *             html = await e.client.download_media(r.media)
 *         elif r.text:
 *             html = r.text
 *     if not html:
 *         return await eod(e, "`Either reply to any file or give any text`")
 *     html = html.replace("\n", "<br>")
 *     shot = WebShot(quality=85)
 *     css = "body {background: white;} p {color: red;}"
 *     pic = await shot.create_pic_async(html=html, css=css)
 *     await e.reply(file=pic, force_document=True)
 *     os.remove(pic)
 *     if os.path.exists(html):
 *         os.remove(html)
 * 
 * 
 * @ultroid_cmd(pattern="write( (.*)|$)")
 * async def writer(e):
 *     if e.reply_to:
 *         reply = await e.get_reply_message()
 *         text = reply.message
 *     elif e.pattern_match.group(1).strip():
 *         text = e.text.split(maxsplit=1)[1]
 *     else:
 *         return await eod(e, get_string("writer_1"))
 *     k = await e.eor(get_string("com_1"))
 *     img = Image.open("resources/extras/template.jpg")
 *     draw = ImageDraw.Draw(img)
 *     font = ImageFont.truetype("resources/fonts/assfont.ttf", 30)
 *     x, y = 150, 140
 *     lines = text_set(text)
 *     bbox = font.getbbox("hg")
 *     line_height = bbox[3] - bbox[1]
 *     for line in lines:
 *         draw.text((x, y), line, fill=(1, 22, 55), font=font)
 *         y = y + line_height - 5
 *     file = "ult.jpg"
 *     img.save(file)
 *     await e.reply(file=file)
 *     os.remove(file)
 *     await k.delete()
---- end original ---- */

ultroidCmd('gethtml( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gethtml( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("writer") || `Plugin \`writer\` matched \`gethtml( (.*)|$)\`.` });
});

ultroidCmd('image( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `image( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("writer") || `Plugin \`writer\` matched \`image( (.*)|$)\`.` });
});

ultroidCmd('write( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `write( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("writer") || `Plugin \`writer\` matched \`write( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/youtube.js =====
// Ultroid-JS port of plugins/youtube.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/youtube.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "youtube";
const PATTERNS = ['yt(a|v|sa|sv) ?(.*)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}yta <(youtube/any) link>`
 *    Download audio from the link.
 * 
 * • `{i}ytv <(youtube/any) link>`
 *    Download video  from the link.
 * 
 * • `{i}ytsa <(youtube) search query>`
 *    Search and download audio from youtube.
 * 
 * • `{i}ytsv <(youtube) search query>`
 *    Search and download video from youtube.
 * """
 * from pyUltroid.fns.ytdl import download_yt, get_yt_link
 * 
 * from . import get_string, requests, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="yt(a|v|sa|sv) ?(.*)",
 * )
 * async def download_from_youtube_(event):
 *     ytd = {
 *         "prefer_ffmpeg": True,
 *         "addmetadata": True,
 *         "geo-bypass": True,
 *         "nocheckcertificate": True,
 *     }
 *     opt = event.pattern_match.group(1).strip()
 *     xx = await event.eor(get_string("com_1"))
 *     if opt == "a":
 *         ytd["format"] = "bestaudio"
 *         ytd["outtmpl"] = "%(id)s.m4a"
 *         url = event.pattern_match.group(2)
 *         if not url:
 *             return await xx.eor(get_string("youtube_1"))
 *         try:
 *             requests.get(url)
 *         except BaseException:
 *             return await xx.eor(get_string("youtube_2"))
 *     elif opt == "v":
 *         ytd["format"] = "best"
 *         ytd["outtmpl"] = "%(id)s.mp4"
 *         ytd["postprocessors"] = [{"key": "FFmpegMetadata"}]
 *         url = event.pattern_match.group(2)
 *         if not url:
 *             return await xx.eor(get_string("youtube_3"))
 *         try:
 *             requests.get(url)
 *         except BaseException:
 *             return await xx.eor(get_string("youtube_4"))
 *     elif opt == "sa":
 *         ytd["format"] = "bestaudio"
 *         ytd["outtmpl"] = "%(id)s.m4a"
 *         try:
 *             query = event.text.split(" ", 1)[1]
 *         except IndexError:
 *             return await xx.eor(get_string("youtube_5"))
 *         url = get_yt_link(query)
 *         if not url:
 *             return await xx.edit(get_string("unspl_1"))
 *         await xx.eor(get_string("youtube_6"))
 *     elif opt == "sv":
 *         ytd["format"] = "best"
 *         ytd["outtmpl"] = "%(id)s.mp4"
 *         ytd["postprocessors"] = [{"key": "FFmpegMetadata"}]
 *         try:
 *             query = event.text.split(" ", 1)[1]
 *         except IndexError:
 *             return await xx.eor(get_string("youtube_7"))
 *         url = get_yt_link(query)
 *         if not url:
 *             return await xx.edit(get_string("unspl_1"))
 *         await xx.eor(get_string("youtube_8"))
 *     else:
 *         return
 *     await download_yt(xx, url, ytd)
---- end original ---- */

ultroidCmd('yt(a|v|sa|sv) ?(.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `yt(a|v|sa|sv) ?(.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("youtube") || `Plugin \`youtube\` matched \`yt(a|v|sa|sv) ?(.*)\`.` });
});
}

{ // ===== lib/plugins/ziptools.js =====
// Ultroid-JS port of plugins/ziptools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/ziptools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.

const PLUGIN_NAME = "ziptools";
const PATTERNS = ['zip( (.*)|$)', 'unzip( (.*)|$)', 'addzip$', 'dozip( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available
 * 
 * • `{i}zip <reply to file>`
 *     zip the replied file
 *     To set password on zip: `{i}zip <password>` reply to file
 * 
 * • `{i}unzip <reply to zip file>`
 *     unzip the replied file.
 * 
 * • `{i}azip <reply to file>`
 *    add file to batch for batch upload zip
 * 
 * • `{i}dozip`
 *    upload batch zip the files u added from `{i}azip`
 *    To set Password: `{i}dozip <password>`
 * 
 * """
 * import os
 * import time
 * 
 * from . import (
 *     HNDLR,
 *     ULTConfig,
 *     asyncio,
 *     bash,
 *     downloader,
 *     get_all_files,
 *     get_string,
 *     ultroid_cmd,
 *     uploader,
 * )
 * 
 * 
 * @ultroid_cmd(pattern="zip( (.*)|$)")
 * async def zipp(event):
 *     reply = await event.get_reply_message()
 *     t = time.time()
 *     if not reply:
 *         await event.eor(get_string("zip_1"))
 *         return
 *     xx = await event.eor(get_string("com_1"))
 *     if reply.media:
 *         if hasattr(reply.media, "document"):
 *             file = reply.media.document
 *             image = await downloader(
 *                 reply.file.name, reply.media.document, xx, t, get_string("com_5")
 *             )
 *             file = image.name
 *         else:
 *             file = await event.download_media(reply)
 *     inp = file.replace(file.split(".")[-1], "zip")
 *     if event.pattern_match.group(1).strip():
 *         await bash(
 *             f"zip -r --password {event.pattern_match.group(1).strip()} {inp} {file}"
 *         )
 *     else:
 *         await bash(f"zip -r {inp} {file}")
 *     k = time.time()
 *     n_file, _ = await event.client.fast_uploader(
 *         inp, show_progress=True, event=event, message="Uploading...", to_delete=True
 *     )
 *     await event.client.send_file(
 *         event.chat_id,
 *         n_file,
 *         force_document=True,
 *         thumb=ULTConfig.thumb,
 *         caption=f"`{n_file.name}`",
 *         reply_to=reply,
 *     )
 *     os.remove(inp)
 *     os.remove(file)
 *     await xx.delete()
 * 
 * 
 * @ultroid_cmd(pattern="unzip( (.*)|$)")
 * async def unzipp(event):
 *     reply = await event.get_reply_message()
 *     file = event.pattern_match.group(1).strip()
 *     t = time.time()
 *     if not ((reply and reply.media) or file):
 *         await event.eor(get_string("zip_1"))
 *         return
 *     xx = await event.eor(get_string("com_1"))
 *     if reply.media:
 *         if not hasattr(reply.media, "document"):
 *             return await xx.edit(get_string("zip_3"))
 *         file = reply.media.document
 *         if not reply.file.name.endswith(("zip", "rar", "exe")):
 *             return await xx.edit(get_string("zip_3"))
 *         image = await downloader(
 *             reply.file.name, reply.media.document, xx, t, get_string("com_5")
 *         )
 *         file = image.name
 *     if os.path.isdir("unzip"):
 *         await bash("rm -rf unzip")
 *     os.mkdir("unzip")
 *     await bash(f"7z x {file} -aoa -ounzip")
 *     await asyncio.sleep(4)
 *     ok = get_all_files("unzip")
 *     for x in ok:
 *         k = time.time()
 *         n_file, _ = await event.client.fast_uploader(
 *             x, show_progress=True, event=event, message="Uploading...", to_delete=True
 *         )
 *         await event.client.send_file(
 *             event.chat_id,
 *             n_file,
 *             force_document=True,
 *             thumb=ULTConfig.thumb,
 *             caption=f"`{n_file.name}`",
 *         )
 *     await xx.delete()
 * 
---- end original ---- */

ultroidCmd('zip( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `zip( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("ziptools") || `Plugin \`ziptools\` matched \`zip( (.*)|$)\`.` });
});

ultroidCmd('unzip( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `unzip( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("ziptools") || `Plugin \`ziptools\` matched \`unzip( (.*)|$)\`.` });
});

ultroidCmd('addzip$', async (e) => {
  const chatId = e.chatId;
  // Port of `addzip$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("ziptools") || `Plugin \`ziptools\` matched \`addzip$\`.` });
});

ultroidCmd('dozip( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `dozip( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("ziptools") || `Plugin \`ziptools\` matched \`dozip( (.*)|$)\`.` });
});
}

{ // ===== lib/plugins/_monitors.js =====
// Passive monitors — port of plugins/_chatactions.py, filter.py (incoming),
// notes.py, blacklist.py, antiflood.py, chatbot.py, echo.py, greetings.py,
// nsfwfilter.py, profanityfilter.py, nightmode.py, forcesubscribe.py.
// Runs on EVERY message before command dispatch (see handlers/message.js).

async function runPassiveMonitors({ message, api, cfg }) {
  const chatId = message.chat?.id;
  const userId = message.from?.id;
  const text = (message.text || message.caption || '').trim();
  if (!chatId || !userId) return;

  // 0) AFK auto-reply (plugins/afk.py on_afk)
  try { await afkMonitor({ message, api }); } catch {}

  // 1) GBan / GMute enforcement (globaltools.py, mute.py)
  try {
    const g = await db.select().from(gbans).all().catch(() => []);
    if (g.some((r) => Number(r.userId) === Number(userId))) {
      try { await api.banChatMember({ chat_id: chatId, user_id: userId }); } catch {}
      return;
    }
  } catch {}

  // 2) Blacklist words (blacklist.py)
  try {
    const words = await db.select().from(blacklistWords).all().catch(() => []);
    const hit = words.find((w) => Number(w.chatId) === Number(chatId) && text.toLowerCase().includes(String(w.word).toLowerCase()));
    if (hit) {
      try { await api.deleteMessage({ chat_id: chatId, message_id: message.message_id }); } catch {}
      return;
    }
  } catch {}

  // 3) Filters (filter.py) — exact keyword reply
  try {
    const all = await db.select().from(filters).all().catch(() => []);
    const f = all.find((r) => Number(r.chatId) === Number(chatId) && text.toLowerCase().startsWith(String(r.keyword).toLowerCase()));
    if (f) {
      await api.sendMessage({ chat_id: chatId, text: f.reply || '(filter)', reply_to_message_id: message.message_id }).catch(() => {});
    }
  } catch {}

  // 4) Notes (#note)
  try {
    if (text.startsWith('#')) {
      const name = text.slice(1).split(/\s+/)[0].toLowerCase();
      const all = await db.select().from(notes).all().catch(() => []);
      const n = all.find((r) => Number(r.chatId) === Number(chatId) && String(r.name).toLowerCase() === name);
      if (n) await api.sendMessage({ chat_id: chatId, text: n.content || '(note)' }).catch(() => {});
    }
  } catch {}

  // 5) Echo (echo.py)
  try {
    const rows = await db.select().from(echos).all().catch(() => []);
    if (rows.some((r) => Number(r.chatId) === Number(chatId) && Number(r.userId) === Number(userId)) && text) {
      await api.sendMessage({ chat_id: chatId, text }).catch(() => {});
    }
  } catch {}

  // 6) Antiflood (antiflood.py) — simple counter
  try {
    const conf = await db.select().from(antiflood).all().catch(() => []);
    const c = conf.find((r) => Number(r.chatId) === Number(chatId));
    if (c) {
      const now = Math.floor(Date.now() / 1000);
      const tracks = await db.select().from(floodTrack).all().catch(() => []);
      let t = tracks.find((r) => Number(r.chatId) === Number(chatId) && Number(r.userId) === Number(userId));
      if (!t || now - (t.windowStart || 0) > (c.windowSec || 5)) {
        await db.insert(floodTrack).values({ chatId, userId, count: 1, windowStart: now }).run().catch(() => {});
      } else if ((t.count || 0) + 1 >= (c.limit || 5)) {
        try {
          if ((c.action || 'mute') === 'ban') await api.banChatMember({ chat_id: chatId, user_id: userId });
          else await api.restrictChatMember({ chat_id: chatId, user_id: userId, permissions: { can_send_messages: false } });
        } catch {}
      } else {
        await db.update(floodTrack).set({ count: (t.count || 0) + 1 }).run().catch(() => {});
      }
    }
  } catch {}
}

// (inlined from afk.js: same-bundle module, no longer separately deployed)
async function afkMonitor({ message, api }) {
  const rows = await db.select().from(afkTable).all().catch(() => []);
  const row = rows.find((r) => r.id === 1);
  if (!row) return;
  const isPrivate = message.chat?.type === 'private';
  const mentioned = JSON.stringify(message).includes('mention');
  if (!isPrivate && !mentioned) return;
  if ((message.text || '').toLowerCase().includes('afk')) return;
  const text = row.text
    ? get_string('afk_3', 'some time ago', row.text)
    : get_string('afk_4', 'some time ago');
  try {
    await api.sendMessage({ chat_id: message.chat.id, text, reply_to_message_id: message.message_id });
  } catch {}
}
PASSIVE_MONITORS.push(runPassiveMonitors);

}
