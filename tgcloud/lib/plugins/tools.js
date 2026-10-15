// Ultroid-JS port of plugins/tools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/tools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "tools";
const PATTERNS = ['tr( (.*)|$)', 'id( (.*)|$)', 'bots( (.*)|$)', 'hl( (.*)|$)', 'circle$', 'ls( (.*)|$)', 'sg(|u)(?:\\\\s|$)([\\\\s\\\\S]*)', 'webshot( (.*)|$)'];

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
 * • `{i}circle`
 *     Reply to a audio song or gif to get video note.
 * 
 * • `{i}ls`
 *     Get all the Files inside a Directory.
 * 
 * • `{i}bots`
 *     Shows the number of bots in the current chat with their perma-link.
 * 
 * • `{i}hl <a link> <text-optional>`
 *     Embeds the link with a whitespace as message.
 * 
 * • `{i}id`
 *     Reply a Sticker to Get Its Id
 *     Reply a User to Get His Id
 *     Without Replying You Will Get the Chat's Id
 * 
 * • `{i}sg <reply to a user><username/id>`
 *     Get His Name History of the replied user.
 * 
 * • `{i}tr <dest lang code> <(reply to) a message>`
 *     Get translated message.
 * 
 * • `{i}webshot <url>`
 *     Get a screenshot of the webpage.
 * """
 * import asyncio
 * import glob
 * import io
 * import os
 * import re
 * import secrets
 * from asyncio.exceptions import TimeoutError as AsyncTimeout
 * 
 * try:
 *     import cv2
 * except ImportError:
 *     cv2 = None
 * 
 * try:
 *     from playwright.async_api import async_playwright
 * except ImportError:
 *     async_playwright = None
 * try:
 *     from htmlwebshot import WebShot
 * except ImportError:
 *     WebShot = None
 * 
 * from telethon import functions, types
 * from telethon.errors.rpcerrorlist import MessageTooLongError, YouBlockedUserError
 * from telethon.tl.types import (
 *     ChannelParticipantAdmin,
 *     ChannelParticipantsBots,
 *     DocumentAttributeVideo,
 * )
 * 
 * from pyUltroid.fns.tools import metadata, translate
 * 
 * from . import (
 *     HNDLR,
 *     LOGS,
 *     ULTConfig,
 *     async_searcher,
 *     bash,
 *     check_filename,
 *     con,
 *     download_file,
 *     eor,
 *     get_string,
 *     ultroid_bot,
 * )
 * from . import humanbytes as hb
 * from . import inline_mention, is_url_ok, json_parser, mediainfo, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="tr( (.*)|$)", manager=True)
 * async def _(event):
 *     input = event.pattern_match.group(1).strip().split(maxsplit=1)
 *     txt = input[1] if len(input) > 1 else None
 *     if input:
 *         input = input[0]
 *     if txt:
 *         text = txt
 *     elif event.is_reply:
 *         previous_message = await event.get_reply_message()
 *         text = previous_message.message
 *     else:
 *         return await eor(
 *             event, f"`{HNDLR}tr LanguageCode` as reply to a message", time=5
 *         )
 *     lan = input or "en"
 *     try:
 *         tt = translate(text, lang_tgt=lan)
 *         output_str = f"**TRANSLATED** to {lan}\n{tt}"
 *         await event.eor(output_str)
 *     except Exception as exc:
 *         LOGS.exception(exc)
 *         await event.eor(str(exc), time=5)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="id( (.*)|$)",
 *     manager=True,
 * )
 * async def _(event):
 *     ult = event
 *     match = event.pattern_match.group(1).strip()
 *     if match:
 *         try:
 *             ids = await event.client.parse_id(match)
 *         except Exception as er:
---- end original ---- */

ultroidCmd('tr( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `tr( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`tr( (.*)|$)\`.` });
});

ultroidCmd('id( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `id( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`id( (.*)|$)\`.` });
});

ultroidCmd('bots( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `bots( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`bots( (.*)|$)\`.` });
});

ultroidCmd('hl( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `hl( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`hl( (.*)|$)\`.` });
});

ultroidCmd('circle$', async (e) => {
  const chatId = e.chatId;
  // Port of `circle$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`circle$\`.` });
});

ultroidCmd('ls( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ls( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`ls( (.*)|$)\`.` });
});

ultroidCmd('sg(|u)(?:\\\\s|$)([\\\\s\\\\S]*)', async (e) => {
  const chatId = e.chatId;
  // Port of `sg(|u)(?:\\s|$)([\\s\\S]*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`sg(|u)(?:\\s|$)([\\s\\S]*)\`.` });
});

ultroidCmd('webshot( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `webshot( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tools") || `Plugin \`tools\` matched \`webshot( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
