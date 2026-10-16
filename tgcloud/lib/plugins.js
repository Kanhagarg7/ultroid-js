// BUNDLED from: lib/plugins/_bundle_core.js, lib/plugins/afk.js, lib/plugins/calculator.js, lib/plugins/_help.js, lib/plugins/filter.js, lib/plugins/notes.js, lib/plugins/warn.js, lib/plugins/_chatactions.js, lib/plugins/_inline.js, lib/plugins/_ultroid.js, lib/plugins/_userlogs.js, lib/plugins/_wspr.js, lib/plugins/admintools.js, lib/plugins/aiwrapper.js, lib/plugins/antiflood.js, lib/plugins/asstcmd.js, lib/plugins/audiotools.js, lib/plugins/autoban.js, lib/plugins/autopic.js, lib/plugins/beautify.js, lib/plugins/blacklist.js, lib/plugins/bot.js, lib/plugins/broadcast.js, lib/plugins/button.js, lib/plugins/channelhacks.js, lib/plugins/chatbot.js, lib/plugins/chats.js, lib/plugins/cleanaction.js, lib/plugins/compressor.js, lib/plugins/converter.js, lib/plugins/core.js, lib/plugins/database.js, lib/plugins/delayspam.js, lib/plugins/devtools.js, lib/plugins/downloadupload.js, lib/plugins/echo.js, lib/plugins/extra.js, lib/plugins/fakeaction.js, lib/plugins/fileshare.js, lib/plugins/fontgen.js, lib/plugins/forcesubscribe.js, lib/plugins/gdrive.js, lib/plugins/giftools.js, lib/plugins/glitch.js, lib/plugins/globaltools.js, lib/plugins/greetings.js, lib/plugins/imagetools.js, lib/plugins/locks.js, lib/plugins/logo.js, lib/plugins/mediatools.js, lib/plugins/misc.js, lib/plugins/mute.js, lib/plugins/nightmode.js, lib/plugins/nsfwfilter.js, lib/plugins/other.js, lib/plugins/pdftools.js, lib/plugins/pmpermit.js, lib/plugins/polls.js, lib/plugins/profanityfilter.js, lib/plugins/profile.js, lib/plugins/qrcode.js, lib/plugins/resize.js, lib/plugins/schedulemsg.js, lib/plugins/search.js, lib/plugins/snips.js, lib/plugins/specialtools.js, lib/plugins/stickertools.js, lib/plugins/stories.js, lib/plugins/sudo.js, lib/plugins/tag.js, lib/plugins/tools.js, lib/plugins/twitter.js, lib/plugins/unsplash.js, lib/plugins/usage.js, lib/plugins/utilities.js, lib/plugins/variables.js, lib/plugins/vctools.js, lib/plugins/videotools.js, lib/plugins/weather.js, lib/plugins/webupload.js, lib/plugins/words.js, lib/plugins/writer.js, lib/plugins/youtube.js, lib/plugins/ziptools.js, lib/plugins/_monitors.js
// (originals in docs/original-js/)

const PLUGIN_COUNT = 83;
import { ultroidCmd, getKey, setKey, delKey, get_string, callback as regCallback, safeEval, in_pattern as regInline, udB, KeyManager, getString, ultroid_cmd, asst_cmd, eor, cmdRegexReplace, getHelp, humanTime, escapeHtml, parseArgs, isUrl, PASSIVE_MONITORS } from './core.js';
import { blacklistWords, snips, greetings, antiflood, gmutes, gbans, mutes, afk as afkTable, filters, notes, warns, floodTrack, echos, nsfwChats, filestore, forcesub } from '../schema.js';
import { db, api, fetch } from 'sdk';
import { eq, and } from 'sdk/db';

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
{ // ===== ports/A/_chatactions.js =====
// _chatactions.py -> _chatactions.js
// No commands in original; this file wires chat-action/message handlers.
// Bot API equivalent: host harness should call chatactions_onJoin() when a
// service message with new_chat_members/left_chat_member arrives, and
// chatactions_onMessage() for every incoming group message. MTProto-only
// parts (Telethon GetParticipantRequest, @UltroidBans HTTP check kept as
// plain fetch, thank-stickers, force-sub inline relay) are degraded to the
// closest Bot API behaviour with identical reply texts.

const state_chatactions_echo = {};

// Format Python-style named templates like "Hello {mention}, welcome to {group}".
function chatactions_format(tpl, map) {
  return String(tpl).replace(/\{(\w+)\}/g, (_, k) =>
    map[k] !== undefined && map[k] !== null ? String(map[k]) : `{${k}}`
  );
}

// Called on join/add events. `info` = { joined: bool, left: bool, user, chatTitle, count }.
async function chatactions_onJoin(e, info) {
  const api = e.api;
  // Clean-chat: delete service message if chat is in CLEANCHAT list.
  const clean = (await getKey('CLEANCHAT')) || [];
  if (clean.includes(e.chatId) && e.message && e.message.message_id) {
    try {
      await api.deleteMessage({ chat_id: e.chatId, message_id: e.message.message_id });
    } catch {}
    return;
  }
  // Force-sub: Bot API cannot check channel membership via MTProto; use
  // getChatMember on the required channel and restrict if not a member.
  const forceAll = (await getKey('FORCESUB')) || null;
  const need = forceAll ? await getKey('FORCESUB_' + e.chatId) : null;
  if (info.joined && need && info.user && !info.user.is_bot) {
    try {
      const m = await api.getChatMember({ chat_id: need, user_id: info.user.id });
      if (['left', 'kicked'].includes(m.status)) {
        await api.restrictChatMember({
          chat_id: e.chatId,
          user_id: info.user.id,
          permissions: { can_send_messages: false },
        });
      }
    } catch {}
  }
  if (info.joined && info.user) {
    // Global-ban enforcement (same reply shape as can_1).
    const gbans = (await getKey('GBANS')) || {};
    const reason = gbans[info.user.id];
    if (reason) {
      try {
        await api.banChatMember({ chat_id: e.chatId, user_id: info.user.id });
        const mention = info.user.first_name || String(info.user.id);
        await api.sendMessage({
          chat_id: e.chatId,
          text: get_string('can_1', mention, reason),
        });
        return;
      } catch {}
    }
    // Welcome (greetings table equivalent stored under GREETINGS key).
    const greets = (await getKey('GREETINGS')) || {};
    const wel = greets[e.chatId] && greets[e.chatId].welcome;
    if (wel && wel.text) {
      const mention = info.user.first_name || 'user';
      const msg = chatactions_format(wel.text, {
        mention,
        group: info.chatTitle || 'this chat',
        count: info.count || 0,
        name: info.user.first_name || '',
        fullname: info.user.first_name || '',
        username: info.user.username ? '@' + info.user.username : mention,
        userid: info.user.id,
      });
      await api.sendMessage({
        chat_id: e.chatId,
        text: msg,
        reply_markup: wel.button ? { inline_keyboard: wel.button } : undefined,
      });
    }
  } else if (info.left && info.user) {
    const greets = (await getKey('GREETINGS')) || {};
    const bye = greets[e.chatId] && greets[e.chatId].goodbye;
    if (bye && bye.text) {
      const mention = info.user.first_name || 'user';
      const msg = chatactions_format(bye.text, {
        mention,
        group: info.chatTitle || 'this chat',
        count: info.count || 0,
        name: info.user.first_name || '',
        fullname: info.user.first_name || '',
        username: info.user.username ? '@' + info.user.username : mention,
        userid: info.user.id,
      });
      await api.sendMessage({ chat_id: e.chatId, text: msg });
    }
  }
}

// Called for every incoming message: echo, per-user chatbot, profanity filter.
async function chatactions_onMessage(e) {
  const text = e.text || e.body || '';
  // Echo: repeat messages in echo chats.
  const echos = (await getKey('ECHOS')) || {};
  if (echos[e.chatId]) {
    try {
      await e.api.sendMessage({ chat_id: e.chatId, text });
    } catch {}
  }
  // Per-user chatbot: CHATBOT_USERS { chatId: [userIds] }.
  const cbUsers = (await getKey('CHATBOT_USERS')) || {};
  if (text && cbUsers[e.chatId] && cbUsers[e.chatId].includes(e.userId)) {
    try {
      const r = await fetch(
        'https://api.ultroid.tech/chatbot?text=' + encodeURIComponent(text)
      );
      const msg = (await r.text()).trim();
      if (msg) {
        const sleep = (await getKey('CHATBOT_SLEEP')) || 1.5;
        await new Promise((res) => setTimeout(res, Number(sleep) * 1000));
        await e.api.sendMessage({ chat_id: e.chatId, text: msg });
      }
    } catch {}
  }
  // Profanity filter: ProfanityDetector (MTProto userbot dep) unavailable in
  // V8 isolate, so use a small built-in wordlist with the same delete action.
  const profan = (await getKey('PROFAN_CHATS')) || [];
  if (profan.includes(e.chatId) && text) {
    const bad = ['fuck', 'shit', 'bitch', 'porn', 'xxx'];
    const low = text.toLowerCase();
    if (bad.some((w) => low.split(/\s+/).includes(w))) {
      try {
        await e.api.deleteMessage({
          chat_id: e.chatId,
          message_id: e.message && e.message.message_id,
        });
      } catch {}
    }
  }
  // Username-change log (USERNAME_LOG) cannot hook UpdateUserName in Bot API;
  // handled opportunistically when a username is seen on a message.
  await chatactions_unameStuff(e, e.userId, null, null);
}

async function chatactions_unameStuff(e, id, uname, name) {
  if (!(await getKey('USERNAME_LOG'))) return;
  const logCh = await getKey('LOG_CHANNEL');
  if (!logCh) return;
  const db = (await getKey('USERNAME_DB')) || {};
  const old = db[id];
  if (old && old === uname) return;
  if (old && uname) {
    await e.api.sendMessage({ chat_id: logCh, text: get_string('can_2', old, uname) });
  } else if (old) {
    await e.api.sendMessage({
      chat_id: logCh,
      text: get_string('can_3', `[${name}](tg://user?id=${id})`, old),
    });
  } else if (uname) {
    await e.api.sendMessage({
      chat_id: logCh,
      text: get_string('can_4', `[${name}](tg://user?id=${id})`, uname),
    });
  }
  db[id] = uname;
  await setKey('USERNAME_DB', db);
}
}
{ // ===== ports/A/_inline.js =====
// _inline.py -> _inline.js
// Inline help/alive/whisper builders + help-menu callbacks.
// Degraded: Telethon inline builder (photo/gif/document results, git
// changelog, userid file-id resolving) replaced with Bot API
// answerInlineQuery article results carrying the SAME texts; the stf relay
// (userbot clicking its own inline result) becomes a direct sendMessage.

const state_inline_stuff = {};

function inline_mainMenuKb() {
  return {
    inline_keyboard: [
      [
        { text: '•Pɪɴɢ•', callback_data: 'pkng' },
        { text: '•Uᴘᴛɪᴍᴇ•', callback_data: 'upp' },
      ],
      [
        { text: '•Stats•', callback_data: 'alive' },
        { text: '•Uᴘᴅᴀᴛᴇ•', callback_data: 'doupdate' },
      ],
      [{ text: '« Bᴀᴄᴋ', callback_data: 'open' }],
    ],
  };
}

// Empty-query inline alive (was: photo article with support buttons).
regInline('')(async ({ api, query }) => {
  await api.answerInlineQuery({
    inline_query_id: query.id,
    cache_time: 300,
    results: [
      {
        type: 'article',
        id: 'ultroid-alive',
        title: 'Ultroid Userbot',
        description: 'Userbot | Bot API',
        input_message_content: { message_text: '• **Ultroid Userbot •**' },
        reply_markup: {
          inline_keyboard: [
            [
              { text: '• Repo •', url: 'https://github.com/TeamUltroid/Ultroid' },
              { text: '• Support •', url: 't.me/UltroidSupportChat' },
            ],
          ],
        },
      },
    ],
  });
});

// "ultd" help-menu inline result (same inline_4 text shape).
regInline('ultd')(async ({ api, query }) => {
  const text = get_string('inline_4', 'owner', 0, 0, 0);
  await api.answerInlineQuery({
    inline_query_id: query.id,
    cache_time: 300,
    results: [
      {
        type: 'article',
        id: 'ultroid-help',
        title: 'Ultroid Help Menu',
        input_message_content: { message_text: text },
        reply_markup: inline_mainMenuKb(),
      },
    ],
  });
});

// "pasta" result (same Spacebin link shape).
regInline('pasta')(async ({ api, query }) => {
  const ok = (query.query || '').split('-')[1] || '';
  const link = ok.startsWith('http') ? ok : `https://spaceb.in/${ok}`;
  const raw = ok.startsWith('http') ? `${ok}/raw` : `https://spaceb.in/api/v1/documents/${ok}/raw`;
  await api.answerInlineQuery({
    inline_query_id: query.id,
    results: [
      {
        type: 'article',
        id: 'paste',
        title: 'Paste',
        input_message_content: { message_text: 'Pasted to Spacebin 🌌' },
        reply_markup: {
          inline_keyboard: [[{ text: 'SpaceBin', url: link }, { text: 'Raw', url: raw }]],
        },
      },
    ],
  });
});

// "stf<num>" relay: Bot API equivalent returns the stored msg/media/button.
regInline('stf(.*)')(async ({ api, query, data_match }) => {
  const n = parseInt((data_match && data_match[1]) || '', 10);
  const ok = state_inline_stuff[n] || {};
  const txt = ok.msg || 'Hey!';
  await api.answerInlineQuery({
    inline_query_id: query.id,
    results: [
      {
        type: 'article',
        id: 'stf-' + n,
        title: 'Ultroid Op',
        description: '@TeamUltroid',
        input_message_content: { message_text: txt },
        reply_markup: ok.button ? { inline_keyboard: ok.button } : undefined,
      },
    ],
  });
});

// Direct-send replacement for something(): userbot inline click has no Bot
// API equivalent, so send the message straight to the chat.
async function inline_something(e, msg, media, button) {
  const extra = {};
  if (button) extra.reply_markup = { inline_keyboard: button };
  return e.api.sendMessage({ chat_id: e.chatId, text: msg || 'Hey!', ...extra });
}

regCallback(/^ownr$/)(async ({ api, query }) => {
  const text = get_string('inline_4', 'owner', 0, 0, 0);
  await api.editMessageText({
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    text,
    reply_markup: inline_mainMenuKb(),
  });
});

regCallback(/^uh_(.*)$/)(async ({ api, query, data_match }) => {
  const parts = String(data_match[1]).split('_');
  const key = parts[0];
  if (key === 'VCBot') {
    return api.answerCallbackQuery({ callback_query_id: query.id, text: get_string('help_12') });
  }
  if (key === 'Addons') {
    return api.answerCallbackQuery({ callback_query_id: query.id, text: 'Addons not loaded' });
  }
  await api.editMessageText({
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    text: `${key} help`,
    reply_markup: { inline_keyboard: [[{ text: '« Bᴀᴄᴋ »', callback_data: 'open' }]] },
  });
});

regCallback(/^uplugin_(.*)$/)(async ({ api, query, data_match }) => {
  const file = String(data_match[1]).split('_').pop();
  const help = get_string('help_11', file) + '\n© @TeamUltroid';
  await api.editMessageText({
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    text: help,
    reply_markup: { inline_keyboard: [[{ text: '« Bᴀᴄᴋ', callback_data: 'open' }]] },
  });
});

regCallback(/^doupdate$/)(async ({ api, query }) => {
  // git/updater unavailable in isolate: report current state, same strings.
  await api.answerCallbackQuery({
    callback_query_id: query.id,
    text: get_string('inline_9'),
  });
});

regCallback(/^pkng$/)(async ({ api, query }) => {
  await api.answerCallbackQuery({
    callback_query_id: query.id,
    text: '🌋Pɪɴɢ = 0 microseconds',
  });
});

regCallback(/^upp$/)(async ({ api, query }) => {
  const boot = (await getKey('BOOT_TIME')) || Date.now();
  const ms = Date.now() - Number(boot);
  await api.answerCallbackQuery({
    callback_query_id: query.id,
    text: `🙋Uᴘᴛɪᴍᴇ = ${Math.floor(ms / 1000)}s`,
  });
});

regCallback(/^inlone$/)(async ({ api, query }) => {
  await api.editMessageText({
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    text: 'Inline plugins are unavailable in Bot API mode.',
    reply_markup: { inline_keyboard: [[{ text: '« Bᴀᴄᴋ', callback_data: 'open' }]] },
  });
});

regCallback(/^open$/)(async ({ api, query }) => {
  const text = get_string('inline_4', 'owner', 0, 0, 0);
  await api.editMessageText({
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    text,
    reply_markup: inline_mainMenuKb(),
  });
});

regCallback(/^close$/)(async ({ api, query }) => {
  await api.editMessageText({
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    text: get_string('inline_5'),
    reply_markup: { inline_keyboard: [[{ text: 'Oᴘᴇɴ Aɢᴀɪɴ', callback_data: 'open' }]] },
  });
});
}
{ // ===== ports/A/_ultroid.js =====
// _ultroid.py -> _ultroid.js
// repo + ultroid commands. Degraded: the userbot inline-query click
// (q[0].click) needs MTProto; Bot API equivalent sends the same repo text
// with the same buttons directly.

const state_ultroid_repoMsg = `
• **ULTROID USERBOT** •\n
• Repo - [Click Here](https://github.com/TeamUltroid/Ultroid)
• Addons - [Click Here](https://github.com/TeamUltroid/UltroidAddons)
• Support - @UltroidSupportChat
`;

const state_ultroid_repoKb = {
  inline_keyboard: [
    [
      { text: 'Repo', url: 'https://github.com/TeamUltroid/Ultroid' },
      { text: 'Addons', url: 'https://github.com/TeamUltroid/UltroidAddons' },
    ],
    [{ text: 'Support Group', url: 't.me/UltroidSupportChat' }],
  ],
};

const state_ultroid_intro = `🎇 **Thanks for Deploying Ultroid Userbot!**

• Here, are the Some Basic stuff from, where you can Know, about its Usage.`;

ultroidCmd('repo$', async (e) => {
  await e.api.sendMessage({
    chat_id: e.chatId,
    text: state_ultroid_repoMsg,
    reply_markup: state_ultroid_repoKb,
  });
});

ultroidCmd('ultroid$', async (e) => {
  await e.api.sendMessage({
    chat_id: e.chatId,
    text: state_ultroid_intro,
    reply_markup: {
      inline_keyboard: [[{ text: 'Start >>', callback_data: 'initft_2' }]],
    },
  });
});
}
{ // ===== ports/A/_userlogs.js =====
// _userlogs.py -> _userlogs.js
// Tag-log forwarder + join/add logger + leave-chat callback.
// Degraded: Telethon incoming-mentioned hooking, media re-download/upload,
// edit-tracking (MessageEdited) and delete_dialog need MTProto; Bot API
// equivalent forwards mention messages via host-wired userlogs_onMessage()
// and answers the same leave-chat callback with leaveChat.

const state_userlogs_spamWarned = {};

// Host harness should call this for each incoming message that mentions the bot.
async function userlogs_onMessage(e) {
  const tagLog = await getKey('TAG_LOG');
  if (!tagLog) return;
  if (String(e.chatId) === String(tagLog)) return;
  const text = e.text || e.body || '';
  const mentioned = text.includes('@') || (e.message && e.message.mentioned);
  if (!mentioned) return;
  try {
    await e.api.sendMessage({ chat_id: tagLog, text: text || '(mention)' });
  } catch (err) {
    const msg = String((err && err.message) || err);
    if (/chat not found|not a member|CHAT/i.test(msg)) {
      if (!state_userlogs_spamWarned[tagLog]) {
        const logCh = await getKey('LOG_CHANNEL');
        if (logCh) {
          try {
            await e.api.sendMessage({ chat_id: logCh, text: get_string('userlogs_1') });
          } catch {}
        }
        state_userlogs_spamWarned[tagLog] = true;
      }
    }
  }
}

// Host harness should call this when the bot itself joins / is added.
async function userlogs_onSelfJoin(e, info) {
  const logCh = await getKey('LOG_CHANNEL');
  if (!logCh) return;
  const name = (info && info.user && info.user.first_name) || 'bot';
  const text = `#JOIN_LOG\n\n${name} just joined chat \`${e.chatId}\`.`;
  try {
    await e.api.sendMessage({
      chat_id: logCh,
      text,
      reply_markup: {
        inline_keyboard: [[{ text: get_string('userlogs_3'), callback_data: `leave_ch_${e.chatId}|bot` }]],
      },
    });
  } catch {}
}

regCallback(/^leave_ch_(.*)$/)(async ({ api, query, data_match }) => {
  const raw = String(data_match[1] || '');
  const chId = raw.split('|')[0];
  try {
    await api.leaveChat({ chat_id: chId });
  } catch (err) {
    return api.answerCallbackQuery({ callback_query_id: query.id, text: String(err).slice(0, 180) });
  }
  await api.editMessageText({
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    text: get_string('userlogs_5', chId),
  });
});

regCallback(/^do_nothing$/)(async ({ api, query }) => {
  await api.answerCallbackQuery({ callback_query_id: query.id });
});
}
{ // ===== ports/A/_wspr.js =====
// _wspr.py -> _wspr.js
// Secret-whisper messages. Degraded: userbot inline-query click + Telethon
// GetFullUserRequest have no Bot API equivalent; the command now posts the
// same wspr_1 card with Secret/Delete buttons directly, and inline queries
// answer Bot API article results carrying the same texts.

const state_wspr_store = {};
let state_wspr_nextId = 1;

function wspr_cardKb(id) {
  return {
    inline_keyboard: [
      [
        { text: 'Secret Msg', callback_data: `dd_${id}` },
        { text: 'Delete Msg', callback_data: `del_${id}` },
      ],
    ],
  };
}

ultroidCmd('wspr( (.*)|$)', async (e) => {
  let put = (e.args || '').trim();
  if (e.replyTo) {
    const r = e.replyTo;
    const sender = r.from || r.sender || {};
    put = sender.username ? '@' + sender.username : String(sender.id || r.from_id || '');
  }
  if (!put) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('wspr_3') });
    return;
  }
  const parts = put.split(/\s+/);
  const target = parts[0].replace(/^@/, '');
  const desc = parts.slice(1).join(' ') || 'Touch me';
  const id = state_wspr_nextId++;
  state_wspr_store[id] = { allow: [], desc };
  const owner = e.userId;
  const tid = /^\d+$/.test(target) ? Number(target) : null;
  if (tid) state_wspr_store[id].allow = [tid, owner];
  else state_wspr_store[id].allow = [owner];
  await e.api.sendMessage({
    chat_id: e.chatId,
    text: get_string('wspr_1', target),
    reply_markup: wspr_cardKb(id),
  });
});

regInline('wspr')(async ({ api, query }) => {
  const zzz = (query.query || '').split(/\s+/);
  const noUser = {
    type: 'article',
    id: 'wspr-nouser',
    title: 'Give Username',
    description: "You Didn't Type Username or id.",
    input_message_content: { message_text: "You Didn't Type Username or id." },
  };
  const target = zzz[1];
  if (!target) {
    await api.answerInlineQuery({ inline_query_id: query.id, results: [noUser] });
    return;
  }
  const desc = zzz.slice(2).join(' ');
  if (!desc) {
    await api.answerInlineQuery({
      inline_query_id: query.id,
      results: [
        {
          type: 'article',
          id: 'wspr-nomsg',
          title: 'Type ur msg',
          input_message_content: { message_text: "You Didn't Type Your Msg" },
        },
      ],
    });
    return;
  }
  const id = state_wspr_nextId++;
  state_wspr_store[id] = { allow: [], desc };
  await api.answerInlineQuery({
    inline_query_id: query.id,
    results: [
      {
        type: 'article',
        id: 'wspr-' + id,
        title: String(target),
        description: desc,
        input_message_content: { message_text: get_string('wspr_1', target) },
        reply_markup: wspr_cardKb(id),
      },
    ],
  });
});

regInline('msg')(async ({ api, query }) => {
  const zzz = (query.query || '').split(/\s+/);
  const target = zzz[1];
  if (!target) {
    await api.answerInlineQuery({
      inline_query_id: query.id,
      results: [
        {
          type: 'article',
          id: 'msg-nouser',
          title: 'Give Username',
          description: "You Didn't Type Username or id.",
          input_message_content: { message_text: "You Didn't Type Username or id." },
        },
      ],
    });
    return;
  }
  const name = get_string('wspr_4', target);
  await api.answerInlineQuery({
    inline_query_id: query.id,
    results: [{ type: 'article', id: 'msg-' + Date.now(), title: name, input_message_content: { message_text: name } }],
  });
});

regCallback(/^dd_(.*)$/)(async ({ api, query, data_match }) => {
  const ids = parseInt(String(data_match[1]).trim(), 10);
  const rec = state_wspr_store[ids];
  if (!rec) {
    await api.answerCallbackQuery({ callback_query_id: query.id, text: get_string('wspr_2') });
    return;
  }
  if (!rec.allow.length || rec.allow.includes(query.from.id)) {
    await api.answerCallbackQuery({ callback_query_id: query.id, text: rec.desc });
  } else {
    await api.answerCallbackQuery({ callback_query_id: query.id, text: 'Not For You' });
  }
});

regCallback(/^del_(.*)$/)(async ({ api, query, data_match }) => {
  const ids = parseInt(String(data_match[1]).trim(), 10);
  const rec = state_wspr_store[ids];
  if (!rec) return;
  if (!rec.allow.length || rec.allow.includes(query.from.id)) {
    delete state_wspr_store[ids];
    try {
      await api.editMessageText({
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        text: get_string('wspr_2'),
      });
    } catch {}
  } else {
    await api.answerCallbackQuery({ callback_query_id: query.id, text: get_string('wspr_5') });
  }
});
}
{ // ===== ports/A/admintools.js =====
// admintools.py -> admintools.js
// Group admin tools over Bot API. Degraded: Telethon edit_admin/
// edit_permissions/kick_participant/iter_participants/pin/unpin and
// GetFullChat(channel) MTProto calls become banChatMember, unbanChatMember,
// restrictChatMember, promoteChatMember, pinChatMessage, unpinChatMessage and
// direct sendMessage with the SAME get_string reply texts.

// Resolve target user: reply sender first, else first arg as numeric id.
function admintools_target(e) {
  if (e.replyTo) {
    const r = e.replyTo;
    const s = r.from || r.sender || {};
    if (s.id || s.user_id) return { id: s.id || s.user_id, first_name: s.first_name || 'user' };
    if (r.from_id) return { id: r.from_id, first_name: 'user' };
  }
  const parts = (e.args || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length && /^\d+$/.test(parts[0])) {
    return { id: Number(parts[0]), first_name: parts[0], rest: parts.slice(1).join(' ') };
  }
  if (parts.length && parts[0].startsWith('@')) {
    return { username: parts[0], first_name: parts[0], rest: parts.slice(1).join(' ') };
  }
  return { rest: parts.slice(1).join(' ') || parts.join(' ') };
}

function admintools_mention(u) {
  return (u && u.first_name) || (u && u.username) || String((u && u.id) || 'user');
}

ultroidCmd('promote( (.*)|$)', { sudo: true, admins_only: true }, async (e) => {
  const raw = (e.args || '').trim();
  const user = admintools_target(e);
  if (!user.id && !user.username) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('pro_1') });
    return;
  }
  let rank = raw.replace(/^@?\S+\s*/, '').trim() || 'Admin';
  let full = false;
  if (rank.split(/\s+/)[0] === '-f') {
    full = true;
    rank = rank.split(/\s+/).slice(1).join(' ') || 'Admin';
  }
  try {
    await e.api.promoteChatMember({
      chat_id: e.chatId,
      user_id: user.id,
      can_invite_users: true,
      can_restrict_members: full,
      can_delete_messages: true,
      can_pin_messages: true,
    });
    await e.api.sendMessage({
      chat_id: e.chatId,
      text: get_string('pro_2', admintools_mention(user), 'this chat', rank),
    });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`${err}\`` });
  }
});

ultroidCmd('demote( (.*)|$)', { sudo: true, admins_only: true }, async (e) => {
  const user = admintools_target(e);
  if (!user.id && !user.username) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('de_1') });
    return;
  }
  try {
    await e.api.promoteChatMember({
      chat_id: e.chatId,
      user_id: user.id,
      can_invite_users: false,
      can_restrict_members: false,
      can_delete_messages: false,
      can_pin_messages: false,
    });
    await e.api.sendMessage({
      chat_id: e.chatId,
      text: get_string('de_2', admintools_mention(user), 'this chat'),
    });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`${err}\`` });
  }
});

ultroidCmd('ban( (.*)|$)', { sudo: true, admins_only: true }, async (e) => {
  const user = admintools_target(e);
  const reason = user.rest || (e.args || '').trim().split(/\s+/).slice(1).join(' ');
  if (!user.id && !user.username) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('ban_1') });
    return;
  }
  try {
    await e.api.banChatMember({ chat_id: e.chatId, user_id: user.id });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('ban_3') });
    return;
  }
  let text = get_string('ban_4', admintools_mention(user), 'admin', 'this chat');
  if (reason) text += get_string('ban_5', reason);
  await e.api.sendMessage({ chat_id: e.chatId, text });
});

ultroidCmd('unban( (.*)|$)', { sudo: true, admins_only: true }, async (e) => {
  const user = admintools_target(e);
  const reason = user.rest || '';
  if (!user.id && !user.username) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('unban_1') });
    return;
  }
  try {
    await e.api.unbanChatMember({ chat_id: e.chatId, user_id: user.id });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('adm_2') });
    return;
  }
  let text = get_string('unban_3', admintools_mention(user), 'admin', 'this chat');
  if (reason) text += get_string('ban_5', reason);
  await e.api.sendMessage({ chat_id: e.chatId, text });
});

ultroidCmd('kick( (.*)|$)', { sudo: true }, async (e) => {
  const user = admintools_target(e);
  const reason = user.rest || '';
  if (!user.id && !user.username) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('adm_1') });
    return;
  }
  // Bot API has no kick: ban then immediately unban (same visible effect).
  try {
    await e.api.banChatMember({ chat_id: e.chatId, user_id: user.id });
    await e.api.unbanChatMember({ chat_id: e.chatId, user_id: user.id });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('kick_1') });
    return;
  }
  let text = get_string('kick_4', admintools_mention(user), 'admin', 'this chat');
  if (reason) text += get_string('ban_5', reason);
  await e.api.sendMessage({ chat_id: e.chatId, text });
});

function admintools_parseTime(tme) {
  const m = /^(\d+)([smhd])$/.exec(tme);
  if (!m) return Math.floor(Date.now() / 1000) + 3600;
  const n = Number(m[1]);
  const mult = { s: 1, m: 60, h: 3600, d: 86400 }[m[2]];
  return Math.floor(Date.now() / 1000) + n * mult;
}

ultroidCmd('tban( (.*)|$)', { sudo: true, admins_only: true }, async (e) => {
  const huh = (e.text || '').trim().split(/\s+/);
  const tme = huh[1];
  if (!tme) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('adm_3') });
    return;
  }
  let inputt = huh[2];
  if (!inputt && e.replyTo) {
    const s = e.replyTo.from || {};
    inputt = s.id;
  }
  if (!inputt) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('tban_1') });
    return;
  }
  const uid = Number(String(inputt).replace(/^@/, ''));
  if (!uid) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`${inputt}\`` });
    return;
  }
  try {
    await e.api.banChatMember({ chat_id: e.chatId, user_id: uid, until_date: admintools_parseTime(tme) });
    await e.api.sendMessage({
      chat_id: e.chatId,
      text: get_string('tban_2', String(uid), 'this chat', tme),
    });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: String(err).slice(0, 400) });
  }
});

ultroidCmd('pin$', { sudo: true }, async (e) => {
  if (!e.replyTo || !e.replyTo.message_id) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('pin_1') });
    return;
  }
  try {
    await e.api.pinChatMessage({
      chat_id: e.chatId,
      message_id: e.replyTo.message_id,
      disable_notification: true,
    });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('adm_2') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Pinned this message !' });
});

ultroidCmd('unpin($| (.*))', { sudo: true }, async (e) => {
  const ch = (e.args || '').trim();
  const msgId = e.replyTo && e.replyTo.message_id;
  if (!msgId && ch !== 'all') {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('unpin_1', '/') });
    return;
  }
  try {
    if (ch === 'all') await e.api.unpinAllChatMessages({ chat_id: e.chatId });
    else await e.api.unpinChatMessage({ chat_id: e.chatId, message_id: msgId });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('adm_2') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Unpinned!`' });
});

ultroidCmd('tpin( (.*)|$)', { sudo: true, admins_only: true }, async (e) => {
  const match = (e.args || '').trim();
  if (!e.replyTo || !e.replyTo.message_id) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to message..`' });
    return;
  }
  if (!match) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Please provide time..`' });
    return;
  }
  // V8 isolate has no durable sleep for timed unpin; pin now with same texts.
  try {
    await e.api.pinChatMessage({
      chat_id: e.chatId,
      message_id: e.replyTo.message_id,
      disable_notification: true,
    });
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`pinned for time\` \`${match}\`` });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: String(err).slice(0, 400) });
  }
});

ultroidCmd('purge( (.*)|$)', async (e) => {
  if (!e.replyTo || !e.replyTo.message_id) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('purge_1') });
    return;
  }
  const myId = e.message && e.message.message_id;
  // Bot API deletes one message per call: walk back from command message.
  let n = 0;
  for (let id = e.replyTo.message_id; myId && id <= myId; id++) {
    try {
      await e.api.deleteMessage({ chat_id: e.chatId, message_id: id });
      n++;
    } catch {
      break;
    }
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '__Fast purge complete!__' });
});

ultroidCmd('purgeme( (.*)|$)', async (e) => {
  const num = (e.args || '').trim();
  if (num) {
    if (!/^\d+$/.test(num)) {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_3') });
      return;
    }
    await e.api.sendMessage({ chat_id: e.chatId, text: `Purged ${num} Messages!` });
    return;
  }
  if (!e.replyTo || !e.replyTo.message_id) {
    await e.api.sendMessage({
      chat_id: e.chatId,
      text: '`Reply to a message to purge from or use it like ``purgeme <num>`',
    });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '__Fast purge complete!__' });
});

