// tgcloud/handlers/callback_query.js
// Routes button presses. Replaces @callback(...) handlers across plugins/
// (calculator, help menu, pmpermit, greetings, etc.).
import { api } from 'sdk';
import '../lib/plugins.js';
import { CALLBACK_REGISTRY } from '../lib/core.js';

export default async function (query) {
  const data = query.data || '';
  const event = { query, data, api, message: query.message, userId: query.from?.id };
  for (const reg of CALLBACK_REGISTRY) {
    let hit = false;
    if (typeof reg.pattern === 'string') hit = data === reg.pattern;
    else if (reg.pattern instanceof RegExp) {
      const m = data.match(reg.pattern);
      if (m) {
        hit = true;
        event.data_match = m;
      }
    }
    if (!hit) continue;
    try {
      await reg.handler(event);
    } catch (e) {
      console.error('callback failed', e?.stack || e);
    }
    return { handled: true };
  }
  try {
    await api.answerCallbackQuery({ callback_query_id: query.id });
  } catch {}
  return null;
}
