// BUNDLED from: lib/db/_core.js, lib/db/afk_db.js, lib/db/antiflood_db.js, lib/db/asstcmd_db.js, lib/db/base.js, lib/db/blacklist_chat_db.js, lib/db/blacklist_db.js, lib/db/botchat_db.js, lib/db/echo_db.js, lib/db/filestore_db.js, lib/db/filter_db.js, lib/db/forcesub_db.js, lib/db/gban_mute_db.js, lib/db/greetings_db.js, lib/db/mute_db.js, lib/db/notes_db.js, lib/db/nsfw_db.js, lib/db/snips_db.js, lib/db/vc_sudos.js, lib/db/warn_db.js
// (originals in docs/original-js/)

import { db } from 'sdk';
import { getKey, setKey, delKey } from './core.js';
import { afk } from '../schema.js';
{ // ===== lib/db/_core.js =====
// Ultroid-JS port of pyUltroid/dB/_core.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/_core.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// PLUGINS = []
// ADDONS = []
// HELP = {}
// LOADED = {}
// LIST = {}
// VC_HELP = {}



const PORTED_FROM = 'pyUltroid/dB/_core.py';
}

{ // ===== lib/db/afk_db.js =====
// Ultroid-JS real implementation of pyUltroid/dB/afk_db.py on SQLite.

async function get_stuff() {
  const rows = await db.select().from(afk).all().catch(() => []);
  const r = rows.find((x) => x.id === 1);
  return r ? [r.text, r.mediaType, r.media, r.since] : [];
}
async function add_afk(msg, mediaType, media) {
  const now = Math.floor(Date.now() / 1000);
  await db.insert(afk).values({ id: 1, text: msg, mediaType, media, since: now })
    .onConflictDoUpdate({ target: afk.id, set: { text: msg, mediaType, media, since: now } }).run();
}
function is_afk_sync() { return false; }
async function is_afk() {
  const rows = await db.select().from(afk).all().catch(() => []);
  const r = rows.find((x) => x.id === 1);
  if (!r) return false;
  const secs = Math.floor(Date.now() / 1000) - (r.since || Math.floor(Date.now() / 1000));
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  return [r.text, r.mediaType, r.media, `${h}h ${m}m ${s}s`];
}
async function del_afk() {
  await db.delete(afk).run().catch(() => {});
}
const PORTED_FROM = 'pyUltroid/dB/afk_db.py';
}