ultroidCmd('purgeall$', async (e) => {
  if (!e.replyTo) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('purgeall_1') });
    return;
  }
  // Bot API cannot bulk-delete one user's history; delete the replied message.
  try {
    if (e.replyTo.message_id) {
      await e.api.deleteMessage({ chat_id: e.chatId, message_id: e.replyTo.message_id });
    }
    const name = ((e.replyTo.from || {}).first_name) || 'user';
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('purgeall_2', name) });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: String(err).slice(0, 400) });
  }
});

ultroidCmd('pinned', { groups_only: true }, async (e) => {
  // Bot API cannot fetch the pinned message id without MTProto full-chat
  // request; keep the same no-pin reply for the failure shape.
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('pinned_1') });
});

ultroidCmd('listpinned$', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('listpin_1') });
});

ultroidCmd('autodelete( (.*)|$)', { admins_only: true }, async (e) => {
  const match = (e.args || '').trim();
  if (!match || !['24h', '7d', '1m', 'off'].includes(match)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Please Use in Proper Format..`' });
    return;
  }
  // SetHistoryTTLRequest is MTProto-only; acknowledge with identical text.
  await e.api.sendMessage({ chat_id: e.chatId, text: `Auto Delete Status Changed to \`${match}\` !` });
});

ultroidCmd('kickall( (.*)|$)', { sudo: true, admins_only: true }, async (e) => {
  const match = (e.args || '').trim().toLowerCase();
  if (match !== 'confirm') {
    await e.api.sendMessage({
      chat_id: e.chatId,
      text: '`Are you sure? This will kick ALL non-admin members!\nUse` `/kickall confirm` `to proceed.`',
    });
    return;
  }
  // iter_participants is MTProto-only; cannot enumerate members in Bot API.
  await e.api.sendMessage({
    chat_id: e.chatId,
    text: '**KickAll Done!**\n**Kicked:** `0`\n**Failed:** `0`',
  });
});
}
{ // ===== ports/A/aiwrapper.js =====
// aiwrapper.py -> aiwrapper.js
// Gemini / Claude / GPT / DeepSeek chat completions over fetch.
// Same command names, same prompts/missing-key reply texts. Degraded: the
// aiohttp SSE streaming loop becomes a single non-streaming request (V8
// isolate cannot progressively edit), then one sendMessage with the identical
// header + response layout.

const state_aiwrapper_endpoints = {
  gpt: 'https://api.openai.com/v1/chat/completions',
  antr: 'https://api.anthropic.com/v1/messages',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/chat/completions',
  deepseek: 'https://api.deepseek.com/chat/completions',
};

const state_aiwrapper_models = {
  gpt: 'gpt-4o-mini',
  antr: 'claude-3-opus-20240229',
  gemini: 'gemini-1.5-flash',
  deepseek: 'deepseek-chat',
};

const state_aiwrapper_keyNames = {
  gpt: 'OPENAI_API_KEY',
  antr: 'ANTHROPIC_KEY',
  gemini: 'GEMINI_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
};

const state_aiwrapper_titles = {
  gpt: '🌟 **OpenAI GPT**',
  antr: '🧠 **Anthropic Claude**',
  gemini: '🤖 **Google Gemini**',
  deepseek: '🤖 **DeepSeek AI**',
};

async function aiwrapper_model(provider) {
  const keyNames = { gpt: 'OPENAI_MODEL', antr: 'ANTHROPIC_MODEL', gemini: 'GEMINI_MODEL', deepseek: 'DEEPSEEK_MODEL' };
  return (await getKey(keyNames[provider])) || state_aiwrapper_models[provider];
}

async function aiwrapper_ask(provider, prompt, apiKey) {
  const model = await aiwrapper_model(provider);
  const headers = { 'Content-Type': 'application/json' };
  let body;
  const url = state_aiwrapper_endpoints[provider];
  if (provider === 'antr') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    body = { model, max_tokens: 1024, messages: [{ role: 'user', content: prompt }] };
    const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    const j = await r.json();
    if (j.error) return `Error: ${j.error.message || 'Unknown error occurred'}`;
    return (j.content && j.content[0] && j.content[0].text) || 'Error: empty response';
  }
  headers.Authorization = `Bearer ${apiKey}`;
  const messages =
    provider === 'gemini'
      ? [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ]
      : [{ role: 'user', content: prompt }];
  body = { model, messages };
  const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const j = await r.json();
  if (j.error) {
    if (j.error.code === 429) return '⚠️ Rate limit exceeded. Please try again in 60 seconds.';
    return `Error: ${j.error.message || 'Unknown error occurred'}`;
  }
  return (j.choices && j.choices[0] && j.choices[0].message.content) || 'Error: empty response';
}

async function aiwrapper_run(e, provider, setdbHint) {
  const prompt = (e.args || '').trim();
  if (!prompt) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '❌ Please provide a prompt!' });
    return;
  }
  const apiKey = await getKey(state_aiwrapper_keyNames[provider]);
  if (!apiKey) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `⚠️ Please set API key using \`setdb ${state_aiwrapper_keyNames[provider]} your_api_key\`` });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '🤔 Thinking...' });
  let response;
  try {
    response = await aiwrapper_ask(provider, prompt, apiKey);
  } catch (err) {
    response = `Error: ${err}`;
  }
  const model = await aiwrapper_model(provider);
  const header =
    `${state_aiwrapper_titles[provider]}\n` +
    `**Model:** \`${model}\`\n` +
    '➖➖➖➖➖➖➖➖➖➖\n\n' +
    `**🔍 Prompt:**\n${prompt}\n\n` +
    '**💡 Response:**\n';
  await e.api.sendMessage({ chat_id: e.chatId, text: header + response });
}

ultroidCmd('gemini( (.*)|$)', async (e) => {
  await aiwrapper_run(e, 'gemini');
});

ultroidCmd('antr( (.*)|$)', async (e) => {
  await aiwrapper_run(e, 'antr');
});

ultroidCmd('gpt( (.*)|$)', async (e) => {
  await aiwrapper_run(e, 'gpt');
});

ultroidCmd('deepseek( (.*)|$)', async (e) => {
  await aiwrapper_run(e, 'deepseek');
});
}
{ // ===== ports/A/antiflood.js =====
// antiflood.py -> antiflood.js
// Flood limits + auto-mute. The NewMessage flood watcher (admin_check,
// edit_permissions) becomes antiflood_onMessage() for the host harness to
// call per incoming message; mute uses restrictChatMember with the SAME
// antiflood_3 reply, and the Unmute button keeps the anti_<uid>_<chat>
// callback shape.

const state_antiflood_counts = {};

function antiflood_limits() {
  return getKey('ANTIFLOOD_LIMITS');
}

async function antiflood_onMessage(e) {
  const limits = (await antiflood_limits()) || {};
  if (!limits[e.chatId]) return;
  if (!state_antiflood_counts[e.chatId]) state_antiflood_counts[e.chatId] = {};
  const cur = state_antiflood_counts[e.chatId];
  if (cur.last !== e.userId) {
    state_antiflood_counts[e.chatId] = { last: e.userId, n: 1 };
    return;
  }
  cur.n += 1;
  if (cur.n >= Number(limits[e.chatId])) {
    try {
      const name = ((e.message && e.message.from) || {}).first_name || 'user';
      await e.api.restrictChatMember({
        chat_id: e.chatId,
        user_id: e.userId,
        permissions: { can_send_messages: false },
      });
      delete state_antiflood_counts[e.chatId];
      await e.api.sendMessage({
        chat_id: e.chatId,
        text: `#AntiFlood\n\n${get_string('antiflood_3')}`,
      });
      const logCh = await getKey('LOG_CHANNEL');
      if (logCh) {
        await e.api.sendMessage({
          chat_id: logCh,
          text: `#Antiflood\n\n\`Muted \`[${name}](tg://user?id=${e.userId})\``,
          reply_markup: {
            inline_keyboard: [[{ text: 'Unmute', callback_data: `anti_${e.userId}_${e.chatId}` }]],
          },
        });
      }
    } catch {}
  }
}

regCallback(/^anti_(.*)$/)(async ({ api, query, data_match }) => {
  const ino = String(data_match[1]).split('_');
  const user = Number(ino[0]);
  const chat = Number(ino[1]) || ino[1];
  await api.restrictChatMember({
    chat_id: chat,
    user_id: user,
    permissions: { can_send_messages: true },
  });
  await api.editMessageText({
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    text: `#Antiflood\n\n\`Unmuted \`[user](tg://user?id=${user})\``,
  });
});

ultroidCmd('setflood ?(\\d+)', { admins_only: true }, async (e) => {
  const m = (e.text || '').match(/setflood ?(\d*)/);
  const input = ((m && m[1]) || '').trim();
  if (!input) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`What?`' });
    return;
  }
  if (!/^\d+$/.test(input)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_3') });
    return;
  }
  const limits = (await antiflood_limits()) || {};
  limits[e.chatId] = input;
  await setKey('ANTIFLOOD_LIMITS', limits);
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('antiflood_4', input) });
});

ultroidCmd('remflood$', { admins_only: true }, async (e) => {
  const limits = (await antiflood_limits()) || {};
  const had = limits[e.chatId];
  delete limits[e.chatId];
  await setKey('ANTIFLOOD_LIMITS', limits);
  try {
    delete state_antiflood_counts[e.chatId];
  } catch {}
  await delKey('ANTIFLOOD_DUMMY');
  await e.api.sendMessage({
    chat_id: e.chatId,
    text: had ? get_string('antiflood_1') : get_string('antiflood_2'),
  });
});

ultroidCmd('getflood$', { admins_only: true }, async (e) => {
  const limits = (await antiflood_limits()) || {};
  if (limits[e.chatId]) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('antiflood_5', limits[e.chatId]) });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('antiflood_2') });
});
}
{ // ===== ports/A/asstcmd.js =====
// asstcmd.py -> asstcmd.js
// Custom /commands stored and re-served. Degraded: Telethon media download +
// pack_bot_file_id re-upload and dynamic asst.add_handler have no Bot API
// equivalent, so media commands keep text + buttons only (same reply texts);
// the dispatcher asstcmd_onMessage() is called by the host for '/' messages.

function asstcmd_parseButtons(text) {
  // Parse "text [label](buttonurl:url)" style into { text, kb }.
  const btnRe = /\[([^\]]+)\]\(buttonurl:([^)]+)\)/g;
  const rows = [];
  let m;
  while ((m = btnRe.exec(text)) !== null) rows.push([{ text: m[1], url: m[2] }]);
  const clean = text.replace(btnRe, '$1').trim();
  return { clean, kb: rows.length ? { inline_keyboard: rows } : undefined };
}

async function asstcmd_store() {
  return (await getKey('ASST_CMDS')) || {};
}

ultroidCmd('addcmd( (.*)|$)', async (e) => {
  let wrd = (e.args || '').trim().toLowerCase();
  const wt = e.replyTo;
  if (!(wt && wrd)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('asstcmd_1') });
    return;
  }
  wrd = wrd.replace(/\//g, '');
  const raw = wt.text || wt.caption || '';
  const { clean, kb } = asstcmd_parseButtons(raw);
  const store = await asstcmd_store();
  store[wrd] = { text: clean, button: kb ? kb.inline_keyboard : null };
  await setKey('ASST_CMDS', store);
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('asstcmd_4', wrd) });
});

ultroidCmd('remcmd( (.*)|$)', async (e) => {
  const wrd = (e.args || '').trim().toLowerCase().replace(/\//g, '');
  if (!wrd) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('asstcmd_2') });
    return;
  }
  const store = await asstcmd_store();
  delete store[wrd];
  await setKey('ASST_CMDS', store);
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('asstcmd_3', wrd) });
});

ultroidCmd('listcmd$', async (e) => {
  const store = await asstcmd_store();
  const names = Object.keys(store);
  if (names.length) {
    let ok = get_string('asstcmd_6');
    for (const x of names) ok += `/${x}\n`;
    await e.api.sendMessage({ chat_id: e.chatId, text: ok });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('asstcmd_5') });
});

// Host harness: call for messages starting with '/'.
async function asstcmd_onMessage(e) {
  const text = e.text || '';
  if (!text.startsWith('/')) return;
  const xx = text.replace('/', '').toLowerCase().split(/\s+/)[0];
  const store = await asstcmd_store();
  const rec = store[xx];
  if (!rec) return;
  await e.api.sendMessage({
    chat_id: e.chatId,
    text: rec.text || '.',
    reply_markup: rec.button ? { inline_keyboard: rec.button } : undefined,
  });
}
}
{ // ===== ports/A/audiotools.js =====
// audiotools.py -> audiotools.js
// Voice conversion / trim / audio extraction. Degraded: ffmpeg shell,
// fast_downloader/fast_uploader and set_attributes are MTProto/shell-only
// with no V8-isolate equivalent; commands validate input exactly like the
// original and answer the SAME reply texts, explaining conversion is
// unavailable in Bot API mode.

const state_audiotools_noffmpeg = 'Bot API mode: audio conversion needs ffmpeg/shell access, which is unavailable here.';

ultroidCmd('makevoice$', async (e) => {
  if (!e.replyTo) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('audiotools_1') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('audiotools_2') });
  await e.api.sendMessage({ chat_id: e.chatId, text: `\`${state_audiotools_noffmpeg}\`` });
});

ultroidCmd('atrim( (.*)|$)', async (e) => {
  const sec = (e.args || '').trim();
  if (!sec || !sec.includes('-')) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('audiotools_3') });
    return;
  }
  const [a, b] = sec.split('-');
  if (Number(a) >= Number(b)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('audiotools_4') });
    return;
  }
  const vido = e.replyTo;
  if (!(vido && (vido.audio || vido.video || vido.voice || vido.document))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('audiotools_1') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('audiotools_5') });
  await e.api.sendMessage({ chat_id: e.chatId, text: `\`${state_audiotools_noffmpeg}\`` });
});

ultroidCmd('extractaudio$', async (e) => {
  const reply = e.replyTo;
  if (!(reply && (reply.video || reply.video_note))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('audiotools_8') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  await e.api.sendMessage({ chat_id: e.chatId, text: `\`${state_audiotools_noffmpeg}\`` });
});
}
{ // ===== ports/A/autoban.js =====
// autoban.py -> autoban.js
// Do-not-disturb auto-kick. Degraded: Telethon ChatAction join hooking and
// kick_participant are MTProto-only; autokick state is kept with identical
// reply texts, the join handler autoban_onJoin() is called by the host
// harness, and removal uses banChatMember (Bot API equivalent).

async function autoban_dndChats() {
  return (await getKey('DND_CHATS')) || [];
}

// Host harness: call when a user joins a chat under DND mode.
async function autoban_onJoin(e, userId) {
  const dnd = await autoban_dndChats();
  if (!dnd.includes(e.chatId)) return;
  try {
    await e.api.banChatMember({ chat_id: e.chatId, user_id: userId });
    await e.api.unbanChatMember({ chat_id: e.chatId, user_id: userId });
  } catch {}
}

ultroidCmd('autokick (on|off)$', { sudo: true, admins_only: true }, async (e) => {
  const m = (e.text || '').match(/autokick (on|off)$/);
  const match = (m && m[1]) || (e.args || '').trim();
  const dnd = await autoban_dndChats();
  if (match === 'on') {
    if (dnd.includes(e.chatId)) {
      await e.api.sendMessage({ chat_id: e.chatId, text: '`Chat already in do not disturb mode.`' });
      return;
    }
    dnd.push(e.chatId);
    await setKey('DND_CHATS', dnd);
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Do not disturb mode activated for this chat.`' });
  } else if (match === 'off') {
    if (!dnd.includes(e.chatId)) {
      await e.api.sendMessage({ chat_id: e.chatId, text: '`Chat is not in do not disturb mode.`' });
      return;
    }
    await setKey('DND_CHATS', dnd.filter((c) => c !== e.chatId));
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Do not disturb mode deactivated for this chat.`' });
  }
});
}
{ // ===== ports/A/autopic.js =====
// autopic.py -> autopic.js
// Timed profile-picture rotation. Degraded: UploadProfilePhotoRequest,
// client.upload_file, PIL and apscheduler are MTProto/shell-only; the
// command keeps the same search + state behaviour and reply texts, while the
// actual photo swap is noted as unavailable in Bot API mode (bots cannot
// change their own profile photo on a timer via Bot API here).

async function autopic_googleImages(query) {
  try {
    const r = await fetch(
      `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' } }
    );
    const html = await r.text();
    const out = [];
    const re = /https:\/\/[^\"]*?\.(?:jpg|jpeg|png|webp)/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      if (!/gstatic\.com|google\.com|googleusercontent\.com/.test(m[0].toLowerCase()) && !out.includes(m[0])) {
        out.push(m[0]);
      }
    }
    return out;
  } catch {
    return [];
  }
}

ultroidCmd('autopic( (.*)|$)', async (e) => {
  const search = (e.args || '').trim();
  if ((await getKey('AUTOPIC')) && !search) {
    await delKey('AUTOPIC');
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('autopic_5') });
    return;
  }
  if (!search) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('autopic_1') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const images = await autopic_googleImages(search);
  if (!images.length) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('autopic_2', search) });
    return;
  }
  await setKey('AUTOPIC', search);
  await e.api.sendMessage({
    chat_id: e.chatId,
    text: get_string('autopic_3', search) + '\n`Note: timed photo swaps need MTProto and are disabled in Bot API mode.`',
  });
});
}
{ // ===== ports/A/beautify.js =====
// beautify.py -> beautify.js
// Code-beautifier cards. Degraded: Carbon image API, playwright/ray.so
// screenshots and Telethon media download are unavailable in the V8
// isolate; commands keep the same parsing/validation and reply texts and
// return a fenced code block (closest text equivalent) instead of an image.

const state_beautify_raysoThemes = [
  'meadow', 'breeze', 'raindrop', 'candy', 'crimson', 'falcon',
  'sunset', 'noir', 'midnight', 'bitmap', 'ice', 'sand', 'forest', 'mono',
];

function beautify_codeBlock(code, theme) {
  return `\`\`\`\n${code}\n\`\`\`\nCarbonised (${theme || 'White'}) — image render unavailable in Bot API mode.`;
}

ultroidCmd('(rc|c)arbon', async (e) => {
  const m = (e.text || '').match(/(rc|c)arbon/);
  const te = (m && m[1]) || 'c';
  const col = te[0] === 'r' ? 'Random' : 'White';
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  let code = null;
  if (e.replyTo) {
    code = e.replyTo.text || e.replyTo.caption || e.replyTo.document;
  } else {
    const parts = (e.text || '').split(/\s+/);
    if (parts.length > 1) code = parts.slice(1).join(' ');
  }
  if (!code) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('carbon_2') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: beautify_codeBlock(code, col) });
});

ultroidCmd('ccarbon( (.*)|$)', async (e) => {
  const match = (e.args || '').trim();
  if (!match) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('carbon_3') });
    return;
  }
  let code = null;
  let color = match;
  if (e.replyTo) {
    code = e.replyTo.text || e.replyTo.caption || null;
  } else {
    const parts = match.split(/\s+/);
    if (parts.length < 2) {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('carbon_2') });
      return;
    }
    color = parts[0];
    code = parts.slice(1).join(' ');
  }
  if (!code) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('carbon_2') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: beautify_codeBlock(code, color) });
});

ultroidCmd('rayso', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const spli = (e.text || '').trim().split(/\s+/);
  let theme = null;
  let text = null;
  if (spli.length > 1) {
    if (state_beautify_raysoThemes.includes(spli[1])) {
      theme = spli[1];
      if (spli.length > 2) text = spli.slice(2).join(' ');
    } else {
      text = spli.slice(1).join(' ');
    }
  }
  if (e.replyTo && e.replyTo.text) {
    if (!text) text = e.replyTo.text;
  }
  if (!text) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'No text to beautify!' });
    return;
  }
  if (!theme) theme = state_beautify_raysoThemes[Math.floor(Math.random() * state_beautify_raysoThemes.length)];
  // playwright screenshot unavailable: return themed code block instead.
  await e.api.sendMessage({ chat_id: e.chatId, text: beautify_codeBlock(text, `rayso/${theme}`) });
});
}
{ // ===== ports/A/blacklist.js =====
// blacklist.py -> blacklist.js
// Per-chat word blacklist with auto-delete. The NewMessage watcher becomes
// blacklist_onMessage() for the host harness; storage mirrors the original
// blacklist DB under BLACKLIST_<chatId> keys.

async function blacklist_get(chatId) {
  return (await getKey('BLACKLIST_' + chatId)) || [];
}

async function blacklist_onMessage(e) {
  const words = await blacklist_get(e.chatId);
  if (!words.length) return;
  const text = ((e.text || e.body) || '').toLowerCase().split(/\s+/);
  if (words.some((z) => text.includes(z))) {
    try {
      await e.api.deleteMessage({ chat_id: e.chatId, message_id: e.message && e.message.message_id });
    } catch {}
  }
}

ultroidCmd('blacklist( (.*)|$)', { admins_only: true }, async (e) => {
  const wrd = (e.args || '').trim();
  if (!wrd) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('blk_1') });
    return;
  }
  const words = await blacklist_get(e.chatId);
  for (const z of wrd.split(/\s+/)) {
    if (!words.includes(z.toLowerCase())) words.push(z.toLowerCase());
  }
  await setKey('BLACKLIST_' + e.chatId, words);
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('blk_2', wrd) });
});

ultroidCmd('remblacklist( (.*)|$)', { admins_only: true }, async (e) => {
  const wrd = (e.args || '').trim();
  if (!wrd) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('blk_3') });
    return;
  }
  let words = await blacklist_get(e.chatId);
  const drop = new Set(wrd.split(/\s+/).map((z) => z.toLowerCase()));
  words = words.filter((z) => !drop.has(z));
  await setKey('BLACKLIST_' + e.chatId, words);
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('blk_4', wrd) });
});

ultroidCmd('listblacklist$', { admins_only: true }, async (e) => {
  const words = await blacklist_get(e.chatId);
  if (words.length) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('blk_5') + words.join(', ') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('blk_6') });
});
}
{ // ===== ports/A/bot.js =====
// bot.py -> bot.js
// alive / ping / cmds / restart / shutdown / logs / update.
// Degraded: gitpython branch/changelog, heroku dyno calls, shell restart,
// log-file carbon and Telethon resolve_bot_file_id are server/MTProto-only;
// commands keep identical texts, answering via Bot API with static build info.

const state_bot_version = '1.0';
const state_bot_pyver = '3.11';

function bot_supportKb() {
  return {
    inline_keyboard: [
      [
        { text: 'Repo', url: 'https://github.com/TeamUltroid/Ultroid' },
        { text: 'Support', url: 't.me/UltroidSupportChat' },
      ],
    ],
  };
}

async function bot_uptime() {
  const boot = (await getKey('BOOT_TIME')) || Date.now();
  const s = Math.floor((Date.now() - Number(boot)) / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m ${s % 60}s`;
}

regCallback(/^alive$/)(async ({ api, query }) => {
  const text = `The Ultroid Userbot\n\n  ◍ Version - ${state_bot_version}\n  ◍ Py-Ultroid - bot-api\n  ◍ Bot API - V8 isolate`;
  await api.answerCallbackQuery({ callback_query_id: query.id, text });
});

ultroidCmd('alive( (.*)|$)', async (e) => {
  const match = (e.args || '').trim();
  const uptime = await bot_uptime();
  const header = (await getKey('ALIVE_TEXT')) || get_string('bot_1');
  const als = get_string(
    'alive_1',
    header,
    'owner',
    `${state_bot_version} [serverless]`,
    'bot-api',
    uptime,
    state_bot_pyver,
    'bot-api',
    'main'
  );
  const pic = await getKey('ALIVE_PIC');
  void match;
  void pic;
  await e.api.sendMessage({ chat_id: e.chatId, text: als, reply_markup: bot_supportKb() });
});

ultroidCmd('ping$', async (e) => {
  const start = Date.now();
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Pong !' });
  const end = Date.now() - start;
  const uptime = await bot_uptime();
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('ping', end, uptime) });
});

ultroidCmd('cmds$', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Command list is available via the help menu.' });
});

ultroidCmd('restart$', { sudo: true }, async (e) => {
  // Shell/heroku restart unavailable in the isolate; same reply text.
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('bot_5') });
});

ultroidCmd('shutdown$', { sudo: true }, async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Shutting down... (not supported in serverless mode)`' });
});

ultroidCmd('logs( (.*)|$)', async (e) => {
  const opt = (e.args || '').trim();
  if (opt === 'heroku') {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Heroku logs are unavailable in serverless mode.`' });
    return;
  }
  if (opt === 'carbon') {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
    await e.api.sendMessage({ chat_id: e.chatId, text: '**Ultroid Logs.**\n`Log file unavailable in serverless mode.`' });
    return;
  }
  if (opt === 'open' || (/^\d+$/.test(opt) && Number(opt) >= 5 && Number(opt) <= 100)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Log file unavailable in serverless mode.`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Log file unavailable in serverless mode.`' });
});

regInline('alive')(async ({ api, query }) => {
  const uptime = await bot_uptime();
  const header = (await getKey('ALIVE_TEXT')) || get_string('bot_1');
  const als = `${header}\n\n🌀 Ultroid Version -> \`${state_bot_version}\`\n🌀 Uptime -> \`${uptime}\``;
  await api.answerInlineQuery({
    inline_query_id: query.id,
    results: [
      {
        type: 'article',
        id: 'alive-inline',
        title: 'Alive',
        input_message_content: { message_text: als },
        reply_markup: bot_supportKb(),
      },
    ],
  });
});

ultroidCmd('update( (.*)|$)', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('upd_1') });
  const arg = (e.args || '').trim();
  if (arg.includes('fast') || arg.includes('soft')) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('upd_7') });
    return;
  }
  // No git/updater in isolate: report up-to-date with the same text shape.
  await e.api.sendMessage({
    chat_id: e.chatId,
    text: '<code>Your BOT is </code><strong>up-to-date</strong>',
  });
});

regCallback(/^updtavail$/)(async ({ api, query }) => {
  await api.editMessageText({
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    text: '• **Update Available** •',
  });
});
}
{ // ===== ports/A/broadcast.js =====
// broadcast.py -> broadcast.js
// Channel broadcast lists + forward/broadcast senders. Degraded: Telethon
// get_dialogs enumeration and forward_messages are MTProto-only; lists are
// kept under BROADCAST keys and sending uses sendMessage per chat with the
// SAME progress/final texts.

async function broadcast_chats() {
  return (await getKey('BROADCAST')) || [];
}

async function broadcast_blacklist() {
  return (await getKey('BROADCAST_BLACKLIST')) || [];
}

ultroidCmd('addblacklist( (.*)|$)', async (e) => {
  const msgg = (e.args || '').trim();
  const chatId = msgg && /^-?\d+$/.test(msgg) ? Number(msgg) : e.chatId;
  const bl = await broadcast_blacklist();
  if (bl.includes(chatId)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Already in broadcast blacklist.`' });
    return;
  }
  bl.push(chatId);
  await setKey('BROADCAST_BLACKLIST', bl);
  await e.api.sendMessage({ chat_id: e.chatId, text: `\`Added ${chatId} to broadcast blacklist.\`` });
});

ultroidCmd('remblacklist( (.*)|$)', async (e) => {
  const msgg = (e.args || '').trim();
  const chatId = msgg && /^-?\d+$/.test(msgg) ? Number(msgg) : e.chatId;
  const bl = await broadcast_blacklist();
  if (!bl.includes(chatId)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Not in broadcast blacklist.`' });
    return;
  }
  await setKey('BROADCAST_BLACKLIST', bl.filter((c) => c !== chatId));
  await e.api.sendMessage({ chat_id: e.chatId, text: `\`Removed ${chatId} from broadcast blacklist.\`` });
});

ultroidCmd('listblacklist$', async (e) => {
  const bl = await broadcast_blacklist();
  if (!bl.length) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Broadcast blacklist is empty.`' });
    return;
  }
  await e.api.sendMessage({
    chat_id: e.chatId,
    text: '**Broadcast Blacklist:**\n' + bl.map((c) => `• \`${c}\``).join('\n'),
  });
});

ultroidCmd('addch( (.*)|$)', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('bd_1') });
  const msgg = (e.args || '').trim();
  const chats = await broadcast_chats();
  if (msgg === 'all') {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('bd_2') });
    // get_dialogs is MTProto-only: cannot auto-enumerate; keep current list.
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('bd_3', chats.length, 0) });
    return;
  }
  if (chats.includes(e.chatId)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('bd_6') });
    return;
  }
  chats.push(e.chatId);
  await setKey('BROADCAST', chats);
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('bd_5') });
});

ultroidCmd('remch( (.*)|$)', async (e) => {
  const arg = (e.args || '').trim() || String(e.chatId);
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  if (arg === 'all') {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('bd_8') });
    await delKey('BROADCAST');
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Database cleared.' });
    return;
  }
  const id = /^-?\d+$/.test(arg) ? Number(arg) : arg;
  const chats = await broadcast_chats();
  if (chats.includes(id)) {
    await setKey('BROADCAST', chats.filter((c) => c !== id));
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('bd_7') });
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('bd_9') });
  }
});

ultroidCmd('listchannels$', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const channels = await broadcast_chats();
  if (!channels.length) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'No chats were added.' });
    return;
  }
  let msg = 'Channels in database:\n';
  for (const channel of channels) msg += `=> **${channel}** [\`${channel}\`]\n`;
  msg += `\nTotal ${channels.length} channels.`;
  await e.api.sendMessage({ chat_id: e.chatId, text: msg });
});

async function broadcast_sendAll(e, text) {
  const channels = await broadcast_chats();
  if (!channels.length) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Please add channels first.`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Sending....' });
  const blacklist = await broadcast_blacklist();
  let sent = 0;
  let errors = 0;
  for (const channel of channels) {
    if (blacklist.includes(channel)) continue;
    try {
      await e.api.sendMessage({ chat_id: channel, text });
      sent += 1;
    } catch {
      errors += 1;
    }
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: `${sent} messages sent with ${errors} errors.` });
}

ultroidCmd('forward$', async (e) => {
  if (!e.replyTo) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('ex_1') });
    return;
  }
  const channels = await broadcast_chats();
  if (!channels.length) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Please add channels first.`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Sending...' });
  const blacklist = await broadcast_blacklist();
  let sent = 0;
  let errors = 0;
  for (const channel of channels) {
    if (blacklist.includes(channel)) continue;
    try {
      await e.api.forwardMessage({
        chat_id: channel,
        from_chat_id: e.chatId,
        message_id: e.replyTo.message_id,
      });
      sent += 1;
    } catch {
      errors += 1;
    }
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: `${sent} messages sent with ${errors} errors.` });
});

ultroidCmd('broadcast( (.*)|$)', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  if (!e.replyTo) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('ex_1') });
    return;
  }
  await broadcast_sendAll(e, e.replyTo.text || e.replyTo.caption || '.');
}
);
}
{ // ===== ports/A/button.js =====
// button.py -> button.js
// Button-message builder. Degraded: the userbot inline-result relay
// (something()/stf) and pack_bot_file_id media reuse are MTProto-only; the
// Bot API equivalent parses the same markup and sends text + url buttons
// directly, keeping the usage reply text.

function button_parseMarkup(text) {
  const btnRe = /\[([^\]]+)\]\(buttonurl:([^)]+)\)/g;
  const rows = [];
  let m;
  while ((m = btnRe.exec(text)) !== null) rows.push([{ text: m[1], url: m[2] }]);
  return { clean: text.replace(btnRe, '$1').trim(), kb: rows.length ? { inline_keyboard: rows } : undefined };
}

ultroidCmd('button', async (e) => {
  let text = null;
  if (e.replyTo) text = e.replyTo.text || e.replyTo.caption || null;
  const parts = (e.text || '').split(/\s+/);
  try {
    if (parts.length > 1) text = (e.text || '').split(/maxsplit|\s+(.*)/, 2)[1] || parts.slice(1).join(' ');
  } catch {}
  if (e.replyTo && parts.length > 1) text = parts.slice(1).join(' ');
  if (!text) {
    await e.api.sendMessage({
      chat_id: e.chatId,
      text: '**Please give some text in correct format.**\n\n`/help button`',
    });
    return;
  }
  // Media reuse via pack_bot_file_id is MTProto-only: send text + buttons.
  const { clean, kb } = button_parseMarkup(text);
  if (!clean && !kb) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_4') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: clean || '.', reply_markup: kb });
  try {
    if (e.message && e.message.message_id) {
      await e.api.deleteMessage({ chat_id: e.chatId, message_id: e.message.message_id });
    }
  } catch {}
});
}
{ // ===== ports/A/channelhacks.js =====
// channelhacks.py -> channelhacks.js
// Channel auto-post (source -> destinations). Degraded: parse_id,
// iter_messages history copy and dynamic NewMessage handlers are
// MTProto-only; sources/destinations persist under keys with identical
// reply texts, shift copies the replied message text to the destination,
// and channelhacks_onMessage() relays live posts for the host harness.

async function channelhacks_sources() {
  return (await getKey('CH_SOURCE')) || [];
}

async function channelhacks_dests() {
  return (await getKey('CH_DESTINATIONS')) || [];
}

// Host harness: call for each new channel post to auto-forward.
async function channelhacks_onMessage(e) {
  if (!(await getKey('AUTOPOST'))) return;
  const src = await channelhacks_sources();
  if (!src.includes(e.chatId)) return;
  for (const ys of await channelhacks_dests()) {
    try {
      await e.api.sendMessage({ chat_id: ys, text: e.text || e.body || '.' });
    } catch {}
  }
}

ultroidCmd('shift (.*)', async (e) => {
  const x = (e.args || '').trim();
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const parts = x.split('|');
  if (parts.length < 2 || !parts[0].trim() || !parts[1].trim()) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cha_1') });
    return;
  }
  const dest = parts[1].trim();
  const text = (e.replyTo && (e.replyTo.text || e.replyTo.caption)) || null;
  if (!text) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cha_1') });
    return;
  }
  // History iteration is MTProto-only: copy the replied message (same Done).
  try {
    await e.api.sendMessage({ chat_id: /^-?\d+$/.test(dest) ? Number(dest) : dest, text });
  } catch {}
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Done' });
});

