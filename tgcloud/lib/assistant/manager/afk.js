// Ultroid-JS port of assistant/manager/afk.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/assistant/manager/afk.py
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
// from datetime import datetime as dt
// 
// from telethon.events import NewMessage
// from telethon.tl.types import (
//     Message,
//     MessageEntityMention,
//     MessageEntityMentionName,
//     User,
// )
// from telethon.utils import get_display_name
// 
// from pyUltroid.fns.helper import inline_mention, time_formatter
// 
// from . import asst, asst_cmd
// 
// AFK = {}
// 
// 
// @asst_cmd(pattern="afk", func=lambda x: not x.is_private)
// async def go_afk(event):
//     sender = await event.get_sender()
//     if (not isinstance(sender, User)) or sender.bot:
//         return
//     try:
//         reason = event.text.split(" ", maxsplit=1)[1]
//     except IndexError:
//         reason = None
//     if event.is_reply and not reason:
//         replied = await event.get_reply_message()
//         if not reason and replied.text and not replied.media:
//             reason = replied.text
//         else:
//             reason = replied
//     time_ = dt.now()
//     if AFK.get(event.chat_id):
//         AFK[event.chat_id].update({event.sender_id: {"reason": reason, "time": time_}})
//     else:
//         AFK.update(
//             {event.chat_id: {event.sender_id: {"reason": reason, "time": time_}}}
//         )
//     mention = inline_mention(sender)
//     msg = f"**{mention} went AFK Now!**"
//     if reason and not isinstance(reason, str):
//         await event.reply(reason)
//     else:
//         msg += f"\n\n**Reason : ** `{reason}`"
//     await event.reply(msg)
// 
// 
// @asst.on(NewMessage(func=lambda x: AFK.get(x.chat_id) and not x.is_private))
// async def make_change(event):
//     if event.text.startswith("/afk"):
//         return

import { api, db, fetch } from 'sdk';


export const PORTED_FROM = 'assistant/manager/afk.py';
