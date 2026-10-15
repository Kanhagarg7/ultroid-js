// Ultroid-JS port of plugins/blacklist.py, snips.py, greetings.py,
// antiflood.py, sudo.py, variables.py, database.py, core.py, tools.py,
// admintools.py, mute.py, globaltools.py — functional Bot API versions.
import { db } from 'sdk';
import { eq } from 'sdk/db';
import { ultroidCmd } from '../decorators.js';
import { getKey, setKey, delKey } from '../database.js';
import { blacklistWords, snips, greetings, antiflood, gmutes, gbans, mutes } from '../../schema.js';

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

export const PLUGIN_NAME = 'core-bundle';