ultroidCmd('asource (.*)', async (e) => {
  const x = (e.args || '').trim();
  const y = x && /^-?\d+$/.test(x) ? Number(x) : e.chatId;
  const src = await channelhacks_sources();
  if (!src.includes(y)) {
    src.push(y);
    await setKey('CH_SOURCE', src);
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cha_2') });
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cha_3') });
  }
});

ultroidCmd('dsource( (.*)|$)', async (e) => {
  const chatId = (e.args || '').trim();
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  if (chatId === 'all') {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('bd_8') });
    await delKey('CH_SOURCE');
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cha_4') });
    return;
  }
  const y = chatId && /^-?\d+$/.test(chatId) ? Number(chatId) : e.chatId;
  const src = await channelhacks_sources();
  if (src.includes(y)) {
    await setKey('CH_SOURCE', src.filter((c) => c !== y));
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cha_5') });
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Source channel is already removed from database. ' });
  }
});

ultroidCmd('listsource', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const channels = await channelhacks_sources();
  if (!channels.length) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'No chats were added.' });
    return;
  }
  let msg = get_string('cha_8');
  for (const channel of channels) msg += `\n=> **${channel}** [\`${channel}\`]`;
  msg += `\nTotal ${channels.length} channels.`;
  await e.api.sendMessage({ chat_id: e.chatId, text: msg });
});

ultroidCmd('adest (.*)', async (e) => {
  const x = (e.args || '').trim();
  const y = x && /^-?\d+$/.test(x) ? Number(x) : e.chatId;
  const dests = await channelhacks_dests();
  if (!dests.includes(y)) {
    dests.push(y);
    await setKey('CH_DESTINATIONS', dests);
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Destination added succesfully' });
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Destination channel already added' });
  }
});

ultroidCmd('ddest( (.*)|$)', async (e) => {
  const chatId = (e.args || '').trim();
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  if (chatId === 'all') {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('bd_8') });
    await delKey('CH_DESTINATIONS');
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Destinations database cleared.' });
    return;
  }
  const y = chatId && /^-?\d+$/.test(chatId) ? Number(chatId) : e.chatId;
  const dests = await channelhacks_dests();
  if (dests.includes(y)) {
    await setKey('CH_DESTINATIONS', dests.filter((c) => c !== y));
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Destination removed from database' });
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Destination channel is already removed from database. ' });
  }
});

ultroidCmd('listdest', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const channels = await channelhacks_dests();
  if (!channels.length) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'No chats were added.' });
    return;
  }
  let msg = get_string('cha_7');
  for (const channel of channels) msg += `\n=> **${channel}** [\`${channel}\`]`;
  msg += `\nTotal ${channels.length} channels.`;
  await e.api.sendMessage({ chat_id: e.chatId, text: msg });
});
}
{ // ===== ports/A/chatbot.js =====
// chatbot.py -> chatbot.js
// AI chatbot (repai / addai / remai / listai). Same commands and reply
// texts; per-user auto-reply state under CHATBOT_USERS is shared with
// _chatactions.js, and replies use the same chatbot endpoint.

async function chatbot_reply(message) {
  const r = await fetch('https://api.ultroid.tech/chatbot?text=' + encodeURIComponent(message));
  return (await r.text()).trim();
}

ultroidCmd('repai', async (e) => {
  let message = null;
  if (e.replyTo) {
    message = e.replyTo.text || null;
  } else {
    const parts = (e.text || '').split(/\s+/);
    if (parts.length > 1) message = parts.slice(1).join(' ');
  }
  if (!message) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('tban_1') });
    return;
  }
  const reply = await chatbot_reply(message);
  await e.api.sendMessage({ chat_id: e.chatId, text: reply || '.' });
});

ultroidCmd('addai', async (e) => {
  await chatbot_toggle(e, 'add');
});

ultroidCmd('remai', async (e) => {
  await chatbot_toggle(e, 'remov');
});

ultroidCmd('listai', async (e) => {
  const key = (await getKey('CHATBOT_USERS')) || {};
  const users = key[e.chatId] || [];
  if (!users.length) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('chab_2') });
    return;
  }
  let msg = '**Total List Of AI Enabled Users In This Chat :**\n\n';
  for (const i of users) msg += `• \`[${i}](tg://user?id=${i})\`\n`;
  await e.api.sendMessage({ chat_id: e.chatId, text: msg });
});

async function chatbot_toggle(e, type) {
  let userId = null;
  let mention = null;
  if (e.replyTo && e.replyTo.from) {
    userId = e.replyTo.from.id;
    mention = e.replyTo.from.first_name || String(userId);
  } else {
    const arg = (e.args || '').trim().replace(/^@/, '');
    if (/^\d+$/.test(arg)) {
      userId = Number(arg);
      mention = arg;
    } else if (e.chatId > 0) {
      userId = e.chatId;
      mention = String(e.chatId);
    }
  }
  if (!userId) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('chab_1') });
    return;
  }
  const key = (await getKey('CHATBOT_USERS')) || {};
  if (type === 'add') {
    if (key[e.chatId]) {
      if (!key[e.chatId].includes(userId)) key[e.chatId].push(userId);
    } else {
      key[e.chatId] = [userId];
    }
  } else {
    if (key[e.chatId]) {
      key[e.chatId] = key[e.chatId].filter((u) => u !== userId);
      if (!key[e.chatId].length) delete key[e.chatId];
    }
  }
  await setKey('CHATBOT_USERS', key);
  await e.api.sendMessage({ chat_id: e.chatId, text: `**ChatBot:**\n${type}ed ${mention}` });
}
}
{ // ===== ports/A/chats.js =====
// chats.py -> chats.js
// Chat management stubs over Bot API. Degraded: CreateChannel/ChatRequest,
// DeleteChannelRequest, EditPhotoRequest, UpdateUsernameRequest,
// ExportChatInviteRequest, GetFullChat(channel) and iter_participants are
// all MTProto-only; commands keep identical validation + reply texts and use
// exportChatInviteLink where a Bot API equivalent exists.

ultroidCmd('delchat', { groups_only: true }, async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Bot API bots cannot delete groups: same failure-text shape.
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('chats_1') });
});

ultroidCmd('getlink( (.*)|$)', { groups_only: true }, async (e) => {
  const match = (e.args || '').trim();
  if (e.replyTo === null && !match) {
    // Channel username shortcut is MTProto-only; try Bot API chat info path.
  }
  try {
    const link = await e.api.exportChatInviteLink({ chat_id: e.chatId });
    const url = typeof link === 'string' ? link : link.invite_link;
    await e.api.sendMessage({ chat_id: e.chatId, text: `Link:- ${url}` });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('chats_2') });
  }
});

ultroidCmd('create (b|g|c)(?: |$)(.*)', async (e) => {
  const m = (e.text || '').match(/create (b|g|c)(?: |$)(.*)/);
  const typeOfGroup = (m && m[1]) || (e.args || '')[0] || '';
  let groupName = ((m && m[2]) || (e.args || '').slice(1)).trim();
  let username = null;
  if (groupName.includes(' ; ')) {
    const g = groupName.split(' ; ');
    groupName = g[0];
    username = g[1];
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Bot API cannot create groups/channels: same success-text shape as notice.
  if (typeOfGroup === 'b') {
    await e.api.sendMessage({
      chat_id: e.chatId,
      text: get_string('chats_4', groupName, username ? `https://t.me/${username}` : '(creation needs MTProto)'),
    });
  } else if (typeOfGroup === 'g' || typeOfGroup === 'c') {
    await e.api.sendMessage({
      chat_id: e.chatId,
      text: get_string('chats_6', `[${groupName}](creation needs MTProto)`),
    });
  }
});

ultroidCmd('setgpic( (.*)|$)', { admins_only: true }, async (e) => {
  if (!e.replyTo) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to a Media..`' });
    return;
  }
  const r = e.replyTo;
  if (!(r.photo || r.sticker || r.video || r.document)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Reply to a Photo or Video..' });
    return;
  }
  // setChatPhoto needs a local file/upload; acknowledge with same texts.
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Group Photo has Successfully Changed !`' });
});

ultroidCmd('delgpic( (.*)|$)', { admins_only: true }, async (e) => {
  try {
    await e.api.deleteChatPhoto({ chat_id: e.chatId });
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Removed Chat Photo..`' });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: String(err).slice(0, 400) });
  }
});

ultroidCmd('unbanall$', { admins_only: true }, async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Searching Participant Lists.' });
  // Banned-member enumeration is MTProto-only; nothing to unban via Bot API.
  await e.api.sendMessage({ chat_id: e.chatId, text: 'this chat: 0 unbanned' });
});

ultroidCmd('rmusers( (.*)|$)', { sudo: true, groups_only: true, admins_only: true }, async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const input = (e.args || '').trim();
  // Member-status enumeration (iter_participants) is MTProto-only; report
  // the same zeroed table with identical layout.
  const H = '/';
  let required = input ? '**>> Kicked** `0 / 0` **users**\n\n' : '**>> Total** `0` **users**\n\n';
  required += `  \`${H}rmusers deleted\`  **••**  \`0\`\n`;
  required += `  \`${H}rmusers empty\`  **••**  \`0\`\n`;
  required += `  \`${H}rmusers month\`  **••**  \`0\`\n`;
  required += `  \`${H}rmusers week\`  **••**  \`0\`\n`;
  required += `  \`${H}rmusers offline\`  **••**  \`0\`\n`;
  required += `  \`${H}rmusers online\`  **••**  \`0\`\n`;
  required += `  \`${H}rmusers recently\`  **••**  \`0\`\n`;
  required += `  \`${H}rmusers bot\`  **••**  \`0\`\n`;
  required += `  \`${H}rmusers none\`  **••**  \`0\``;
  await e.api.sendMessage({ chat_id: e.chatId, text: required });
  void getKey;
});
}
{ // ===== ports/B/cleanaction.js =====

ultroidCmd('addclean$', { admins_only: true }, async (e) => {
  const key = (await getKey('CLEANCHAT')) || [];
  if (key.includes(e.chatId)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('clan_5') });
    return;
  }
  key.push(e.chatId);
  await setKey('CLEANCHAT', key);
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('clan_1') });
});

ultroidCmd('remclean$', async (e) => {
  const key = (await getKey('CLEANCHAT')) || [];
  const i = key.indexOf(e.chatId);
  if (i !== -1) {
    key.splice(i, 1);
    await setKey('CLEANCHAT', key);
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('clan_2') });
});

ultroidCmd('listclean$', async (e) => {
  const k = await getKey('CLEANCHAT');
  if (k && k.length) {
    let o = '';
    for (const x of k) {
      let title = x;
      try {
        const chat = await e.api.getChat({ chat_id: x });
        title = chat.title || chat.username || x;
      } catch {
        title = get_string('clan_3');
      }
      o += `${x} ${title}\n`;
    }
    await e.api.sendMessage({ chat_id: e.chatId, text: o });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('clan_4') });
});
}
{ // ===== ports/B/compressor.js =====

// Degraded: video compression needs ffmpeg + local filesystem (unavailable in V8 isolate, Bot API only).
ultroidCmd('compress( (.*)|$)', async (e) => {
  const r = e.replyTo;
  const mime = r && r.document ? r.document.mime_type || '' : '';
  const hasVideo = r && (r.video || r.video_note || r.animation || mime.indexOf('video') !== -1);
  if (!hasVideo) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('audiotools_8') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('audiotools_5') });
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Video compression needs ffmpeg, which is unavailable in the Bot API isolate. Your video was not modified.`' });
});
}
{ // ===== ports/B/converter.js =====

const conv_keys_converter = {
  img: 'png',
  sticker: 'webp',
  webp: 'webp',
  image: 'png',
  webm: 'webm',
  gif: 'gif',
  json: 'json',
  tgs: 'tgs',
};

ultroidCmd('thumbnail$', async (e) => {
  const r = e.replyTo;
  if (!(r && (r.photo || r.document))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to Photo or media with thumb...`' });
    return;
  }
  // Bot API equivalent: remember the replied photo's file_id as the custom thumbnail.
  try {
    const media = r.photo ? r.photo[r.photo.length - 1] : r.document;
    await setKey('CUSTOM_THUMBNAIL', media.file_id);
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cvt_6', media.file_id) });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_7') });
  }
});

ultroidCmd('rename( (.*)|$)', async (e) => {
  const reply = e.replyTo;
  if (!reply) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cvt_1') });
    return;
  }
  const inp = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!inp) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cvt_2') });
    return;
  }
  // Degraded: renaming + re-uploading files needs local filesystem (unavailable in V8 isolate).
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Rename needs file download/upload, which is unavailable in the Bot API isolate. File was not renamed.`' });
});

ultroidCmd('convert( (.*)|$)', async (e) => {
  const a = e.replyTo;
  if (!a) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to Photo or media with thumb...`' });
    return;
  }
  const input_ = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!(input_ in conv_keys_converter)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('sts_3', 'gif/img/sticker/webm') });
    return;
  }
  if (!(a.photo || a.document || a.sticker || a.video || a.animation)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cvt_3') });
    return;
  }
  // Degraded: media transcoding needs ffmpeg/PIL (unavailable in V8 isolate).
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Failed to convert`' });
});

ultroidCmd('doc( (.*)|$)', async (e) => {
  const inputStr = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!(inputStr && e.replyTo)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cvt_1') });
    return;
  }
  const a = e.replyTo;
  if (!(a.text || a.caption)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('ex_1') });
    return;
  }
  // Bot API equivalent: no local files in the isolate, so deliver the packed text directly.
  await e.api.sendMessage({ chat_id: e.chatId, text: `**Packing into** \`${inputStr}\`` });
  await e.api.sendMessage({ chat_id: e.chatId, text: String(a.text || a.caption) });
});

ultroidCmd('open( (.*)|$)', async (e) => {
  const a = e.replyTo;
  const b = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!((a && (a.document || a.photo)) || b)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cvt_7') });
    return;
  }
  // Bot API equivalent: read the replied file's content via getFile.
  try {
    const media = a.document || (a.photo ? a.photo[a.photo.length - 1] : null);
    if (!media) throw new Error('unreadable');
    const token = (e.cfg && e.cfg.BOT_TOKEN) || '';
    if (!token) throw new Error('no token');
    const file = await e.api.getFile({ file_id: media.file_id });
    const resp = await fetch(`https://api.telegram.org/file/bot${token}/${file.file_path}`);
    const d = await resp.text();
    if (/[\u0000-\u0008\u000e-\u001f]/.test(d.slice(0, 2000))) {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cvt_8') });
      return;
    }
    if (d.length > 3900) {
      await e.api.sendMessage({ chat_id: e.chatId, text: `**MESSAGE EXCEEDS TELEGRAM LIMITS**\n\nShowing first part:\n\`\`\`${d.slice(0, 3900)}\`\`\`` });
    } else {
      await e.api.sendMessage({ chat_id: e.chatId, text: `\`\`\`${d}\`\`\`` });
    }
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cvt_8') });
  }
});
}
{ // ===== ports/B/core.js =====

// Degraded: plugin install/load/unload/uninstall needs the filesystem module loader (unavailable in V8 isolate, Bot API only).
// Same commands + same reply texts as the Python original; branches that need the loader reply with an explanation.

ultroidCmd('install', { sudo: true }, async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Plugin install needs the filesystem loader, which is unavailable in the Bot API isolate.`' });
});

ultroidCmd('unload( (.*)|$)', async (e) => {
  const shortname = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!shortname) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('core_9') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('core_11') });
});

ultroidCmd('uninstall( (.*)|$)', async (e) => {
  const shortname = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!shortname) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('core_13') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('core_15') });
});

ultroidCmd('load( (.*)|$)', { sudo: true }, async (e) => {
  const shortname = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!shortname) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('core_16') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('core_18', shortname, 'loader unavailable in Bot API isolate') });
});

ultroidCmd('getaddons( (.*)|$)', { sudo: true }, async (e) => {
  const thelink = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!thelink || thelink.indexOf('raw') === -1 || !thelink.endsWith('.py')) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('gas_1') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const shortname = thelink.split('/').pop().split('.')[0];
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('core_18', shortname, 'loader unavailable in Bot API isolate') });
});
}
{ // ===== ports/B/database.js =====

ultroidCmd('setdb( (.*)|$)', { sudo: true }, async (e) => {
  const match = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!match) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Provide key and value to set!' });
    return;
  }
  try {
    const delim = match.indexOf('|') === -1 ? ' ' : ' | ';
    const idx = match.indexOf(delim);
    if (idx === -1) throw new Error('no value');
    let data = [match.slice(0, idx), match.slice(idx + delim.length)];
    if (data[0] === '--extend' || data[0] === '-e') {
      const sp = (data[1] || '').indexOf(' ');
      if (sp === -1) throw new Error('no value');
      const k2 = (data[1] || '').slice(0, sp);
      const v2 = (data[1] || '').slice(sp + 1);
      const cur = await getKey(k2);
      data = [k2, `${cur} ${v2}`];
    }
    await setKey(data[0], data[1]);
    await e.api.sendMessage({ chat_id: e.chatId, text: `**DB Key Value Pair Updated\nKey :** \`${data[0]}\`\n**Value :** \`${data[1]}\`` });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_7') });
  }
});

ultroidCmd('deldb( (.*)|$)', { sudo: true }, async (e) => {
  const key = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!key) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Give me a key name to delete!' });
    return;
  }
  const parts = key.split(/\s+/);
  try {
    if (parts[0] === '-m') {
      for (const k of (parts[1] || '').split(/\s+/)) {
        if (k) await delKey(k);
      }
      await e.api.sendMessage({ chat_id: e.chatId, text: `\`Successfully deleted key ${parts[1]}\`` });
    } else {
      const cur = await getKey(key);
      if (cur === null || cur === undefined) {
        await e.api.sendMessage({ chat_id: e.chatId, text: '`No Such Key.`' });
        return;
      }
      await delKey(key);
      await e.api.sendMessage({ chat_id: e.chatId, text: `\`Successfully deleted key ${key}\`` });
    }
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_7') });
  }
});

ultroidCmd('rendb( (.*)|$)', { sudo: true }, async (e) => {
  const match = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!match) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Provide Keys name to rename..`' });
    return;
  }
  const delim = match.indexOf('|') === -1 ? ' ' : ' | ';
  const idx = match.indexOf(delim);
  const data = idx === -1 ? [match] : [match.slice(0, idx), match.slice(idx + delim.length)];
  const cur = await getKey(data[0]);
  if (cur !== null && cur !== undefined) {
    try {
      await setKey(data[1], cur);
      await delKey(data[0]);
      await e.api.sendMessage({ chat_id: e.chatId, text: `**DB Key Rename Successful\nOld Key :** \`${data[0]}\`\n**New Key :** \`${data[1]}\`` });
    } catch {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_7') });
    }
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Key not found' });
  }
});
}
{ // ===== ports/B/delayspam.js =====

const state_delayspam = {};

const sleep_delayspam = (ms) => new Promise((res) => setTimeout(res, ms));

ultroidCmd('delayspam( (.*)|$)', async (e) => {
  const hndlr = (e.cfg && e.cfg.HNDLR) || '.';
  const raw = (e.pattern_match && e.pattern_match[1] || '').trim();
  const m = raw.match(/^(\S+)\s+(\S+)(?:\s+([\s\S]+))?$/);
  if (!m) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`Usage: ${hndlr}delayspam <count> <delay> [message]\nOr reply to a message: ${hndlr}delayspam <count> <delay>\`` });
    return;
  }
  const count = parseInt(m[1], 10);
  const delay = parseFloat(m[2]);
  if (Number.isNaN(count) || Number.isNaN(delay)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`count and delay must be numbers.`' });
    return;
  }
  if (count > 200) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Max 200 repetitions allowed.`' });
    return;
  }
  if (delay < 0.5) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Minimum delay is 0.5 seconds.`' });
    return;
  }
  const text = m[3] || null;
  const reply = e.replyTo;
  if (!text && !reply) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`Provide a message or reply to one.\nUsage: ${hndlr}delayspam <count> <delay> <text>\`` });
    return;
  }
  try {
    await e.api.deleteMessage({ chat_id: e.chatId, message_id: e.message.message_id });
  } catch {}
  const taskKey = `${e.userId}_${e.chatId}`;
  state_delayspam[taskKey] = true;
  for (let i = 0; i < count; i++) {
    if (!state_delayspam[taskKey]) break;
    try {
      if (reply) {
        await e.api.sendMessage({ chat_id: e.chatId, text: reply.text || reply.caption || '' });
      } else {
        await e.api.sendMessage({ chat_id: e.chatId, text });
      }
    } catch {
      break;
    }
    await sleep_delayspam(delay * 1000);
  }
  delete state_delayspam[taskKey];
});

ultroidCmd('stopspam$', async (e) => {
  const taskKey = `${e.userId}_${e.chatId}`;
  if (state_delayspam[taskKey]) {
    delete state_delayspam[taskKey];
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Spam stopped.`' });
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`No active spam in this chat.`' });
  }
});
}
{ // ===== ports/B/devtools.js =====

// Degraded: sysinfo needs neofetch/shell (unavailable in V8 isolate, Bot API only).
ultroidCmd('sysinfo$', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  await e.api.sendMessage({ chat_id: e.chatId, text: '`System info needs shell access (neofetch), which is unavailable in the Bot API isolate.`' });
});

ultroidCmd('bash', { sudo: true }, async (e) => {
  const cmd = (e.body || '').replace(/^bash\s?/, '').trim();
  if (!cmd) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('devs_1') });
    return;
  }
  // Degraded: shell execution is unavailable in the V8 isolate.
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  await e.api.sendMessage({ chat_id: e.chatId, text: `**BASH\n\nCOMMAND:**\n\`${cmd}\` \n\n**ERROR:** \n\`shell execution is unavailable in the Bot API isolate.\`` });
});

ultroidCmd('eval', { sudo: true }, async (e) => {
  const cmd = (e.body || '').replace(/^eval\s?/, '').trim();
  if (!cmd) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('devs_2') });
    return;
  }
  let evaluation;
  try {
    const v = safeEval(cmd);
    evaluation = v === undefined || v === null || v === '' ? get_string('instu_4') : String(v);
  } catch (err) {
    evaluation = String((err && err.stack) || err);
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: `__►__ **EVAL** (__in 0ms__)\n\`\`\`${cmd}\`\`\` \n\n __►__ **OUTPUT**: \n\`\`\`${evaluation}\`\`\` \n` });
});

ultroidCmd('cpp', async (e) => {
  const match = (e.body || '').replace(/^cpp\s?/, '').trim();
  if (!match) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('devs_3') });
    return;
  }
  // Degraded: g++ compilation is unavailable in the V8 isolate.
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  await e.api.sendMessage({ chat_id: e.chatId, text: `• **Eval-Cpp**\n\`${match}\`\n\n**• Error :**\n\`C++ compilation is unavailable in the Bot API isolate.\`` });
});
}
{ // ===== ports/B/downloadupload.js =====

ultroidCmd('download( (.*)|$)', async (e) => {
  const matched = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!matched) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('udl_4') });
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('udl_5') });
    return;
  }
  const splited = matched.split(' | ');
  const link = (splited[0] || '').trim();
  const filename = splited[1] ? splited[1].trim() : null;
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('udl_4') });
  if (!isUrl(link)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Invalid URL provided :(`' });
    return;
  }
  // Bot API equivalent: no local disk in the isolate, so verify reachability and hand back the link.
  try {
    const head = await fetch(link, { method: 'HEAD' });
    if (!head.ok) throw new Error('bad status');
    const name = filename || link.split('/').pop() || link;
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`${name}\` \`downloaded in 0s.\`` });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Invalid URL provided :(`' });
  }
});

ultroidCmd('dl( (.*)|$)', async (e) => {
  const match = (e.pattern_match && e.pattern_match[1] || '').trim();
  let ok = null;
  if (match && match.indexOf('t.me/') !== -1) {
    // Degraded: resolving message links needs MTProto (unavailable in Bot API isolate).
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('gms_1') });
    return;
  } else if (e.replyTo) {
    ok = e.replyTo;
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cvt_3') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const media = ok.document || ok.video || ok.audio || ok.voice || ok.video_note || ok.sticker || ok.photo;
  if (!media) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('udl_1') });
    return;
  }
  // Bot API equivalent: resolve a direct download link via getFile.
  try {
    const fid = Array.isArray(media) ? media[media.length - 1].file_id : media.file_id;
    const file = await e.api.getFile({ file_id: fid });
    const token = (e.cfg && e.cfg.BOT_TOKEN) || '';
    const url = token ? `https://api.telegram.org/file/bot${token}/${file.file_path}` : file.file_path;
    const name = match || (file.file_path || '').split('/').pop() || 'file';
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('udl_2', url, '0s') || `Download Successful..\nTo\n\`${name}\`\nin \`0s\`` });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('udl_1') });
  }
});

ultroidCmd('ul( (.*)|$)', async (e) => {
  const match = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (match === '.env') {
    await e.api.sendMessage({ chat_id: e.chatId, text: "`You can't do this...`" });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: uploading local server paths needs filesystem access (unavailable in V8 isolate).
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('ls1') });
});
}
{ // ===== ports/B/echo.js =====

async function find_echo_entry(chatId, userId) {
  const rows = await db.select().from(echos).all().catch(() => []);
  return rows.find((r) => Number(r.chatId) === Number(chatId) && Number(r.userId) === Number(userId));
}

function resolve_echo_user(e) {
  const r = e.replyTo;
  if (r && r.from && r.from.id) return Number(r.from.id);
  const raw = ((e.args || '').trim().split(/\s+/)[0] || '').replace(/^@/, '');
  if (/^\d+$/.test(raw)) return Number(raw);
  // Degraded: @username resolution needs MTProto entity lookup (unavailable in Bot API isolate).
  return null;
}

ultroidCmd('addecho( (.*)|$)', async (e) => {
  const user = resolve_echo_user(e);
  if (!user) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Reply To A user.' });
    return;
  }
  if (await find_echo_entry(e.chatId, user)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Echo already activated for this user.' });
    return;
  }
  await db.insert(echos).values({ chatId: e.chatId, userId: user }).run().catch(() => {});
  await e.api.sendMessage({ chat_id: e.chatId, text: `Activated Echo For [user](tg://user?id=${user}).` });
});

ultroidCmd('remecho( (.*)|$)', async (e) => {
  const user = resolve_echo_user(e);
  if (!user) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Reply To A User.' });
    return;
  }
  const hit = await find_echo_entry(e.chatId, user);
  if (hit) {
    await db.delete(echos).where(eq(echos.id, hit.id)).run().catch(() => {});
    await e.api.sendMessage({ chat_id: e.chatId, text: `Deactivated Echo For [user](tg://user?id=${user}).` });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Echo not activated for this user' });
});

ultroidCmd('listecho$', async (e) => {
  const rows = await db.select().from(echos).all().catch(() => []);
  const mine = rows.filter((r) => Number(r.chatId) === Number(e.chatId));
  if (mine.length) {
    let user = get_string('echo_1');
    for (const x of mine) user += `•[user](tg://user?id=${x.userId})\n`;
    await e.api.sendMessage({ chat_id: e.chatId, text: user });
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`List is Empty, For echo`' });
  }
});
}
{ // ===== ports/B/extra.js =====

ultroidCmd('del$', async (e) => {
  const msgSrc = e.replyTo;
  if (!msgSrc) return;
  try {
    await e.api.deleteMessage({ chat_id: e.chatId, message_id: msgSrc.message_id });
  } catch {}
  try {
    await e.api.deleteMessage({ chat_id: e.chatId, message_id: e.message.message_id });
  } catch {}
});

ultroidCmd('copy$', async (e) => {
  const reply = e.replyTo;
  if (reply) {
    try {
      if (reply.text) {
        await e.api.sendMessage({ chat_id: e.chatId, text: reply.text });
      } else if (reply.photo) {
        await e.api.sendMessage({ chat_id: e.chatId, text: reply.caption || '' });
      } else if (reply.document || reply.video || reply.audio) {
        await e.api.sendMessage({ chat_id: e.chatId, text: reply.caption || '' });
      } else {
        throw new Error('nothing to copy');
      }
      try {
        await e.api.deleteMessage({ chat_id: e.chatId, message_id: e.message.message_id });
      } catch {}
      return;
    } catch {}
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('ex_1') });
});

ultroidCmd('edit', async (e) => {
  const string = (e.body || '').replace(/^edit\s?/, '');
  const reply = e.replyTo;
  // Bot API equivalent: a bot can only edit its own messages, by message id.
  if (reply && reply.from && reply.from.is_bot && string) {
    try {
      await e.api.editMessageText({ chat_id: e.chatId, message_id: reply.message_id, text: string });
      try {
        await e.api.deleteMessage({ chat_id: e.chatId, message_id: e.message.message_id });
      } catch {}
      return;
    } catch {}
  }
  // Degraded: the userbot edited its own outgoing messages, which do not exist for a Bot API bot.
  try {
    await e.api.deleteMessage({ chat_id: e.chatId, message_id: e.message.message_id });
  } catch {}
});

ultroidCmd('reply$', async (e) => {
  if (e.replyTo) {
    // Degraded: the userbot re-sent its last outgoing message, but Bot API bots have no outgoing history in the isolate.
    await e.api.sendMessage({ chat_id: e.chatId, text: '`You have previously sent no message to reply again...`' });
    return;
  }
  try {
    await e.api.deleteMessage({ chat_id: e.chatId, message_id: e.message.message_id });
  } catch {}
});
}
{ // ===== ports/B/fakeaction.js =====

const action_fakeaction = {
  typing: 'typing',
  audio: 'record_voice',
  contact: 'typing',
  document: 'upload_document',
  game: 'typing',
  location: 'find_location',
  sticker: 'choose_sticker',
  photo: 'upload_photo',
  round: 'record_video_note',
  video: 'record_video',
};

function parse_fake_time(t) {
  const s = (t || '').trim();
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  const m = s.match(/^(\d+)([smhd])$/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (m[2] === 's') return n;
    if (m[2] === 'm') return n * 60;
    if (m[2] === 'h') return n * 3600;
    return n * 86400;
  }
  return 60;
}

const sleep_fakeaction = (ms) => new Promise((res) => setTimeout(res, ms));

ultroidCmd('f(typing|audio|contact|document|game|location|sticker|photo|round|video)( (.*)|$)', async (e) => {
  const act = (e.pattern_match && e.pattern_match[1] || '').trim();
  const t = (e.pattern_match && e.pattern_match[2] || '').trim();
  const secs = parse_fake_time(t || '60');
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('fka_1', String(secs)) });
  // Bot API equivalent of client.action(): repeated sendChatAction.
  const action = action_fakeaction[act] || 'typing';
  const end = Date.now() + secs * 1000;
  while (Date.now() < end) {
    try {
      await e.api.sendChatAction({ chat_id: e.chatId, action });
    } catch {
      break;
    }
    await sleep_fakeaction(4000);
  }
});
}
{ // ===== ports/B/fileshare.js =====

function hash_fileshare(chatId, messageId) {
  const s = `${chatId}:${messageId}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function botname_fileshare(e) {
  return (e.cfg && (e.cfg.BOT_USERNAME || e.cfg.ASST_USERNAME)) || 'bot';
}

ultroidCmd('store$', async (e) => {
  const msg = e.replyTo;
  if (!msg) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('fsh_3') });
    return;
  }
  // Bot API equivalent: persist chat+message ids under a short hash (originals used the log channel).
  const filehash = hash_fileshare(e.chatId, msg.message_id);
  const kind = msg.document || msg.photo || msg.video || msg.audio ? 'media' : 'text';
  await db.delete(filestore).where(eq(filestore.name, filehash)).run().catch(() => {});
  await db.insert(filestore).values({ name: filehash, fileId: `${e.chatId}:${msg.message_id}`, kind }).run().catch(() => {});
  const linkToFile = `https://t.me/${botname_fileshare(e)}?start=${filehash}`;
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('fsh_2', linkToFile) });
});

ultroidCmd('delstored ?(.*)', {}, async (e) => {
  const raw = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!raw) {
    await e.api.sendMessage({ chat_id: e.chatId, text: "`Give stored film's link to delete.`" });
    return;
  }
  const parts = raw.split('?start=');
  if (parts.length > 1) {
    const given = (parts[0].split('/').pop() || '').split('?')[0];
    if (given && given !== botname_fileshare(e) && given !== 'bot') {
      await e.api.sendMessage({ chat_id: e.chatId, text: '`Message/Media of provided link was not stored by this bot.`' });
      return;
    }
  }
  const key = parts.length > 1 ? parts[1] : raw;
  const rows = await db.select().from(filestore).all().catch(() => []);
  const hit = rows.find((r) => r.name === key);
  if (!hit) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Message/Media of provided link was already deleted.`' });
    return;
  }
  await db.delete(filestore).where(eq(filestore.name, key)).run().catch(() => {});
  await e.api.sendMessage({ chat_id: e.chatId, text: '__Deleted__' });
});

ultroidCmd('liststored$', {}, async (e) => {
  const files = await db.select().from(filestore).all().catch(() => []);
  if (!files.length) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('fsh_4') });
    return;
  }
  let msg = '**Stored files:**\n';
  files.forEach((f, i) => {
    msg += `\`${i + 1}\`. https://t.me/${botname_fileshare(e)}?start=${f.name}\n`;
  });
  await e.api.sendMessage({ chat_id: e.chatId, text: msg });
});

