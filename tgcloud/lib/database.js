// Ultroid-JS port of pyUltroid/startup/_database.py UltroidDB + pyUltroid/dB/base.py
// Original: Redis / Mongo / SQL via udB.get_key / set_key / del_key.
// Serverless: SQLite `kv` table (see ../schema.js) via sdk `db`.
import { db } from 'sdk';
import { eq } from 'sdk/db';
import { kv } from '../schema.js';

export async function getKey(key, fallback = null) {
  try {
    const row = await db.select().from(kv).where(eq(kv.key, key)).get();
    return row ? row.value : fallback;
  } catch {
    return fallback;
  }
}

export async function setKey(key, value) {
  await db
    .insert(kv)
    .values({ key, value })
    .onConflictDoUpdate({ target: kv.key, set: { value } })
    .run();
  return true;
}

export async function delKey(key) {
  const { eq: eqOp } = await import('sdk/db');
  await db.delete(kv).where(eqOp(kv.key, key)).run();
  return true;
}

// Sync in-memory mirror used by ported plugin code that expects udB.* sync calls.
// Handlers should prefer async getKey/setKey/delKey; this keeps 1:1 call shapes.
export const udB = {
  get_key: (k) => null, // async variant lives in getKey(); sync returns null by design
  set_key: () => false,
  del_key: () => false,
  getKey,
  setKey,
  delKey,
  name: 'tgcloud-sqlite',
  async ping() {
    return true;
  },
};

// Port of KeyManager (pyUltroid/dB/base.py)
export class KeyManager {
  constructor(key, cast = null) {
    this._key = key;
    this._cast = cast;
  }
  async get() {
    const data = await getKey(this._key);
    if (this._cast === Array) return Array.isArray(data) ? data : data ? [data] : [];
    if (this._cast === Object) return data && typeof data === 'object' ? data : {};
    return data ?? null;
  }
  async add(item) {
    const content = (await this.get()) || (Array.isArray(item) ? [] : {});
    if (Array.isArray(content) && !content.includes(item)) {
      content.push(item);
      await setKey(this._key, content);
    } else if (content && typeof content === 'object' && item && typeof item === 'object') {
      Object.assign(content, item);
      await setKey(this._key, content);
    }
  }
  async remove(item) {
    const content = await this.get();
    if (Array.isArray(content)) {
      const i = content.indexOf(item);
      if (i >= 0) {
        content.splice(i, 1);
        await setKey(this._key, content);
      }
    } else if (content && typeof content === 'object' && content[item]) {
      delete content[item];
      await setKey(this._key, content);
    }
  }
  async contains(item) {
    const content = await this.get();
    if (Array.isArray(content)) return content.includes(item);
    if (content && typeof content === 'object') return item in content;
    return false;
  }
}
