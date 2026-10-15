// BUNDLED from: lib/assistant/callbackstuffs.js, lib/assistant/games.js, lib/assistant/initial.js, lib/assistant/inlinestuff.js, lib/assistant/localization.js, lib/assistant/pmbot.js, lib/assistant/start.js, lib/assistant/ytdl.js, lib/assistant/manager/_help.js, lib/assistant/manager/_on_adds.js, lib/assistant/manager/admins.js, lib/assistant/manager/afk.js, lib/assistant/manager/misc.js, lib/assistant/manager/stickermanager.js
// (originals in docs/original-js/)

import { api, db, fetch } from 'sdk';
{ // ===== lib/assistant/callbackstuffs.js =====
// Ultroid-JS port of assistant/callbackstuffs.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/assistant/callbackstuffs.py
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
// import ast
// import asyncio
// import re
// import sys
// import time
// from asyncio.exceptions import TimeoutError as AsyncTimeOut
// from os import execl, remove
// from random import choice
// 
// from bs4 import BeautifulSoup as bs
// 
// try:
//     from pyUltroid.fns.gDrive import GDriveManager
// except ImportError:
//     GDriveManager = None
// from telethon import Button, events
// from catbox import CatboxUploader
// from telethon.tl.types import MessageMediaWebPage
// from telethon.utils import get_peer_id
// 
// from pyUltroid.fns.helper import fast_download, progress
// from pyUltroid.fns.tools import Carbon, async_searcher, get_paste, telegraph_client
// from pyUltroid.startup.loader import Loader
// 
// from . import *
// 
// # --------------------------------------------------------------------#
// telegraph = telegraph_client()
// GDrive = GDriveManager() if GDriveManager else None
// uploader = CatboxUploader()
// # --------------------------------------------------------------------#
// 
// def text_to_url(event):
//     """function to get media url (with|without) Webpage"""
//     if isinstance(event.media, MessageMediaWebPage):
//         webpage = event.media.webpage
//         if not isinstance(webpage, types.WebPageEmpty) and webpage.type in ["photo"]:
//             return webpage.display_url
//     return event.text
// 
// 
// # --------------------------------------------------------------------#
// 
// _buttons = {
//     "otvars": {
//         "text": "Other Variables to set for @TeamUltroid:",
//         "buttons": [
//             [
//                 Button.inline("Tᴀɢ Lᴏɢɢᴇʀ", data="taglog"),
//                 Button.inline("SᴜᴘᴇʀFʙᴀɴ", data="cbs_sfban"),
//             ],
//             [
//                 Button.inline("Sudo Mode", data="sudo"),


async function text_to_url(...args) { /* ported from Python `text_to_url` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'assistant/callbackstuffs.py';
}

{ // ===== lib/assistant/games.js =====
// Ultroid-JS port of assistant/games.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/assistant/games.py
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
// """
// • `{i}akinator` | `/akinator`
//    Start akinator game from Userbot/Assistant
// 
// • `/startgame`
//    Open Portal for Games
// """
// 
// import asyncio
// import re, uuid, operator
// from random import choice, shuffle
// 
// from akipy.async_akipy import Akinator
// from telethon.errors.rpcerrorlist import BotMethodInvalidError
// from telethon.events import Raw
// from telethon.tl.types import InputMediaPoll, Poll, PollAnswer, UpdateMessagePollVote
// 
// from pyUltroid._misc._decorators import ultroid_cmd
// from logging import getLogger
// from html import unescape
// from telethon.tl.types import TextWithEntities
// from pyUltroid.fns.helper import inline_mention
// from pyUltroid.fns.tools import async_searcher
// from telethon.errors import ChatSendStickersForbiddenError
// 
// from . import *  # Ensure this import matches your project structure
// 
// games = {}
// aki_photo = "https://graph.org/file/3cc8825c029fd0cab9edc.jpg"
// 
// akipyLOGS = getLogger("akipy")
// 
// @ultroid_cmd(pattern="akinator")
// async def akina(e):
//     sta = Akinator()
//     games[e.chat_id] = {e.id: sta}
//     LOGS.info(f"Game started for chat {e.chat_id} with ID {e.id}.")
//     try:
//         m = await e.client.inline_query(asst.me.username, f"aki_{e.chat_id}_{e.id}")
//         await m[0].click(e.chat_id)
//         akipyLOGS.info(f"Clicked inline result for chat {e.chat_id}")
//     except BotMethodInvalidError as err:
//         akipyLOGS.error(f"BotMethodInvalidError: {err}")
//         await asst.send_file(
//             e.chat_id,
//             aki_photo,
//             buttons=Button.inline(get_string("aki_2"), data=f"aki_{e.chat_id}_{e.id}"),
//         )
//     except Exception as er:
//         akipyLOGS.error(f"Unexpected error: {er}")
//         return await e.eor(f"ERROR : {er}")
//     if e.out:
//         await e.delete()



const PORTED_FROM = 'assistant/games.py';
}

{ // ===== lib/assistant/initial.js =====
// Ultroid-JS port of assistant/initial.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/assistant/initial.py
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
// import re
// 
// from . import *
// 
// STRINGS = {
//     1: """🎇 **Thanks for Deploying Ultroid Userbot!**
// 
// • Here, are the Some Basic stuff from, where you can Know, about its Usage.""",
//     2: """🎉** About Ultroid**
// 
// 🧿 Ultroid is Pluggable and powerful Telethon Userbot, made in Python from Scratch. It is Aimed to Increase Security along with Addition of Other Useful Features.
// 
// ❣ Made by **@TeamUltroid**""",
//     3: """**💡• FAQs •**
// 
// -> [Username Tracker](https://t.me/UltroidUpdates/24)
// -> [Keeping Custom Addons Repo](https://t.me/UltroidUpdates/28)
// -> [Disabling Deploy message](https://t.me/UltroidUpdates/27)
// -> [Setting up TimeZone](https://t.me/UltroidUpdates/22)
// -> [About Inline PmPermit](https://t.me/UltroidUpdates/21)
// -> [About Dual Mode](https://t.me/UltroidUpdates/18)
// -> [Custom Thumbnail](https://t.me/UltroidUpdates/13)
// -> [About FullSudo](https://t.me/UltroidUpdates/11)
// -> [Setting Up PmBot](https://t.me/UltroidUpdates/2)
// -> [Also Check](https://t.me/UltroidUpdates/14)
// 
// **• To Know About Updates**
//   - Join @TeamUltroid.""",
//     4: f"""• `To Know All Available Commands`
// 
//   - `{HNDLR}help`
//   - `{HNDLR}cmds`""",
//     5: """• **For Any Other Query or Suggestion**
//   - Move to **@UltroidSupportChat**.
// 
// • Thanks for Reaching till END.""",
// }
// 
// 
// @callback(re.compile("initft_(\\d+)"))
// async def init_depl(e):
//     CURRENT = int(e.data_match.group(1))
//     if CURRENT == 5:
//         return await e.edit(
//             STRINGS[5],
//             buttons=Button.inline("<< Back", "initbk_4"),
//             link_preview=False,
//         )
// 
//     await e.edit(
//         STRINGS[CURRENT],
//         buttons=[
//             Button.inline("<<", f"initbk_{str(CURRENT - 1)}"),



const PORTED_FROM = 'assistant/initial.py';
}

{ // ===== lib/assistant/inlinestuff.js =====
// Ultroid-JS port of assistant/inlinestuff.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/assistant/inlinestuff.py
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
// import base64
// import inspect
// from datetime import datetime
// from html import unescape
// from random import choice
// from re import compile as re_compile
// 
// from bs4 import BeautifulSoup as bs
// from telethon import Button
// from telethon.tl.alltlobjects import LAYER, tlobjects
// from telethon.tl.types import DocumentAttributeAudio as Audio
// from telethon.tl.types import InputWebDocument as wb
// 
// from pyUltroid.fns.misc import google_search
// from pyUltroid.fns.tools import (
//     _webupload_cache,
//     async_searcher,
//     get_ofox,
//     saavn_search,
//     webuploader,
// )
// 
// from . import *
// from . import _ult_cache
// 
// SUP_BUTTONS = [
//     [
//         Button.url("• Repo •", url="https://github.com/TeamUltroid/Ultroid"),
//         Button.url("• Support •", url="t.me/UltroidSupportChat"),
//     ],
// ]
// 
// ofox = "https://graph.org/file/231f0049fcd722824f13b.jpg"
// gugirl = "https://graph.org/file/0df54ae4541abca96aa11.jpg"
// ultpic = "https://graph.org/file/4136aa1650bc9d4109cc5.jpg"
// 
// apis = [
//     "QUl6YVN5QXlEQnNZM1dSdEI1WVBDNmFCX3c4SkF5NlpkWE5jNkZV",
//     "QUl6YVN5QkYwenhMbFlsUE1wOXh3TVFxVktDUVJxOERnZHJMWHNn",
//     "QUl6YVN5RGRPS253blB3VklRX2xiSDVzWUU0Rm9YakFLSVFWMERR",
// ]
// 
// 
// @in_pattern("ofox", owner=True)
// async def _(e):
//     try:
//         match = e.text.split(" ", maxsplit=1)[1]
//     except IndexError:
//         kkkk = e.builder.article(
//             title="Enter Device Codename",
//             thumb=wb(ofox, 0, "image/jpeg", []),
//             text="**OFᴏx🦊Rᴇᴄᴏᴠᴇʀʏ**\n\nYou didn't search anything",
//             buttons=Button.switch_inline("Sᴇᴀʀᴄʜ Aɢᴀɪɴ", query="ofox ", same_peer=True),



const PORTED_FROM = 'assistant/inlinestuff.py';
}

{ // ===== lib/assistant/localization.js =====
// Ultroid-JS port of assistant/localization.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/assistant/localization.py
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
// import re
// 
// from . import (
//     Button,
//     ULTConfig,
//     callback,
//     get_back_button,
//     get_languages,
//     get_string,
//     udB,
// )
// 
// 
// @callback("lang", owner=True)
// async def setlang(event):
//     languages = get_languages()
//     tultd = [
//         Button.inline(
//             f"{languages[ult]['natively']} [{ult.lower()}]",
//             data=f"set_{ult}",
//         )
//         for ult in languages
//     ]
//     buttons = list(zip(tultd[::2], tultd[1::2]))
//     if len(tultd) % 2 == 1:
//         buttons.append((tultd[-1],))
//     buttons.append([Button.inline("« Back", data="mainmenu")])
//     await event.edit(get_string("ast_4"), buttons=buttons)
// 
// 
// @callback(re.compile(b"set_(.*)"), owner=True)
// async def settt(event):
//     lang = event.data_match.group(1).decode("UTF-8")
//     languages = get_languages()
//     ULTConfig.lang = lang
//     udB.del_key("language") if lang == "en" else udB.set_key("language", lang)
//     await event.edit(
//         f"Your language has been set to {languages[lang]['natively']} [{lang}].",
//         buttons=get_back_button("lang"),
//     )



const PORTED_FROM = 'assistant/localization.py';
}

{ // ===== lib/assistant/pmbot.js =====
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



const PORTED_FROM = 'assistant/pmbot.py';
}

{ // ===== lib/assistant/start.js =====
// Ultroid-JS port of assistant/start.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/assistant/start.py
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
// from datetime import datetime
// 
// try:
//     from pytz import timezone as tz
// except ImportError:
//     tz = None
// from telethon import Button, events
// from telethon.errors.rpcerrorlist import MessageDeleteForbiddenError
// from telethon.utils import get_display_name
// 
// from pyUltroid._misc import SUDO_M, owner_and_sudos
// from pyUltroid.dB.base import KeyManager
// from pyUltroid.fns.helper import inline_mention
// from strings import get_string
// 
// from . import *
// 
// Owner_info_msg = udB.get_key("BOT_INFO_START")
// custom_info = True
// if Owner_info_msg is None:
//     custom_info = False
//     Owner_info_msg = f"""
// **Owner** - {OWNER_NAME}
// **OwnerID** - `{OWNER_ID}`
// 
// **Message Forwards** - {udB.get_key("PMBOT")}
// 
// **Ultroid [v{ultroid_version}](https://github.com/TeamUltroid/Ultroid), powered by @TeamUltroid**
// """
// 
// 
// _settings = [
//     [
//         Button.inline("API Keys", data="cbs_apiset"),
//         Button.inline("PM Bot", data="cbs_chatbot"),
//     ],
//     [
//         Button.inline("Alive", data="cbs_alvcstm"),
//         Button.inline("PMPermit", data="cbs_ppmset"),
//     ],
//     [
//         Button.inline("Features", data="cbs_otvars"),
//         Button.inline("VC Song Bot", data="cbs_vcb"),
//     ],
//     [Button.inline("« Back", data="mainmenu")],
// ]
// 
// _start = [
//     [
//         Button.inline("Language 🌐", data="lang"),
//         Button.inline("Settings ⚙️", data="setter"),
//     ],
//     [



const PORTED_FROM = 'assistant/start.py';
}

{ // ===== lib/assistant/ytdl.js =====
// Ultroid-JS port of assistant/ytdl.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/assistant/ytdl.py
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
// 
// import os
// import re
// 
// try:
//     from PIL import Image
// except ImportError:
//     Image = None
// from telethon import Button
// from telethon.errors.rpcerrorlist import FilePartLengthInvalidError, MediaEmptyError
// from telethon.tl.types import DocumentAttributeAudio, DocumentAttributeVideo
// from telethon.tl.types import InputWebDocument as wb
// 
// from pyUltroid.fns.helper import (
//     bash,
//     fast_download,
//     humanbytes,
//     numerize,
//     time_formatter,
// )
// from pyUltroid.fns.ytdl import dler, get_buttons, get_formats
// 
// from . import LOGS, asst, callback, in_pattern, udB
// 
// try:
//     from youtubesearchpython import VideosSearch
// except ImportError:
//     LOGS.info("'youtubesearchpython' not installed!")
//     VideosSearch = None
// 
// 
// ytt = "https://graph.org/file/afd04510c13914a06dd03.jpg"
// _yt_base_url = "https://www.youtube.com/watch?v="
// BACK_BUTTON = {}
// 
// 
// @in_pattern("yt", owner=True)
// async def _(event):
//     try:
//         string = event.text.split(" ", maxsplit=1)[1]
//     except IndexError:
//         fuk = event.builder.article(
//             title="Search Something",
//             thumb=wb(ytt, 0, "image/jpeg", []),
//             text="**YᴏᴜTᴜʙᴇ Sᴇᴀʀᴄʜ**\n\nYou didn't search anything",
//             buttons=Button.switch_inline(
//                 "Sᴇᴀʀᴄʜ Aɢᴀɪɴ",
//                 query="yt ",
//                 same_peer=True,
//             ),
//         )
//         await event.answer([fuk])
//         return



const PORTED_FROM = 'assistant/ytdl.py';
}

{ // ===== lib/assistant/manager/_help.js =====
// Ultroid-JS port of assistant/manager/_help.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/assistant/manager/_help.py
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
// from . import *
// 
// START = """
// 🪅 **Help Menu** 🪅
// 
// ✘  /start : Check I am Alive or not.
// ✘  /help : Get This Message.
// ✘  /repo : Get Bot's Repo..
// 
// 🧑‍💻 Join **@TeamUltroid**
// """
// 
// ADMINTOOLS = """✘ **AdminTools** ✘
// 
// • /pin : Pins the Replied Message
// • /pinned : Get Pinned message in chat.
// • /unpin : Unpin the Replied message
// • /unpin all : Unpin all Pinned Messages.
// 
// • /ban (username/id/reply) : Ban the User
// • /unban (username/id/reply) : UnBan the User.
// 
// • /mute (username/id/reply) : Mute the User.
// • /unmute (username/id/reply) : Unmute the User.
// 
// • /tban (username/id/reply) (time) : Temporary ban a user
// • /tmute (username/id/reply) (time) : temporary Mutes a User.
// 
// • /purge (purge messages)
// 
// • /setgpic (reply photo) : keep Chat Photo of Group.
// • /delgpic : remove current chat Photo."""
// 
// UTILITIES = """
// ✘ ** Utilities ** ✘
// 
// • /info (reply/username/id) : get detailed info of user.
// • /id : get chat/user id.
// • /tr : Translate Languages..
// • /q : Create Quotes.
// 
// • /paste (reply file/text) : paste content on Spaceb.in
// • /meaning (text) : Get Meaning of that Word.
// • /google (query) : Search Something on Google..
// 
// • /suggest (query/reply) : Creates a Yes / No Poll.
// """
// 
// LOCKS = """
// ✘ ** Locks ** ✘
// 
// • /lock (query) : lock particular content in chat.
// • /unlock (query) : Unlock some content.


async function get_buttons(...args) { /* ported from Python `get_buttons` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'assistant/manager/_help.py';
}

{ // ===== lib/assistant/manager/_on_adds.js =====
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



const PORTED_FROM = 'assistant/manager/_on_adds.py';
}

{ // ===== lib/assistant/manager/admins.js =====
// Ultroid-JS port of assistant/manager/admins.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/assistant/manager/admins.py
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
// import re
// 
// from telethon.errors.rpcerrorlist import UserNotParticipantError
// 
// from pyUltroid import _ult_cache
// 
// from . import *
// 
// 
// @ultroid_cmd(pattern="d(kick|ban)", manager=True, require="ban_users")
// async def dowj(e):
//     replied = await e.get_reply_message()
//     if replied:
//         user = replied.sender_id
//     else:
//         return await e.eor("Reply to a message...")
//     try:
//         await replied.delete()
//         if e.pattern_match.group(1).strip() == "kick":
//             await e.client.kick_participant(e.chat_id, user)
//             te = "Kicked"
//         else:
//             await e.client.edit_permissions(e.chat_id, user, view_messages=False)
//             te = "Banned"
//         await e.eor(f"{te} Successfully!")
//     except Exception as E:
//         await e.eor(str(E))
// 
// 
// @callback(re.compile("cc_(.*)"), func=_ult_cache.get("admin_callback"))
// async def callback_(event):
//     data = event.data_match.group(1).decode("utf-8")
//     if data not in _ult_cache.get("admin_callback", {}):
//         return
//     try:
//         perm = await event.client.get_permissions(event.chat_id, event.sender_id)
//     except UserNotParticipantError:
//         return await event.answer("Join the Group First!", alert=True)
//     if not perm.is_admin:
//         return await event.answer("You are not an Admin!", alert=True)
//     _ult_cache["admin_callback"].update({data: (event.sender, perm)})
//     await event.answer("Verification Done!")
//     await event.delete()



const PORTED_FROM = 'assistant/manager/admins.py';
}

{ // ===== lib/assistant/manager/afk.js =====
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



const PORTED_FROM = 'assistant/manager/afk.py';
}

{ // ===== lib/assistant/manager/misc.js =====
// Ultroid-JS port of assistant/manager/misc.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/assistant/manager/misc.py
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
// 
// import random
// 
// import aiohttp
// 
// from pyUltroid.dB import DEVLIST
// from pyUltroid.fns.admins import admin_check
// 
// from . import *
// 
// 
// @asst_cmd(pattern="decide")
// async def dheh(e):
//     text = ["Yes", "NoU", "Maybe", "IDK"]
//     text = random.choice(text)
//     ri = e.reply_to_msg_id or e.id
//     await e.client.send_message(e.chat_id, text, reply_to=ri)
// 
// 
// @asst_cmd(pattern="echo( (.*)|$)")
// async def oqha(e):
//     if not await admin_check(e):
//         return
//     if match := e.pattern_match.group(1).strip():
//         text = match
//         reply_to = e
//     elif e.is_reply:
//         text = (await e.get_reply_message()).text
//         reply_to = e.reply_to_msg_id
//     else:
//         return await e.eor("What to Echo?", time=5)
//     try:
//         await e.delete()
//     except BaseException as ex:
//         LOGS.error(ex)
//     await e.client.send_message(e.chat_id, text, reply_to=reply_to)
// 
// 
// @asst_cmd(pattern="kickme$")
// async def doit(e):
//     if e.sender_id in DEVLIST:
//         return await eod(e, "`I will Not Kick You, my Developer..`")
//     try:
//         await e.client.kick_participant(e.chat_id, e.sender_id)
//     except Exception as Fe:
//         return await e.eor(str(Fe), time=5)
//     await e.eor("Yes, You are right, get out.", time=5)
// 
// 
// @asst_cmd(pattern="joke$")
// async def do_joke(e):
//     e = await e.get_reply_message() if e.is_reply else e
//     link = "https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=single"



const PORTED_FROM = 'assistant/manager/misc.py';
}

{ // ===== lib/assistant/manager/stickermanager.js =====
// Ultroid-JS port of assistant/manager/stickermanager.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/assistant/manager/stickermanager.py
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
// import random
// 
// from telethon import errors
// from telethon.errors.rpcerrorlist import StickersetInvalidError
// from telethon.tl.functions.messages import GetStickerSetRequest as GetSticker
// from telethon.tl.functions.messages import UploadMediaRequest
// from telethon.tl.functions.stickers import AddStickerToSetRequest as AddSticker
// from telethon.tl.functions.stickers import CreateStickerSetRequest
// from telethon.tl.types import InputPeerSelf
// from telethon.tl.types import InputStickerSetItem as SetItem
// from telethon.tl.types import InputStickerSetShortName, User
// from telethon.utils import get_display_name, get_input_document
// 
// from pyUltroid.fns.misc import Quotly
// from pyUltroid.fns.tools import TgConverter
// 
// from . import LOGS, asst, asst_cmd, udB
// 
// 
// @asst_cmd(
//     pattern="kang",
// )
// async def kang_cmd(ult):
//     sender = await ult.get_sender()
//     if not isinstance(sender, User):
//         return
//     if not ult.is_reply:
//         return await ult.eor("`Reply to a sticker/photo..`", time=5)
//     reply = await ult.get_reply_message()
//     if sender.username:
//         pre = sender.username[:4]
//     else:
//         pre = random.random_string(length=3)
//     animated, dl, video = None, None, None
//     try:
//         emoji = ult.text.split(maxsplit=1)[1]
//     except IndexError:
//         emoji = None
//     if reply.sticker:
//         file = get_input_document(reply.sticker)
//         emoji = emoji or reply.file.emoji
//         name = reply.file.name
//         if name.endswith(".tgs"):
//             animated = True
//             dl = await reply.download_media()
//         elif name.endswith(".webm"):
//             video = True
//             dl = await reply.download_media()
//     elif reply.photo:
//         dl = await reply.download_media()
//         name = "sticker.webp"
//         image = TgConverter.resize_photo_sticker(dl)
//         image.save(name, "WEBP")



const PORTED_FROM = 'assistant/manager/stickermanager.py';
}