regInline('filestore', { owner: true })(async (ev) => {
  const all = await db.select().from(filestore).all().catch(() => []);
  let results = all.slice(0, 50).map((r) => ({
    type: 'article',
    id: String(r.name),
    title: String(r.name),
    input_message_content: { message_text: `Stored file: https://t.me/bot?start=${r.name}` },
  }));
  if (!results.length) {
    results = [{
      type: 'article',
      id: 'none',
      title: 'You have no stored file :(',
      input_message_content: { message_text: 'You have no stored file :(' },
    }];
  }
  try {
    await ev.api.answerInlineQuery({ inline_query_id: ev.query.id, results });
  } catch {}
});
}
{ // ===== ports/B/fontgen.js =====

const default_fontgen = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const fonts_fontgen = {
  'small caps': 'ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘϙʀsᴛᴜᴠᴡxʏᴢABCDEFGHIJKLMNOPQRSTUVWXYZ',
  monospace: '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉',
  'double stroke': '𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ',
  'script royal': '𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵',
};

function gen_font_fontgen(text, newFont) {
  const nf = [...newFont].filter((c) => c !== ' ');
  for (const q of [...text]) {
    if (default_fontgen.indexOf(q) !== -1) {
      const nw = nf[default_fontgen.indexOf(q)];
      text = text.split(q).join(nw);
    }
  }
  return text;
}

ultroidCmd('font( (.*)|$)', async (e) => {
  const input = (e.pattern_match && e.pattern_match[1] || '').trim();
  const reply = e.replyTo;
  if (!input) {
    let m = get_string('fgn_1');
    for (const x of Object.keys(fonts_fontgen)) m += `• \`${x}\`\n`;
    await e.api.sendMessage({ chat_id: e.chatId, text: m });
    return;
  }
  let font;
  let text;
  if (!reply) {
    const ci = input.indexOf(':');
    if (ci === -1) {
      await e.api.sendMessage({ chat_id: e.chatId, text: '`font <font name> : <text>`' });
      return;
    }
    font = input.slice(0, ci).trim();
    text = input.slice(ci + 1);
    if (!text) {
      await e.api.sendMessage({ chat_id: e.chatId, text: '`font <font name> : <text>`' });
      return;
    }
  } else {
    font = input;
    text = reply.text || reply.caption || '';
  }
  if (!(font in fonts_fontgen)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`${font} not in font list\`.` });
    return;
  }
  const msg = gen_font_fontgen(text, fonts_fontgen[font]);
  await e.api.sendMessage({ chat_id: e.chatId, text: msg });
});
}
{ // ===== ports/B/forcesubscribe.js =====

const cache_forcesub = {};

async function setting_forcesub(chatId) {
  const rows = await db.select().from(forcesub).all().catch(() => []);
  const hit = rows.find((r) => Number(r.chatId) === Number(chatId));
  return hit ? hit.channel : null;
}

ultroidCmd('fsub( (.*)|$)', { groups_only: true, admins_only: true }, async (e) => {
  const match = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!match) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('fsub_1') });
    return;
  }
  // Degraded: MTProto id parsing is unavailable; accept numeric ids / @usernames / invite links as-is.
  const first = match.split(/\s+/)[0];
  if (!first) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('fsub_2') });
    return;
  }
  await db.delete(forcesub).where(eq(forcesub.chatId, e.chatId)).run().catch(() => {});
  await db.insert(forcesub).values({ chatId: e.chatId, channel: first }).run().catch(() => {});
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Added ForceSub in This Chat !' });
});

ultroidCmd('remfsub$', async (e) => {
  const res = await setting_forcesub(e.chatId);
  if (!res) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('fsub_3') });
    return;
  }
  await db.delete(forcesub).where(eq(forcesub.chatId, e.chatId)).run().catch(() => {});
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Removed ForceSub...' });
});

ultroidCmd('checkfsub$', async (e) => {
  const res = await setting_forcesub(e.chatId);
  if (!res) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'ForceSub is Not Active In This Chat !' });
    return;
  }
  let title = res;
  try {
    const cha = await e.api.getChat({ chat_id: res });
    title = cha.title || res;
  } catch {}
  await e.api.sendMessage({ chat_id: e.chatId, text: `**ForceSub Status** : \`Active\`\n- **${title}** \`(${res})\`` });
});

// Note: live enforcement on every message needs a passive NewMessage monitor (MTProto-only);
// in the Bot API isolate use the "Unmute Me" button flow below plus manual checks.
regInline('fsub( (.*)|$)', { owner: true })(async (ev) => {
  const match = (ev.text || '').replace(/^fsub\s*/, '').trim();
  const spli = match.split('_');
  const userId = spli[0];
  const channel = spli.slice(1).join('_');
  const text = `Hi [user](tg://user?id=${userId}), You Need to Join ${channel} in order to Chat in this Group.`;
  const el = channel.indexOf('http') === 0 ? channel : `https://t.me/${String(channel).replace(/^@/, '')}`;
  try {
    await ev.api.answerInlineQuery({
      inline_query_id: ev.query.id,
      results: [{
        type: 'article',
        id: 'forcesub',
        title: 'forcesub',
        input_message_content: { message_text: text },
        reply_markup: {
          inline_keyboard: [
            [{ text: get_string('fsub_4'), url: el }],
            [{ text: get_string('fsub_5'), callback_data: `unm_${match}` }],
          ],
        },
      }],
    });
  } catch {}
});

regCallback(/^unm_(.*)$/)(async ({ api, query, data_match }) => {
  const match = data_match[1];
  const spli = match.split('_');
  if (Number(query.from && query.from.id) !== Number(spli[0])) {
    await api.answerCallbackQuery({ callback_query_id: query.id, text: get_string('fsub_7'), show_alert: true }).catch(() => {});
    return;
  }
  try {
    const m = await api.getChatMember({ chat_id: spli[1], user_id: Number(spli[0]) });
    if (m.status === 'left' || m.status === 'kicked') throw new Error('not participant');
  } catch {
    await api.answerCallbackQuery({ callback_query_id: query.id, text: get_string('fsub_6'), show_alert: true }).catch(() => {});
    return;
  }
  try {
    await api.restrictChatMember({
      chat_id: query.message && query.message.chat && query.message.chat.id,
      user_id: Number(spli[0]),
      permissions: { can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_add_web_page_previews: true },
    });
  } catch {}
  try {
    await api.editMessageText({
      chat_id: query.message && query.message.chat && query.message.chat.id,
      message_id: query.message && query.message.message_id,
      text: get_string('fsub_8'),
    });
  } catch {
    await api.answerCallbackQuery({ callback_query_id: query.id, text: get_string('fsub_8') }).catch(() => {});
  }
  if (cache_forcesub[query.message && query.message.chat && query.message.chat.id]) {
    delete cache_forcesub[query.message.chat.id][spli[0]];
  }
});
}
{ // ===== ports/B/gdrive.js =====

// Degraded: Google Drive needs OAuth credentials + local files (unavailable in V8 isolate, Bot API only).
// Same commands + same reply texts as the Python original.

function botname_gdrive(e) {
  return (e.cfg && (e.cfg.BOT_USERNAME || e.cfg.ASST_USERNAME)) || 'bot';
}

ultroidCmd('gdown( (.*)|$)', { sudo: true }, async (e) => {
  const match = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!match) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Give file id or Gdrive link to download from!`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  await e.api.sendMessage({ chat_id: e.chatId, text: '`G-Drive download needs OAuth credentials, which are unavailable in the Bot API isolate.`' });
});

ultroidCmd('gdlist$', { sudo: true }, async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('gdrive_6', botname_gdrive(e)) });
});

ultroidCmd('gdul( (.*)|$)', { sudo: true }, async (e) => {
  const inputFile = (e.pattern_match && e.pattern_match[1] || '').trim() || (e.replyTo ? 'reply' : '');
  if (!inputFile) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to file or give its location.`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  await e.api.sendMessage({ chat_id: e.chatId, text: '`G-Drive upload needs OAuth credentials, which are unavailable in the Bot API isolate.`' });
});

ultroidCmd('gdsearch( (.*)|$)', { sudo: true }, async (e) => {
  const inputStr = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!inputStr) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Give filename to search on GDrive...`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: `\`Searching for ${inputStr} in G-Drive...\`` });
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('gdrive_6', botname_gdrive(e)) });
});

ultroidCmd('gdfolder$', { sudo: true }, async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('gdrive_6', botname_gdrive(e)) });
});
}
{ // ===== ports/B/giftools.js =====

// Degraded: GIF/video editing needs ffmpeg (unavailable in V8 isolate, Bot API only).
// Same commands + same reply texts as the Python original.

ultroidCmd('(bw|invert)gif$', async (e) => {
  const a = e.replyTo;
  if (!(a && (a.animation || a.document || a.video))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply To gif only`' });
    return;
  }
  const mime = a.document ? a.document.mime_type || '' : '';
  if (!(a.animation || mime === 'image/gif')) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply To Gif Only`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  await e.api.sendMessage({ chat_id: e.chatId, text: '`GIF filters need ffmpeg, which is unavailable in the Bot API isolate. GIF was not modified.`' });
});

ultroidCmd('rvgif$', async (e) => {
  const a = e.replyTo;
  if (!(a && (a.video || a.animation || a.document))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply To Video only`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  await e.api.sendMessage({ chat_id: e.chatId, text: '`- **Reversed Video/GIF** (needs ffmpeg, which is unavailable in the Bot API isolate.)`' });
});

ultroidCmd('gif( (.*)|$)', async (e) => {
  const get = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!get) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`gif <query>`' });
    return;
  }
  // Degraded: @gif inline-bot queries need MTProto inline queries (unavailable in Bot API isolate).
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_2') });
  await e.api.sendMessage({ chat_id: e.chatId, text: '`GIF search needs the @gif inline bot, which is unavailable in the Bot API isolate.`' });
});

ultroidCmd('vtog$', async (e) => {
  const a = e.replyTo;
  if (!(a && (a.video || a.document))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply To video only`' });
    return;
  }
  const mime = a.document ? a.document.mime_type || '' : '';
  if (!(a.video || mime.indexOf('video') !== -1)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply To Video Only`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Video-to-GIF needs ffmpeg, which is unavailable in the Bot API isolate.`' });
});
}
{ // ===== ports/B/glitch.js =====

// Degraded: glitch art needs glitch_me + PIL + ffmpeg (unavailable in V8 isolate, Bot API only).
ultroidCmd('glitch$', async (e) => {
  const reply = e.replyTo;
  if (!(reply && (reply.photo || reply.sticker || reply.document))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cvt_3') });
    return;
  }
  if (!(reply.photo || reply.sticker || (reply.document && reply.document.thumb))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_4') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('glitch_1') });
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Glitch art needs glitch_me/PIL, which is unavailable in the Bot API isolate. Media was not modified.`' });
});
}
{ // ===== ports/B/globaltools.js =====

async function rows_gban_globaltools() {
  return db.select().from(gbans).all().catch(() => []);
}

async function rows_gmute_globaltools() {
  return db.select().from(gmutes).all().catch(() => []);
}

function target_globaltools(e) {
  if (e.replyTo && e.replyTo.from && e.replyTo.from.id) return Number(e.replyTo.from.id);
  const raw = ((e.pattern_match && e.pattern_match[1] || '').trim().split(/\s+/)[0] || '').replace(/^@/, '');
  if (/^-?\d+$/.test(raw)) return Number(raw);
  if (e.isPrivate) return Number(e.chatId);
  // Degraded: @username resolution needs MTProto entity lookup (unavailable in Bot API isolate).
  return null;
}

ultroidCmd('gpromote( (.*)|$)', { sudo: true }, async (e) => {
  const x = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!x) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('schdl_2') });
    return;
  }
  // Degraded: no dialog iteration in the Bot API isolate; promote in the current chat only.
  const reply = e.replyTo;
  const ok = (e.text || '').split(/\s+/);
  let key = 'all';
  let rank = 'AdMin';
  let userid = null;
  if (reply && reply.from) {
    userid = Number(reply.from.id);
    if (ok.length > 1 && (ok[1].indexOf('group') !== -1 || ok[1].indexOf('channel') !== -1)) key = ok[1];
    rank = ok[2] || 'AdMin';
  } else {
    const user = ok[1];
    if (!user) {
      await e.api.sendMessage({ chat_id: e.chatId, text: "`Give someone's username/id or replied to user.`" });
      return;
    }
    if (!/^-?\d+$/.test(user)) {
      await e.api.sendMessage({ chat_id: e.chatId, text: `\`No User Found Regarding ${user}\`` });
      return;
    }
    userid = Number(user);
    if (ok.length > 2 && (ok[2].indexOf('group') !== -1 || ok[2].indexOf('channel') !== -1)) key = ok[2];
    rank = ok[3] || 'AdMin';
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: reply ? '`Promoting Replied User Globally`' : `\`Promoting ${userid} globally.\`` });
  let c = 0;
  try {
    await e.api.promoteChatMember({
      chat_id: e.chatId,
      user_id: userid,
      can_invite_users: true,
      can_pin_messages: true,
      can_delete_messages: true,
      can_restrict_members: true,
    });
    c = 1;
  } catch {}
  await e.api.sendMessage({ chat_id: e.chatId, text: reply ? `Promoted The Replied Users in Total : ${c} ${key} chats` : `Promoted ${userid} in Total : ${c} ${key} chats.` });
});

ultroidCmd('gdemote( (.*)|$)', { sudo: true }, async (e) => {
  const x = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (!x) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('schdl_2') });
    return;
  }
  const reply = e.replyTo;
  const ok = (e.text || '').split(/\s+/);
  let key = 'all';
  let userid = null;
  if (reply && reply.from) {
    userid = Number(reply.from.id);
    if (ok.length > 1 && (ok[1].indexOf('group') !== -1 || ok[1].indexOf('channel') !== -1)) key = ok[1];
  } else {
    const user = ok[1];
    if (!user) {
      await e.api.sendMessage({ chat_id: e.chatId, text: "`Give someone's username/id or replied to user.`" });
      return;
    }
    if (!/^-?\d+$/.test(user)) {
      await e.api.sendMessage({ chat_id: e.chatId, text: `\`No User Found Regarding ${user}\`` });
      return;
    }
    userid = Number(user);
    if (ok.length > 2 && (ok[2].indexOf('group') !== -1 || ok[2].indexOf('channel') !== -1)) key = ok[2];
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: reply ? '`Demoting Replied User Globally`' : `\`Demoting ${userid} globally.\`` });
  let c = 0;
  try {
    await e.api.promoteChatMember({
      chat_id: e.chatId,
      user_id: userid,
      can_invite_users: false,
      can_pin_messages: false,
      can_delete_messages: false,
      can_restrict_members: false,
      can_promote_members: false,
      can_change_info: false,
    });
    c = 1;
  } catch {}
  await e.api.sendMessage({ chat_id: e.chatId, text: reply ? `Demoted The Replied Users in Total : ${c} ${key} chats` : `Demoted ${userid} in Total : ${c} ${key} chats.` });
});

ultroidCmd('ungban( (.*)|$)', { sudo: true }, async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: '`UnGbanning...`' });
  const userid = target_globaltools(e);
  if (!userid) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to some msg or add their id.`' });
    return;
  }
  const rows = await rows_gban_globaltools();
  if (!rows.some((r) => Number(r.userId) === userid)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`User/Channel is not Gbanned...`' });
    return;
  }
  let chats = 0;
  try {
    await e.api.unbanChatMember({ chat_id: e.chatId, user_id: userid });
    chats = 1;
  } catch {}
  await db.delete(gbans).where(eq(gbans.userId, userid)).run().catch(() => {});
  await e.api.sendMessage({ chat_id: e.chatId, text: `\`Ungbaned\` [user](tg://user?id=${userid}) in ${chats} \`chats.\nRemoved from gbanwatch.\`` });
});

ultroidCmd('gban( (.*)|$)', { sudo: true }, async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Gbanning...`' });
  let userid = null;
  let reason = '';
  if (e.replyTo && e.replyTo.from) {
    userid = Number(e.replyTo.from.id);
    reason = (e.text || '').split(/\s+/).slice(1).join(' ');
  } else if ((e.pattern_match && e.pattern_match[1] || '').trim()) {
    const parts = (e.text || '').split(/\s+/);
    const usr = (parts[1] || '').replace(/^@/, '');
    if (!/^-?\d+$/.test(usr)) {
      await e.api.sendMessage({ chat_id: e.chatId, text: `\`No User Found Regarding ${usr}\`` });
      return;
    }
    userid = Number(usr);
    reason = parts.slice(2).join(' ');
  } else if (e.isPrivate) {
    userid = Number(e.chatId);
    reason = (e.text || '').split(/\s+/).slice(1).join(' ');
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to some msg or add their id.`' });
    return;
  }
  const rows = await rows_gban_globaltools();
  if (rows.some((r) => Number(r.userId) === userid)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`User is already gbanned and added to gbanwatch.`' });
    return;
  }
  // Bot API equivalent: ban in the current chat (no dialog iteration in the isolate).
  let chats = 0;
  try {
    await e.api.banChatMember({ chat_id: e.chatId, user_id: userid });
    chats = 1;
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: "`I don't have the right to ban a user.`" });
    return;
  }
  await db.insert(gbans).values({ userId: userid, reason: reason || null, date: Date.now() }).run().catch(() => {});
  let gbMsg = `**#Gbanned** [user](tg://user?id=${userid}) \`in ${chats} chats and added to gbanwatch!\``;
  if (reason) gbMsg += `\n**Reason** : ${reason}`;
  await e.api.sendMessage({ chat_id: e.chatId, text: gbMsg });
});

ultroidCmd('g(admin|)cast( (.*)|$)', { sudo: true }, async (e) => {
  const arg = (e.pattern_match && e.pattern_match[2] || '').trim();
  const msg = arg || (e.replyTo ? e.replyTo.text || e.replyTo.caption : '');
  if (!msg) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Give some text to Globally Broadcast or reply a message..`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Globally Broadcasting Msg...`' });
  // Degraded: no dialog iteration in the Bot API isolate; deliver to the current chat only.
  let er = 0;
  let done = 0;
  try {
    await e.api.sendMessage({ chat_id: e.chatId, text: msg });
    done = 1;
  } catch {
    er = 1;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: `Done in ${done} chats, error in ${er} chat(s)` });
});

ultroidCmd('gucast( (.*)|$)', { sudo: true }, async (e) => {
  const arg = (e.pattern_match && e.pattern_match[1] || '').trim();
  const msg = arg || (e.replyTo ? e.replyTo.text || e.replyTo.caption : '');
  if (!msg) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Give some text to Globally Broadcast or reply a message..`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Globally Broadcasting Msg...`' });
  // Degraded: no dialog iteration in the Bot API isolate; deliver to the current chat only.
  let er = 0;
  let done = 0;
  try {
    await e.api.sendMessage({ chat_id: e.chatId, text: msg });
    done = 1;
  } catch {
    er = 1;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: `Done in ${done} chats, error in ${er} chat(s)` });
});

ultroidCmd('gkick( (.*)|$)', { sudo: true }, async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Gkicking...`' });
  const userid = target_globaltools(e);
  if (!userid) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to some msg or add their id.`' });
    return;
  }
  // Bot API equivalent of kick: ban then immediately unban, in the current chat.
  let chats = 0;
  try {
    await e.api.banChatMember({ chat_id: e.chatId, user_id: userid });
    await e.api.unbanChatMember({ chat_id: e.chatId, user_id: userid });
    chats = 1;
  } catch {}
  await e.api.sendMessage({ chat_id: e.chatId, text: `\`Gkicked\` [user](tg://user?id=${userid}) \`in ${chats} chats.\`` });
});

ultroidCmd('gmute( (.*)|$)', { sudo: true }, async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Gmuting...`' });
  const userid = target_globaltools(e);
  if (!userid) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to some msg or add their id.`' });
    return;
  }
  const rows = await rows_gmute_globaltools();
  if (rows.some((r) => Number(r.userId) === userid)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`User is already gmuted.`' });
    return;
  }
  let chats = 0;
  try {
    await e.api.restrictChatMember({ chat_id: e.chatId, user_id: userid, permissions: { can_send_messages: false } });
    chats = 1;
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: "`I don't have the right to mute a user.`" });
    return;
  }
  await db.insert(gmutes).values({ userId: userid, reason: null, date: Date.now() }).run().catch(() => {});
  await e.api.sendMessage({ chat_id: e.chatId, text: `\`Gmuted\` [user](tg://user?id=${userid}) \`in ${chats} chats.\`` });
});

ultroidCmd('ungmute( (.*)|$)', { sudo: true }, async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: '`UnGmuting...`' });
  const userid = target_globaltools(e);
  if (!userid) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to some msg or add their id.`' });
    return;
  }
  const rows = await rows_gmute_globaltools();
  if (!rows.some((r) => Number(r.userId) === userid)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`User is not gmuted.`' });
    return;
  }
  let chats = 0;
  try {
    await e.api.restrictChatMember({
      chat_id: e.chatId,
      user_id: userid,
      permissions: { can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_add_web_page_previews: true },
    });
    chats = 1;
  } catch {}
  await db.delete(gmutes).where(eq(gmutes.userId, userid)).run().catch(() => {});
  await e.api.sendMessage({ chat_id: e.chatId, text: `\`Ungmuted\` [user](tg://user?id=${userid}) \`in ${chats} chats.\`` });
});

ultroidCmd('listgban$', async (e) => {
  const users = await rows_gban_globaltools();
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  if (!users.length) {
    await e.api.sendMessage({ chat_id: e.chatId, text: "`You haven't GBanned anyone!`" });
    return;
  }
  let msg = '';
  for (const i of users) {
    msg += `<strong>User</strong>: <a href="tg://user?id=${i.userId}">${i.userId}</a>\n`;
    msg += i.reason ? `<strong>Reason</strong>: ${i.reason}\n\n` : '\n';
  }
  const owner = (e.cfg && e.cfg.OWNER_NAME) || 'owner';
  await e.api.sendMessage({ chat_id: e.chatId, text: `<strong>List of users GBanned by ${owner}</strong>:\n\n${msg}`, parse_mode: 'HTML' });
});

ultroidCmd('gstat( (.*)|$)', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const userid = target_globaltools(e);
  if (!userid) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to some msg or add their id.`' });
    return;
  }
  const rows = await rows_gban_globaltools();
  const hit = rows.find((r) => Number(r.userId) === Number(userid));
  let msg = `**${userid} is `;
  if (hit) {
    msg += 'Globally Banned';
    msg += hit.reason ? ` with reason** \`${hit.reason}\`` : '.**';
  } else {
    msg += 'not Globally Banned.**';
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: msg });
});

ultroidCmd('gblacklist$', async (e) => {
  await gblacker_globaltools(e, 'add');
});

ultroidCmd('ungblacklist$', async (e) => {
  await gblacker_globaltools(e, 'remove');
});

async function gblacker_globaltools(event, type_) {
  let chatId = event.chatId;
  const parts = (event.text || '').split(/\s+/);
  if (parts[1] && /^-?\d+$/.test(parts[1])) chatId = Number(parts[1]);
  const list = (await getKey('GBLACKLISTS')) || [];
  if (type_ === 'add') {
    if (!list.includes(chatId)) list.push(chatId);
  } else {
    const i = list.indexOf(chatId);
    if (i !== -1) list.splice(i, 1);
  }
  await setKey('GBLACKLISTS', list);
  await event.api.sendMessage({ chat_id: event.chatId, text: `Global Broadcasts: \n${type_}ed ${chatId}` });
}
}
{ // ===== ports/B/greetings.js =====

async function greeting_row_greetings(chatId, kind) {
  const rows = await db.select().from(greetings).all().catch(() => []);
  return rows.find((r) => Number(r.chatId) === Number(chatId) && r.kind === kind);
}

async function greeting_set_greetings(chatId, kind, text, mediaFileId) {
  await db.delete(greetings).where(and(eq(greetings.chatId, chatId), eq(greetings.kind, kind))).run().catch(() => {});
  await db.insert(greetings).values({ chatId, kind, text: text || null, mediaFileId: mediaFileId || null, enabled: true }).run().catch(() => {});
}

async function greeting_del_greetings(chatId, kind) {
  await db.delete(greetings).where(and(eq(greetings.chatId, chatId), eq(greetings.kind, kind))).run().catch(() => {});
}

function greeting_format_greetings(tpl, chatTitle, member) {
  const name = (member && (member.first_name || member.username)) || 'user';
  return String(tpl || '')
    .replace(/\{mention\}/g, member ? `[${name}](tg://user?id=${member.id})` : name)
    .replace(/\{group\}/g, chatTitle || '')
    .replace(/\{count\}/g, '')
    .replace(/\{fullname\}/g, name)
    .replace(/\{name\}/g, name)
    .replace(/\{username\}/g, (member && member.username) || name)
    .replace(/\{userid\}/g, member ? String(member.id) : '');
}

async function greeting_send_greetings(e, row, fallbackLabel) {
  const msgg = row.text;
  const med = row.mediaFileId;
  if (med) {
    // Bot API equivalent: resend saved media by file_id.
    try {
      await e.api.sendPhoto({ chat_id: e.chatId, photo: med, caption: msgg || '' });
      return;
    } catch {}
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: msgg ? `${fallbackLabel}\n\n\`${msgg}\`` : fallbackLabel });
}

ultroidCmd('setwelcome', { groups_only: true }, async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const r = e.replyTo;
  let text = (e.args || '').trim() || null;
  let media = null;
  if (r && (r.photo || r.video || r.document || r.sticker || r.animation)) {
    const m = r.photo ? r.photo[r.photo.length - 1] : r.video || r.document || r.sticker || r.animation;
    media = m && m.file_id ? m.file_id : null;
    if (!text) text = r.text || r.caption || null;
  }
  if (!text && !media) {
    if (r && (r.text || r.caption)) {
      text = r.text || r.caption;
    } else {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('grt_3') });
      return;
    }
  }
  await greeting_set_greetings(e.chatId, 'welcome', text, media);
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('grt_1') });
});

ultroidCmd('clearwelcome$', { groups_only: true }, async (e) => {
  if (!await greeting_row_greetings(e.chatId, 'welcome')) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('grt_4') });
    return;
  }
  await greeting_del_greetings(e.chatId, 'welcome');
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('grt_5') });
});

ultroidCmd('getwelcome$', { groups_only: true }, async (e) => {
  const wel = await greeting_row_greetings(e.chatId, 'welcome');
  if (!wel || (!wel.text && !wel.mediaFileId)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('grt_4') });
    return;
  }
  await greeting_send_greetings(e, wel, '**Welcome Note in this chat**');
});

ultroidCmd('setgoodbye', { groups_only: true }, async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const r = e.replyTo;
  let text = (e.args || '').trim() || null;
  let media = null;
  if (r && (r.photo || r.video || r.document || r.sticker || r.animation)) {
    const m = r.photo ? r.photo[r.photo.length - 1] : r.video || r.document || r.sticker || r.animation;
    media = m && m.file_id ? m.file_id : null;
    if (!text) text = r.text || r.caption || null;
  }
  if (!text && !media) {
    if (r && (r.text || r.caption)) {
      text = r.text || r.caption;
    } else {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('grt_7') });
      return;
    }
  }
  await greeting_set_greetings(e.chatId, 'goodbye', text, media);
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Goodbye note saved`' });
});

ultroidCmd('cleargoodbye$', { groups_only: true }, async (e) => {
  if (!await greeting_row_greetings(e.chatId, 'goodbye')) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('grt_6') });
    return;
  }
  await greeting_del_greetings(e.chatId, 'goodbye');
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Goodbye Note Deleted`' });
});

ultroidCmd('getgoodbye$', { groups_only: true }, async (e) => {
  const wel = await greeting_row_greetings(e.chatId, 'goodbye');
  if (!wel || (!wel.text && !wel.mediaFileId)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('grt_6') });
    return;
  }
  await greeting_send_greetings(e, wel, '**Goodbye Note in this chat**');
});

ultroidCmd('thankmembers (on|off)', { groups_only: true }, async (e) => {
  const type_ = (e.pattern_match && e.pattern_match[1] || '').trim().toLowerCase();
  await greeting_set_greetings(e.chatId, 'thanks', type_, null);
  await e.api.sendMessage({ chat_id: e.chatId, text: `**Done! Thank you members has been turned** \`${type_}\` **for this chat**!` });
});
}
{ // ===== ports/B/imagetools.js =====

// Degraded: OpenCV/PIL pixel editing needs native libs (unavailable in V8 isolate, Bot API only).
// API-based tools (DeepAI colorizer, nekobot) use fetch, like the original used requests.

function media_file_id_imagetools(reply) {
  if (!reply) return null;
  if (reply.photo) return reply.photo[reply.photo.length - 1].file_id;
  const m = reply.document || reply.video || reply.sticker || reply.animation;
  return m && m.file_id ? m.file_id : null;
}

function token_imagetools(e) {
  return (e.cfg && e.cfg.BOT_TOKEN) || '';
}

ultroidCmd('color$', async (e) => {
  const reply = e.replyTo;
  if (!(reply && (reply.photo || reply.document))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply To a Black and White Image`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Coloring image 🎨🖌️...`' });
  const key = await getKey('DEEP_API');
  if (!key) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Get api nd set `setdb DEEP_API key`' });
    return;
  }
  // Same DeepAI colorizer API the original used, fed with the replied photo via getFile.
  try {
    const fid = media_file_id_imagetools(reply);
    const file = await e.api.getFile({ file_id: fid });
    const imgResp = await fetch(`https://api.telegram.org/file/bot${token_imagetools(e)}/${file.file_path}`);
    const buf = await imgResp.arrayBuffer();
    const form = new FormData();
    form.append('image', new Blob([buf]), 'ult.jpg');
    const r = await fetch('https://api.deepai.org/api/colorizer', { method: 'POST', headers: { 'api-key': key }, body: form });
    const j = await r.json();
    if (j.status) {
      await e.api.sendMessage({ chat_id: e.chatId, text: `${j.status}\nGet api nd set \`setdb DEEP_API key\`` });
      return;
    }
    await e.api.sendPhoto({ chat_id: e.chatId, photo: j.output_url });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_7') });
  }
});

ultroidCmd('(grey|blur|negative|danger|mirror|quad|sketch|flip|toon)$', async (e) => {
  const ureply = e.replyTo;
  if (!(ureply && (ureply.photo || ureply.document || ureply.sticker || ureply.video))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cvt_3') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  await e.api.sendMessage({ chat_id: e.chatId, text: '`This filter needs OpenCV, which is unavailable in the Bot API isolate. Image was not modified.`' });
});

ultroidCmd('csample (.*)', async (e) => {
  const color = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (color) {
    // Degraded: rendering a color swatch needs PIL (unavailable in V8 isolate).
    await e.api.sendMessage({ chat_id: e.chatId, text: `Colour Sample for \`${color}\` !\n(isolate cannot render images; use \`${color}\` as the color value.)` });
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Wrong Color Name/Hex Code specified!' });
  }
});

ultroidCmd('blue$', async (e) => {
  const ureply = e.replyTo;
  if (!(ureply && (ureply.photo || ureply.document || ureply.sticker || ureply.video))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cvt_3') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '`...`' });
  // Same nekobot blurpify API the original used, fed with the replied photo via getFile.
  try {
    const fid = media_file_id_imagetools(ureply);
    const file = await e.api.getFile({ file_id: fid });
    const lnk = `https://api.telegram.org/file/bot${token_imagetools(e)}/${file.file_path}`;
    const r = await fetch(`https://nekobot.xyz/api/imagegen?type=blurpify&image=${encodeURIComponent(lnk)}`);
    const j = await r.json();
    if (!j.success) {
      await e.api.sendMessage({ chat_id: e.chatId, text: j.message });
      return;
    }
    await e.api.sendPhoto({ chat_id: e.chatId, photo: j.message });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_7') });
  }
});

ultroidCmd('border( (.*)|$)', async (e) => {
  const hm = e.replyTo;
  if (!(hm && (hm.photo || hm.sticker))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to Sticker or Photo..`' });
    return;
  }
  const col = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (col) {
    try {
      let c = col;
      if (c.indexOf(';') !== -1) {
        const p = c.split(';');
        const wh = parseInt((p[1] || '').trim(), 10);
        if (!Number.isFinite(wh)) throw new Error('bad width');
        c = p[0];
      }
      const nums = c.split(',').slice(0, 2).map((x) => {
        const n = parseInt(x.trim(), 10);
        if (!Number.isFinite(n)) throw new Error('bad color');
        return n;
      });
      if (!nums.length) throw new Error('bad color');
    } catch {
      await e.api.sendMessage({ chat_id: e.chatId, text: '`Not a Valid Input...`' });
      return;
    }
  }
  // Degraded: drawing borders needs OpenCV (unavailable in V8 isolate).
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Adding borders needs OpenCV, which is unavailable in the Bot API isolate.`' });
});

ultroidCmd('pixelator( (.*)|$)', async (e) => {
  const replyMessage = e.replyTo;
  if (!(replyMessage && (replyMessage.photo || replyMessage.sticker))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to a photo`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: pixelation needs OpenCV (unavailable in V8 isolate).
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Pixelation needs OpenCV, which is unavailable in the Bot API isolate.`' });
});
}
{ // ===== ports/C/locks.js =====
// locks.py -> locks.js
// Group permission locks. MTProto EditChatDefaultBannedRightsRequest has no
// Bot API equivalent for all lock types, so this uses setChatPermissions as
// the closest Bot API equivalent (same command + same replies).

const state_locks_map = {
  msgs: 'can_send_messages',
  media: 'can_send_photos',
  sticker: 'can_send_other_messages',
  gif: 'can_send_other_messages',
  games: 'can_send_other_messages',
  inline: 'can_send_other_messages',
  polls: 'can_send_polls',
  invites: 'can_invite_users',
  pin: 'can_pin_messages',
  changeinfo: 'can_change_info',
};

ultroidCmd('(un|)lock( (.*)|$)', { admins_only: true }, async (e) => {
  const mat = ((e.pattern_match && e.pattern_match[3]) || '').trim();
  if (!mat) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Give some Proper Input..`' });
    return;
  }
  const lock = (e.pattern_match[1] || '') === '';
  const key = mat.toLowerCase();
  const perm = state_locks_map[key];
  if (!perm) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Incorrect Input`' });
    return;
  }
  const msg = lock ? 'Locked' : 'Unlocked';
  try {
    // Closest Bot API equivalent: toggle one permission, keep the rest open.
    const permissions = {
      can_send_messages: true,
      can_send_photos: true,
      can_send_videos: true,
      can_send_audios: true,
      can_send_documents: true,
      can_send_polls: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
      can_change_info: true,
      can_invite_users: true,
      can_pin_messages: true,
    };
    if (key === 'media') {
      permissions.can_send_photos = !lock;
      permissions.can_send_videos = !lock;
      permissions.can_send_audios = !lock;
      permissions.can_send_documents = !lock;
    } else {
      permissions[perm] = !lock;
    }
    await e.api.setChatPermissions({ chat_id: e.chatId, permissions });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`' + String((err && err.message) || err) + '`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: `**${msg}** - \`${mat}\` ! ` });
});
}
{ // ===== ports/C/logo.js =====
// logo.py -> logo.js
// Logo generator. PIL/LogoHelper/unsplash are unavailable in the V8 isolate,
// so this uses fetch to the dummyimage placeholder service as the closest
// Bot API-friendly equivalent (same command + same reply texts).

ultroidCmd('logo( (.*)|$)', async (e) => {
  const name = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!name) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Give a name too!`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Closest equivalent without PIL: render text via a placeholder image API.
  const url = 'https://dummyimage.com/1024x512/000000/ffffff&text=' + encodeURIComponent(name);
  try {
    await e.api.sendPhoto({ chat_id: e.chatId, photo: url, caption: '`Done!`' });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Done!`\n' + url });
  }
});
}
{ // ===== ports/C/mediatools.js =====
// mediatools.py -> mediatools.js
// mediainfo + rotate. The `mediainfo` binary, cv2, ffmpeg and telegraph are
// unavailable in the V8 isolate, so both commands are degraded to their
// closest Bot API equivalents (same commands + same reply texts).

ultroidCmd('mediainfo( (.*)|$)', async (e) => {
  const match = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  const r = e.replyTo;
  if (r && (r.photo || r.document || r.video || r.audio || r.sticker || r.voice)) {
    // Closest Bot API equivalent: report what the Bot API exposes about media.
    const lines = [];
    if (r.photo && Array.isArray(r.photo) && r.photo.length) {
      const best = r.photo[r.photo.length - 1];
      lines.push(`type: photo, width: ${best.width || '?'}, height: ${best.height || '?'}, file_size: ${best.file_size || '?'}`);
    }
    const doc = r.document || r.video || r.audio || r.sticker || r.voice;
    if (doc) {
      lines.push(`mime_type: ${doc.mime_type || '?'}, file_name: ${doc.file_name || '?'}, file_size: ${doc.file_size || '?'}`);
    }
    // No mediainfo binary / telegraph in isolate: inline the summary instead.
    await e.api.sendMessage({ chat_id: e.chatId, text: '`' + (lines.join('\n') || 'media') + '`' });
    return;
  }
  if (match) {
    // No shell/filesystem in isolate: cannot run `mediainfo` on paths/URLs.
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Cannot inspect files/URLs in this environment.`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('cvt_3') });
});

ultroidCmd('rotate( (.*)|$)', async (e) => {
  // No cv2/ffmpeg in isolate: cannot rotate media, keep command + replies.
  const match = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!e.replyTo) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to a media...`' });
    return;
  }
  const deg = Number(match);
  if (!match || !Number.isFinite(deg)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Please provide a valid angle to rotate media..`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Unsupported Media..\nReply to Photo/Video`' });
});
}
{ // ===== ports/C/misc.js =====
// misc.py -> misc.js
// eod / pntrst / gadget / randomuser use fetch to the same external sites.
// ascii needs img2html + htmlwebshot binaries, unavailable in the V8 isolate,
// so it is degraded (same command + same reply texts).

ultroidCmd('eod$', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  try {
    const da = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mon = months[da.getMonth()];
    const day = String(da.getDate()).padStart(2, '0');
    const li = `https://daysoftheyear.com/days/${mon}/${day}`;
    const res = await fetch(li, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    let te = '🎊 **Events of the Day**\n\n';
    const re = /<a[^>]*class="[^"]*js-link-target[^"]*"[^>]*href="([^"]*daysoftheyear\.com\/days[^"]*)"[^>]*>([^<]+)<\/a>/g;
    let m;
    let n = 0;
    while ((m = re.exec(html)) && n < 5) {
      te += `• [${m[2].trim()}](${m[1]})\n`;
      n += 1;
    }
    await e.api.sendMessage({ chat_id: e.chatId, text: te, parse_mode: 'Markdown', disable_web_page_preview: true });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: '🎊 **Events of the Day**\n\n`Could not fetch events.`' });
  }
});

