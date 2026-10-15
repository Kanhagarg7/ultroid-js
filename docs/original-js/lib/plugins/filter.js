// Ultroid-JS port of plugins/filter.py — full logic via SQLite.
import { db } from 'sdk';
import { eq, and } from 'sdk/db';
import { ultroidCmd } from '../decorators.js';
import { filters } from '../../schema.js';

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

export const PLUGIN_NAME = 'filter';
