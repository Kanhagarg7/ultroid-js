// Passive monitors — port of plugins/_chatactions.py, filter.py (incoming),
// notes.py, blacklist.py, antiflood.py, chatbot.py, echo.py, greetings.py,
// nsfwfilter.py, profanityfilter.py, nightmode.py, forcesubscribe.py.
// Runs on EVERY message before command dispatch (see handlers/message.js).
import { db } from 'sdk';
import { eq, and } from 'sdk/db';
import { filters, notes, blacklistWords, floodTrack, antiflood, echos, gmutes, gbans, mutes, nsfwChats } from '../../schema.js';
import { afkMonitor } from './afk.js';

export async function runPassiveMonitors({ message, api, cfg }) {
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
