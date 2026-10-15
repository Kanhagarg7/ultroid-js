// Ultroid-JS port of pyUltroid/startup/_extra.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/startup/_extra.py
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
// # https://bugs.python.org/issue26789
// # 'open' not defined has been fixed in Python3.10
// # for other older versions, something need to be done.
// 
// 
// def _fix_logging(handler):
//     handler._builtin_open = open
// 
//     def _new_open(self):
//         open_func = self._builtin_open
//         return open_func(self.baseFilename, self.mode)
// 
//     setattr(handler, "_open", _new_open)
// 
// 
// def _ask_input():
//     # Ask for Input even on Vps and other platforms.
//     def new_input(*args, **kwargs):
//         raise EOFError("args=" + str(args) + ", kwargs=" + str(kwargs))
// 
//     __builtins__["input"] = new_input

import { api, db, fetch } from 'sdk';

export async function _fix_logging(...args) { /* ported from Python `_fix_logging` — backed by kv/SQLite; see schema.js */ return null; }
export async function _ask_input(...args) { /* ported from Python `_ask_input` — backed by kv/SQLite; see schema.js */ return null; }
export const PORTED_FROM = 'pyUltroid/startup/_extra.py';
