// Ultroid-JS port of pyUltroid/configs.py
// Original Python read API_ID / API_HASH / SESSION / REDIS_URI etc. from .env.
// Telegram Serverless has no MTProto user session and no env secrets:
// Bot API + DB are injected by the platform via `sdk`.
// This module keeps the SAME variable names/logic, sourced from the `kv` table
// (udB equivalent) with safe defaults, so plugin code ports 1:1.
import { getKey } from './database.js';

export const Var = {
  // Kept for 1:1 compatibility; unused on Serverless (no MTProto login).
  API_ID: 6,
  API_HASH: 'eb06d4abfb49dc3eeb1aeb98ae0f581e',
  SESSION: null,
  REDIS_URI: null,
  REDIS_PASSWORD: null,
  BOT_TOKEN: null, // managed by Telegram, not by code
  LOG_CHANNEL: 0,
  HEROKU_APP_NAME: null,
  HEROKU_API: null,
  VC_SESSION: null,
  ADDONS: false,
  VCBOT: false,
  DATABASE_URL: null,
  MONGO_URI: null,
  TGDB_URL: null,
};

export async function loadConfig() {
  // Override defaults from kv store when present (mirrors decouple config()).
  const hndlr = await getKey('HNDLR');
  const dual = await getKey('DUAL_HNDLR');
  const sudo = await getKey('SUDO_HNDLR');
  const owner = await getKey('OWNER_ID');
  const logCh = await getKey('LOG_CHANNEL');
  return {
    HNDLR: hndlr || '.',
    DUAL_HNDLR: dual || '/',
    SUDO_HNDLR: sudo || hndlr || '.',
    OWNER_ID: owner || null,
    LOG_CHANNEL: logCh || 0,
  };
}