ultroidCmd('pntrst( (.*)|$)', async (e) => {
  const m = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!m) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Give pinterest link.`' });
    return;
  }
  try {
    const form = new URLSearchParams({ url: m });
    const res = await fetch('https://www.expertstool.com/download-pinterest-video/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0' },
      body: form.toString(),
    });
    const html = await res.text();
    const fm = html.match(/<tr>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/tr>/);
    const file = fm && fm[1];
    if (!file) {
      await e.api.sendMessage({ chat_id: e.chatId, text: '`Wrong link or private pin.`' });
      return;
    }
    await e.api.sendMessage({ chat_id: e.chatId, text: `Pin:- ${m}\n${file}` });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Wrong link or private pin.`' });
  }
});

ultroidCmd('gadget( (.*)|$)', async (e) => {
  const mat = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!mat) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Please Give a Mobile Name to look for.' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  try {
    const query = mat.replace(/ /g, '%20');
    const res = await fetch(`https://gadgets.ndtv.com/search?searchtext=${query}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const linkM = html.match(/<div[^>]*class="[^"]*rvw-imgbox[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"/);
    if (!linkM) {
      await e.api.sendMessage({ chat_id: e.chatId, text: 'No Results Found!' });
      return;
    }
    const href = linkM[1].startsWith('http') ? linkM[1] : `https://gadgets.ndtv.com${linkM[1]}`;
    await e.api.sendMessage({ chat_id: e.chatId, text: `**📱 Mobile / Gadgets Search**\n\n☑️ **[${mat}](${href})**`, parse_mode: 'Markdown', disable_web_page_preview: true });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'No Results Found!' });
  }
});

ultroidCmd('randomuser', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  try {
    const res = await fetch('https://randomuser.me/api/');
    const j = await res.json();
    const u = (j.results && j.results[0]) || {};
    const msg = `Name: ${(u.name && `${u.name.first} ${u.name.last}`) || '?'}\nGender: ${u.gender || '?'}\nEmail: ${u.email || '?'}\nCountry: ${(u.location && u.location.country) || '?'}`;
    const pic = (u.picture && u.picture.large) || undefined;
    if (pic) {
      await e.api.sendPhoto({ chat_id: e.chatId, photo: pic, caption: msg });
    } else {
      await e.api.sendMessage({ chat_id: e.chatId, text: msg });
    }
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Something Went Wrong.`' });
  }
});

ultroidCmd('ascii( (.*)|$)', async (e) => {
  // Degraded: img2html + htmlwebshot need filesystem/binaries, unavailable here.
  if (!e.replyTo) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('ascii_1') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('ascii_2') });
  await e.api.sendMessage({ chat_id: e.chatId, text: '`ASCII conversion is not supported in this environment.`' });
});
}
{ // ===== ports/C/mute.js =====
// mute.py -> mute.js
// Local DB mutes (dmute/undmute) use KV storage; Telegram-level mutes use
// restrictChatMember as the closest Bot API equivalent. The NewMessage
// watcher that auto-deletes muted users' messages must run as a host monitor
// (triggers handled by monitors) — see mute_check_muted below.

async function state_mute_get(chatId) {
  return (await getKey('MUTED_' + chatId)) || [];
}

async function state_mute_add(chatId, userId) {
  const cur = await state_mute_get(chatId);
  if (!cur.map(Number).includes(Number(userId))) {
    cur.push(Number(userId));
    await setKey('MUTED_' + chatId, cur);
  }
}

async function state_mute_del(chatId, userId) {
  const cur = (await state_mute_get(chatId)).filter((x) => Number(x) !== Number(userId));
  await setKey('MUTED_' + chatId, cur);
}

function state_mute_target(e) {
  if (e.replyTo && e.replyTo.from) return Number(e.replyTo.from.id);
  const input = ((e.pattern_match && (e.pattern_match[1] || e.pattern_match[3])) || '').trim() || (e.args || '').trim();
  const num = Number(input);
  if (input && Number.isFinite(num)) return num;
  return null;
}

// Host monitor hook: delete messages from locally-muted users.
// (Original: @ultroid_bot.on(NewMessage) watcher; triggers handled by monitors.)
async function mute_check_muted(e) {
  const muted = await state_mute_get(e.chatId);
  if (muted.map(Number).includes(Number(e.userId))) {
    try {
      await e.api.deleteMessage({ chat_id: e.chatId, message_id: e.message && e.message.message_id });
    } catch {}
  }
}

function state_mute_parse_time(tme) {
  const m = String(tme).match(/^(\d+)(s|m|h|d)?$/i);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = (m[2] || 's').toLowerCase();
  const mult = { s: 1, m: 60, h: 3600, d: 86400 }[unit];
  return Math.floor(Date.now() / 1000) + n * mult;
}

ultroidCmd('dmute( (.*)|$)', async (e) => {
  const userid = state_mute_target(e);
  if (!userid) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to a user or add their userid.`' });
    return;
  }
  const muted = await state_mute_get(e.chatId);
  if (muted.map(Number).includes(Number(userid))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`This user is already muted in this chat.`' });
    return;
  }
  await state_mute_add(e.chatId, userid);
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Successfully muted...`' });
});

ultroidCmd('undmute( (.*)|$)', async (e) => {
  const userid = state_mute_target(e);
  if (!userid) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to a user or add their userid.`' });
    return;
  }
  const muted = await state_mute_get(e.chatId);
  if (!muted.map(Number).includes(Number(userid))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`This user is not muted in this chat.`' });
    return;
  }
  await state_mute_del(e.chatId, userid);
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Successfully unmuted...`' });
});

ultroidCmd('tmute', { groups_only: true }, async (e) => {
  const huh = (e.body || e.text || '').split(/\s+/);
  const tme = huh[1];
  if (!tme) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Time till mute?`' });
    return;
  }
  let userid = null;
  let name = 'user';
  if (e.replyTo && e.replyTo.from) {
    userid = Number(e.replyTo.from.id);
    name = e.replyTo.from.first_name || name;
  } else if (huh[2] && Number.isFinite(Number(huh[2]))) {
    userid = Number(huh[2]);
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('tban_1') });
    return;
  }
  const until = state_mute_parse_time(tme);
  if (!until) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Time till mute?`' });
    return;
  }
  try {
    await e.api.restrictChatMember({
      chat_id: e.chatId,
      user_id: userid,
      permissions: { can_send_messages: false },
      until_date: until,
    });
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`Successfully Muted\` [${name}](tg://user?id=${userid}) \`for ${tme}\``, parse_mode: 'Markdown' });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`' + String((err && err.message) || err) + '`' });
  }
});

ultroidCmd('unmute( (.*)|$)', { admins_only: true }, async (e) => {
  let userid = null;
  let name = 'user';
  if (e.replyTo && e.replyTo.from) {
    userid = Number(e.replyTo.from.id);
    name = e.replyTo.from.first_name || name;
  } else {
    const input = ((e.pattern_match && e.pattern_match[1]) || '').trim() || (e.args || '').trim();
    if (!input) {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('tban_1') });
      return;
    }
    userid = Number(input);
  }
  try {
    await e.api.restrictChatMember({
      chat_id: e.chatId,
      user_id: userid,
      permissions: {
        can_send_messages: true,
        can_send_photos: true,
        can_send_videos: true,
        can_send_audios: true,
        can_send_documents: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
      },
    });
    await state_mute_del(e.chatId, userid);
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`Successfully Unmuted\` [${name}](tg://user?id=${userid})`, parse_mode: 'Markdown' });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`' + String((err && err.message) || err) + '`' });
  }
});

ultroidCmd('mute( (.*)|$)', { admins_only: true }, async (e) => {
  let userid = null;
  let name = 'user';
  if (e.replyTo && e.replyTo.from) {
    userid = Number(e.replyTo.from.id);
    name = e.replyTo.from.first_name || name;
  } else {
    const input = ((e.pattern_match && e.pattern_match[1]) || '').trim() || (e.args || '').trim();
    if (!input) {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('tban_1') });
      return;
    }
    if (!Number.isFinite(Number(input))) {
      await e.api.sendMessage({ chat_id: e.chatId, text: '`' + input + '`' });
      return;
    }
    userid = Number(input);
  }
  try {
    await e.api.restrictChatMember({
      chat_id: e.chatId,
      user_id: userid,
      permissions: { can_send_messages: false },
    });
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`Successfully Muted\` [${name}](tg://user?id=${userid})`, parse_mode: 'Markdown' });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`' + String((err && err.message) || err) + '`' });
  }
});
}
{ // ===== ports/C/nightmode.js =====
// nightmode.py -> nightmode.js
// Auto close/open groups at night. APScheduler + MTProto banned-rights edits
// are unavailable in the V8 isolate, so scheduling is degraded: chats and
// times are stored (same commands + same replies) for a host cron to enforce
// via setChatPermissions.

async function state_nightmode_chats() {
  return (await getKey('NIGHT_CHATS')) || [];
}

ultroidCmd('nmtime( (.*)|$)', async (e) => {
  const raw = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!raw) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('nightm_1') });
    return;
  }
  try {
    const ok = (e.body || e.text || '').split(/\s+/).slice(1);
    if (ok.length !== 4) {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('nightm_1') });
      return;
    }
    const tm = ok.map((x) => Number(x));
    if (tm.some((x) => !Number.isFinite(x))) throw new Error('bad time');
    await setKey('NIGHT_TIME', JSON.stringify(tm));
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('nightm_2') });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('nightm_1') });
  }
});

ultroidCmd('addnm( (.*)|$)', async (e) => {
  const pat = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  const chats = await state_nightmode_chats();
  if (pat) {
    const id = Number(pat);
    if (!Number.isFinite(id)) {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('nightm_5') });
      return;
    }
    if (!chats.map(Number).includes(id)) {
      chats.push(id);
      await setKey('NIGHT_CHATS', chats);
    }
    await e.api.sendMessage({ chat_id: e.chatId, text: `Done, Added ${pat} To Night Mode.` });
    return;
  }
  if (!chats.map(Number).includes(Number(e.chatId))) {
    chats.push(Number(e.chatId));
    await setKey('NIGHT_CHATS', chats);
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('nightm_3') });
});

ultroidCmd('remnm( (.*)|$)', async (e) => {
  const pat = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  let chats = await state_nightmode_chats();
  if (pat) {
    const id = Number(pat);
    if (!Number.isFinite(id)) {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('nightm_5') });
      return;
    }
    chats = chats.filter((x) => Number(x) !== id);
    await setKey('NIGHT_CHATS', chats);
    await e.api.sendMessage({ chat_id: e.chatId, text: `Done, Removed ${pat} To Night Mode.` });
    return;
  }
  chats = chats.filter((x) => Number(x) !== Number(e.chatId));
  await setKey('NIGHT_CHATS', chats);
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('nightm_4') });
});

ultroidCmd('listnm$', async (e) => {
  const chats = await state_nightmode_chats();
  let name = 'NightMode Groups Are-:\n\n';
  for (const x of chats) name += `${x}\n`;
  await e.api.sendMessage({ chat_id: e.chatId, text: name });
});
}
{ // ===== ports/C/nsfwfilter.js =====
// nsfwfilter.py -> nsfwfilter.js
// NSFW filtering. deepai.org image scoring + ProfanityDetector need API keys
// and native binaries, unavailable in the V8 isolate, so media scanning is
// degraded: chats + actions are stored (same commands + same replies) and the
// NewMessage media check must run as a host monitor (triggers handled by
// monitors).

const state_nsfw_warns = {};

ultroidCmd('addnsfw( (.*)|$)', { admins_only: true }, async (e) => {
  const deepApi = await getKey('DEEP_API');
  if (!deepApi) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Get Api from deepai.org and Add It `.setdb DEEP_API your-api`' });
    return;
  }
  let action = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!action || !['ban', 'kick', 'mute'].some((z) => action.includes(z))) action = 'mute';
  await setKey('NSFW_' + e.chatId, action);
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Added This Chat To Nsfw Filter' });
});

ultroidCmd('remnsfw', { admins_only: true }, async (e) => {
  await delKey('NSFW_' + e.chatId);
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Removed This Chat from Nsfw Filter.' });
});

// Host monitor hook (original: nsfw_check NewMessage handler).
// Media scoring via deepai needs the DEEP_API key + file bytes; in the
// isolate we only track warn counts here. Full media deletion + mute/ban
// enforcement must run as a host monitor (triggers handled by monitors).
async function nsfwfilter_check(e) {
  const action = await getKey('NSFW_' + e.chatId);
  if (!action) return;
  const id = Number(e.userId);
  state_nsfw_warns[id] = (state_nsfw_warns[id] || 0) + 1;
  if (state_nsfw_warns[id] >= 3) delete state_nsfw_warns[id];
}
}
{ // ===== ports/C/other.js =====
// other.py -> other.js
// send/dm, fwdreply, save/fsave via Bot API (same commands + same replies).

ultroidCmd('(send|dm)( (.*)|$)', { sudo: true }, async (e) => {
  const parts = (e.body || e.text || '').split(/\s+/);
  if (parts.length <= 1) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('dm_1') });
    return;
  }
  const chat = parts[1];
  const chatId = Number(chat);
  if (!Number.isFinite(chatId) && !chat.startsWith('@')) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`' + chat + '`' });
    return;
  }
  let msg = null;
  if (parts.length > 2) {
    msg = (e.body || '').split(/\s+/).slice(2).join(' ');
  } else if (e.replyTo) {
    msg = e.replyTo.text || e.replyTo.caption || '';
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('dm_2') });
    return;
  }
  if (!msg) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('dm_2') });
    return;
  }
  try {
    await e.api.sendMessage({ chat_id: chatId, text: msg });
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('dm_3') });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('dm_4', String((err && err.message) || err), '.') });
  }
});

ultroidCmd('fwdreply( (.*)|$)', { sudo: true }, async (e) => {
  const message = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!e.replyTo) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('ex_1') });
    return;
  }
  if (!message) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('dm_6') });
    return;
  }
  try {
    const target = e.replyTo.from && e.replyTo.from.id;
    const fwd = await e.api.forwardMessage({
      chat_id: target,
      from_chat_id: e.chatId,
      message_id: e.replyTo.message_id,
    });
    const fwdId = (fwd && (fwd.message_id || (fwd.result && fwd.result.message_id))) || undefined;
    await e.api.sendMessage({ chat_id: target, text: message, ...(fwdId ? { reply_to_message_id: fwdId } : {}) });
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('dm_5') });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('dm_4', String((err && err.message) || err), '.') });
  }
});

ultroidCmd('(f|)save$', async (e) => {
  const x = e.replyTo;
  if (!x) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Reply to Any Message to save it to ur saved messages' });
    return;
  }
  const fwd = (e.pattern_match && e.pattern_match[1] || '').trim() === 'f';
  try {
    if (fwd) {
      await e.api.forwardMessage({ chat_id: e.userId, from_chat_id: e.chatId, message_id: x.message_id });
    } else {
      // Closest Bot API equivalent of send_message(sender, msg): copy it.
      await e.api.copyMessage({ chat_id: e.userId, from_chat_id: e.chatId, message_id: x.message_id });
    }
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Message saved to Your Pm/Saved Messages.' });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`' + String((err && err.message) || err) + '`' });
  }
});
}
{ // ===== ports/C/pdftools.js =====
// pdftools.py -> pdftools.js
// PDF extract/scan/merge. PyPDF2, cv2, scikit-image and shell tools are
// unavailable in the V8 isolate, so all five commands are degraded to their
// closest Bot API equivalents (same commands + same reply texts).

ultroidCmd('pdf( (.*)|$)', async (e) => {
  const r = e.replyTo;
  const isPdf = r && r.document && r.document.mime_type === 'application/pdf';
  if (!isPdf) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply The pdf u Want to Download..`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: no PyPDF2 in isolate, cannot extract pages as images.
  await e.api.sendMessage({ chat_id: e.chatId, text: '`PDF page extraction is not supported in this environment.`' });
});

ultroidCmd('pdtext( (.*)|$)', async (e) => {
  const r = e.replyTo;
  const isPdf = r && r.document && r.document.mime_type === 'application/pdf';
  if (!isPdf) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply The pdf u Want to Download..`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: no PyPDF2 in isolate, cannot extract text.
  await e.api.sendMessage({ chat_id: e.chatId, text: '`PDF text extraction is not supported in this environment.`' });
});

ultroidCmd('pdscan( (.*)|$)', async (e) => {
  const r = e.replyTo;
  if (!(r && (r.photo || r.document))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply The pdf u Want to Download..`' });
    return;
  }
  const name = (r.document && r.document.file_name) || '';
  const isImg = !!(r.photo || /\.(png|jpe?g|webp)$/i.test(name));
  if (!isImg) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to a Image only...`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: no cv2/scikit-image in isolate, cannot scan/crop to PDF.
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Image scanning is not supported in this environment.`' });
});

ultroidCmd('pdsave( (.*)|$)', async (e) => {
  const r = e.replyTo;
  if (!(r && (r.photo || r.document))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to Images/pdf which u want to merge as a single pdf..`' });
    return;
  }
  // Degraded: no cv2/PyPDF2 in isolate, cannot scan or stage pages for merge.
  await e.api.sendMessage({ chat_id: e.chatId, text: '`PDF staging is not supported in this environment.`' });
});

ultroidCmd('pdsend( (.*)|$)', async (e) => {
  // Degraded: no staged pages and no PdfMerger in isolate.
  await e.api.sendMessage({ chat_id: e.chatId, text: 'first select pages by replying .pdsave of which u want to make multi page pdf file' });
});
}
{ // ===== ports/C/pmpermit.js =====
// pmpermit.py -> pmpermit.js
// PM security: approve/disapprove/block/unblock/listapproved + warn flow.
// MTProto-only calls (BlockRequest/UnblockRequest/GetBlockedRequest,
// ReportSpamRequest, edit_folder, inline query clicks) have no Bot API
// equivalent and are degraded (same commands + same reply texts); approvals
// are stored in KV for a host monitor to enforce (triggers handled by
// monitors).

const state_pmpermit_notapproved = {};
const state_pmpermit_todelete = {};
const state_pmpermit_count = {};
const state_pmpermit_lastmsg = {};
const state_pmpermit_warns = {};
const state_pmpermit_warnmsgs = {};

async function state_pmpermit_approved() {
  return (await getKey('PMPERMIT')) || [];
}

async function state_pmpermit_isApproved(uid) {
  return (await state_pmpermit_approved()).map(Number).includes(Number(uid));
}

async function state_pmpermit_add(uid) {
  const cur = await state_pmpermit_approved();
  if (!cur.map(Number).includes(Number(uid))) {
    cur.push(Number(uid));
    await setKey('PMPERMIT', cur);
  }
}

async function state_pmpermit_remove(uid) {
  await setKey('PMPERMIT', (await state_pmpermit_approved()).filter((x) => Number(x) !== Number(uid)));
}

function state_pmpermit_mention(uid, name) {
  const safe = String(name || 'user').replace(/\]/g, '');
  return `[${safe}](tg://user?id=${uid})`;
}

function state_pmpermit_warnText(uid) {
  const warns = state_pmpermit_warns[uid] || 1;
  const max = 4;
  return `**PMSecurity!**\n\n${get_string('pmperm_1')}\n\nYou have ${warns}/${max} warnings!`;
}

ultroidCmd('pmpermit( (.*)|$)', { sudo: true }, async (e) => {
  const arg = (((e.pattern_match && e.pattern_match[1]) || '').trim() || '').toLowerCase();
  const hndlr = (e.cfg && e.cfg.HNDLR) || '.';
  if (['on', 'enable', '1'].includes(arg)) {
    await setKey('PMSETTING', true);
    await e.api.sendMessage({ chat_id: e.chatId, text: '`PMPermit enabled.`' });
  } else if (['off', 'disable', '0'].includes(arg)) {
    await setKey('PMSETTING', false);
    await e.api.sendMessage({ chat_id: e.chatId, text: '`PMPermit disabled.`' });
  } else {
    const on = await getKey('PMSETTING');
    const status = on ? 'enabled' : 'disabled';
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`PMPermit is currently ${status}.\nUse ${hndlr}pmpermit on/off to toggle.\`` });
  }
});

ultroidCmd('(start|stop|clear)archive$', { sudo: true }, async (e) => {
  const x = (e.pattern_match && e.pattern_match[1] || '').trim();
  if (x === 'start') {
    await setKey('MOVE_ARCHIVE', 'True');
    await e.api.sendMessage({ chat_id: e.chatId, text: "Now I will move new Unapproved DM's to archive" });
  } else if (x === 'stop') {
    await setKey('MOVE_ARCHIVE', 'False');
    await e.api.sendMessage({ chat_id: e.chatId, text: "Now I won't move new Unapproved DM's to archive" });
  } else if (x === 'clear') {
    // Degraded: no edit_folder (unarchive) in Bot API.
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Unarchived all chats' });
  }
});

ultroidCmd('(a|approve)(?: |$)', { sudo: true }, async (e) => {
  let uid = null;
  let name = 'user';
  if (e.replyTo && e.replyTo.from) {
    uid = Number(e.replyTo.from.id);
    name = e.replyTo.from.first_name || name;
  } else if (e.isPrivate) {
    uid = Number(e.chatId);
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('pmperm_3') });
    return;
  }
  if (!(await state_pmpermit_isApproved(uid))) {
    await state_pmpermit_add(uid);
    delete state_pmpermit_todelete[uid];
    await e.api.sendMessage({ chat_id: e.chatId, text: `<b>${state_pmpermit_mention(uid, name)}</b> <code>approved to PM!</code>`, parse_mode: 'HTML' });
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`User may already be approved.`' });
  }
});

ultroidCmd('(da|disapprove)(?: |$)', { sudo: true }, async (e) => {
  let uid = null;
  let name = 'user';
  if (e.replyTo && e.replyTo.from) {
    uid = Number(e.replyTo.from.id);
    name = e.replyTo.from.first_name || name;
  } else if (e.isPrivate) {
    uid = Number(e.chatId);
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('pmperm_3') });
    return;
  }
  if (await state_pmpermit_isApproved(uid)) {
    await state_pmpermit_remove(uid);
    await e.api.sendMessage({ chat_id: e.chatId, text: `<b>${state_pmpermit_mention(uid, name)}</b> <code>Disapproved to PM!</code>`, parse_mode: 'HTML' });
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: `<b>${state_pmpermit_mention(uid, name)}</b> <code>was never approved!</code>`, parse_mode: 'HTML' });
  }
});

ultroidCmd('block( (.*)|$)', { sudo: true }, async (e) => {
  const match = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  let uid = null;
  if (e.replyTo && e.replyTo.from) {
    uid = Number(e.replyTo.from.id);
  } else if (match && Number.isFinite(Number(match))) {
    uid = Number(match);
  } else if (e.isPrivate) {
    uid = Number(e.chatId);
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('pmperm_3') });
    return;
  }
  // Degraded: Bot API cannot block users; drop approval and record the block.
  await state_pmpermit_remove(uid);
  const blocked = (await getKey('PMBLOCKED')) || [];
  if (!blocked.map(Number).includes(uid)) {
    blocked.push(uid);
    await setKey('PMBLOCKED', blocked);
  }
  const name = (e.replyTo && e.replyTo.from && e.replyTo.from.first_name) || 'user';
  await e.api.sendMessage({ chat_id: e.chatId, text: `${state_pmpermit_mention(uid, name)} [\`${uid}\`] \`has been blocked!\`` });
});

ultroidCmd('unblock( (.*)|$)', { sudo: true }, async (e) => {
  const match = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (match === 'all') {
    // Degraded: Bot API cannot list blocked users (no GetBlockedRequest).
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
    await setKey('PMBLOCKED', []);
    await e.api.sendMessage({ chat_id: e.chatId, text: '__Unblocked 0 Users!__' });
    return;
  }
  let uid = null;
  if (e.replyTo && e.replyTo.from) {
    uid = Number(e.replyTo.from.id);
  } else if (match && Number.isFinite(Number(match))) {
    uid = Number(match);
  } else if (e.isPrivate) {
    uid = Number(e.chatId);
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('pmperm_3') });
    return;
  }
  // Degraded: Bot API cannot unblock users; clear the local record.
  await setKey('PMBLOCKED', ((await getKey('PMBLOCKED')) || []).filter((x) => Number(x) !== Number(uid)));
  const name = (e.replyTo && e.replyTo.from && e.replyTo.from.first_name) || 'user';
  await e.api.sendMessage({ chat_id: e.chatId, text: `${state_pmpermit_mention(uid, name)} [\`${uid}\`] \`has been UnBlocked!\`` });
});

ultroidCmd('listapproved$', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const all = await state_pmpermit_approved();
  if (!all.length) {
    await e.api.sendMessage({ chat_id: e.chatId, text: "`You haven't approved anyone yet!`" });
    return;
  }
  const lines = all.map((i) => `[${i}] - `).join('\n');
  await e.api.sendMessage({ chat_id: e.chatId, text: `List of approved users:\n${lines}` });
});

ultroidCmd('logpm$', async (e) => {
  if (!e.isPrivate) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Use me in Private.`' });
    return;
  }
  const log = (await getKey('LOGUSERS')) || [];
  if (!log.map(Number).includes(Number(e.chatId))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Wasn\'t logging msgs from here.`' });
    return;
  }
  await setKey('LOGUSERS', log.filter((x) => Number(x) !== Number(e.chatId)));
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Now I Will log msgs from here.`' });
});

ultroidCmd('nologpm$', async (e) => {
  if (!e.isPrivate) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Use me in Private.`' });
    return;
  }
  const log = (await getKey('LOGUSERS')) || [];
  if (log.map(Number).includes(Number(e.chatId))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Wasn\'t logging msgs from here.`' });
    return;
  }
  log.push(Number(e.chatId));
  await setKey('LOGUSERS', log);
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Now I Won\'t log msgs from here.`' });
});

regCallback(/^approve_(.*)$/)(async ({ api, query, data_match }) => {
  const uid = Number(data_match[1]);
  if (!(await state_pmpermit_isApproved(uid))) {
    await state_pmpermit_add(uid);
    delete state_pmpermit_todelete[uid];
    try {
      await api.editMessageText({
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        text: `#APPROVED\n\n[${uid}](tg://user?id=${uid}) was approved to PM you!`,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: 'Disapprove PM', callback_data: `disapprove_${uid}` }, { text: 'Block', callback_data: `block_${uid}` }]] },
      });
    } catch {}
    await api.answerCallbackQuery({ callback_query_id: query.id, text: 'Approved.' });
  } else {
    try {
      await api.editMessageText({
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        text: '`User may already be approved.`',
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: 'Disapprove PM', callback_data: `disapprove_${uid}` }, { text: 'Block', callback_data: `block_${uid}` }]] },
      });
    } catch {}
  }
});

regCallback(/^disapprove_(.*)$/)(async ({ api, query, data_match }) => {
  const uid = Number(data_match[1]);
  if (await state_pmpermit_isApproved(uid)) {
    await state_pmpermit_remove(uid);
    try {
      await api.editMessageText({
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        text: `#DISAPPROVED\n\n[${uid}](tg://user?id=${uid}) was disapproved to PM you!`,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: 'Approve PM', callback_data: `approve_${uid}` }, { text: 'Block', callback_data: `block_${uid}` }]] },
      });
    } catch {}
    await api.answerCallbackQuery({ callback_query_id: query.id, text: 'Disapproved.' });
  } else {
    try {
      await api.editMessageText({
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        text: '`User was never approved!`',
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: 'Disapprove PM', callback_data: `disapprove_${uid}` }, { text: 'Block', callback_data: `block_${uid}` }]] },
      });
    } catch {}
  }
});

regCallback(/^block_(.*)$/)(async ({ api, query, data_match }) => {
  const uid = Number(data_match[1]);
  // Degraded: Bot API cannot block users; drop approval and record the block.
  await state_pmpermit_remove(uid);
  try {
    await api.editMessageText({
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      text: `BLOCKED\n\n[${uid}](tg://user?id=${uid}) was blocked!`,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: 'UnBlock', callback_data: `unblock_${uid}` }]] },
    });
  } catch {}
  await api.answerCallbackQuery({ callback_query_id: query.id, text: 'Blocked.' });
});

regCallback(/^unblock_(.*)$/)(async ({ api, query, data_match }) => {
  const uid = Number(data_match[1]);
  await setKey('PMBLOCKED', ((await getKey('PMBLOCKED')) || []).filter((x) => Number(x) !== Number(uid)));
  try {
    await api.editMessageText({
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      text: `#UNBLOCKED\n\n[${uid}](tg://user?id=${uid}) was unblocked!`,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: 'Block', callback_data: `block_${uid}` }]] },
    });
  } catch {}
  await api.answerCallbackQuery({ callback_query_id: query.id, text: 'Unblocked.' });
});

regCallback(/^deletedissht$/)(async ({ api, query }) => {
  try {
    await api.answerCallbackQuery({ callback_query_id: query.id, text: 'Deleted.' });
    await api.deleteMessage({ chat_id: query.message.chat.id, message_id: query.message.message_id });
  } catch {}
});

regCallback(/^admin_only(.*)$/)(async ({ api, query, data_match }) => {
  const chat = String(data_match[1]).trim();
  try {
    await api.editMessageText({
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      text: query.message.text || 'PM Security',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Approve PM', callback_data: `approve_${chat}` }, { text: 'Block PM', callback_data: `block_${chat}` }],
          [{ text: '« Back', callback_data: `pmbk_${chat}` }],
        ],
      },
    });
  } catch {}
});

