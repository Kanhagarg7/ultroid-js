// Ultroid-JS port of plugins/_inline.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/_inline.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "_inline";
const PATTERNS = ['ownr', 'ultd', 'pasta', 'stf(.*)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * import re
 * import time
 * from datetime import datetime
 * from os import remove
 * 
 * from git import Repo
 * from telethon import Button
 * from telethon.tl.types import InputWebDocument, Message
 * from telethon.utils import resolve_bot_file_id
 * 
 * from pyUltroid._misc._assistant import callback, in_pattern
 * from pyUltroid.dB._core import HELP, LIST
 * from pyUltroid.fns.helper import gen_chlog, time_formatter, updater
 * from pyUltroid.fns.misc import split_list
 * 
 * from . import (
 *     HNDLR,
 *     LOGS,
 *     OWNER_NAME,
 *     InlinePlugin,
 *     asst,
 *     get_string,
 *     inline_pic,
 *     split_list,
 *     start_time,
 *     udB,
 * )
 * from ._help import _main_help_menu
 * 
 * # ================================================#
 * 
 * helps = get_string("inline_1")
 * 
 * add_ons = udB.get_key("ADDONS")
 * 
 * zhelps = get_string("inline_3") if add_ons is False else get_string("inline_2")
 * PLUGINS = HELP.get("Official", [])
 * ADDONS = HELP.get("Addons", [])
 * upage = 0
 * # ============================================#
 * 
 * # --------------------BUTTONS--------------------#
 * 
 * SUP_BUTTONS = [
 *     [
 *         Button.url("• Repo •", url="https://github.com/TeamUltroid/Ultroid"),
 *         Button.url("• Support •", url="t.me/UltroidSupportChat"),
 *     ],
 * ]
 * 
 * # --------------------BUTTONS--------------------#
 * 
 * 
 * @in_pattern(owner=True, func=lambda x: not x.text)
 * async def inline_alive(o):
 *     TLINK = inline_pic() or "https://graph.org/file/74d6259983e0642923fdb.jpg"
 *     MSG = "• **Ultroid Userbot •**"
 *     WEB0 = InputWebDocument(
 *         "https://graph.org/file/acd4f5d61369f74c5e7a7.jpg", 0, "image/jpg", []
 *     )
 *     RES = [
 *         await o.builder.article(
 *             type="photo",
 *             text=MSG,
 *             include_media=True,
 *             buttons=SUP_BUTTONS,
 *             title="Ultroid Userbot",
 *             description="Userbot | Telethon",
 *             url=TLINK,
 *             thumb=WEB0,
 *             content=InputWebDocument(TLINK, 0, "image/jpg", []),
 *         )
 *     ]
 *     await o.answer(
 *         RES,
 *         private=True,
 *         cache_time=300,
 *         switch_pm="👥 ULTROID PORTAL",
 *         switch_pm_param="start",
 *     )
 * 
 * 
 * @in_pattern("ultd", owner=True)
 * async def inline_handler(event):
 *     z = []
 *     for x in LIST.values():
 *         z.extend(x)
 *     text = get_string("inline_4").format(
 *         OWNER_NAME,
 *         len(HELP.get("Official", [])),
 *         len(HELP.get("Addons", [])),
 *         len(z),
 *     )
 *     if inline_pic():
 *         result = await event.builder.photo(
 *             file=inline_pic(),
 *             link_preview=False,
 *             text=text,
 *             buttons=_main_help_menu,
 *         )
 *     else:
 *         result = await event.builder.article(
 *             title="Ultroid Help Menu", text=text, buttons=_main_help_menu
 *         )
 *     await event.answer([result], private=True, cache_time=300, gallery=True)
 * 
 * 
 * @in_pattern("pasta", owner=True)
 * async def _(event):
 *     ok = event.text.split("-")[1]
 *     if not ok.startswith("http"):
 *         link = f"https://spaceb.in/{ok}"
 *         raw = f"https://spaceb.in/api/v1/documents/{ok}/raw"
---- end original ---- */

// No @ultroid_cmd pattern found in original; passive/service plugin.
// Its background logic is wired via _monitors.js where applicable.
export { PLUGIN_NAME, PATTERNS };
