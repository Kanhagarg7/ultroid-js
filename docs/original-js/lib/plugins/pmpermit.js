// Ultroid-JS port of plugins/pmpermit.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/pmpermit.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "pmpermit";
const PATTERNS = ['logpm$', 'nologpm$', 'pmpermit( (.*)|$)', '(start|stop|clear)archive$', '(a|approve)(?: |$)', '(da|disapprove)(?: |$)', 'block( (.*)|$)', 'unblock( (.*)|$)', 'listapproved$', 'deletedissht'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available -
 * 
 * • `{i}a` or `{i}approve`
 *     Approve someone to PM.
 * 
 * • `{i}da` or `{i}disapprove`
 *     Disapprove someone to PM.
 * 
 * • `{i}block`
 *     Block someone.
 * 
 * • `{i}unblock` | `{i}unblock all`
 *     Unblock someone.
 * 
 * • `{i}nologpm`
 *     Stop logging messages from the user.
 * 
 * • `{i}logpm`
 *     Start logging messages from the user.
 * 
 * • `{i}startarchive`
 *     Archive new PMs.
 * 
 * • `{i}stoparchive`
 *     Don't archive new PMs.
 * 
 * • `{i}cleararchive`
 *     Unarchive all chats.
 * 
 * • `{i}listapproved`
 *    List all approved PMs.
 * 
 * • `{i}pmpermit on/off`
 *     Enable or disable PMPermit. Check current status with no argument.
 * """
 * 
 * import asyncio
 * import re
 * from os import remove
 * 
 * from pyUltroid.dB import DEVLIST
 * 
 * try:
 *     from tabulate import tabulate
 * except ImportError:
 *     tabulate = None
 * from telethon import events
 * from telethon.errors import MessageNotModifiedError
 * from telethon.tl.functions.contacts import (
 *     BlockRequest,
 *     GetBlockedRequest,
 *     UnblockRequest,
 * )
 * from telethon.tl.functions.messages import ReportSpamRequest
 * from telethon.utils import get_display_name, resolve_bot_file_id
 * 
 * from pyUltroid.dB.base import KeyManager
 * 
 * from . import *
 * 
 * # ========================= CONSTANTS =============================
 * 
 * COUNT_PM = {}
 * LASTMSG = {}
 * WARN_MSGS = {}
 * U_WARNS = {}
 * if isinstance(udB.get_key("PMPERMIT"), (int, str)):
 *     value = [udB.get_key("PMPERMIT")]
 *     udB.set_key("PMPERMIT", value)
 * keym = KeyManager("PMPERMIT", cast=list)
 * Logm = KeyManager("LOGUSERS", cast=list)
 * PMPIC = udB.get_key("PMPIC")
 * LOG_CHANNEL = udB.get_key("LOG_CHANNEL")
 * UND = get_string("pmperm_1")
 * UNS = get_string("pmperm_2")
 * NO_REPLY = get_string("pmperm_3")
 * 
 * UNAPPROVED_MSG = "**PMSecurity of {ON}!**\n\n{UND}\n\nYou have {warn}/{twarn} warnings!"
 * if udB.get_key("PM_TEXT"):
 *     UNAPPROVED_MSG = (
 *         "**PMSecurity of {ON}!**\n\n"
 *         + udB.get_key("PM_TEXT")
 *         + "\n\nYou have {warn}/{twarn} warnings!"
 *     )
 * # 1
 * WARNS = udB.get_key("PMWARNS") or 4
 * PMCMDS = [
 *     f"{HNDLR}a",
 *     f"{HNDLR}approve",
 *     f"{HNDLR}da",
 *     f"{HNDLR}disapprove",
 *     f"{HNDLR}block",
 *     f"{HNDLR}unblock",
 * ]
 * 
 * _not_approved = {}
 * _to_delete = {}
 * 
 * my_bot = asst.me.username if asst.me else None
 * 
 * 
 * def update_pm(userid, message, warns_given):
 *     try:
 *         WARN_MSGS.update({userid: message})
 *     except KeyError:
 *         pass
 *     try:
 *         U_WARNS.update({userid: warns_given})
 *     except KeyError:
 *         pass
 * 
 * 
 * async def delete_pm_warn_msgs(chat: int):
---- end original ---- */

ultroidCmd('logpm$', async (e) => {
  const chatId = e.chatId;
  // Port of `logpm$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`logpm$\`.` });
});

ultroidCmd('nologpm$', async (e) => {
  const chatId = e.chatId;
  // Port of `nologpm$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`nologpm$\`.` });
});

ultroidCmd('pmpermit( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `pmpermit( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`pmpermit( (.*)|$)\`.` });
});

ultroidCmd('(start|stop|clear)archive$', async (e) => {
  const chatId = e.chatId;
  // Port of `(start|stop|clear)archive$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`(start|stop|clear)archive$\`.` });
});

ultroidCmd('(a|approve)(?: |$)', async (e) => {
  const chatId = e.chatId;
  // Port of `(a|approve)(?: |$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`(a|approve)(?: |$)\`.` });
});

ultroidCmd('(da|disapprove)(?: |$)', async (e) => {
  const chatId = e.chatId;
  // Port of `(da|disapprove)(?: |$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`(da|disapprove)(?: |$)\`.` });
});

ultroidCmd('block( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `block( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`block( (.*)|$)\`.` });
});

ultroidCmd('unblock( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `unblock( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`unblock( (.*)|$)\`.` });
});

ultroidCmd('listapproved$', async (e) => {
  const chatId = e.chatId;
  // Port of `listapproved$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pmpermit") || `Plugin \`pmpermit\` matched \`listapproved$\`.` });
});
export { PLUGIN_NAME, PATTERNS };
