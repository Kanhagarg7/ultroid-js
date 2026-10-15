// Ultroid-JS port of plugins/afk.py — full logic, Bot API adapted.
// Original: userbot outgoing handler + incoming mention auto-reply via Telethon.
// Serverless: bot cannot see outgoing user messages; AFK is per-bot state in
// SQLite `afk` table. `.afk <reason>` sets AFK; any later message from owner
// clears it; mentions/DMs while AFK get auto-reply.
import { db } from 'sdk';
import { ultroidCmd } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';
import { afk as afkTable } from '../../schema.js';

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

export const PLUGIN_NAME = 'afk';
export const PATTERNS = ['afk( (.*)|$)', 'unafk$'];

// Called by _monitors.js: auto-reply when AFK and mentioned / DM.
export async function afkMonitor({ message, api }) {
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
