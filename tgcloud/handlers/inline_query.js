// tgcloud/handlers/inline_query.js
// Routes inline queries. Replaces @in_pattern(...) handlers.
import { api } from 'sdk';
import '../lib/plugins/index.js';
import { INLINE_REGISTRY } from '../lib/decorators.js';

export default async function (query) {
  const text = (query.query || '').trim();
  for (const reg of INLINE_REGISTRY) {
    const pat = reg.pattern;
    const hit =
      typeof pat === 'string'
        ? text.startsWith(pat)
        : pat instanceof RegExp
          ? pat.test(text)
          : false;
    if (!hit) continue;
    const event = { query, text, api, pattern: pat };
    try {
      await reg.handler(event);
    } catch (e) {
      console.error('inline failed', e?.stack || e);
    }
    return { handled: true };
  }
  return null;
}