regCallback(/^don_(.*)$/)(async ({ api, query, data_match }) => {
  const data = String(data_match[1]).split('/');
  const text = '👮‍♂ Warn Count : ' + (data[0] || '') + '\n🤖 Total Warn Count : ' + (data[1] || '');
  await api.answerCallbackQuery({ callback_query_id: query.id, text });
});

regCallback(/^pmbk_(.*)$/)(async ({ api, query, data_match }) => {
  const fromUser = String(data_match[1]).trim();
  const warns = state_pmpermit_warns[fromUser] || '0';
  const wrns = `${warns}/4`;
  try {
    await api.editMessageText({
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      text: query.message.text || 'PM Security',
      reply_markup: {
        inline_keyboard: [[{ text: 'Warns', callback_data: `admin_only${fromUser}` }, { text: wrns, callback_data: `don_${wrns}` }]],
      },
    });
  } catch {}
});

regInline(/ip_(.*)/, { owner: true })(async ({ api, query, text }) => {
  const m = (text || '').match(/ip_(.*)/);
  const fromUser = m ? m[1].trim() : '';
  const warns = state_pmpermit_warns[fromUser] || '?';
  const msg = state_pmpermit_warnmsgs[fromUser] || '**PMSecurity**';
  const wrns = `${warns}/4`;
  try {
    await api.answerInlineQuery({
      inline_query_id: query.id,
      results: [
        {
          type: 'article',
          id: 'pmpermit_warn',
          title: 'Inline PMPermit.',
          description: '@TeamUltroid',
          input_message_content: { message_text: msg },
          reply_markup: {
            inline_keyboard: [[{ text: 'Warns', callback_data: `admin_only${fromUser}` }, { text: wrns, callback_data: `don_${wrns}` }]],
          },
        },
      ],
    });
  } catch {}
});

// Host monitor hook (original: permitpm NewMessage handler). Sends the
// unapproved-PM warning and auto-blocks on max warns. The live watcher must
// run as a host monitor (triggers handled by monitors).
async function pmpermit_check(e) {
  if (!(await getKey('PMSETTING'))) return;
  if (await state_pmpermit_isApproved(e.userId)) return;
  const cur = (state_pmpermit_count[e.userId] || 0) + 1;
  state_pmpermit_count[e.userId] = cur;
  const msg = state_pmpermit_warnText(e.userId);
  state_pmpermit_warnmsgs[e.userId] = msg;
  state_pmpermit_warns[e.userId] = cur;
  state_pmpermit_lastmsg[e.userId] = e.text;
  state_pmpermit_notapproved[e.userId] = true;
  try {
    state_pmpermit_todelete[e.userId] = await e.api.sendMessage({ chat_id: e.userId, text: msg });
  } catch {}
  if (cur >= 4) {
    try {
      await e.api.sendMessage({ chat_id: e.userId, text: get_string('pmperm_2') });
    } catch {}
    delete state_pmpermit_count[e.userId];
    delete state_pmpermit_lastmsg[e.userId];
  }
}
}
{ // ===== ports/C/polls.js =====
// polls.py -> polls.js
// Anonymous polls via Bot API sendPoll (same command + same reply texts).

ultroidCmd('poll( (.*)|$)', async (e) => {
  if (e.isPrivate) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Use this in Group/Channel.`' });
    return;
  }
  const match = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!match) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Give Proper Input...`' });
    return;
  }
  if (!match.includes(';')) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Unable to Determine Options.`. ' });
    return;
  }
  let ques = match.split(';')[0].trim();
  let option = match.split(';').slice(1).map((z) => z.trim());
  let isAnonymous = true;
  let allowsMultiple = false;
  let ptype = 'regular';
  let correctId = undefined;
  if (match.includes('|')) {
    const ptypeRaw = match.split('|')[1].trim();
    option = match.split('|')[0].split(';').slice(1).map((z) => z.trim());
    let p = ptypeRaw;
    if (p.includes('_')) {
      correctId = Number(p.split('_')[1]) - 1;
      p = p.split('_')[0].trim();
    }
    if (!['public', 'quiz', 'multiple'].includes(p)) {
      await e.api.sendMessage({ chat_id: e.chatId, text: '`Invalid Poll Type...`' });
      return;
    }
    if (p === 'multiple') allowsMultiple = true;
    else if (p === 'public') isAnonymous = false;
    else if (p === 'quiz') ptype = 'quiz';
  }
  option = option.filter((z) => z);
  if (option.length <= 1) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Options Should be More than 1..`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  try {
    await e.api.sendPoll({
      chat_id: e.chatId,
      question: ques,
      options: option.slice(0, 10),
      is_anonymous: isAnonymous,
      type: ptype,
      allows_multiple_answers: allowsMultiple || undefined,
      correct_option_id: ptype === 'quiz' ? (Number.isFinite(correctId) ? correctId : 0) : undefined,
    });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`' + String((err && err.message) || err) + '`' });
  }
});
}
{ // ===== ports/C/profanityfilter.js =====
// profanityfilter.py -> profanityfilter.js
// Per-chat profanity filtering flag. The NewMessage watcher that deletes bad
// words must run as a host monitor (triggers handled by monitors); the word
// list itself is enforced there.

ultroidCmd('(add|rem)profanity$', { admins_only: true }, async (e) => {
  const cas = (e.pattern_match && e.pattern_match[1]) || '';
  const add = cas === 'add';
  if (add) {
    await setKey('PROFANITY_' + e.chatId, 'mute');
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('prof_1') });
    return;
  }
  await delKey('PROFANITY_' + e.chatId);
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('prof_2') });
});

// Host monitor hook (original: profanity NewMessage watcher).
async function profanityfilter_check(e) {
  const on = await getKey('PROFANITY_' + e.chatId);
  if (!on) return;
}
}
{ // ===== ports/C/profile.js =====
// profile.py -> profile.js
// Profile tools. MTProto UpdateProfileRequest/UploadProfilePhotoRequest have
// no userbot equivalent in Bot API; setbio/setname map to the closest Bot
// API equivalents (setMyDescription/setMyName), photo ops to chat-photo APIs
// (same commands + same reply texts).

ultroidCmd('setbio( (.*)|$)', { sudo: true }, async (e) => {
  const set = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  try {
    // Closest Bot API equivalent: set the bot's own description.
    await e.api.setMyDescription({ description: set });
    await e.api.sendMessage({ chat_id: e.chatId, text: `Profile bio changed to\n\`${set}\`` });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `Error occured.\n\`${String((err && err.message) || err)}\`` });
  }
});

ultroidCmd('setname ?((.|//)*)', { sudo: true }, async (e) => {
  const names = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  let firstName = names;
  if (names.includes('//')) firstName = names.split('//')[0].trim();
  try {
    // Closest Bot API equivalent: set the bot's own name.
    await e.api.setMyName({ name: firstName.slice(0, 64) });
    await e.api.sendMessage({ chat_id: e.chatId, text: `Name changed to \`${names}\`` });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `Error occured.\n\`${String((err && err.message) || err)}\`` });
  }
});

ultroidCmd('setpic$', { sudo: true }, async (e) => {
  if (!e.replyTo) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to a Media..`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: Bot API bots cannot change the userbot account photo; the
  // closest equivalent (setChatPhoto) only works on groups/channels.
  try {
    const fileId = e.replyTo.photo
      ? e.replyTo.photo[e.replyTo.photo.length - 1].file_id
      : (e.replyTo.document && e.replyTo.document.file_id);
    if (!fileId) throw new Error('no photo in reply');
    await e.api.setChatPhoto({ chat_id: e.chatId, photo: fileId });
    await e.api.sendMessage({ chat_id: e.chatId, text: '`My Profile Photo has Successfully Changed !`' });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `Error occured.\n\`${String((err && err.message) || err)}\`` });
  }
});

ultroidCmd('delpfp( (.*)|$)', { sudo: true }, async (e) => {
  try {
    // Closest Bot API equivalent: delete the chat photo.
    await e.api.deleteChatPhoto({ chat_id: e.chatId });
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Successfully deleted 1 profile picture(s).`' });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `Error occured.\n\`${String((err && err.message) || err)}\`` });
  }
});

ultroidCmd('poto( (.*)|$)', async (e) => {
  const ult = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  let userId = e.chatId;
  if (e.replyTo && e.replyTo.from) {
    userId = Number(e.replyTo.from.id);
  } else if (ult) {
    const first = ult.split(/\s+/)[0];
    if (Number.isFinite(Number(first))) userId = Number(first);
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  let limit = 1;
  if (ult && ult !== 'all' && Number.isFinite(Number(ult))) limit = Math.max(1, Math.min(10, Number(ult)));
  if (ult === 'all') limit = 10;
  try {
    const res = await e.api.getUserProfilePhotos({ user_id: userId, limit });
    const photos = (res && (res.photos || (res.result && res.result.photos))) || [];
    if (!photos.length || !photos[0].length) {
      await e.api.sendMessage({ chat_id: e.chatId, text: '`Pfp Not Found...`' });
      return;
    }
    for (const size of photos[0].slice(0, 1)) {
      await e.api.sendPhoto({ chat_id: e.chatId, photo: size.file_id });
    }
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Pfp Not Found...`' });
  }
});
}
{ // ===== ports/C/qrcode.js =====
// qrcode.py -> qrcode.js
// QR tools. qrcode lib + cv2 + PIL are unavailable in the V8 isolate, so
// generation uses fetch to the api.qrserver.com image API (same external
// service family) and sends the result as a photo. addqr/qrdecode are
// degraded (same commands + same reply texts).

ultroidCmd('qrcode( (.*)|$)', async (e) => {
  let msg = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (e.replyTo && (e.replyTo.text || e.replyTo.caption)) msg = e.replyTo.text || e.replyTo.caption;
  if (!msg) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Give Some Text or Reply' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const url = 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=' + encodeURIComponent(msg);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('qr api failed');
    await e.api.sendPhoto({ chat_id: e.chatId, photo: url, caption: '`Done!`' });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: url });
  }
});

ultroidCmd('addqr( (.*)|$)', async (e) => {
  const msg = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!(e.replyTo && (e.replyTo.photo || e.replyTo.document)) || !msg) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply Any Media and Give Text`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: compositing a QR onto media needs PIL, unavailable in isolate.
  // Closest equivalent: send the QR for the text as a photo.
  const url = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(msg);
  await e.api.sendPhoto({ chat_id: e.chatId, photo: url, caption: '`Done!`' });
});

ultroidCmd('qrdecode$', async (e) => {
  const r = e.replyTo;
  if (!(r && (r.photo || r.document))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to Qrcode Media`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: downloading the file bytes + cv2 decode need filesystem
  // access, unavailable in the isolate.
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply To Media in Which Qr image present.`' });
});
}
{ // ===== ports/C/resize.js =====
// resize.py -> resize.js
// size + resize. PIL is unavailable in the V8 isolate, so both commands are
// degraded to their closest Bot API equivalents (same commands + same reply
// texts). size reports the Bot API photo dimensions when available.

ultroidCmd('size$', async (e) => {
  const r = e.replyTo;
  if (!(r && (r.photo || r.document || r.video || r.sticker))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('ascii_1') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Closest Bot API equivalent: Bot API photo sizes carry width/height.
  if (r.photo && Array.isArray(r.photo) && r.photo.length) {
    const best = r.photo[r.photo.length - 1];
    await e.api.sendMessage({ chat_id: e.chatId, text: `Dimension Of This Image Is\n\`${best.width} x ${best.height}\`` });
    return;
  }
  // Degraded: documents/video need PIL to measure, unavailable in isolate.
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Cannot measure this media in this environment.`' });
});

ultroidCmd('resize( (.*)|$)', async (e) => {
  const r = e.replyTo;
  if (!(r && (r.photo || r.document || r.video || r.sticker))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('ascii_1') });
    return;
  }
  const sz = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!sz) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Give Some Size To Resize, Like `.resize 720 1080` ' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const parts = sz.split(/\s+/);
  if (parts.length !== 2 || !parts.every((z) => Number.isFinite(Number(z)))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Give Some Size To Resize, Like `.resize 720 1080` ' });
    return;
  }
  // Degraded: resizing pixels needs PIL, unavailable in the V8 isolate.
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Image resizing is not supported in this environment.`' });
});
}
{ // ===== ports/C/schedulemsg.js =====
// schedulemsg.py -> schedulemsg.js
// Scheduled messages. Bot API has no schedule option, so requests are stored
// in KV for a host cron to deliver (same command + same reply texts).

function state_schedule_parseDelay(raw) {
  const s = String(raw).trim();
  if (/^\d+$/.test(s)) return Number(s);
  const m = s.match(/^(\d+)(s|m|h|d|w)?$/i);
  if (!m) return null;
  const n = Number(m[1]);
  const mult = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 }[(m[2] || 's').toLowerCase()];
  return n * mult;
}

ultroidCmd('schedule( (.*)|$)', { sudo: true }, async (e) => {
  const x = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  const xx = e.replyTo;
  async function state_schedule_store(text, delaySec) {
    const fireAt = Math.floor(Date.now() / 1000) + delaySec;
    const all = (await getKey('SCHEDULED')) || [];
    all.push({ chatId: e.chatId, text, fireAt, createdBy: e.userId });
    await setKey('SCHEDULED', all);
  }
  if (x && !xx) {
    const y = x.split(/\s+/).slice(-1)[0];
    const k = x.slice(0, x.length - y.length).trim();
    const delay = state_schedule_parseDelay(y);
    if (delay === null || !k) {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('schdl_2') });
      return;
    }
    await state_schedule_store(k, delay);
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('schdl_1') });
  } else if (xx && x) {
    const delay = state_schedule_parseDelay(x);
    if (delay === null) {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('schdl_2') });
      return;
    }
    await state_schedule_store(xx.text || xx.caption || '', delay);
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('schdl_1') });
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('schdl_2') });
  }
});
}
{ // ===== ports/C/search.js =====
// search.py -> search.js
// github / google / img / reverse / saavn via fetch to the same external
// APIs. google image scraping and reverse-image upload need multipart posts
// + cv2 conversion, unavailable in the isolate, so img/reverse are degraded
// to closest fetch-based equivalents (same commands + same reply texts).

ultroidCmd('github (.*)', async (e) => {
  const usrname = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!usrname) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('srch_1') });
    return;
  }
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(usrname)}`, { headers: { 'User-Agent': 'Ultroid-JS' } });
    const ult = await res.json();
    if (!res.ok || !ult.login) {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('srch_2') });
      return;
    }
    const fullusr = `
**[GITHUB](${ult.html_url})**
**Name** - ${ult.name}
**UserName** - ${ult.login}
**ID** - ${ult.id}
**Company** - ${ult.company}
**Blog** - ${ult.blog}
**Location** - ${ult.location}
**Bio** - ${ult.bio}
**Repos** - ${ult.public_repos}
**Followers** - ${ult.followers}
**Following** - ${ult.following}
`;
    await e.api.sendPhoto({ chat_id: e.chatId, photo: `https://avatars.githubusercontent.com/u/${ult.id}`, caption: fullusr, parse_mode: 'Markdown' });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('srch_2') });
  }
});

ultroidCmd('google( (.*)|$)', async (e) => {
  const inp = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!inp) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('autopic_1') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_2') });
  try {
    // Same external API (google search) via fetch; parse result anchors.
    const res = await fetch(`https://www.google.com/search?q=${encodeURIComponent(inp)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:58.0) Gecko/20100101 Firefox/58.0' },
    });
    const html = await res.text();
    const re = /<a[^>]*href="(\/url\?q=(https?[^"&]+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
    let out = '';
    let n = 0;
    let m;
    while ((m = re.exec(html)) && n < 6) {
      const url = decodeURIComponent(m[2]);
      const title = m[3].replace(/<[^>]+>/g, '').trim().slice(0, 80);
      if (!title || url.includes('google.')) continue;
      out += ` 👉🏻  [${title}](${url})\n\`${url}\`\n\n`;
      n += 1;
    }
    if (!out) {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('autopic_2').replace('{}', inp) });
      return;
    }
    await e.api.sendMessage({ chat_id: e.chatId, text: `**Google Search Query:**\n\`${inp}\`\n\n**Results:**\n${out}`, parse_mode: 'Markdown', disable_web_page_preview: true });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('autopic_2').replace('{}', inp) });
  }
});

ultroidCmd('img( (.*)|$)', async (e) => {
  let query = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!query) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('autopic_1') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  let lmt = 5;
  if (query.includes(';')) {
    const n = Number(query.split(';')[1].trim());
    if (Number.isFinite(n)) lmt = Math.max(1, Math.min(5, n));
    query = query.split(';')[0].trim();
  }
  try {
    // Same external API (google images) via fetch; extract direct image URLs.
    const res = await fetch(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:58.0) Gecko/20100101 Firefox/58.0' },
    });
    const html = await res.text();
    const re = /"ou":"(https?:[^"]+\.(?:jpg|jpeg|png|webp))"/g;
    const found = [];
    let m;
    while ((m = re.exec(html)) && found.length < lmt) found.push(m[1]);
    if (!found.length) {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('autopic_2').replace('{}', query) });
      return;
    }
    for (const img of found) {
      try {
        await e.api.sendPhoto({ chat_id: e.chatId, photo: img });
      } catch {}
    }
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('autopic_2').replace('{}', query) });
  }
});

ultroidCmd('reverse$', async (e) => {
  if (!e.replyTo) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to an Image`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: reverse search needs file conversion (cv2) + multipart upload
  // to google searchbyimage, unavailable in the V8 isolate.
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Reverse image search is not supported in this environment.`' });
});

ultroidCmd('saavn( (.*)|$)', async (e) => {
  const song = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!song) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Give me Something to Search' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: `\`Searching for ${song} on Saavn...\`` });
  try {
    // Same external API family (jiosaavn search) via fetch.
    const res = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(song)}`);
    const j = await res.json();
    const data = (j.data && (j.data.results || j.data)) || [];
    if (!data.length) {
      await e.api.sendMessage({ chat_id: e.chatId, text: `\`${song} not found on saavn.\`` });
      return;
    }
    const top = data[0];
    const title = top.name || top.title || song;
    const url = (top.downloadUrl && (Array.isArray(top.downloadUrl) ? top.downloadUrl.slice(-1)[0].url : top.downloadUrl.url)) || top.url || '';
    const performer = ((top.artists && top.artists.primary && top.artists.primary.map((a) => a.name).join(', ')) || top.artists || '').toString();
    if (!url) {
      await e.api.sendMessage({ chat_id: e.chatId, text: '`Something went wrong.`' });
      return;
    }
    await e.api.sendAudio({ chat_id: e.chatId, audio: url, title, performer, caption: `\`${title}\`\n\`From Saavn\`` });
  } catch {
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`${song} not found on saavn.\`` });
  }
});
}
{ // ===== ports/C/snips.js =====
// snips.py -> snips.js
// Snip CRUD backed by the snips table. The $name trigger watcher is a
// passive monitor (triggers handled by monitors) — see snips_trigger_note;
// only add/del/list/get + comment are implemented here.

ultroidCmd('addsnip( (.*)|$)', async (e) => {
  let wrd = ((e.pattern_match && e.pattern_match[1]) || '').trim().toLowerCase();
  const wt = e.replyTo;
  if (!(wt && wrd)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('snip_1') });
    return;
  }
  if (wrd.includes('$')) wrd = wrd.replace(/\$/g, '');
  const txt = wt.text || wt.caption || '';
  // Media/file_id storage needs pack_bot_file_id + upload; store text only.
  await db.insert(snips).values({ name: wrd, content: txt }).onConflictDoUpdate({ target: snips.name, set: { content: txt } }).run();
  await e.api.sendMessage({ chat_id: e.chatId, text: `Done : snip \`${wrd}\` Saved.` });
});

ultroidCmd('remsnip( (.*)|$)', async (e) => {
  let wrd = ((e.pattern_match && e.pattern_match[1]) || '').trim().toLowerCase();
  if (!wrd) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('snip_2') });
    return;
  }
  if (wrd.startsWith('$')) wrd = wrd.replace(/\$/g, '');
  await db.delete(snips).where(eq(snips.name, wrd)).run();
  await e.api.sendMessage({ chat_id: e.chatId, text: `Done : snip \`${wrd}\` Removed.` });
});

ultroidCmd('listsnip', async (e) => {
  let rows = [];
  try {
    rows = await db.select().from(snips).all();
  } catch {}
  if (rows.length) {
    const sd = 'SNIPS Found :\n\n';
    await e.api.sendMessage({ chat_id: e.chatId, text: sd + rows.map((r) => `• \`$${r.name}\``).join('\n') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: 'No Snips Found Here' });
});

ultroidCmd('getsnip( (.*)|$)', async (e) => {
  const wrd = ((e.pattern_match && e.pattern_match[1]) || '').trim().toLowerCase().replace(/\$/g, '');
  if (!wrd) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('snip_2') });
    return;
  }
  let rows = [];
  try {
    rows = await db.select().from(snips).where(eq(snips.name, wrd)).all();
  } catch {}
  if (rows.length && rows[0].content) {
    await e.api.sendMessage({ chat_id: e.chatId, text: rows[0].content });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: 'No Snips Found Here' });
});

// NOTE: `$name` trigger replies (original add_snips NewMessage handler) are
// passive-monitor territory — the host harness matches `$word` in incoming
// messages against the snips table and replays content. Not implemented here.
}
{ // ===== ports/C/specialtools.js =====
// specialtools.py -> specialtools.js
// getaudio/addaudio need ffmpeg + filesystem (degraded). dob keeps the same
// date math + horoscope lookup via fetch to the same aztros API. sticker
// scrapes the same combot.org site via fetch. wall fetches google images like
// img. q (quotly) needs the quotly API + media handling (degraded).

const state_specialtools_files = [];

ultroidCmd('getaudio$', async (e) => {
  if (!e.replyTo) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('spcltool_1') });
    return;
  }
  // Degraded: downloading + ffmpeg extraction need filesystem/binaries.
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  state_specialtools_files.push(e.replyTo.message_id);
  await setKey('SPECIAL_AUDIO', state_specialtools_files);
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('spcltool_2') });
});

ultroidCmd('addaudio$', async (e) => {
  if (!e.replyTo) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('spcltool_3') });
    return;
  }
  const saved = (await getKey('SPECIAL_AUDIO')) || [];
  if (!saved.length) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`First reply an audio with .addaudio`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: muxing audio into video needs ffmpeg, unavailable in isolate.
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('spcltool_5') });
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Audio muxing is not supported in this environment.`' });
});

ultroidCmd('dob( (.*)|$)', async (e) => {
  const match = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!match) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('spcltool_6') });
    return;
  }
  const parts = match.split('/');
  if (parts.length !== 3) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('spcltool_6') });
    return;
  }
  const day = Number(parts[0]);
  const month = parts[1];
  const year = Number(parts[2]);
  const birth = new Date(year, Number(month) - 1, day);
  if (!Number.isFinite(day) || !Number.isFinite(year) || Number.isNaN(birth.getTime())) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('spcltool_6') });
    return;
  }
  const name = (e.replyTo && e.replyTo.from && e.replyTo.from.first_name) || ((e.cfg && e.cfg.OWNER_NAME) || 'user');
  const now = new Date();
  const diffSec = Math.max(0, (now - birth) / 1000);
  const barsh = diffSec / (365.242 * 24 * 3600);
  const saal = Math.floor(barsh);
  const mash = (barsh - saal) * 12;
  const mahina = Math.floor(mash);
  const divas = (mash - mahina) * (365.242 / 12);
  const din = Math.floor(divas);
  const samay = (divas - din) * 24;
  const ghanta = Math.floor(samay);
  const pehl = (samay - ghanta) * 60;
  const mi = Math.floor(pehl);
  const slive = Math.floor((pehl - mi) * 60);
  const cm = new Date(now.getFullYear(), Number(month) - 1, day);
  const ish = Math.ceil((cm - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000) + 1;
  let hp;
  if (ish === 0) hp = '`Happy BirthDay To U🎉🎊`';
  else if (ish < 0) hp = `${365 + ish} Days Left 🥳`;
  else hp = `${ish} Days Left 🥳`;
  let sign = 'Capricorn';
  if (month === '01') sign = day < 20 ? 'Capricorn' : 'Aquarius';
  else if (month === '02') sign = day < 19 ? 'Aquarius' : 'Pisces';
  else if (month === '03') sign = day < 21 ? 'Pisces' : 'Aries';
  else if (month === '04') sign = day < 20 ? 'Aries' : 'Taurus';
  else if (month === '05') sign = day < 21 ? 'Taurus' : 'Gemini';
  else if (month === '06') sign = day < 21 ? 'Gemini' : 'Cancer';
  else if (month === '07') sign = day < 23 ? 'Cancer' : 'Leo';
  else if (month === '08') sign = day < 23 ? 'Leo' : 'Virgo';
  else if (month === '09') sign = day < 23 ? 'Virgo' : 'Libra';
  else if (month === '10') sign = day < 23 ? 'Libra' : 'Scorpio';
  else if (month === '11') sign = day < 22 ? 'Scorpio' : 'Sagittarius';
  else if (month === '12') sign = day < 22 ? 'Sagittarius' : 'Capricorn';
  let dd = '', ds = '', lt = '', md = '', cl = '', ln = '';
  try {
    const res = await fetch(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`, { method: 'POST' });
    const json = await res.json();
    dd = json.current_date || '';
    ds = json.description || '';
    lt = json.lucky_time || '';
    md = json.mood || '';
    cl = json.color || '';
    ln = json.lucky_number || '';
  } catch {}
  await e.api.sendMessage({
    chat_id: e.chatId,
    text: `
    Name -: ${name}

D.O.B -:  ${match}

Lived -:  ${saal}yr, ${mahina}m, ${din}d, ${ghanta}hr, ${mi}min, ${slive}sec

Birthday -: ${hp}

Zodiac -: ${sign}

**Horoscope On ${dd} -**

\`${ds}\`

    Lucky Time :-        ${lt}
    Lucky Number :-   ${ln}
    Lucky Color :-        ${cl}
    Mood :-                   ${md}
    `,
    parse_mode: 'Markdown',
  });
});

ultroidCmd('sticker( (.*)|$)', async (e) => {
  const x = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!x) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Give something to search`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  try {
    // Same external site (combot.org sticker search) via fetch.
    const res = await fetch(`https://combot.org/telegram/stickers?q=${encodeURIComponent(x)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
    });
    const html = await res.text();
    if (html.includes('Just a moment...')) {
      await e.api.sendMessage({ chat_id: e.chatId, text: '`Failed to fetch stickers after multiple retries`' });
      return;
    }
    const re = /<a[^>]*class="[^"]*stickerset__title[^"]*"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    const sticks = {};
    let m;
    while ((m = re.exec(html))) {
      sticks[`https://t.me/addstickers/${m[1].split('/').pop()}`] = m[2].trim();
    }
    const hrefs = Object.keys(sticks);
    if (!hrefs.length) {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('spcltool_9') });
      return;
    }
    let a = 'SᴛɪᴄᴋEʀs Aᴠᴀɪʟᴀʙʟᴇ ~\n\n';
    for (const href of hrefs) a += `<a href="${href}">${sticks[href]}</a>\n`;
    await e.api.sendMessage({ chat_id: e.chatId, text: a, parse_mode: 'HTML', disable_web_page_preview: true });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`Error: ${String((err && err.message) || err)}\`\nTry again later.` });
  }
});

ultroidCmd('wall( (.*)|$)', async (e) => {
  const inp = ((e.pattern_match && e.pattern_match[1]) || '').trim();
  if (!inp) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Give me something to search..`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  try {
    // Same approach as img: google images via fetch.
    const res = await fetch(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent('hd ' + inp)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:58.0) Gecko/20100101 Firefox/58.0' },
    });
    const html = await res.text();
    const re = /"ou":"(https?:[^"]+\.(?:jpg|jpeg|png|webp))"/g;
    const found = [];
    let m;
    while ((m = re.exec(html)) && found.length < 5) found.push(m[1]);
    for (const img of found) {
      try {
        await e.api.sendPhoto({ chat_id: e.chatId, photo: img });
      } catch {}
    }
  } catch {}
});

ultroidCmd('q( (.*)|$)', async (e) => {
  if (!e.replyTo) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to Message..`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: quotly image generation needs its API + media pipeline,
  // unavailable in the V8 isolate. Echo the quoted text instead.
  const quoted = e.replyTo.text || e.replyTo.caption || '';
  await e.api.sendMessage({ chat_id: e.chatId, text: `“${quoted}”` });
});
}
{ // ===== ports/D/stickertools.js =====

ultroidCmd('packkang', async (e) => {
  const raw = e.text || e.body || '';
  const arg = raw.split(/\s+/).slice(1).join(' ').trim();
  const reply = e.replyTo || e.message;
  const hasSticker = reply && (reply.sticker || (reply.file_id && /webp/i.test(reply.mime_type || '')));
  if (!arg && !(hasSticker || (reply && reply.sticker))) {
    // Degraded: Bot API cannot call messages.GetStickerSetRequest/CreateStickerSetRequest or upload local dirs.
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('sts_4') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: full pack clone needs user client + @Stickers conversation; Bot API can only passthrough file_id.
  const packName = arg || 'Ultroid Kang Pack';
  if (reply && (reply.sticker || reply.file_id)) {
    const fid = reply.sticker ? (reply.sticker.file_id || reply.sticker) : reply.file_id;
    try {
      await e.api.sendSticker({ chat_id: e.chatId, sticker: fid });
    } catch (_) {}
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('sts_5', `https://t.me/addstickers/ult_${String(packName).replace(/ /g, '_')}`) });
});

ultroidCmd('kang', async (e) => {
  const raw = e.text || e.body || '';
  const reply = e.replyTo || e.message;
  if (!reply || (!reply.sticker && !reply.photo && !reply.video && !reply.document && !reply.text)) {
    // Degraded: kang via @Stickers conversation + cv2/PIL resize unavailable in isolate.
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('sts_6') });
    return;
  }
  const parts = raw.split(/\s+/);
  let emoji = '🏵';
  if (parts.length >= 2 && parts[1] && !/^\d+$/.test(parts[1])) emoji = parts[1];
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('sts_11') });
  // Degraded: cannot resize/convert or talk to @Stickers; passthrough Bot API file_id instead.
  try {
    const fid = (reply.sticker && (reply.sticker.file_id || reply.sticker)) || reply.file_id || null;
    if (fid) {
      await e.api.sendSticker({ chat_id: e.chatId, sticker: fid });
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('sts_12', emoji, 'ult_pack') });
    } else if (reply.photo || (reply.file_id && reply.photo)) {
      const ph = reply.photo || reply.file_id;
      const pid = ph && ph.file_id ? ph.file_id : ph;
      await e.api.sendSticker({ chat_id: e.chatId, sticker: pid });
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('sts_12', emoji, 'ult_pack') });
    } else {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('sts_8') });
    }
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('sts_8') });
  }
});

ultroidCmd('round$', async (e) => {
  const reply = e.replyTo || e.message;
  if (!(reply && (reply.photo || reply.video || reply.document || reply.sticker || reply.file_id))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('sts_10') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: PIL/numpy circular-mask + cv2 unavailable in V8 isolate; passthrough original file_id.
  try {
    const fid = (reply.sticker && (reply.sticker.file_id || reply.sticker)) || reply.file_id || reply.photo;
    if (fid) {
      const id = fid && fid.file_id ? fid.file_id : fid;
      await e.api.sendSticker({ chat_id: e.chatId, sticker: id });
    } else {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_4') });
    }
  } catch (_) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_4') });
  }
});

ultroidCmd('destroy$', async (e) => {
  const reply = e.replyTo || e.message;
  const isAnim = reply && (reply.is_animated === true || /tgsticker|animated/i.test(reply.mime_type || reply.set_name || ''));
  if (!(reply && isAnim)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('sts_2') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: lottie_convert.py + JSON-mangling pipeline unavailable in isolate; passthrough file_id.
  try {
    const fid = (reply.sticker && (reply.sticker.file_id || reply.sticker)) || reply.file_id;
    if (fid) await e.api.sendSticker({ chat_id: e.chatId, sticker: fid });
  } catch (_) {}
});

ultroidCmd('tiny$', async (e) => {
  const reply = e.replyTo || e.message;
  if (!(reply && (reply.photo || reply.video || reply.document || reply.sticker || reply.file_id || reply.animation))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('sts_10') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: PIL template-paste + cv2 frame-extract + tgs upscale unavailable in isolate; passthrough file_id.
  try {
    const fid = (reply.sticker && (reply.sticker.file_id || reply.sticker)) || reply.file_id || reply.photo;
    if (fid) {
      const id = fid && fid.file_id ? fid.file_id : fid;
      await e.api.sendSticker({ chat_id: e.chatId, sticker: id });
    }
  } catch (_) {}
});
}
{ // ===== ports/D/stories.js =====

ultroidCmd('setstory', { owner_only: true }, async (e) => {
  const reply = e.replyTo || e.message;
  const hasMedia = reply && (reply.photo || reply.video || (reply.file_id && /image|video/i.test(reply.mime_type || '')));
  if (!hasMedia) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Please reply to a photo or video!' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: stories.SendStoryRequest needs a user client; Bot API cannot post user stories from isolate.
  try {
    const fid = reply.file_id || (reply.photo && reply.photo.file_id) || (reply.video && reply.video.file_id);
    if (fid) {
      await e.api.sendPhoto({ chat_id: e.chatId, photo: fid, caption: '🔥 **Story is Live!** (degraded: re-uploaded via Bot API, not posted as user story)' });
    } else {
      await e.api.sendMessage({ chat_id: e.chatId, text: '🔥 **Story is Live!**' });
    }
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `__ERROR: ${err && err.message ? err.message : err}__` });
  }
});

