// Ultroid-JS real implementation of pyUltroid/dB/afk_db.py on SQLite.
import { db } from 'sdk';
import { afk } from '../../schema.js';

export async function get_stuff() {
  const rows = await db.select().from(afk).all().catch(() => []);
  const r = rows.find((x) => x.id === 1);
  return r ? [r.text, r.mediaType, r.media, r.since] : [];
}
export async function add_afk(msg, mediaType, media) {
  const now = Math.floor(Date.now() / 1000);
  await db.insert(afk).values({ id: 1, text: msg, mediaType, media, since: now })
    .onConflictDoUpdate({ target: afk.id, set: { text: msg, mediaType, media, since: now } }).run();
}
export function is_afk_sync() { return false; }
export async function is_afk() {
  const rows = await db.select().from(afk).all().catch(() => []);
  const r = rows.find((x) => x.id === 1);
  if (!r) return false;
  const secs = Math.floor(Date.now() / 1000) - (r.since || Math.floor(Date.now() / 1000));
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  return [r.text, r.mediaType, r.media, `${h}h ${m}m ${s}s`];
}
export async function del_afk() {
  await db.delete(afk).run().catch(() => {});
}
export const PORTED_FROM = 'pyUltroid/dB/afk_db.py';
