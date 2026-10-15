// Ultroid-JS port of pyUltroid/exceptions.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/exceptions.py
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
// """
// Exceptions which can be raised by py-Ultroid Itself.
// """
// 
// 
// class pyUltroidError(Exception):
//     ...
// 
// 
// class DependencyMissingError(ImportError):
//     ...
// 
// 
// class RunningAsFunctionLibError(pyUltroidError):
//     ...

import { api, db, fetch } from 'sdk';


export const PORTED_FROM = 'pyUltroid/exceptions.py';
