// Ultroid-JS port of plugins/warn.py + pyUltroid/dB/warn_db.py
import { db } from 'sdk';
import { eq } from 'sdk/db';
import { ultroidCmd } from '../decorators.js';
import { warns } from '../../schema.js';

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

export const PLUGIN_NAME = 'warn';
