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

import { db } from 'sdk';
import { getKey, setKey, delKey } from '../database.js';


export const PORTED_FROM = 'pyUltroid/dB/_core.py';
