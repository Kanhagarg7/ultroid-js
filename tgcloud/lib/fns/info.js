// Ultroid-JS port of pyUltroid/fns/info.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/fns/info.py
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
// # -----------------Random Stuff--------------
// 
// import math
// 
// from telethon.tl import functions, types
// 
// from .. import LOGS
// 
// # -----------
// # @buddhhu
// 
// 
// async def get_uinfo(e):
//     user, data = None, None
//     reply = await e.get_reply_message()
//     if reply:
//         user = await e.client.get_entity(reply.sender_id)
//         data = e.pattern_match.group(1)
//     else:
//         ok = e.pattern_match.group(1).split(maxsplit=1)
//         if len(ok) > 1:
//             data = ok[1]
//         try:
//             user = await e.client.get_entity(await e.client.parse_id(ok[0]))
//         except IndexError:
//             pass
//         except ValueError as er:
//             await e.eor(str(er))
//             return None, None
//     return user, data
// 
// 
// # Random stuffs dk who added
// 
// 
// async def get_chat_info(chat, event):
//     if isinstance(chat, types.Channel):
//         chat_info = await event.client(functions.channels.GetFullChannelRequest(chat))
//     elif isinstance(chat, types.Chat):
//         chat_info = await event.client(functions.messages.GetFullChatRequest(chat))
//     else:
//         return await event.eor("`Use this for Group/Channel.`")
//     full = chat_info.full_chat
//     chat_photo = full.chat_photo
//     broadcast = getattr(chat, "broadcast", False)
//     chat_type = "Channel" if broadcast else "Group"
//     chat_title = chat.title
//     try:
//         msg_info = await event.client(
//             functions.messages.GetHistoryRequest(
//                 peer=chat.id,
//                 offset_id=0,

import { api, db, fetch } from 'sdk';


export const PORTED_FROM = 'pyUltroid/fns/info.py';
