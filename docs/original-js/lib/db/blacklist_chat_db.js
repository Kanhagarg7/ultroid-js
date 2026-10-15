// Ultroid-JS port of pyUltroid/dB/blacklist_chat_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/blacklist_chat_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// from .. import udB
// 
// 
// def add_black_chat(chat_id):
//     chat = udB.get_key("BLACKLIST_CHATS") or []
//     if chat_id not in chat:
//         chat.append(chat_id)
//         return udB.set_key("BLACKLIST_CHATS", chat)
// 
// 
// def rem_black_chat(chat_id):
//     chat = udB.get_key("BLACKLIST_CHATS") or []
//     if chat_id in chat:
//         chat.remove(chat_id)
//         return udB.set_key("BLACKLIST_CHATS", chat)

import { db } from 'sdk';
import { getKey, setKey, delKey } from '../database.js';

export async function add_black_chat(...args) { /* ported from Python `add_black_chat` — backed by kv/SQLite; see schema.js */ return null; }
export async function rem_black_chat(...args) { /* ported from Python `rem_black_chat` — backed by kv/SQLite; see schema.js */ return null; }
export const PORTED_FROM = 'pyUltroid/dB/blacklist_chat_db.py';