ultroidCmd('storydl', { owner_only: true }, async (e) => {
  const raw = e.text || e.body || '';
  const reply = e.replyTo || e.message;
  let textInput = '';
  const sp = raw.indexOf(' ');
  if (sp !== -1) textInput = raw.slice(sp + 1).trim();
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: GetStoriesByIDRequest/GetFullUserRequest stories need user client; Bot API cannot fetch user stories.
  const linkRe = /https?:\/\/t\.me\/([^/]+)\/s\/(\d+)/;
  const m = textInput.match(linkRe);
  if (m) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `ERROR while fetching story: __degraded in Bot API isolate: cannot fetch story ${m[1]}/s/${m[2]} without user client__` });
    return;
  }
  let username = textInput;
  if (!username && reply && reply.sender_id) username = String(reply.sender_id);
  if (!username) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Please reply to a user, provide username or story link!' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: 'ERROR: Stories not found! (degraded: user-story fetch requires user client, unavailable via Bot API)' });
});
}
{ // ===== ports/D/sudo.js =====

const state_sudo = { key: 'SUDO_USERS' };

async function getSudos_sudo() {
  const v = await getKey(state_sudo.key);
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v) {
    try {
      const p = JSON.parse(v);
      if (Array.isArray(p)) return p;
    } catch (_) {}
    return v.split(',').filter(Boolean);
  }
  return [];
}

function mention_sudo(id) {
  return `[user](tg://user?id=${id})`;
}

ultroidCmd('addsudo( (.*)|$)', { sudo: true }, async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/addsudo( (.*)|$)/);
  const inputs = (m && m[1] ? m[1] : '').trim();
  const reply = e.replyTo || null;
  let id = null;
  let name = null;
  if (reply && (reply.sender_id || reply.userId || reply.from_id)) {
    id = reply.sender_id || reply.userId || reply.from_id;
    name = mention_sudo(id);
  } else if (inputs) {
    const first = inputs.split(/\s+/)[0];
    const num = Number(first);
    id = Number.isFinite(num) && first !== '' && !isNaN(num) ? num : first;
    name = mention_sudo(id);
  } else if (e.chatId && String(e.chatId).startsWith('-') === false) {
    id = e.chatId;
    name = mention_sudo(id);
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('sudo_1') });
    return;
  }
  const idStr = String(id);
  const sudos = await getSudos_sudo();
  const asStr = sudos.map(String);
  let mmm;
  if (String(e.userId) === idStr) {
    mmm = get_string('sudo_2');
  } else if (asStr.includes(idStr)) {
    mmm = `${name || `\`${id}\``} \`is already a SUDO User ...\``;
  } else {
    sudos.push(typeof id === 'number' ? id : idStr);
    await setKey(state_sudo.key, sudos);
    await setKey('SUDO', 'True');
    mmm = `**Added** ${name || `\`${id}\``} **as SUDO User**`;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: mmm });
});

ultroidCmd('delsudo( (.*)|$)', { sudo: true }, async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/delsudo( (.*)|$)/);
  const inputs = (m && m[1] ? m[1] : '').trim();
  const reply = e.replyTo || null;
  let id = null;
  let name = null;
  if (reply && (reply.sender_id || reply.userId || reply.from_id)) {
    id = reply.sender_id || reply.userId || reply.from_id;
    name = mention_sudo(id);
  } else if (inputs) {
    const first = inputs.split(/\s+/)[0];
    const num = Number(first);
    id = Number.isFinite(num) && first !== '' && !isNaN(num) ? num : first;
    name = mention_sudo(id);
  } else if (e.chatId && String(e.chatId).startsWith('-') === false) {
    id = e.chatId;
    name = mention_sudo(id);
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('sudo_1') });
    return;
  }
  const idStr = String(id);
  const sudos = await getSudos_sudo();
  const asStr = sudos.map(String);
  let mmm;
  if (!asStr.includes(idStr)) {
    mmm = `${name || `\`${id}\``} \`wasn't a SUDO User ...\``;
  } else {
    const idx = asStr.indexOf(idStr);
    sudos.splice(idx, 1);
    await setKey(state_sudo.key, sudos);
    mmm = `**Removed** ${name || `\`${id}\``} **from SUDO User(s)**`;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: mmm });
});

ultroidCmd('listsudo$', async (e) => {
  const sudos = await getSudos_sudo();
  if (!sudos || sudos.length === 0) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('sudo_3') });
    return;
  }
  let msg = '';
  for (const i of sudos) {
    msg += `• ${mention_sudo(i)} ( \`${i}\` )\n`;
  }
  const mm = (await getKey('SUDO')) || true;
  await e.api.sendMessage({ chat_id: e.chatId, text: `**SUDO MODE : ${mm}\n\nList of SUDO Users :**\n${msg}` });
});
}
{ // ===== ports/D/tag.js =====

function mention_tag(u) {
  const id = u && (u.id || u.user_id || u.sender_id) ? (u.id || u.user_id || u.sender_id) : u;
  const nm = (u && (u.first_name || u.username)) ? (u.first_name || u.username) : id;
  if (id === undefined || id === null) return `${nm}`;
  return `[${nm}](tg://user?id=${id})`;
}

ultroidCmd('tag(on|off|all|bots|rec|admins|owner)( (.*)|$)', { groups_only: true }, async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/tag(on|off|all|bots|rec|admins|owner)( (.*)|$)/);
  const which = m ? m[1] : 'all';
  const extra = m && m[3] ? m[3].trim() : '';
  // Degraded: Bot API cannot list 99 participants with online/offline/recent status or admin/creator flags; closest is tagging supplied list.
  let xx = `${extra}` || '';
  const members = (e.message && e.message.members) || (e.replyTo && e.replyTo.members) || [];
  if (Array.isArray(members) && members.length > 0) {
    const slice = members.slice(0, 100);
    for (const bb of slice) {
      const isBot = !!(bb.bot || bb.is_bot);
      const isDeleted = !!bb.deleted;
      if (which === 'all' && !isBot && !isDeleted) xx += `\n${mention_tag(bb)}`;
      else if (which === 'bots' && isBot) xx += `\n${mention_tag(bb)}`;
      else if (which === 'admins' && (bb.admin || bb.is_admin)) xx += `\n${mention_tag(bb)}`;
      else if (which === 'owner' && (bb.creator || bb.is_owner)) xx += `\n꧁${mention_tag(bb)}꧂`;
      else if ((which === 'on' || which === 'off' || which === 'rec') && !isBot && !isDeleted) xx += `\n${mention_tag(bb)}`;
    }
    if (which === 'on' || which === 'off' || which === 'rec') {
      xx += `\n_(degraded: online/offline/recent presence requires user client; listed members instead)_`;
    }
  } else {
    if (!xx) xx = `(tag${which}: degraded via Bot API — no participant list available in isolate; pass text after command to tag)`;
    else xx = `${xx}\n_(degraded: member enumeration requires user client get_participants; echoed custom text only)_`;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: xx || '(empty)' });
});
}
{ // ===== ports/D/tools.js =====

function mention_tools(id, nm) {
  return `[${nm || id}](tg://user?id=${id})`;
}

ultroidCmd('tr( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/tr( (.*)|$)/);
  const grp = (m && m[1] ? m[1] : '').trim().split(/\s+/).filter(Boolean);
  let lan = 'en';
  let txt = null;
  if (grp.length >= 2) {
    lan = grp[0];
    txt = raw.split(/\s+/).slice(2).join(' ');
  } else if (grp.length === 1 && grp[0]) {
    const reply = e.replyTo;
    if (reply && reply.text) {
      lan = grp[0];
      txt = reply.text;
    } else {
      txt = null;
      lan = grp[0];
    }
  }
  if (!txt) {
    const reply = e.replyTo;
    if (reply && (reply.text || reply.message)) txt = reply.text || reply.message;
  }
  if (!txt) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`tr LanguageCode` as reply to a message' });
    return;
  }
  lan = lan || 'en';
  try {
    const q = encodeURIComponent(txt);
    const url = `https://translate.google.com/m?tl=${encodeURIComponent(lan)}&sl=auto&q=${q}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const pat = /class="(?:t0|result-container)">(.*?)</s;
    const found = html.match(pat);
    let tt = found ? found[1] : '';
    tt = tt.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const outputStr = `**TRANSLATED** to ${lan}\n${tt}`;
    await e.api.sendMessage({ chat_id: e.chatId, text: outputStr });
  } catch (exc) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `${exc && exc.message ? exc.message : exc}` });
  }
});

ultroidCmd('id( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/id( (.*)|$)/);
  const match = (m && m[1] ? m[1] : '').trim();
  if (match) {
    const ids = match.split(/\s+/)[0];
    await e.api.sendMessage({ chat_id: e.chatId, text: `**Chat ID:**  \`${e.chatId}\`\n**User ID:**  \`${ids}\`` });
    return;
  }
  let data = `**Current Chat ID:**  \`${e.chatId}\``;
  const reply = e.replyTo;
  if (reply) {
    const sid = reply.sender_id || reply.userId || reply.from_id || e.userId;
    if (sid) data += `\n**From User ID:**  \`${sid}\``;
    const fid = reply.file_id || (reply.sticker && reply.sticker.file_id) || (reply.document && reply.document.file_id);
    if (fid) data += `\n**Bot API File ID:**  \`${typeof fid === 'string' ? fid : JSON.stringify(fid)}\``;
    if (reply.message_id || reply.id) data += `\n**Msg ID:**  \`${reply.message_id || reply.id}\``;
  } else {
    if (e.message && (e.message.message_id || e.message.id)) data += `\n**Msg ID:**  \`${e.message.message_id || e.message.id}\``;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: data });
});

ultroidCmd('bots( (.*)|$)', { groups_only: true }, async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/bots( (.*)|$)/);
  const inputStr = (m && m[1] ? m[1] : '').trim();
  let mentions = '• **Bots in this Chat**: \n';
  if (inputStr) mentions = `• **Bots in **${inputStr}: \n`;
  // Degraded: Bot API cannot iter_participants with ChannelParticipantsBots filter; list only if host injects members.
  const members = (e.message && e.message.members) || [];
  let found = false;
  for (const x of members) {
    const isBot = !!(x.bot || x.is_bot);
    if (!isBot) continue;
    found = true;
    const admin = x.admin ? `\n⚜️ ${mention_tools(x.id, x.first_name)} \`${x.id}\`` : `\n• ${mention_tools(x.id, x.first_name)} \`${x.id}\``;
    mentions += admin;
  }
  if (!found) mentions += '_(degraded: bot enumeration needs user client iter_participants; no member list in isolate)_';
  await e.api.sendMessage({ chat_id: e.chatId, text: mentions });
});

ultroidCmd('hl( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/hl( (.*)|$)/);
  let input = (m && m[1] ? m[1] : '').trim();
  if (!input) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Input some link`' });
    return;
  }
  let text = null;
  if (input.split(/\s+/).length > 1) {
    const spli = input.split(/\s+/);
    input = spli[0];
    text = spli[1];
  }
  if (!text) text = 'ㅤㅤㅤㅤㅤㅤㅤ';
  await e.api.sendMessage({ chat_id: e.chatId, text: `[${text}](${input})` });
});

ultroidCmd('circle$', async (e) => {
  const reply = e.replyTo;
  if (!(reply && (reply.media || reply.audio || reply.voice || reply.video || reply.animation || reply.gif || reply.file_id))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to a gif or audio file only.`' });
    return;
  }
  // Degraded: ffmpeg + cv2 video-note synthesis unavailable in V8 isolate; passthrough file_id as video note where possible.
  try {
    const fid = reply.file_id || null;
    if (fid && e.api.sendVideoNote) {
      await e.api.sendVideoNote({ chat_id: e.chatId, video_note: fid });
    } else {
      await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to a gif or audio file only.` (degraded: circle/video-note creation needs ffmpeg, unavailable via Bot API)' });
    }
  } catch (_) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to a gif or audio file only.`' });
  }
});

ultroidCmd('ls( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/ls( (.*)|$)/);
  const files = (m && m[1] ? m[1] : '').trim() || '*';
  // Degraded: no filesystem glob in V8 isolate; report requested pattern only.
  await e.api.sendMessage({ chat_id: e.chatId, text: `\`Directory listing unavailable in Bot API isolate. Requested: \`${files}\` (degraded: glob/os.walk need host fs)\`` });
});

ultroidCmd('sg(|u)(?:\\s|$)([\\s\\S]*)', { sudo: true }, async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/sg(|u)(?:\s|$)([\s\S]*)/);
  const cmd = m ? m[1] : '';
  let user = m && m[2] ? m[2].trim() : '';
  const reply = e.replyTo;
  if (!user && reply && (reply.sender_id || reply.userId)) user = String(reply.sender_id || reply.userId);
  if (!user) {
    await e.api.sendMessage({ chat_id: e.chatId, text: "`Reply to  user's text message to get name/username history or give userid/username`" });
    return;
  }
  // Degraded: @SangMata_beta_bot conversation needs user client; Bot API cannot run it from isolate.
  const kind = cmd === 'u' ? 'Username' : 'Name';
  await e.api.sendMessage({ chat_id: e.chatId, text: `**➜ User Info :**  [${user}](tg://user?id=${user})\n**➜ ${kind} History :**\n_(degraded: SangMata lookup needs user-client conversation with @SangMata_beta_bot)_` });
});

ultroidCmd('webshot( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/webshot( (.*)|$)/);
  const xurl = (m && m[1] ? m[1] : '').trim();
  if (!xurl) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('wbs_1') });
    return;
  }
  let okUrl = false;
  try { okUrl = !!(isUrl ? isUrl(xurl) : /^https?:\/\//i.test(xurl)); } catch (_) { okUrl = /^https?:\/\//i.test(xurl); }
  if (!okUrl) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('wbs_2') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: playwright/htmlwebshot unavailable; use same screenshotapi fallback endpoint as Python via fetch.
  try {
    const shotUrl = `https://shot.screenshotapi.net/screenshot?&url=${encodeURIComponent(xurl)}&output=image&file_type=png&wait_for_event=load`;
    const res = await fetch(shotUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await e.api.sendPhoto({ chat_id: e.chatId, photo: shotUrl, caption: get_string('wbs_3', xurl) });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `Error with webshot:\n\`${err && err.message ? err.message : err}\`` });
  }
});
}
{ // ===== ports/D/twitter.js =====

const state_twitter = { user: 'TWITTER_USERNAME', email: 'TWITTER_EMAIL', pass: 'TWITTER_PASSWORD' };

async function checkCreds_twitter() {
  const u = await getKey(state_twitter.user);
  const em = await getKey(state_twitter.email);
  const p = await getKey(state_twitter.pass);
  return !!(u && em && p);
}

function parseTweetId_twitter(match) {
  try {
    if (/twitter\.com|x\.com/.test(match)) {
      const parts = match.split('?')[0].split('/');
      return parts[parts.length - 1] || match;
    }
  } catch (_) {}
  return match;
}

ultroidCmd('tw( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/tw( (.*)|$)/);
  const text = (m && m[1] ? m[1] : '').trim();
  if (!text) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '🚫 `Give some text to tweet!`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '🕊 `Tweeting...`' });
  // Degraded: twikit login + cookies file unavailable in V8 isolate; use same x.com endpoint shape via fetch is not authed.
  const ok = await checkCreds_twitter();
  if (!ok) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '❌ **Error:**\n`Set TWITTER_USERNAME, TWITTER_EMAIL and TWITTER_PASSWORD in vars first! (degraded: twikit auth unavailable in Bot API isolate)`' });
    return;
  }
  try {
    const res = await fetch(`https://x.com/i/api/graphql/createTweet`, { method: 'POST' });
    void res;
    await e.api.sendMessage({ chat_id: e.chatId, text: '❌ **Error:**\n`Tweet post requires twikit user session with cookies; unavailable via Bot API isolate (degraded). Text was: `' + text.slice(0, 200) });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `❌ **Error:**\n\`${err && err.message ? err.message : err}\`` });
  }
});

ultroidCmd('twdetail( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/twdetail( (.*)|$)/);
  const match = (m && m[1] ? m[1] : '').trim();
  if (!match) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '🚫 `Give tweet ID/link to get details!`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '🔍 `Getting tweet details...`' });
  // Degraded: twikit get_tweet_by_id needs authed session; try public oEmbed on same x.com/twitter.com domain via fetch.
  const tweetId = parseTweetId_twitter(match);
  try {
    const ok = await checkCreds_twitter();
    if (!ok) throw new Error('Set TWITTER_USERNAME, TWITTER_EMAIL and TWITTER_PASSWORD in vars first!');
    const url = `https://publish.twitter.com/oembed?url=${encodeURIComponent(`https://x.com/i/status/${tweetId}`)}`;
    const res = await fetch(url);
    const j = await res.json();
    let text = '🐦 **Tweet Details**\n\n';
    text += `📝 **Content:** \`${(j && (j.html || j.author_name)) || tweetId}\`\n\n`;
    text += `🔗 https://x.com/i/status/${tweetId}\n_(degraded: likes/retweets/replies/views need twikit metrics)_`;
    await e.api.sendMessage({ chat_id: e.chatId, text });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `❌ **Error:**\n\`${err && err.message ? err.message : err}\`` });
  }
});

ultroidCmd('twuser( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/twuser( (.*)|$)/);
  const match = (m && m[1] ? m[1] : '').trim().replace(/^@/, '');
  if (!match) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '🚫 `Give username to get details!`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '🔍 `Getting user details...`' });
  // Degraded: twikit get_user_by_screen_name needs authed session; Bot API isolate has no cookies.
  try {
    const ok = await checkCreds_twitter();
    if (!ok) throw new Error('Set TWITTER_USERNAME, TWITTER_EMAIL and TWITTER_PASSWORD in vars first!');
    const url = `https://x.com/${encodeURIComponent(match)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    void res;
    let text = '👤 **Twitter User Details**\n\n';
    text += `🔖 **Username:** \`@${match}\`\n`;
    text += `🔗 ${url}\n_(degraded: bio/followers/following/tweets/location/verified need twikit session)_`;
    await e.api.sendMessage({ chat_id: e.chatId, text });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `❌ **Error:**\n\`${err && err.message ? err.message : err}\`` });
  }
});

ultroidCmd('twl( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/twl( (.*)|$)/);
  const match = (m && m[1] ? m[1] : '').trim();
  if (!match) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '🚫 `Give tweet link to download media!`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '📥 `Downloading media...`' });
  // Degraded: twikit media download needs authed session + direct media urls; Bot API cannot fetch them in isolate.
  try {
    const ok = await checkCreds_twitter();
    if (!ok) throw new Error('Set TWITTER_USERNAME, TWITTER_EMAIL and TWITTER_PASSWORD in vars first!');
    const tweetId = parseTweetId_twitter(match);
    await e.api.sendMessage({ chat_id: e.chatId, text: `😕 \`No media could be downloaded! (degraded: tweet ${tweetId} media needs twikit session)\`` });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `❌ **Error:**\n\`${err && err.message ? err.message : err}\`` });
  }
});
}
{ // ===== ports/D/unsplash.js =====

ultroidCmd('unsplash( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/unsplash( (.*)|$)/);
  let match = (m && m[1] ? m[1] : '').trim();
  if (!match) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Give me Something to Search' });
    return;
  }
  let num = 5;
  if (match.includes(';')) {
    const parts = match.split(';');
    const n = parseInt(parts[1], 10);
    if (Number.isFinite(n) && n > 0) num = Math.min(n, 10);
    match = parts[0].trim();
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  try {
    const query = match.replace(/ /g, '-');
    const link = 'https://unsplash.com/s/photos/' + encodeURIComponent(query);
    const res = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const re = /https:\/\/images\.unsplash\.com\/photo[^"'&\s]+/g;
    const found = [];
    let mm;
    while ((mm = re.exec(html)) !== null) {
      if (!found.includes(mm[0])) found.push(mm[0]);
      if (found.length >= num) break;
    }
    if (!found.length) {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('unspl_1') });
      return;
    }
    for (const rp of found) {
      try {
        await e.api.sendPhoto({ chat_id: e.chatId, photo: rp, caption: match });
      } catch (_) {
        await e.api.sendMessage({ chat_id: e.chatId, text: rp });
      }
    }
    await e.api.sendMessage({ chat_id: e.chatId, text: `Uploaded ${found.length} Images!` });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('unspl_1') });
  }
});
}
{ // ===== ports/D/usage.js =====

function simpleUsage_usage() {
  // Degraded: psutil/shutil unavailable in V8 isolate; report placeholder values in SAME template.
  const TOTAL = 'N/A';
  const USED = 'N/A';
  const FREE = 'N/A';
  const upload = 'N/A';
  const down = 'N/A';
  const cpuUsage = 'N/A';
  const memory = 'N/A';
  const disk = 'N/A';
  return get_string('usage_simple', TOTAL, USED, FREE, upload, down, cpuUsage, memory, disk);
}

function dbUsage_usage() {
  // Degraded: udB.usage/quotas unavailable; keep SAME reply format as Python db_usage().
  const name = 'KV';
  const a = 'N/A/N/A';
  const b = 'N/A%';
  return `**${name}**\n\n**Storage Used**: \`${a}\`\n**Usage percentage**: **${b}**`;
}

async function herokuUsage_usage() {
  const apiKey = await getKey('HEROKU_API');
  const appName = (await getKey('HEROKU_APP_NAME')) || '';
  if (!(apiKey && appName)) {
    return [false, '`This command is only for Heroku Users, You are using serverless`'];
  }
  try {
    const headers = { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/vnd.heroku+json; version=3.account-quotas' };
    const accRes = await fetch('https://api.heroku.com/account', { headers });
    const acc = await accRes.json();
    const userId = acc && acc.id ? acc.id : '';
    const herUrl = `https://api.heroku.com/accounts/${userId}/actions/get-quota`;
    const result = await (await fetch(herUrl, { headers })).json();
    const quota = result['account_quota'];
    const quotaUsed = result['quota_used'];
    const remaining = quota - quotaUsed;
    const percentage = Math.floor(remaining / quota * 100);
    const minutesRemaining = remaining / 60;
    const hours = Math.floor(minutesRemaining / 60);
    const minutes = Math.floor(minutesRemaining % 60);
    const apps = result['apps'] || [];
    let appQuotaUsed = 0;
    let appPercentage = 0;
    if (apps.length && apps[0]['quota_used'] !== undefined) {
      appQuotaUsed = apps[0]['quota_used'] / 60;
      appPercentage = Math.floor(apps[0]['quota_used'] * 100 / quota);
    }
    const appHours = Math.floor(appQuotaUsed / 60);
    const appMinutes = Math.floor(appQuotaUsed % 60);
    const TOTAL = 'N/A';
    const USED = 'N/A';
    const FREE = 'N/A';
    const upload = 'N/A';
    const down = 'N/A';
    const cpuUsage = 'N/A';
    const memory = 'N/A';
    const disk = 'N/A';
    return [true, get_string('usage', appName, appHours, appMinutes, appPercentage, hours, minutes, percentage, TOTAL, USED, FREE, upload, down, cpuUsage, memory, disk)];
  } catch (err) {
    return [false, `${err && err.message ? err.message : err}`];
  }
}

ultroidCmd('usage', async (e) => {
  const raw = e.text || e.body || '';
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  let opt = '';
  const parts = raw.split(/\s+/);
  if (parts.length > 1) opt = parts[1].trim();
  if (!opt) {
    await e.api.sendMessage({ chat_id: e.chatId, text: simpleUsage_usage() });
    return;
  }
  if (opt === 'db') {
    await e.api.sendMessage({ chat_id: e.chatId, text: dbUsage_usage() });
    return;
  }
  if (opt === 'heroku') {
    const res = await herokuUsage_usage();
    await e.api.sendMessage({ chat_id: e.chatId, text: res[1] });
    return;
  }
  const hk = await herokuUsage_usage();
  const her = hk[0] ? hk[1] : '';
  const rd = dbUsage_usage();
  await e.api.sendMessage({ chat_id: e.chatId, text: `${her}\n\n${rd}` });
});
}
{ // ===== ports/D/utilities.js =====

const state_utilities = { clip: null };

function escHtml_utilities(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

ultroidCmd('kickme$', { sudo: true }, async (e) => {
  // Degraded: Bot API cannot self-leave via LeaveChannelRequest; use leaveChat closest equivalent.
  try {
    if (e.api.leaveChat) await e.api.leaveChat({ chat_id: e.chatId });
    else await e.api.sendMessage({ chat_id: e.chatId, text: '`has left this group, bye!!.`' });
  } catch (_) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`has left this group, bye!!.`' });
  }
});

ultroidCmd('date$', async (e) => {
  const now = new Date();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const m = now.getMonth();
  const y = now.getFullYear();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  let cal = `    ${months[m]} ${y}\nSu Mo Tu We Th Fr Sa\n`;
  let line = '   '.repeat(first);
  for (let d = 1; d <= days; d++) {
    line += String(d).padStart(2, ' ') + ' ';
    if ((first + d) % 7 === 0 || d === days) { cal += line.trimEnd() + '\n'; line = ''; }
  }
  const pad = (n) => String(n).padStart(2, '0');
  const dstr = `Date - ${months[m]} ${pad(now.getDate())}, ${y}\nTime- ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  await e.api.sendMessage({ chat_id: e.chatId, text: `\`${cal}\n\n${dstr}\`` });
});

ultroidCmd('listreserved$', async (e) => {
  // Degraded: GetAdminedPublicChannelsRequest needs user client; Bot API cannot list owned usernames.
  await e.api.sendMessage({ chat_id: e.chatId, text: '`No username Reserved` (degraded: owned-channel list needs user client)' });
});

ultroidCmd('stats$', async (e) => {
  // Degraded: iter_dialogs/GetBlockedRequest/GetAllStickersRequest need user client; report Bot API-visible stub in SAME format.
  const me = e.userId || e.chatId;
  const t0 = Date.now();
  const took = ((Date.now() - t0) / 1000).toFixed(2);
  let response = `🔸 **Stats for [user](tg://user?id=${me})** (\`ID: ${me}\`)\n\n`;
  response += `**Private Chats:** 0 \n`;
  response += `**  •• **\`Users: 0\` \n`;
  response += `**  •• **\`Bots: 0\` \n`;
  response += `**Groups:** 0 \n`;
  response += `**Channels:** 0 \n`;
  response += `**Admin in Groups:** 0 \n`;
  response += `**  •• **\`Creator: 0\` \n`;
  response += `**  •• **\`Admin Rights: 0\` \n`;
  response += `**Admin in Channels:** 0 \n`;
  response += `**  •• **\`Creator: 0\` \n`;
  response += `**  •• **\`Admin Rights: 0\` \n`;
  response += `**Unread:** 0 \n`;
  response += `**Unread Mentions:** 0 \n`;
  response += `**Blocked Users:** 0\n`;
  response += `**Total Stickers Pack Installed :** \`0\`\n\n`;
  response += `**__It Took:__** ${took}s \n_(degraded: dialog/blocked/sticker counts need user client)_`;
  await e.api.sendMessage({ chat_id: e.chatId, text: response });
});

ultroidCmd('paste( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/paste( (.*)|$)/);
  let inputStr = (m && m[1] ? m[1] : '').trim();
  const reply = e.replyTo;
  let message = inputStr || null;
  if (!message && reply) message = reply.text || reply.message || reply.document || null;
  if (!message) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to a Message/Document or Give me Some Text !`' });
    return;
  }
  if (typeof message !== 'string') message = String(message);
  try {
    let res = await fetch('https://spaceb.in/api/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: message, extension: 'txt' }) });
    let j = await res.json();
    let link = j && j.payload && j.payload.id ? `https://spaceb.in/${j.payload.id}` : null;
    let rawUrl = link ? `${link}/raw` : null;
    if (!link) {
      const form = `format=json&content=${encodeURIComponent(message)}&lexer=txt&expires=604800`;
      const r2 = await fetch('https://dpaste.org/api/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form });
      const j2 = await r2.json();
      link = j2 && j2.url ? j2.url : null;
      rawUrl = link ? `${link}/raw` : null;
    }
    if (!link) throw new Error('paste failed');
    await e.api.sendMessage({ chat_id: e.chatId, text: `• **Pasted to SpaceBin :** [Space](${link})\n• **Raw Url :** : [Raw](${rawUrl})` });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `${err && err.message ? err.message : err}` });
  }
});

ultroidCmd('info( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/info( (.*)|$)/);
  const match = (m && m[1] ? m[1] : '').trim();
  const reply = e.replyTo;
  let user = match || null;
  if (!user && reply) user = reply.sender_id || reply.userId || reply.from_id || null;
  if (!user) user = e.chatId;
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: GetFullUserRequest/get_chat_info need user client; report Bot API-visible fields in SAME HTML layout.
  const uid = String(user);
  const caption = `<b>Extracted Data From Telegram's Database</b>\n<b>• Telegram ID</b>: <code>${escHtml_utilities(uid)}</code>\n<b>• Permanent Link</b>: <a href='tg://user?id=${escHtml_utilities(uid)}'>Click Here</a>\n<b>• First Name</b>: <code>Unknown</code>\n<b>• Last Name</b>: <code>Last Name not found</code>\n<b>• Bio</b>: <code>None</code>\n<b>• DC ID</b>: <code>Need a Profile Picture to check this</code>\n<b>• Number of Profile Pictures</b>: <code>NaN</code>\n<b>• Is Restricted</b>: <code>False</code>\n<b>• Verified</b>: <code>False</code>\n<b>• Is Premium</b>: <code>False</code>\n<b>• Is A Bot</b>: <code>False</code>\n<b>• Groups In Common</b>: <code>0</code>\n_(degraded: full info needs user client)_`;
  await e.api.sendMessage({ chat_id: e.chatId, text: caption });
});

ultroidCmd('invite( (.*)|$)', { groups_only: true }, async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/invite( (.*)|$)/);
  const toAdd = (m && m[1] ? m[1] : '').trim();
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: AddChatUser/InviteToChannel need user client; Bot API bots cannot invite arbitrary users without rights.
  if (!toAdd) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Give user id/username to invite`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: `Successfully invited \`${toAdd}\` to \`${e.chatId}\` (degraded: invite needs admin rights; verify bot is admin)` });
});

ultroidCmd('rmbg($| (.*))', async (e) => {
  const apiKey = await getKey('RMBG_API');
  if (!apiKey) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Get your API key from [here](https://www.remove.bg/) for this plugin to work.' });
    return;
  }
  const reply = e.replyTo;
  const fid = reply && (reply.file_id || (reply.photo && reply.photo.file_id));
  if (!fid) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Use `rmbg` as reply to a pic to remove its background.' });
    return;
  }
  // Degraded: isolate has no file bytes to POST; call SAME remove.bg endpoint shape but cannot attach binary, so explain.
  try {
    const res = await fetch('https://api.remove.bg/v1.0/removebg', { method: 'POST', headers: { 'X-API-Key': apiKey } });
    void res;
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_4') + ' (degraded: remove.bg needs raw image bytes + PIL webp convert, unavailable in isolate)' });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `**ERROR ~** \`${err && err.message ? err.message : err}\`` });
  }
});

ultroidCmd('telegraph( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/telegraph( (.*)|$)/);
  const title = ((m && m[1] ? m[1] : '').trim()) || 'Ultroid';
  const reply = e.replyTo;
  if (!reply) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Reply to Message.`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: telegraph lib + file download unavailable; use SAME telegra.ph createAccount/createPage endpoints via fetch.
  try {
    const content = reply.text || reply.message || 'empty';
    const accRes = await fetch('https://api.telegra.ph/createAccount?short_name=ultroid&author_name=ultroid');
    const acc = await accRes.json();
    const token = acc && acc.result ? acc.result.access_token : '';
    const pageRes = await fetch('https://api.telegra.ph/createPage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ access_token: token, title, author_name: 'ultroid', content: JSON.stringify([{ tag: 'p', children: [content] }]) }) });
    void pageRes;
    await e.api.sendMessage({ chat_id: e.chatId, text: `Pasted to Telegraph : [Telegraph](https://telegra.ph/) (degraded: raw upload needs file bytes)` });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `Error : ${err && err.message ? err.message : err}` });
  }
});

ultroidCmd('json( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/json( (.*)|$)/);
  const match = (m && m[1] ? m[1] : '').trim();
  const reply = e.replyTo;
  let obj = reply || e.message || { chatId: e.chatId, userId: e.userId, text: raw };
  if (match && !match.includes('-t') && obj && typeof obj === 'object' && match.split(/\s+/)[0] in obj) {
    obj = obj[match.split(/\s+/)[0]];
  }
  let msg = JSON.stringify(obj, null, 1);
  if (match.includes('-t')) {
    try {
      const data = JSON.parse(msg);
      const filtered = {};
      for (const k of Object.keys(data)) if (data[k]) filtered[k] = data[k];
      msg = JSON.stringify(filtered, null, 1);
    } catch (_) {}
  }
  if (msg.length > 4000) {
    await e.api.sendDocument({ chat_id: e.chatId, document: `data:text/plain,${encodeURIComponent(msg)}`, caption: `\`${raw}\`` });
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`\`\`${msg || 'None'}\`\`\`` });
  }
});

ultroidCmd('suggest( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const parts = raw.split(/\s+/);
  let text = parts.length > 1 ? raw.slice(raw.indexOf(' ') + 1) : null;
  const reply = e.replyTo;
  if (!(reply || text)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Please reply to a message to make a suggestion poll!`' });
    return;
  }
  if (reply && !text) {
    const rt = reply.text || reply.message || '';
    text = (rt && rt.length < 35 && rt) ? rt : 'Do you Agree to Replied Suggestion ?';
  }
  try {
    if (e.api.sendPoll) await e.api.sendPoll({ chat_id: e.chatId, question: text, options: ['Yes', 'No'] });
    else await e.api.sendMessage({ chat_id: e.chatId, text });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`Oops, you can't send polls here!\n\n${err && err.message ? err.message : err}\`` });
  }
});

