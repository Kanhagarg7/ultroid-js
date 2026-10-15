// Ultroid-JS port of assistant/manager/_on_adds.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/assistant/manager/_on_adds.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
// 
// from telethon import events
// 
// from . import *
// 
// 
// @asst.on(events.ChatAction(func=lambda x: x.user_added))
// async def dueha(e):
//     user = await e.get_user()
//     if not user.is_self:
//         return
//     sm = udB.get_key("ON_MNGR_ADD")
//     if sm == "OFF":
//         return
//     if not sm:
//         sm = "Thanks for Adding me :)"
//     await e.reply(sm, link_preview=False)

import { api, db, fetch } from 'sdk';


export const PORTED_FROM = 'assistant/manager/_on_adds.py';
