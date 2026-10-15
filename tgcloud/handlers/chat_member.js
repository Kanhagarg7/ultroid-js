import { api } from 'sdk';
import { greetings } from '../schema.js';
import { db } from 'sdk';
// Welcome new members when a greeting is configured (port of greetings.py).
export default async function (member) {
  try {
    const chatId = member.chat?.id;
    const rows = await db.select().from(greetings).all().catch(() => []);
    const w = rows.find((r) => Number(r.chatId) === Number(chatId) && r.kind === 'welcome' && r.enabled);
    if (w && member.new_chat_member) {
      const name = member.new_chat_member.first_name || 'there';
      await api.sendMessage({ chat_id: chatId, text: (w.text || 'Welcome {name}!').replace('{name}', name) });
    }
  } catch {}
  return null;
}
