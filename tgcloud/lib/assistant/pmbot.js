// Ultroid-JS port of assistant/pmbot.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/assistant/pmbot.py
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
// # https://github.com/xditya/TeleBot/blob/master/telebot/plugins/mybot/pmbot/incoming.py
// 
// # --------------------------------------- Imports -------------------------------------------- #
// 
// import os
// 
// from telethon.errors.rpcerrorlist import UserNotParticipantError
// from telethon.tl.custom import Button
// from telethon.tl.functions.channels import GetFullChannelRequest
// from telethon.tl.functions.messages import GetFullChatRequest
// from telethon.tl.types import Channel, Chat
// from telethon.utils import get_display_name
// 
// from pyUltroid.dB.base import KeyManager
// from pyUltroid.dB.botchat_db import *
// from pyUltroid.fns.helper import inline_mention
// 
// from . import *
// 
// botb = KeyManager("BOTBLS", cast=list)
// FSUB = udB.get_key("PMBOT_FSUB")
// CACHE = {}
// # --------------------------------------- Incoming -------------------------------------------- #
// 
// 
// @asst_cmd(
//     load=AST_PLUGINS,
//     incoming=True,
//     func=lambda e: e.is_private and not botb.contains(e.sender_id),
// )
// async def on_new_mssg(event):
//     who = event.sender_id
//     # doesn't reply to that user anymore
//     if event.text.startswith("/") or who == OWNER_ID:
//         return
//     if FSUB:
//         MSG = ""
//         BTTS = []
//         for chat in FSUB:
//             try:
//                 await event.client.get_permissions(chat, event.sender_id)
//             except UserNotParticipantError:
//                 if not MSG:
//                     MSG += get_string("pmbot_1")
//                 try:
//                     uri = ""
//                     TAHC_ = await event.client.get_entity(chat)
//                     if hasattr(TAHC_, "username") and TAHC_.username:
//                         uri = f"t.me/{TAHC_.username}"
//                     elif CACHE.get(chat):
//                         uri = CACHE[chat]
//                     else:
//                         if isinstance(TAHC_, Channel):

import { api, db, fetch } from 'sdk';


export const PORTED_FROM = 'assistant/pmbot.py';