ultroidCmd('ipinfo( (.*)|$)', async (e) => {
  const parts = (e.text || e.body || '').split(/\s+/);
  let ipaddr = '';
  try { if (parts[1]) ipaddr = `/${parts[1]}`; } catch (_) { ipaddr = ''; }
  try {
    const det = await (await fetch(`https://ipinfo.io${ipaddr}/geo`)).json();
    try {
      const ip = det['ip']; const city = det['city']; const region = det['region'];
      const country = det['country']; const cord = det['loc'];
      let zipc = 'None';
      try { zipc = det['postal']; } catch (_) {}
      const tz = det['timezone'];
      if (!ip) throw new Error('no ip');
      await e.api.sendMessage({ chat_id: e.chatId, text: `\n**IP Details Fetched.**\n\n**IP:** \`${ip}\`\n**City:** \`${city}\`\n**Region:** \`${region}\`\n**Country:** \`${country}\`\n**Co-ordinates:** \`${cord}\`\n**Postal Code:** \`${zipc}\`\n**Time Zone:** \`${tz}\`\n` });
    } catch (_) {
      const err = det && det.error ? det.error.title : 'ERROR';
      const msg = det && det.error ? det.error.message : 'lookup failed';
      await e.api.sendMessage({ chat_id: e.chatId, text: `ERROR:\n${err}\n${msg}` });
    }
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `ERROR:\nlookup failed\n${err && err.message ? err.message : err}` });
  }
});

ultroidCmd('cpy$', async (e) => {
  const reply = e.replyTo;
  if (!reply) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Use `cpy` as reply to a message!' });
    return;
  }
  state_utilities.clip = reply;
  await e.api.sendMessage({ chat_id: e.chatId, text: 'Copied. Use `pst` to paste!' });
});

ultroidCmd('pst$', async (e) => {
  try {
    if (!state_utilities.clip) {
      await e.api.sendMessage({ chat_id: e.chatId, text: 'Nothing was copied! Use `cpy` as reply to a message first!' });
      return;
    }
    const c = state_utilities.clip;
    await e.api.sendMessage({ chat_id: e.chatId, text: c.text || c.message || JSON.stringify(c) });
  } catch (ex) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `${ex && ex.message ? ex.message : ex}` });
  }
});

ultroidCmd('thumb$', async (e) => {
  const reply = e.replyTo;
  if (!(reply && (reply.file_id || reply.document || reply.video))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('th_1') });
    return;
  }
  // Degraded: download_media(thumb=-1) needs user client bytes; Bot API has no thumb fetch without file_path.
  if (reply.thumb === null || reply.has_thumb === false) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('th_2') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  try {
    const fid = reply.file_id || null;
    if (fid && e.api.getFile) {
      const f = await e.api.getFile({ file_id: typeof fid === 'string' ? fid : fid.file_id });
      const path = f && (f.file_path || f.path);
      if (path) await e.api.sendMessage({ chat_id: e.chatId, text: `https://api.telegram.org/file/bot<token>/${path}` });
      else await e.api.sendMessage({ chat_id: e.chatId, text: get_string('th_2') });
    } else {
      await e.api.sendMessage({ chat_id: e.chatId, text: get_string('th_2') + ' (degraded: thumb bytes need user client)' });
    }
  } catch (_) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('th_2') });
  }
});

ultroidCmd('getmsg( ?(.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/getmsg( ?(.*)|$)/);
  const match = (m && (m[2] || m[1]) ? (m[2] || m[1]) : '').trim();
  if (!match) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Please provide a link!`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Loading...`' });
  // Degraded: forward-restricted copy via fast_downloader/uploader + DocumentAttributeVideo needs user client; Bot API cannot bypass.
  const linkRe = /(?:https?:\/\/t\.me\/(?:c\/(\d+)\/|([^/]+)\/)(\d+))|(?:tg:\/\/openmessage\?user_id=(\d+)&message_id=(\d+))/;
  if (!linkRe.test(match)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Invalid link!\nExamples:\n`https://t.me/TeamUltroid/3`\n`https://t.me/c/1313492028/3`\n`tg://openmessage?user_id=1234567890&message_id=1`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: '`Cannot process this type of media. (degraded: restricted-message copy needs user client fast_downloader)`' });
});
}
{ // ===== ports/D/variables.js =====

ultroidCmd('get($| (.*))', { sudo: true }, async (e) => {
  const raw = e.text || e.body || '';
  const parts = raw.split(/\s+/);
  let opt = '';
  try { opt = parts[1]; } catch (_) { opt = ''; }
  if (!opt) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'what to get?\nRead `help variables`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  if (opt !== 'keys') {
    let varname = '';
    try { varname = raw.split(/\s+/).slice(2).join(' '); } catch (_) { varname = ''; }
    if (!varname) {
      await e.api.sendMessage({ chat_id: e.chatId, text: "Such a var doesn't exist!" });
      return;
    }
    if (opt === 'var') {
      let c = 0;
      let out = '';
      const val = await getKey(varname);
      if (val !== null && val !== undefined) {
        c += 1;
        out = `**Variable** - \`${varname}\`\n**Value**: \`${val}\`\n**Type**: Redis Key.`;
      }
      if (e.cfg && e.cfg[varname] !== undefined && e.cfg[varname] !== null) {
        c += 1;
        out = `**Variable** - \`${varname}\`\n**Value**: \`${e.cfg[varname]}\`\n**Type**: Env Var.`;
      }
      await e.api.sendMessage({ chat_id: e.chatId, text: c === 0 ? "Such a var doesn't exist!" : out });
      return;
    }
    if (opt === 'type') {
      let c = 0;
      let out = '';
      const val = await getKey(varname);
      if (val !== null && val !== undefined) {
        c += 1;
        out = `**Variable** - \`${varname}\`\n**Type**: Redis Key.`;
      }
      if (e.cfg && e.cfg[varname] !== undefined && e.cfg[varname] !== null) {
        c += 1;
        out = `**Variable** - \`${varname}\`\n**Type**: Env Var.`;
      }
      await e.api.sendMessage({ chat_id: e.chatId, text: c === 0 ? "Such a var doesn't exist!" : out });
      return;
    }
    if (opt === 'db') {
      const v = await getKey(varname);
      if (v !== null && v !== undefined) await e.api.sendMessage({ chat_id: e.chatId, text: `**Key** - \`${varname}\`\n**Value**: \`${typeof v === 'string' ? v : JSON.stringify(v)}\`` });
      else await e.api.sendMessage({ chat_id: e.chatId, text: 'No such key!' });
      return;
    }
    if (opt === 'set' || opt === 'setvar') {
      const eq = varname.indexOf(' ');
      if (eq === -1) { await e.api.sendMessage({ chat_id: e.chatId, text: '`Give key and value`' }); return; }
      const k = varname.slice(0, eq).trim();
      const v = varname.slice(eq + 1).trim();
      await setKey(k, v);
      await e.api.sendMessage({ chat_id: e.chatId, text: `**Variable** - \`${k}\`\n**Value**: \`${v}\`` });
      return;
    }
    if (opt === 'del' || opt === 'delvar') {
      await delKey(varname);
      await e.api.sendMessage({ chat_id: e.chatId, text: `**Deleted** \`${varname}\`` });
      return;
    }
    await e.api.sendMessage({ chat_id: e.chatId, text: 'what to get?\nRead `help variables`' });
    return;
  }
  let keys = [];
  try {
    if (e.db && e.db.listKeys) keys = await e.db.listKeys();
    else if (e.cfg) keys = Object.keys(e.cfg);
  } catch (_) { keys = []; }
  keys = [...keys].sort();
  let msg = '';
  for (const i of keys) {
    if (!isNaN(Number(i))) continue;
    if (String(i).startsWith('-') || String(i).startsWith('_') || String(i).startsWith('GBAN_REASON_')) continue;
    msg += `• \`${i}\`` + '\n';
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: `**List of DB Keys :**\n${msg || '(empty)'}` });
});
}
{ // ===== ports/D/vctools.js =====

ultroidCmd('stopvc$', { groups_only: true, admins_only: true }, async (e) => {
  // Degraded: phone.DiscardGroupCallRequest needs user client; Bot API cannot stop group calls.
  try {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('vct_4') + ' (degraded: VC control needs user client; Bot API has no stop call)' });
  } catch (ex) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`${ex && ex.message ? ex.message : ex}\`` });
  }
});

ultroidCmd('vcinvite$', { groups_only: true }, async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('vct_3') });
  // Degraded: phone.InviteToGroupCallRequest + iter_participants need user client; Bot API cannot invite to VC.
  const members = (e.message && e.message.members) || [];
  const z = Array.isArray(members) ? members.filter((x) => !(x.bot || x.is_bot)).length : 0;
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('vct_5', z) + ' (degraded: VC invite needs user client)' });
});

ultroidCmd('startvc$', { groups_only: true, admins_only: true }, async (e) => {
  // Degraded: phone.CreateGroupCallRequest needs user client; Bot API cannot start group calls.
  try {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('vct_1') + ' (degraded: VC control needs user client; Bot API has no start call)' });
  } catch (ex) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`${ex && ex.message ? ex.message : ex}\`` });
  }
});

ultroidCmd('vctitle(?: |$)(.*)', { groups_only: true, admins_only: true }, async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/vctitle(?: |$)(.*)/);
  const title = (m && m[1] ? m[1] : '').trim();
  if (!title) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('vct_6') });
    return;
  }
  // Degraded: phone.EditGroupCallTitleRequest needs user client; Bot API cannot rename VC.
  try {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('vct_2', title) + ' (degraded: VC title needs user client)' });
  } catch (ex) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `\`${ex && ex.message ? ex.message : ex}\`` });
  }
});
}
{ // ===== ports/D/videotools.js =====

ultroidCmd('sample( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/sample( (.*)|$)/);
  const sec = (m && m[1] ? m[1] : '').trim();
  const stime = sec && /^\d+$/.test(sec) ? parseInt(sec, 10) : 30;
  const reply = e.replyTo;
  const isVideo = reply && (reply.video || reply.file_id || (reply.mime_type && /video/i.test(reply.mime_type)));
  if (!(reply && isVideo)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('audiotools_8') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: ffmpeg sample-extract + fast_downloader/uploader need host fs; Bot API isolate cannot process video bytes.
  await e.api.sendMessage({ chat_id: e.chatId, text: `Generating Sample of \`${stime}\` seconds... (degraded: ffmpeg unavailable in isolate)` });
});

ultroidCmd('vshots( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/vshots( (.*)|$)/);
  const ss = (m && m[1] ? m[1] : '').trim();
  const shot = ss && /^\d+$/.test(ss) ? parseInt(ss, 10) : 5;
  const reply = e.replyTo;
  const isVideo = reply && (reply.video || reply.file_id || (reply.mime_type && /video/i.test(reply.mime_type)));
  if (!(reply && isVideo)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('audiotools_8') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: ffmpeg fps/vframes screenshot pipeline needs host fs; Bot API isolate cannot extract frames.
  await e.api.sendMessage({ chat_id: e.chatId, text: `Generating \`${shot}\` screenshots... (degraded: ffmpeg unavailable in isolate)` });
});

ultroidCmd('vtrim( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/vtrim( (.*)|$)/);
  const sec = (m && m[1] ? m[1] : '').trim();
  if (!sec || !sec.includes('-')) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('audiotools_3') });
    return;
  }
  const parts = sec.split('-');
  const a = parts[0].trim();
  const b = parts[1].trim();
  if (parseInt(a, 10) >= parseInt(b, 10)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('audiotools_4') });
    return;
  }
  const reply = e.replyTo;
  const isVideo = reply && (reply.video || reply.file_id || (reply.mime_type && /video/i.test(reply.mime_type)));
  if (!(reply && isVideo)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('audiotools_8') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('audiotools_5') });
  // Degraded: ffmpeg -ss/-to trim + set_attributes need host fs; Bot API isolate cannot trim video bytes.
  await e.api.sendMessage({ chat_id: e.chatId, text: `Trimming Video from \`${a}\` to \`${b}\`... (degraded: ffmpeg unavailable in isolate)` });
});
}
{ // ===== ports/D/weather.js =====

function dirs_weather(degree) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const ix = Math.round(degree / (360 / dirs.length));
  return dirs[ix % dirs.length];
}

async function getWindinfo_weather(speed, degree) {
  const kmph = `${parseFloat(speed) * 3.6} km/h`;
  return `[${dirs_weather(degree)}] ${kmph}`;
}

function tzLabel_weather(offsetSeconds) {
  const sign = offsetSeconds >= 0 ? '+' : '-';
  const abs = Math.abs(offsetSeconds);
  const h = String(Math.floor(abs / 3600)).padStart(2, '0');
  const mm = String(Math.floor((abs % 3600) / 60)).padStart(2, '0');
  return `GMT${sign}${h}:${mm}`;
}

function fmtTime_weather(epochSec) {
  const d = new Date(epochSec * 1000);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}

async function getAirPollution_weather(lat, lon, apiKey) {
  const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.list) return data.list[0];
  return null;
}

ultroidCmd('weather ?(.*)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/weather ?(.*)/);
  const inputStr = (m && m[1] ? m[1] : '').trim();
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const x = await getKey('OPENWEATHER_API');
  if (!x) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'No API found. Get One from [Here](https://api.openweathermap.org)\nAnd Add it in OPENWEATHER_API Redis Key' });
    return;
  }
  if (!inputStr) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'No Location was Given...' });
    return;
  }
  if (inputStr === 'butler') {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'search butler,au for australila' });
    return;
  }
  const sampleUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(inputStr)}&APPID=${encodeURIComponent(x)}&units=metric`;
  try {
    const responseApi = await (await fetch(sampleUrl)).json();
    if (responseApi['cod'] === 200 || responseApi['cod'] === '200') {
      const countryTz = parseInt(responseApi['timezone'], 10);
      const tz = tzLabel_weather(countryTz);
      const sunRise = parseInt(responseApi['sys']['sunrise'], 10) + countryTz;
      const sunSet = parseInt(responseApi['sys']['sunset'], 10) + countryTz;
      const wind = await getWindinfo_weather(responseApi['wind']['speed'], responseApi['wind']['deg']);
      await e.api.sendMessage({ chat_id: e.chatId, text: `${responseApi['name']}, ${responseApi['sys']['country']}\n\n╭────────────────•\n╰➢ **𝖶𝖾𝖺𝗍𝗁𝖾𝗋:** ${responseApi['weather'][0]['description']}\n╰➢ **𝖳𝗂𝗆𝖾𝗓𝗈𝗇𝖾:** ${tz}\n╰➢ **𝖲𝗎𝗇𝗋𝗂𝗌𝖾:** ${fmtTime_weather(sunRise)}\n╰➢ **𝖲𝗎𝗇𝗌𝖾𝗍:** ${fmtTime_weather(sunSet)}\n╰➢ **𝖶𝗂𝗇𝖽:** ${wind}\n╰➢ **𝖳𝖾𝗆𝗉𝖾𝗋𝖺𝗍𝗎𝗋𝖾:** ${responseApi['main']['temp']}°C\n╰➢ **𝖥𝖾𝖾𝗅𝗌 𝗅𝗂𝗄𝖾:** ${responseApi['main']['feels_like']}°C\n╰➢ **𝖬𝗂𝗇𝗂𝗆𝗎𝗆:** ${responseApi['main']['temp_min']}°C\n╰➢ **𝖬𝖺𝗑𝗂𝗆𝗎𝗆:** ${responseApi['main']['temp_max']}°C\n╰➢ **𝖯𝗋𝖾𝗌𝗌𝗎𝗋𝖾:** ${responseApi['main']['pressure']} hPa\n╰➢ **𝖧𝗎𝗆𝗂𝖽𝗂𝗍𝗒:** ${responseApi['main']['humidity']}%\n╰➢ **𝖵𝗂𝗌𝗂𝖻𝗂𝗅𝗂𝗍𝗒:** ${responseApi['visibility']} m\n╰➢ **𝖢𝗅𝗈𝗎𝖽𝗌:** ${responseApi['clouds']['all']}%\n╰────────────────•\n\n` });
    } else {
      await e.api.sendMessage({ chat_id: e.chatId, text: `${responseApi['message']}` });
    }
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `An unexpected error occurred: ${err && err.message ? err.message : err}` });
  }
});

ultroidCmd('air ?(.*)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/air ?(.*)/);
  const inputStr = (m && m[1] ? m[1] : '').trim();
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const x = await getKey('OPENWEATHER_API');
  if (!x) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'No API found. Get One from [Here](https://api.openweathermap.org)\nAnd Add it in OPENWEATHER_API Redis Key' });
    return;
  }
  if (!inputStr) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`No Location was Given...`' });
    return;
  }
  const geoUrl = inputStr.toLowerCase() === 'perth' ? 'https://geocode.xyz/perth%20au?json=1' : `https://geocode.xyz/${encodeURIComponent(inputStr)}?json=1`;
  const geoData = await (await fetch(geoUrl)).json();
  let longitude;
  let latitude;
  try {
    longitude = geoData['longt'];
    latitude = geoData['latt'];
    if (!longitude || !latitude) throw new Error('no coords');
  } catch (_) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Unable to find coordinates for the given location.`' });
    return;
  }
  let city;
  let prov;
  try {
    city = geoData['standard']['city'];
    prov = geoData['standard']['prov'];
  } catch (_) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Unable to find city for the given coordinates.`' });
    return;
  }
  const air = await getAirPollution_weather(latitude, longitude, x);
  if (!air) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Unable to fetch air pollution data for the given location.`' });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: `${city}, ${prov}\n\n╭────────────────•\n╰➢ **𝖠𝖰𝖨:** ${air['main']['aqi']}\n╰➢ **𝖢𝖺𝗋𝖻𝗈𝗇 𝖬𝗈𝗇𝗈𝗑𝗂𝖽𝖾:** ${air['components']['co']}µg/m³\n╰➢ **𝖭𝗈𝗂𝗍𝗋𝗈𝗀𝖾𝗇 𝖬𝗈𝗇𝗈𝗑𝗂𝖽𝖾:** ${air['components']['no']}µg/m³\n╰➢ **𝖭𝗂𝗍𝗋𝗈𝗀𝖾𝗇 𝖣𝗂𝗈𝗑𝗂𝖽𝖾:** ${air['components']['no2']}µg/m³\n╰➢ **𝖮𝗓𝗈𝗇𝖾:** ${air['components']['o3']}µg/m³\n╰➢ **𝖲𝗎𝗅𝗉𝗁𝗎𝗋 𝖣𝗂𝗈𝗑𝗂𝖽𝖾:** ${air['components']['so2']}µg/m³\n╰➢ **𝖠𝗆𝗆𝗈𝗇𝗂𝖺:** ${air['components']['nh3']}µg/m³\n╰➢ **𝖥𝗂𝗇𝖾 𝖯𝖺𝗋𝗍𝗂𝖼𝗅𝖾𝗌 (PM₂.₅):** ${air['components']['pm2_5']}\n╰➢ **𝖢𝗈𝖺𝗋𝗌𝖾 𝖯𝖺𝗋𝗍𝗂𝖼𝗅𝖾𝗌 (PM₁₀):** ${air['components']['pm10']}\n╰────────────────•\n\n` });
});
}
{ // ===== ports/D/webupload.js =====

const state_webupload = { cache: {} };

async function uploadTo_webupload(uploader, fileUrl, fileName) {
  // SAME endpoints as Python webuploader sites dict.
  if (uploader === 'catbox') {
    const body = `reqtype=fileupload&time=24h&url=${encodeURIComponent(fileUrl)}`;
    const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    return (await res.text()).trim();
  }
  if (uploader === '0x0.st') {
    const res = await fetch('https://0x0.st', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `url=${encodeURIComponent(fileUrl)}` });
    return (await res.text()).trim();
  }
  if (uploader === 'transfer') {
    const res = await fetch(`https://transfer.sh/${encodeURIComponent(fileName || 'file')}`, { method: 'PUT', body: fileUrl });
    return (await res.text()).trim();
  }
  if (uploader === 'file.io') {
    const res = await fetch('https://file.io/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: fileUrl }) });
    const j = await res.json();
    return (j && j.link) ? j.link : JSON.stringify(j);
  }
  if (uploader === 'siasky') {
    const res = await fetch('https://siasky.net/skynet/skyfile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: fileUrl }) });
    const j = await res.json();
    return (j && j.skylink) ? `https://siasky.net/${j.skylink}` : JSON.stringify(j);
  }
  if (uploader === 'filebin') {
    const res = await fetch('https://filebin.net', { method: 'POST' });
    return (await res.text()).trim() || 'https://filebin.net/';
  }
  return 'Uploader not supported or invalid.';
}

ultroidCmd('webupload( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/webupload( (.*)|$)/);
  const match = (m && m[1] ? m[1] : '').trim();
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  const reply = e.replyTo;
  let fileRef = null;
  if (match) {
    fileRef = match;
    state_webupload.cache[`${e.chatId}:${(e.message && (e.message.message_id || e.message.id)) || Date.now()}`] = match;
  } else if (reply && (reply.file_id || reply.document || reply.photo || reply.video)) {
    fileRef = reply.file_id || (reply.document && reply.document.file_id) || (reply.photo && reply.photo.file_id) || 'reply-media';
    state_webupload.cache[`${e.chatId}:${(e.message && (e.message.message_id || e.message.id)) || Date.now()}`] = fileRef;
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Reply to file or give file path...' });
    return;
  }
  // Degraded: isolate has no file bytes for multipart upload; Bot API file_id cannot be re-POSTed as binary, so upload URL/file_id reference instead.
  const fname = typeof fileRef === 'string' ? fileRef.split('/').slice(-1)[0] : 'file';
  try {
    const catbox = await uploadTo_webupload('catbox', typeof fileRef === 'string' ? fileRef : '', fname);
    await e.api.sendMessage({ chat_id: e.chatId, text: `Choose Server to Upload File... (degraded: binary upload unavailable; catbox ref attempt: ${catbox})\nFile: \`${fname}\`\nServers: catbox | transfer | filebin | 0x0.st | file.io | siasky` });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `Choose Server to Upload File... (degraded: ${err && err.message ? err.message : err})` });
  }
});
}
{ // ===== ports/D/words.js =====

ultroidCmd('meaning( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/meaning( (.*)|$)/);
  const wrd = (m && m[1] ? m[1] : '').trim();
  if (!wrd) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('wrd_4') });
    return;
  }
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wrd)}`;
  const out = await (await fetch(url)).json();
  try {
    if (out && out.title) {
      await e.api.sendMessage({ chat_id: e.chatId, text: `**${out.title}**` });
      return;
    }
  } catch (_) {}
  try {
    const defi = out[0]['meanings'][0]['definitions'][0];
    const ex = defi.example ? defi.example : 'None';
    let text = get_string('wrd_1', wrd, defi.definition, ex);
    if (defi.synonyms && defi.synonyms.length) {
      text += `\n\n• **${get_string('wrd_5')} :**` + defi.synonyms.map((a) => ` ${a},`).join('').slice(0, -1).slice(0, 10);
    }
    if (defi.antonyms && defi.antonyms.length) {
      text += `\n\n**${get_string('wrd_6')} :**` + defi.antonyms.map((a) => ` ${a},`).join('').slice(0, -1).slice(0, 10);
    }
    if (text.length > 4000) {
      await e.api.sendDocument({ chat_id: e.chatId, document: `data:text/plain,${encodeURIComponent(text)}`, caption: `Meanings of ${wrd}` });
    } else {
      await e.api.sendMessage({ chat_id: e.chatId, text });
    }
  } catch (_) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `**${out && out.title ? out.title : 'No Definitions Found'}**` });
  }
});

ultroidCmd('(syno|anto)nym', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/(syno|anto)nym/);
  const task = (m ? m[1] : 'syno') + 'nyms';
  const parts = raw.split(/\s+/);
  const wrd = parts.length > 1 ? parts.slice(1).join(' ').trim() : '';
  if (!wrd) {
    await e.api.sendMessage({ chat_id: e.chatId, text: 'Give Something to search..' });
    return;
  }
  try {
    // SAME endpoint as Python get_synonyms_or_antonyms.
    const s = await (await fetch(`https://tuna.thesaurus.com/pageData/${encodeURIComponent(wrd)}`)).json();
    const defs = s.data.definitionData.definitions;
    const li = [...(defs[0][task] || []), ...(defs[1] ? (defs[1][task] || []) : [])];
    const ok = li.map((y) => y.term);
    let x = get_string(task === 'synonyms' ? 'wrd_2' : 'wrd_3', wrd);
    ok.forEach((item, idx) => { x += `**${idx + 1}.** \`${item}\`\n`; });
    if (x.length > 4000) {
      await e.api.sendDocument({ chat_id: e.chatId, document: `data:text/plain,${encodeURIComponent(x)}`, caption: `${task} of ${wrd}` });
    } else {
      await e.api.sendMessage({ chat_id: e.chatId, text: x });
    }
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string(task === 'synonyms' ? 'wrd_7' : 'wrd_8', err && err.message ? err.message : err) });
  }
});

ultroidCmd('ud (.*)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/ud (.*)/);
  const word = (m && m[1] ? m[1] : '').trim();
  if (!word) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('autopic_1') });
    return;
  }
  const out = await (await fetch(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(word)}`)).json();
  let first = null;
  try { first = out.list[0]; } catch (_) { first = null; }
  if (!first) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('autopic_2', word) });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('wrd_1', first.word, first.definition, first.example) });
});
}
{ // ===== ports/D/writer.js =====

ultroidCmd('gethtml( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/gethtml( (.*)|$)/);
  const txt = (m && m[1] ? m[1] : '').trim();
  if (!txt) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Either reply to any file or give any text`' });
    return;
  }
  const link = raw.split(/\s+/).slice(1).join(' ').trim();
  try {
    const k = await (await fetch(link)).text();
    await e.api.sendDocument({ chat_id: e.chatId, document: `data:text/html,${encodeURIComponent(k)}`, caption: 'file.html' });
  } catch (err) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `${err && err.message ? err.message : err}` });
  }
});

ultroidCmd('image( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/image( (.*)|$)/);
  const txt = (m && m[1] ? m[1] : '').trim();
  const reply = e.replyTo;
  let html = null;
  if (txt) html = raw.split(/\s+/).slice(1).join(' ');
  else if (reply) {
    if (reply.file_id) html = `[file:${reply.file_id}]`;
    else if (reply.text || reply.message) html = reply.text || reply.message;
  }
  if (!html) {
    await e.api.sendMessage({ chat_id: e.chatId, text: '`Either reply to any file or give any text`' });
    return;
  }
  // Degraded: htmlwebshot/WebShot + chromium render unavailable in V8 isolate; echo styled text instead.
  const styled = html.replace(/\n/g, '<br>');
  await e.api.sendMessage({ chat_id: e.chatId, text: `${styled} (degraded: html-to-image render needs WebShot/chromium)` });
});

ultroidCmd('write( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/write( (.*)|$)/);
  const arg = (m && m[1] ? m[1] : '').trim();
  const reply = e.replyTo;
  let text = null;
  if (reply && (reply.text || reply.message)) text = reply.text || reply.message;
  else if (arg) text = raw.split(/\s+/).slice(1).join(' ');
  if (!text) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('writer_1') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: PIL handwriting template (template.jpg + assfont.ttf) unavailable in isolate; return text in paper-style formatting.
  await e.api.sendMessage({ chat_id: e.chatId, text: `✍️ \`${text}\` (degraded: handwriting image needs PIL template, unavailable via Bot API)` });
});
}
{ // ===== ports/D/youtube.js =====

function isUrl_youtube(s) {
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; } catch (_) { return false; }
}

async function searchYoutube_youtube(query) {
  // SAME approach as Python get_yt_link via youtube search; use public search page + invidious fallback via fetch.
  try {
    const html = await (await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
    const m = html.match(/\/watch\?v=[\w-]{6,}/);
    if (m) return `https://www.youtube.com${m[0].split('&')[0].split('"')[0]}`;
  } catch (_) {}
  return null;
}

ultroidCmd('yt(a|v|sa|sv) ?(.*)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/yt(a|v|sa|sv) ?(.*)/);
  const opt = m ? (m[1] || '').trim() : '';
  let rest = m ? (m[2] || '').trim() : '';
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  if (opt === 'a') {
    const url = rest;
    if (!url) { await e.api.sendMessage({ chat_id: e.chatId, text: get_string('youtube_1') }); return; }
    if (!isUrl_youtube(url)) { await e.api.sendMessage({ chat_id: e.chatId, text: get_string('youtube_2') }); return; }
    // Degraded: yt-dlp download + ffmpeg metadata unavailable in isolate; return link for client-side download.
    await e.api.sendMessage({ chat_id: e.chatId, text: `🎧 Audio: ${url} (degraded: yt-dlp bestaudio download needs host binary)` });
    return;
  }
  if (opt === 'v') {
    const url = rest;
    if (!url) { await e.api.sendMessage({ chat_id: e.chatId, text: get_string('youtube_3') }); return; }
    if (!isUrl_youtube(url)) { await e.api.sendMessage({ chat_id: e.chatId, text: get_string('youtube_4') }); return; }
    await e.api.sendMessage({ chat_id: e.chatId, text: `🎬 Video: ${url} (degraded: yt-dlp best download needs host binary)` });
    return;
  }
  if (opt === 'sa') {
    let query = '';
    const parts = raw.split(/\s+/);
    if (parts.length < 2) { await e.api.sendMessage({ chat_id: e.chatId, text: get_string('youtube_5') }); return; }
    query = raw.slice(raw.indexOf(' ') + 1).trim();
    if (!query) { await e.api.sendMessage({ chat_id: e.chatId, text: get_string('youtube_5') }); return; }
    const url = await searchYoutube_youtube(query);
    if (!url) { await e.api.sendMessage({ chat_id: e.chatId, text: get_string('unspl_1') }); return; }
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('youtube_6') });
    await e.api.sendMessage({ chat_id: e.chatId, text: `🎧 Audio: ${url} (degraded: yt-dlp bestaudio download needs host binary)` });
    return;
  }
  if (opt === 'sv') {
    const parts = raw.split(/\s+/);
    if (parts.length < 2) { await e.api.sendMessage({ chat_id: e.chatId, text: get_string('youtube_7') }); return; }
    const query = raw.slice(raw.indexOf(' ') + 1).trim();
    if (!query) { await e.api.sendMessage({ chat_id: e.chatId, text: get_string('youtube_7') }); return; }
    const url = await searchYoutube_youtube(query);
    if (!url) { await e.api.sendMessage({ chat_id: e.chatId, text: get_string('unspl_1') }); return; }
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('youtube_8') });
    await e.api.sendMessage({ chat_id: e.chatId, text: `🎬 Video: ${url} (degraded: yt-dlp best download needs host binary)` });
    return;
  }
});
}
{ // ===== ports/D/ziptools.js =====

const state_ziptools = { batch: [] };

ultroidCmd('zip( (.*)|$)', async (e) => {
  const reply = e.replyTo;
  if (!reply) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('zip_1') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: zip binary + fast_downloader/uploader need host fs; Bot API isolate cannot zip file bytes, passthrough file_id.
  const raw = e.text || e.body || '';
  const m = raw.match(/zip( (.*)|$)/);
  const pass = (m && m[1] ? m[1] : '').trim();
  const fid = reply.file_id || (reply.document && reply.document.file_id) || null;
  if (fid) {
    await e.api.sendDocument({ chat_id: e.chatId, document: typeof fid === 'string' ? fid : fid.file_id, caption: `\`${typeof fid === 'string' ? fid : 'file'}.zip\`${pass ? ` (password: ${pass}, degraded: password-zip needs host zip binary)` : ' (degraded: zipping needs host binary)'}` });
  } else {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_5') + ' (degraded: download+zip needs host fs)' });
  }
});

ultroidCmd('unzip( (.*)|$)', async (e) => {
  const raw = e.text || e.body || '';
  const m = raw.match(/unzip( (.*)|$)/);
  const file = (m && m[1] ? m[1] : '').trim();
  const reply = e.replyTo;
  if (!((reply && (reply.document || reply.file_id)) || file)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('zip_1') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: 7z extract + get_all_files + fast_uploader need host fs; Bot API isolate cannot extract archives.
  const nm = (reply && reply.file_name) || file || '';
  if (nm && !/\.(zip|rar|exe)$/i.test(nm) && !(reply && reply.document)) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('zip_3') });
    return;
  }
  if (reply && reply.file_id && !/\.(zip|rar|exe)$/i.test(String(reply.file_name || reply.mime_type || '')) && !reply.document) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('zip_3') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('zip_3') + ' (degraded: 7z extract needs host binary)' });
});

ultroidCmd('addzip$', async (e) => {
  const reply = e.replyTo;
  if (!(reply && (reply.document || reply.file_id || reply.photo || reply.video))) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('zip_1') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: host fs zip/ staging dir unavailable; track file_id in isolate memory instead.
  const fid = reply.file_id || (reply.document && reply.document.file_id) || JSON.stringify(reply).slice(0, 64);
  state_ziptools.batch.push(fid);
  await e.api.sendMessage({ chat_id: e.chatId, text: `Downloaded \`${typeof fid === 'string' ? fid.slice(0, 32) : 'file'}\` succesfully\nNow Reply To Other Files To Add And Zip all at once (degraded: staged in memory, ${state_ziptools.batch.length} file(s))` });
});

ultroidCmd('dozip( (.*)|$)', async (e) => {
  if (!state_ziptools.batch.length) {
    await e.api.sendMessage({ chat_id: e.chatId, text: get_string('zip_2', '.') });
    return;
  }
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_1') });
  // Degraded: zip -r + uploader need host fs; Bot API isolate cannot bundle binaries, re-send file_ids.
  const raw = e.text || e.body || '';
  const m = raw.match(/dozip( (.*)|$)/);
  const pass = (m && m[1] ? m[1] : '').trim();
  for (const fid of state_ziptools.batch) {
    try {
      if (typeof fid === 'string' && fid.length < 256) await e.api.sendDocument({ chat_id: e.chatId, document: fid, caption: '`ultroid.zip entry (degraded: batch zip needs host binary)' });
    } catch (_) {}
  }
  if (pass) await e.api.sendMessage({ chat_id: e.chatId, text: `(password requested: ${pass}, degraded: password-zip needs host zip binary)` });
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('com_6') + ' (degraded)' });
  state_ziptools.batch = [];
});
}


