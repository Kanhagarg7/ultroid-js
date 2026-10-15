// Ultroid-JS port of plugins/notes.py
import { db } from 'sdk';
import { eq } from 'sdk/db';
import { ultroidCmd } from '../decorators.js';
import { notes } from '../../schema.js';

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

export const PLUGIN_NAME = 'notes';