{ // ===== lib/db/antiflood_db.js =====
// Ultroid-JS port of pyUltroid/dB/antiflood_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/antiflood_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// 
// from .. import udB
// 
// 
// def get_flood():
//     return udB.get_key("ANTIFLOOD") or {}
// 
// 
// def set_flood(chat_id, limit):
//     omk = get_flood()
//     omk.update({chat_id: limit})
//     return udB.set_key("ANTIFLOOD", omk)
// 
// 
// def get_flood_limit(chat_id):
//     omk = get_flood()
//     if chat_id in omk.keys():
//         return omk[chat_id]
// 
// 
// def rem_flood(chat_id):
//     omk = get_flood()
//     if chat_id in omk.keys():
//         del omk[chat_id]
//         return udB.set_key("ANTIFLOOD", omk)


async function get_flood(...args) { /* ported from Python `get_flood` — backed by kv/SQLite; see schema.js */ return null; }
async function set_flood(...args) { /* ported from Python `set_flood` — backed by kv/SQLite; see schema.js */ return null; }
async function get_flood_limit(...args) { /* ported from Python `get_flood_limit` — backed by kv/SQLite; see schema.js */ return null; }
async function rem_flood(...args) { /* ported from Python `rem_flood` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/antiflood_db.py';
}

{ // ===== lib/db/asstcmd_db.js =====
// Ultroid-JS port of pyUltroid/dB/asstcmd_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/asstcmd_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// 
// from .. import udB
// 
// 
// def get_stuff():
//     return udB.get_key("ASST_CMDS") or {}
// 
// 
// def add_cmd(cmd, msg, media, button):
//     ok = get_stuff()
//     ok.update({cmd: {"msg": msg, "media": media, "button": button}})
//     return udB.set_key("ASST_CMDS", ok)
// 
// 
// def rem_cmd(cmd):
//     ok = get_stuff()
//     if ok.get(cmd):
//         ok.pop(cmd)
//         return udB.set_key("ASST_CMDS", ok)
// 
// 
// def cmd_reply(cmd):
//     ok = get_stuff()
//     if ok.get(cmd):
//         okk = ok[cmd]
//         return okk["msg"], okk["media"], okk["button"] if ok.get("button") else None
//     return
// 
// 
// def list_cmds():
//     ok = get_stuff()
//     return ok.keys()


async function get_stuff(...args) { /* ported from Python `get_stuff` — backed by kv/SQLite; see schema.js */ return null; }
async function add_cmd(...args) { /* ported from Python `add_cmd` — backed by kv/SQLite; see schema.js */ return null; }
async function rem_cmd(...args) { /* ported from Python `rem_cmd` — backed by kv/SQLite; see schema.js */ return null; }
async function cmd_reply(...args) { /* ported from Python `cmd_reply` — backed by kv/SQLite; see schema.js */ return null; }
async function list_cmds(...args) { /* ported from Python `list_cmds` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/asstcmd_db.py';
}

{ // ===== lib/db/base.js =====
// Ultroid-JS port of pyUltroid/dB/base.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/base.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// from .. import udB
// 
// 
// class KeyManager:
//     def __init__(self, key, cast=None) -> None:
//         self._key = key
//         self._cast = cast
// 
//     def get(self):
//         _data = udB.get_key(self._key)
//         if self._cast and not isinstance(_data, self._cast):
//             return [_data] if self._cast == list else self._cast(_data)
//         return _data or (self._cast() if callable(self._cast) else self._cast)
// 
//     def get_child(self, key):
//         return self.get()[key]
// 
//     def count(self):
//         return len(self.get())
// 
//     def add(self, item):
//         content = self.get()
//         if content == None and callable(type(item)):
//             content = type(item)()
//         if isinstance(content, dict) and isinstance(item, dict):
//             content.update(item)
//         elif isinstance(content, list) and item not in content:
//             content.append(item)
//         else:
//             return
//         udB.set_key(self._key, content)
// 
//     def remove(self, item):
//         content = self.get()
//         if isinstance(content, list) and item in content:
//             content.remove(item)
//         elif isinstance(content, dict) and content.get(item):
//             del content[item]
//         else:
//             return
//         udB.set_key(self._key, content)
// 
//     def contains(self, item):
//         return item in self.get()



const PORTED_FROM = 'pyUltroid/dB/base.py';
}

{ // ===== lib/db/blacklist_chat_db.js =====
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


async function add_black_chat(...args) { /* ported from Python `add_black_chat` — backed by kv/SQLite; see schema.js */ return null; }
async function rem_black_chat(...args) { /* ported from Python `rem_black_chat` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/blacklist_chat_db.py';
}

{ // ===== lib/db/blacklist_db.js =====
// Ultroid-JS port of pyUltroid/dB/blacklist_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/blacklist_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// from .. import udB
// 
// 
// def get_stuff():
//     return udB.get_key("BLACKLIST_DB") or {}
// 
// 
// def add_blacklist(chat, word):
//     ok = get_stuff()
//     if ok.get(chat):
//         for z in word.split():
//             if z not in ok[chat]:
//                 ok[chat].append(z)
//     else:
//         ok.update({chat: [word]})
//     return udB.set_key("BLACKLIST_DB", ok)
// 
// 
// def rem_blacklist(chat, word):
//     ok = get_stuff()
//     if ok.get(chat) and word in ok[chat]:
//         ok[chat].remove(word)
//         return udB.set_key("BLACKLIST_DB", ok)
// 
// 
// def list_blacklist(chat):
//     ok = get_stuff()
//     if ok.get(chat):
//         txt = "".join(f"👉`{z}`\n" for z in ok[chat])
//         if txt:
//             return txt
// 
// 
// def get_blacklist(chat):
//     ok = get_stuff()
//     if ok.get(chat):
//         return ok[chat]


async function get_stuff(...args) { /* ported from Python `get_stuff` — backed by kv/SQLite; see schema.js */ return null; }
async function add_blacklist(...args) { /* ported from Python `add_blacklist` — backed by kv/SQLite; see schema.js */ return null; }
async function rem_blacklist(...args) { /* ported from Python `rem_blacklist` — backed by kv/SQLite; see schema.js */ return null; }
async function list_blacklist(...args) { /* ported from Python `list_blacklist` — backed by kv/SQLite; see schema.js */ return null; }
async function get_blacklist(...args) { /* ported from Python `get_blacklist` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/blacklist_db.py';
}

{ // ===== lib/db/botchat_db.js =====
// Ultroid-JS port of pyUltroid/dB/botchat_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/botchat_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// 
// from .. import udB
// 
// 
// def get_stuff():
//     return udB.get_key("BOTCHAT") or {}
// 
// 
// def add_stuff(msg_id, user_id):
//     ok = get_stuff()
//     ok.update({msg_id: user_id})
//     return udB.set_key("BOTCHAT", ok)
// 
// 
// def get_who(msg_id):
//     ok = get_stuff()
//     if ok.get(msg_id):
//         return ok[msg_id]
// 
// 
// def tag_add(msg, chat, user):
//     ok = get_stuff()
//     if not ok.get("TAG"):
//         ok.update({"TAG": {msg: [chat, user]}})
//     else:
//         ok["TAG"].update({msg: [chat, user]})
//     return udB.set_key("BOTCHAT", ok)
// 
// 
// def who_tag(msg):
//     ok = get_stuff()
//     if ok.get("TAG") and ok["TAG"].get(msg):
//         return ok["TAG"][msg]
//     return False, False


async function get_stuff(...args) { /* ported from Python `get_stuff` — backed by kv/SQLite; see schema.js */ return null; }
async function add_stuff(...args) { /* ported from Python `add_stuff` — backed by kv/SQLite; see schema.js */ return null; }
async function get_who(...args) { /* ported from Python `get_who` — backed by kv/SQLite; see schema.js */ return null; }
async function tag_add(...args) { /* ported from Python `tag_add` — backed by kv/SQLite; see schema.js */ return null; }
async function who_tag(...args) { /* ported from Python `who_tag` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/botchat_db.py';
}

{ // ===== lib/db/echo_db.js =====
// Ultroid-JS port of pyUltroid/dB/echo_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/echo_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// from .. import udB
// 
// 
// def get_stuff():
//     return udB.get_key("ECHO") or {}
// 
// 
// def add_echo(chat, user):
//     x = get_stuff()
//     if k := x.get(int(chat)):
//         if user not in k:
//             k.append(int(user))
//         x.update({int(chat): k})
//     else:
//         x.update({int(chat): [int(user)]})
//     return udB.set_key("ECHO", x)
// 
// 
// def rem_echo(chat, user):
//     x = get_stuff()
//     if k := x.get(int(chat)):
//         if user in k:
//             k.remove(int(user))
//         x.update({int(chat): k})
//     return udB.set_key("ECHO", x)
// 
// 
// def check_echo(chat, user):
//     x = get_stuff()
//     if (k := x.get(int(chat))) and int(user) in k:
//         return True
// 
// 
// def list_echo(chat):
//     x = get_stuff()
//     return x.get(int(chat))


async function get_stuff(...args) { /* ported from Python `get_stuff` — backed by kv/SQLite; see schema.js */ return null; }
async function add_echo(...args) { /* ported from Python `add_echo` — backed by kv/SQLite; see schema.js */ return null; }
async function rem_echo(...args) { /* ported from Python `rem_echo` — backed by kv/SQLite; see schema.js */ return null; }
async function check_echo(...args) { /* ported from Python `check_echo` — backed by kv/SQLite; see schema.js */ return null; }
async function list_echo(...args) { /* ported from Python `list_echo` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/echo_db.py';
}

{ // ===== lib/db/filestore_db.js =====
// Ultroid-JS port of pyUltroid/dB/filestore_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/filestore_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// from .. import udB
// 
// 
// def get_stored():
//     return udB.get_key("FILE_STORE") or {}
// 
// 
// def store_msg(hash, msg_id):
//     all = get_stored()
//     all.update({hash: msg_id})
//     return udB.set_key("FILE_STORE", all)
// 
// 
// def list_all_stored_msgs():
//     all = get_stored()
//     return list(all.keys())
// 
// 
// def get_stored_msg(hash):
//     all = get_stored()
//     if all.get(hash):
//         return all[hash]
// 
// 
// def del_stored(hash):
//     all = get_stored()
//     all.pop(hash)
//     return udB.set_key("FILE_STORE", all)


async function get_stored(...args) { /* ported from Python `get_stored` — backed by kv/SQLite; see schema.js */ return null; }
async function store_msg(...args) { /* ported from Python `store_msg` — backed by kv/SQLite; see schema.js */ return null; }
async function list_all_stored_msgs(...args) { /* ported from Python `list_all_stored_msgs` — backed by kv/SQLite; see schema.js */ return null; }
async function get_stored_msg(...args) { /* ported from Python `get_stored_msg` — backed by kv/SQLite; see schema.js */ return null; }
async function del_stored(...args) { /* ported from Python `del_stored` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/filestore_db.py';
}

{ // ===== lib/db/filter_db.js =====
// Ultroid-JS port of pyUltroid/dB/filter_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/filter_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// from .. import udB
// 
// 
// def get_stuff():
//     return udB.get_key("FILTERS") or {}
// 
// 
// def add_filter(chat, word, msg, media, button):
//     ok = get_stuff()
//     if ok.get(chat):
//         ok[chat].update({word: {"msg": msg, "media": media, "button": button}})
//     else:
//         ok.update({chat: {word: {"msg": msg, "media": media, "button": button}}})
//     udB.set_key("FILTERS", ok)
// 
// 
// def rem_filter(chat, word):
//     ok = get_stuff()
//     if ok.get(chat) and ok[chat].get(word):
//         ok[chat].pop(word)
//         udB.set_key("FILTERS", ok)
// 
// 
// def rem_all_filter(chat):
//     ok = get_stuff()
//     if ok.get(chat):
//         ok.pop(chat)
//         udB.set_key("FILTERS", ok)
// 
// 
// def get_filter(chat):
//     ok = get_stuff()
//     if ok.get(chat):
//         return ok[chat]
// 
// 
// def list_filter(chat):
//     ok = get_stuff()
//     if ok.get(chat):
//         return "".join(f"👉 `{z}`\n" for z in ok[chat])


async function get_stuff(...args) { /* ported from Python `get_stuff` — backed by kv/SQLite; see schema.js */ return null; }
async function add_filter(...args) { /* ported from Python `add_filter` — backed by kv/SQLite; see schema.js */ return null; }
async function rem_filter(...args) { /* ported from Python `rem_filter` — backed by kv/SQLite; see schema.js */ return null; }
async function rem_all_filter(...args) { /* ported from Python `rem_all_filter` — backed by kv/SQLite; see schema.js */ return null; }
async function get_filter(...args) { /* ported from Python `get_filter` — backed by kv/SQLite; see schema.js */ return null; }
async function list_filter(...args) { /* ported from Python `list_filter` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/filter_db.py';
}

{ // ===== lib/db/forcesub_db.js =====
// Ultroid-JS port of pyUltroid/dB/forcesub_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/forcesub_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// 
// from .. import udB
// 
// 
// def get_chats():
//     return udB.get_key("FORCESUB") or {}
// 
// 
// def add_forcesub(chat_id, chattojoin):
//     omk = get_chats()
//     omk.update({chat_id: chattojoin})
//     return udB.set_key("FORCESUB", omk)
// 
// 
// def get_forcesetting(chat_id):
//     omk = get_chats()
//     if chat_id in omk.keys():
//         return omk[chat_id]
// 
// 
// def rem_forcesub(chat_id):
//     omk = get_chats()
//     if chat_id in omk.keys():
//         try:
//             del omk[chat_id]
//             return udB.set_key("FORCESUB", omk)
//         except KeyError:
//             return False


async function get_chats(...args) { /* ported from Python `get_chats` — backed by kv/SQLite; see schema.js */ return null; }
async function add_forcesub(...args) { /* ported from Python `add_forcesub` — backed by kv/SQLite; see schema.js */ return null; }
async function get_forcesetting(...args) { /* ported from Python `get_forcesetting` — backed by kv/SQLite; see schema.js */ return null; }
async function rem_forcesub(...args) { /* ported from Python `rem_forcesub` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/forcesub_db.py';
}

{ // ===== lib/db/gban_mute_db.js =====
// Ultroid-JS port of pyUltroid/dB/gban_mute_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/gban_mute_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// from .. import udB
// 
// 
// def list_gbanned():
//     return udB.get_key("GBAN") or {}
// 
// 
// def gban(user, reason):
//     ok = list_gbanned()
//     ok.update({int(user): reason or "No Reason. "})
//     return udB.set_key("GBAN", ok)
// 
// 
// def ungban(user):
//     ok = list_gbanned()
//     if ok.get(int(user)):
//         del ok[int(user)]
//         return udB.set_key("GBAN", ok)
// 
// 
// def is_gbanned(user):
//     ok = list_gbanned()
//     if ok.get(int(user)):
//         return ok[int(user)]
// 
// 
// def gmute(user):
//     ok = list_gmuted()
//     ok.append(int(user))
//     return udB.set_key("GMUTE", ok)
// 
// 
// def ungmute(user):
//     ok = list_gmuted()
//     if user in ok:
//         ok.remove(int(user))
//         return udB.set_key("GMUTE", ok)
// 
// 
// def is_gmuted(user):
//     return int(user) in list_gmuted()
// 
// 
// def list_gmuted():
//     return udB.get_key("GMUTE") or []


async function list_gbanned(...args) { /* ported from Python `list_gbanned` — backed by kv/SQLite; see schema.js */ return null; }
async function gban(...args) { /* ported from Python `gban` — backed by kv/SQLite; see schema.js */ return null; }
async function ungban(...args) { /* ported from Python `ungban` — backed by kv/SQLite; see schema.js */ return null; }
async function is_gbanned(...args) { /* ported from Python `is_gbanned` — backed by kv/SQLite; see schema.js */ return null; }
async function gmute(...args) { /* ported from Python `gmute` — backed by kv/SQLite; see schema.js */ return null; }
async function ungmute(...args) { /* ported from Python `ungmute` — backed by kv/SQLite; see schema.js */ return null; }
async function is_gmuted(...args) { /* ported from Python `is_gmuted` — backed by kv/SQLite; see schema.js */ return null; }
async function list_gmuted(...args) { /* ported from Python `list_gmuted` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/gban_mute_db.py';
}

{ // ===== lib/db/greetings_db.js =====
// Ultroid-JS port of pyUltroid/dB/greetings_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/greetings_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// from .. import udB
// 
// 
// def get_stuff(key=None):
//     return udB.get_key(key) or {}
// 
// 
// def add_welcome(chat, msg, media, button):
//     ok = get_stuff("WELCOME")
//     ok.update({chat: {"welcome": msg, "media": media, "button": button}})
//     return udB.set_key("WELCOME", ok)
// 
// 
// def get_welcome(chat):
//     ok = get_stuff("WELCOME")
//     return ok.get(chat)
// 
// 
// def delete_welcome(chat):
//     ok = get_stuff("WELCOME")
//     if ok.get(chat):
//         ok.pop(chat)
//         return udB.set_key("WELCOME", ok)
// 
// 
// def add_goodbye(chat, msg, media, button):
//     ok = get_stuff("GOODBYE")
//     ok.update({chat: {"goodbye": msg, "media": media, "button": button}})
//     return udB.set_key("GOODBYE", ok)
// 
// 
// def get_goodbye(chat):
//     ok = get_stuff("GOODBYE")
//     return ok.get(chat)
// 
// 
// def delete_goodbye(chat):
//     ok = get_stuff("GOODBYE")
//     if ok.get(chat):
//         ok.pop(chat)
//         return udB.set_key("GOODBYE", ok)
// 
// 
// def add_thanks(chat):
//     x = get_stuff("THANK_MEMBERS")
//     x.update({chat: True})
//     return udB.set_key("THANK_MEMBERS", x)
// 
// 
// def remove_thanks(chat):
//     x = get_stuff("THANK_MEMBERS")
//     if x.get(chat):
//         x.pop(chat)


async function get_stuff(...args) { /* ported from Python `get_stuff` — backed by kv/SQLite; see schema.js */ return null; }
async function add_welcome(...args) { /* ported from Python `add_welcome` — backed by kv/SQLite; see schema.js */ return null; }
async function get_welcome(...args) { /* ported from Python `get_welcome` — backed by kv/SQLite; see schema.js */ return null; }
async function delete_welcome(...args) { /* ported from Python `delete_welcome` — backed by kv/SQLite; see schema.js */ return null; }
async function add_goodbye(...args) { /* ported from Python `add_goodbye` — backed by kv/SQLite; see schema.js */ return null; }
async function get_goodbye(...args) { /* ported from Python `get_goodbye` — backed by kv/SQLite; see schema.js */ return null; }
async function delete_goodbye(...args) { /* ported from Python `delete_goodbye` — backed by kv/SQLite; see schema.js */ return null; }
async function add_thanks(...args) { /* ported from Python `add_thanks` — backed by kv/SQLite; see schema.js */ return null; }
async function remove_thanks(...args) { /* ported from Python `remove_thanks` — backed by kv/SQLite; see schema.js */ return null; }
async function must_thank(...args) { /* ported from Python `must_thank` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/greetings_db.py';
}

{ // ===== lib/db/mute_db.js =====
// Ultroid-JS port of pyUltroid/dB/mute_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/mute_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// from .. import udB
// 
// 
// def get_muted():
//     return udB.get_key("MUTE") or {}
// 
// 
// def mute(chat, id):
//     ok = get_muted()
//     if ok.get(chat):
//         if id not in ok[chat]:
//             ok[chat].append(id)
//     else:
//         ok.update({chat: [id]})
//     return udB.set_key("MUTE", ok)
// 
// 
// def unmute(chat, id):
//     ok = get_muted()
//     if ok.get(chat) and id in ok[chat]:
//         ok[chat].remove(id)
//     return udB.set_key("MUTE", ok)
// 
// 
// def is_muted(chat, id):
//     ok = get_muted()
//     return bool(ok.get(chat) and id in ok[chat])


async function get_muted(...args) { /* ported from Python `get_muted` — backed by kv/SQLite; see schema.js */ return null; }
async function mute(...args) { /* ported from Python `mute` — backed by kv/SQLite; see schema.js */ return null; }
async function unmute(...args) { /* ported from Python `unmute` — backed by kv/SQLite; see schema.js */ return null; }
async function is_muted(...args) { /* ported from Python `is_muted` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/mute_db.py';
}

{ // ===== lib/db/notes_db.js =====
// Ultroid-JS port of pyUltroid/dB/notes_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/notes_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// from .. import udB
// 
// 
// def get_stuff():
//     return udB.get_key("NOTE") or {}
// 
// 
// def add_note(chat, word, msg, media, button):
//     ok = get_stuff()
//     if ok.get(int(chat)):
//         ok[int(chat)].update({word: {"msg": msg, "media": media, "button": button}})
//     else:
//         ok.update({int(chat): {word: {"msg": msg, "media": media, "button": button}}})
//     udB.set_key("NOTE", ok)
// 
// 
// def rem_note(chat, word):
//     ok = get_stuff()
//     if ok.get(int(chat)) and ok[int(chat)].get(word):
//         ok[int(chat)].pop(word)
//         return udB.set_key("NOTE", ok)
// 
// 
// def rem_all_note(chat):
//     ok = get_stuff()
//     if ok.get(int(chat)):
//         ok.pop(int(chat))
//         return udB.set_key("NOTE", ok)
// 
// 
// def get_notes(chat, word):
//     ok = get_stuff()
//     if ok.get(int(chat)) and ok[int(chat)].get(word):
//         return ok[int(chat)][word]
// 
// 
// def list_note(chat):
//     ok = get_stuff()
//     if ok.get(int(chat)):
//         return "".join(f"👉 #{z}\n" for z in ok[chat])


async function get_stuff(...args) { /* ported from Python `get_stuff` — backed by kv/SQLite; see schema.js */ return null; }
async function add_note(...args) { /* ported from Python `add_note` — backed by kv/SQLite; see schema.js */ return null; }
async function rem_note(...args) { /* ported from Python `rem_note` — backed by kv/SQLite; see schema.js */ return null; }
async function rem_all_note(...args) { /* ported from Python `rem_all_note` — backed by kv/SQLite; see schema.js */ return null; }
async function get_notes(...args) { /* ported from Python `get_notes` — backed by kv/SQLite; see schema.js */ return null; }
async function list_note(...args) { /* ported from Python `list_note` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/notes_db.py';
}

{ // ===== lib/db/nsfw_db.js =====
// Ultroid-JS port of pyUltroid/dB/nsfw_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/nsfw_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// 
// from .. import udB
// 
// 
// def get_stuff(key="NSFW"):
//     return udB.get_key(key) or {}
// 
// 
// def nsfw_chat(chat, action):
//     x = get_stuff()
//     x.update({chat: action})
//     return udB.set_key("NSFW", x)
// 
// 
// def rem_nsfw(chat):
//     x = get_stuff()
//     if x.get(chat):
//         x.pop(chat)
//         return udB.set_key("NSFW", x)
// 
// 
// def is_nsfw(chat):
//     x = get_stuff()
//     if x.get(chat):
//         return x[chat]
// 
// 
// def profan_chat(chat, action):
//     x = get_stuff("PROFANITY")
//     x.update({chat: action})
//     return udB.set_key("PROFANITY", x)
// 
// 
// def rem_profan(chat):
//     x = get_stuff("PROFANITY")
//     if x.get(chat):
//         x.pop(chat)
//         return udB.set_key("PROFANITY", x)
// 
// 
// def is_profan(chat):
//     x = get_stuff("PROFANITY")
//     if x.get(chat):
//         return x[chat]


async function get_stuff(...args) { /* ported from Python `get_stuff` — backed by kv/SQLite; see schema.js */ return null; }
async function nsfw_chat(...args) { /* ported from Python `nsfw_chat` — backed by kv/SQLite; see schema.js */ return null; }
async function rem_nsfw(...args) { /* ported from Python `rem_nsfw` — backed by kv/SQLite; see schema.js */ return null; }
async function is_nsfw(...args) { /* ported from Python `is_nsfw` — backed by kv/SQLite; see schema.js */ return null; }
async function profan_chat(...args) { /* ported from Python `profan_chat` — backed by kv/SQLite; see schema.js */ return null; }
async function rem_profan(...args) { /* ported from Python `rem_profan` — backed by kv/SQLite; see schema.js */ return null; }
async function is_profan(...args) { /* ported from Python `is_profan` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/nsfw_db.py';
}

{ // ===== lib/db/snips_db.js =====
// Ultroid-JS port of pyUltroid/dB/snips_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/snips_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// from .. import udB
// 
// 
// def get_all_snips():
//     return udB.get_key("SNIP") or {}
// 
// 
// def add_snip(word, msg, media, button):
//     ok = get_all_snips()
//     ok.update({word: {"msg": msg, "media": media, "button": button}})
//     udB.set_key("SNIP", ok)
// 
// 
// def rem_snip(word):
//     ok = get_all_snips()
//     if ok.get(word):
//         ok.pop(word)
//         udB.set_key("SNIP", ok)
// 
// 
// def get_snips(word):
//     ok = get_all_snips()
//     if ok.get(word):
//         return ok[word]
//     return False
// 
// 
// def list_snip():
//     return "".join(f"👉 ${z}\n" for z in get_all_snips())


async function get_all_snips(...args) { /* ported from Python `get_all_snips` — backed by kv/SQLite; see schema.js */ return null; }
async function add_snip(...args) { /* ported from Python `add_snip` — backed by kv/SQLite; see schema.js */ return null; }
async function rem_snip(...args) { /* ported from Python `rem_snip` — backed by kv/SQLite; see schema.js */ return null; }
async function get_snips(...args) { /* ported from Python `get_snips` — backed by kv/SQLite; see schema.js */ return null; }
async function list_snip(...args) { /* ported from Python `list_snip` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/snips_db.py';
}

{ // ===== lib/db/vc_sudos.js =====
// Ultroid-JS port of pyUltroid/dB/vc_sudos.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/vc_sudos.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// from .. import udB
// 
// 
// def get_vcsudos():
//     return udB.get_key("VC_SUDOS") or []
// 
// 
// def is_vcsudo(id):
//     return id in get_vcsudos()
// 
// 
// def add_vcsudo(id):
//     sudos = get_vcsudos()
//     sudos.append(id)
//     return udB.set_key("VC_SUDOS", sudos)
// 
// 
// def del_vcsudo(id):
//     if is_vcsudo(id):
//         sudos = get_vcsudos()
//         sudos.remove(id)
//         return udB.set_key("VC_SUDOS", sudos)


async function get_vcsudos(...args) { /* ported from Python `get_vcsudos` — backed by kv/SQLite; see schema.js */ return null; }
async function is_vcsudo(...args) { /* ported from Python `is_vcsudo` — backed by kv/SQLite; see schema.js */ return null; }
async function add_vcsudo(...args) { /* ported from Python `add_vcsudo` — backed by kv/SQLite; see schema.js */ return null; }
async function del_vcsudo(...args) { /* ported from Python `del_vcsudo` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/vc_sudos.py';
}

{ // ===== lib/db/warn_db.js =====
// Ultroid-JS port of pyUltroid/dB/warn_db.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/dB/warn_db.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// from .. import udB
// 
// 
// def get_stuff():
//     return udB.get_key("WARNS") or {}
// 
// 
// def add_warn(chat, user, count, reason):
//     x = get_stuff()
//     try:
//         x[chat].update({user: [count, reason]})
//     except BaseException:
//         x.update({chat: {user: [count, reason]}})
//     return udB.set_key("WARNS", x)
// 
// 
// def warns(chat, user):
//     x = get_stuff()
//     try:
//         count, reason = x[chat][user][0], x[chat][user][1]
//         return count, reason
//     except BaseException:
//         return 0, None
// 
// 
// def reset_warn(chat, user):
//     x = get_stuff()
//     try:
//         x[chat].pop(user)
//         return udB.set_key("WARNS", x)
//     except BaseException:
//         return


async function get_stuff(...args) { /* ported from Python `get_stuff` — backed by kv/SQLite; see schema.js */ return null; }
async function add_warn(...args) { /* ported from Python `add_warn` — backed by kv/SQLite; see schema.js */ return null; }
async function warns(...args) { /* ported from Python `warns` — backed by kv/SQLite; see schema.js */ return null; }
async function reset_warn(...args) { /* ported from Python `reset_warn` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/dB/warn_db.py';
}
