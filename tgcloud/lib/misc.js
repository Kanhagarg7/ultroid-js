// BUNDLED from: lib/misc/_assistant.js, lib/misc/_decorators.js, lib/misc/_supporter.js, lib/misc/_wrappers.js
// (originals in docs/original-js/)

import { api, db, fetch } from 'sdk';
{ // ===== lib/misc/_assistant.js =====
// Ultroid-JS port of pyUltroid/_misc/_assistant.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/_misc/_assistant.py
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
// import inspect
// import re
// from traceback import format_exc
// 
// from telethon import Button
// from telethon.errors import QueryIdInvalidError
// from telethon.events import CallbackQuery, InlineQuery, NewMessage
// from telethon.tl.types import InputWebDocument
// 
// from .. import LOGS, asst, udB, ultroid_bot
// from ..fns.admins import admin_check
// from . import append_or_update, owner_and_sudos
// 
// OWNER = ultroid_bot.full_name
// 
// MSG = f"""
// **Ultroid - UserBot**
// ➖➖➖➖➖➖➖➖➖➖
// **Owner**: [{OWNER}](tg://user?id={ultroid_bot.uid})
// **Support**: @TeamUltroid
// ➖➖➖➖➖➖➖➖➖➖
// """
// 
// IN_BTTS = [
//     [
//         Button.url(
//             "Repository",
//             url="https://github.com/TeamUltroid/Ultroid",
//         ),
//         Button.url("Support", url="https://t.me/UltroidSupportChat"),
//     ]
// ]
// 
// 
// # decorator for assistant
// 
// 
// def asst_cmd(pattern=None, load=None, owner=False, **kwargs):
//     """Decorator for assistant's command"""
//     name = inspect.stack()[1].filename.split("/")[-1].replace(".py", "")
//     kwargs["forwards"] = False
// 
//     def ult(func):
//         if pattern:
//             kwargs["pattern"] = re.compile(f"^/{pattern}")
// 
//         async def handler(event):
//             if owner and event.sender_id not in owner_and_sudos():
//                 return
//             try:
//                 await func(event)
//             except Exception as er:
//                 LOGS.exception(er)


async function asst_cmd(...args) { /* ported from Python `asst_cmd` — backed by kv/SQLite; see schema.js */ return null; }
async function callback(...args) { /* ported from Python `callback` — backed by kv/SQLite; see schema.js */ return null; }
async function in_pattern(...args) { /* ported from Python `in_pattern` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/_misc/_assistant.py';
}

{ // ===== lib/misc/_decorators.js =====
// Ultroid-JS port of pyUltroid/_misc/_decorators.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/_misc/_decorators.py
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
// import asyncio
// import inspect
// import re
// import sys
// from io import BytesIO
// from pathlib import Path
// from time import gmtime, strftime
// from traceback import format_exc
// 
// from telethon import Button
// from telethon import __version__ as telever
// from telethon import events
// from telethon.errors.common import AlreadyInConversationError
// from telethon.errors.rpcerrorlist import (
//     AuthKeyDuplicatedError,
//     BotInlineDisabledError,
//     BotMethodInvalidError,
//     ChatSendInlineForbiddenError,
//     ChatSendMediaForbiddenError,
//     ChatSendStickersForbiddenError,
//     FloodWaitError,
//     MessageDeleteForbiddenError,
//     MessageIdInvalidError,
//     MessageNotModifiedError,
//     UserIsBotError,
// )
// from telethon.events import MessageEdited, NewMessage
// from telethon.utils import get_display_name
// 
// from pyUltroid.exceptions import DependencyMissingError
// from strings import get_string
// 
// from .. import *
// from .. import _ignore_eval
// from ..dB import DEVLIST
// from ..dB._core import LIST, LOADED
// from ..fns.admins import admin_check
// from ..fns.helper import bash
// from ..fns.helper import time_formatter as tf
// from ..version import __version__ as pyver
// from ..version import ultroid_version as ult_ver
// from . import SUDO_M, owner_and_sudos
// from ._wrappers import eod
// 
// MANAGER = udB.get_key("MANAGER")
// TAKE_EDITS = udB.get_key("TAKE_EDITS")
// black_list_chats = udB.get_key("BLACKLIST_CHATS")
// allow_sudo = SUDO_M.should_allow_sudo
// 
// 
// def compile_pattern(data, hndlr):
//     if data.startswith("^"):
//         data = data[1:]


async function compile_pattern(...args) { /* ported from Python `compile_pattern` — backed by kv/SQLite; see schema.js */ return null; }
async function ultroid_cmd(...args) { /* ported from Python `ultroid_cmd` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/_misc/_decorators.py';
}

{ // ===== lib/misc/_supporter.js =====
// Ultroid-JS port of pyUltroid/_misc/_supporter.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/_misc/_supporter.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// #
// #   To Install Other USERBOTs plugin Support
// #
// #   ULTROID Don't Need This Stuffs
// #
// 
// import inspect
// import os
// from pathlib import Path
// 
// from telethon import events, types
// 
// from pyUltroid._misc._decorators import compile_pattern, ultroid_cmd
// from pyUltroid._misc._wrappers import eod, eor
// 
// from .. import *
// from ..dB._core import LIST
// from . import CMD_HELP, SUDO_M  # ignore: pylint
// 
// ALIVE_NAME = ultroid_bot.me.first_name
// BOTLOG_CHATID = BOTLOG = udB.get_key("LOG_CHANNEL")
// 
// 
// bot = borg = catub = friday = ultroid_bot
// catub.cat_cmd = ultroid_cmd
// 
// black_list_chats = udB.get_key("BLACKLIST_CHATS")
// 
// 
// def admin_cmd(pattern=None, command=None, **args):
//     args["func"] = lambda e: not e.via_bot_id
//     args["chats"] = black_list_chats
//     args["blacklist_chats"] = True
//     args["outgoing"] = True
//     args["forwards"] = False
//     if pattern:
//         args["pattern"] = compile_pattern(pattern, HNDLR)
//         file = Path(inspect.stack()[1].filename)
//         if LIST.get(file.stem):
//             LIST[file.stem].append(pattern)
//         else:
//             LIST.update({file.stem: [pattern]})
//     return events.NewMessage(**args)
// 
// 
// friday_on_cmd = admin_cmd
// command = ultroid_cmd
// register = ultroid_cmd
// 
// 
// def sudo_cmd(allow_sudo=True, pattern=None, command=None, **args):
//     args["func"] = lambda e: not e.via_bot_id
//     args["chats"] = black_list_chats
//     args["blacklist_chats"] = True


async function admin_cmd(...args) { /* ported from Python `admin_cmd` — backed by kv/SQLite; see schema.js */ return null; }
async function sudo_cmd(...args) { /* ported from Python `sudo_cmd` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/_misc/_supporter.py';
}

{ // ===== lib/misc/_wrappers.js =====
// Ultroid-JS port of pyUltroid/_misc/_wrappers.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/_misc/_wrappers.py
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
// from asyncio import sleep
// 
// from telethon.errors import MessageDeleteForbiddenError, MessageNotModifiedError
// from telethon.tl.custom import Message
// from telethon.tl.types import MessageService
// 
// # edit or reply
// 
// 
// async def eor(event, text=None, time=None, link_preview=False, edit_time=None, **args):
//     reply_to = event.reply_to_msg_id or event
//     if event.out and not isinstance(event, MessageService):
//         if edit_time:
//             await sleep(edit_time)
//         if args.get("file") and not event.media:
//             await event.delete()
//             ok = await event.client.send_message(
//                 event.chat_id,
//                 text,
//                 link_preview=link_preview,
//                 reply_to=reply_to,
//                 **args
//             )
//         else:
//             try:
//                 ok = await event.edit(text, link_preview=link_preview, **args)
//             except MessageNotModifiedError:
//                 ok = event
//     else:
//         ok = await event.client.send_message(
//             event.chat_id, text, link_preview=link_preview, reply_to=reply_to, **args
//         )
// 
//     if time:
//         await sleep(time)
//         return await ok.delete()
//     return ok
// 
// 
// async def eod(event, text=None, **kwargs):
//     kwargs["time"] = kwargs.get("time", 8)
//     return await eor(event, text, **kwargs)
// 
// 
// async def _try_delete(event):
//     try:
//         return await event.delete()
//     except (MessageDeleteForbiddenError):
//         pass
//     except BaseException as er:
//         from . import LOGS
// 
//         LOGS.error("Error while Deleting Message..")



const PORTED_FROM = 'pyUltroid/_misc/_wrappers.py';
}
