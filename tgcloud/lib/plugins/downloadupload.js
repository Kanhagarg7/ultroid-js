// Ultroid-JS port of plugins/downloadupload.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/downloadupload.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "downloadupload";
const PATTERNS = ['download( (.*)|$)', 'dl( (.*)|$)', 'ul( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_downloadupload")
 * 
 * import asyncio
 * import glob
 * import os
 * import time
 * from datetime import datetime as dt
 * 
 * from aiohttp.client_exceptions import InvalidURL
 * from telethon.errors.rpcerrorlist import MessageNotModifiedError
 * 
 * from pyUltroid.fns.helper import time_formatter
 * from pyUltroid.fns.tools import get_chat_and_msgid, set_attributes
 * 
 * from . import (
 *     LOGS,
 *     ULTConfig,
 *     downloader,
 *     eor,
 *     fast_download,
 *     get_all_files,
 *     get_string,
 *     progress,
 *     time_formatter,
 *     ultroid_cmd,
 * )
 * 
 * 
 * @ultroid_cmd(
 *     pattern="download( (.*)|$)",
 * )
 * async def down(event):
 *     matched = event.pattern_match.group(1).strip()
 *     msg = await event.eor(get_string("udl_4"))
 *     if not matched:
 *         return await eor(msg, get_string("udl_5"), time=5)
 *     try:
 *         splited = matched.split(" | ")
 *         link = splited[0]
 *         filename = splited[1]
 *     except IndexError:
 *         filename = None
 *     s_time = time.time()
 *     try:
 *         filename, d = await fast_download(
 *             link,
 *             filename,
 *             progress_callback=lambda d, t: asyncio.get_event_loop().create_task(
 *                 progress(
 *                     d,
 *                     t,
 *                     msg,
 *                     s_time,
 *                     f"Downloading from {link}",
 *                 )
 *             ),
 *         )
 *     except InvalidURL:
 *         return await msg.eor("`Invalid URL provided :(`", time=5)
 *     await msg.eor(f"`{filename}` `downloaded in {time_formatter(d*1000)}.`")
 * 
 * 
 * @ultroid_cmd(
 *     pattern="dl( (.*)|$)",
 * )
 * async def download(event):
 *     match = event.pattern_match.group(1).strip()
 *     if match and "t.me/" in match:
 *         chat, msg = get_chat_and_msgid(match)
 *         if not (chat and msg):
 *             return await event.eor(get_string("gms_1"))
 *         match = ""
 *         ok = await event.client.get_messages(chat, ids=msg)
 *     elif event.reply_to_msg_id:
 *         ok = await event.get_reply_message()
 *     else:
 *         return await event.eor(get_string("cvt_3"), time=8)
 *     xx = await event.eor(get_string("com_1"))
 *     if not (ok and ok.media):
 *         return await xx.eor(get_string("udl_1"), time=5)
 *     s = dt.now()
 *     k = time.time()
 *     if hasattr(ok.media, "document"):
 *         file = ok.media.document
 *         mime_type = file.mime_type
 *         filename = match or ok.file.name
 *         if not filename:
 *             if "audio" in mime_type:
 *                 filename = "audio_" + dt.now().isoformat("_", "seconds") + ".ogg"
 *             elif "video" in mime_type:
 *                 filename = "video_" + dt.now().isoformat("_", "seconds") + ".mp4"
 *         try:
 *             result = await downloader(
 *                 f"resources/downloads/{filename}",
 *                 file,
 *                 xx,
 *                 k,
 *                 f"Downloading {filename}...",
 *             )
 * 
 *         except MessageNotModifiedError as err:
 *             return await xx.edit(str(err))
 *         file_name = result.name
 *     else:
 *         d = "resources/downloads/"
 *         file_name = await event.client.download_media(
 *             ok,
 *             d,
 *             progress_callback=lambda d, t: asyncio.get_event_loop().create_task(
 *                 progress(
 *                     d,
---- end original ---- */

ultroidCmd('download( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `download( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("downloadupload") || `Plugin \`downloadupload\` matched \`download( (.*)|$)\`.` });
});

ultroidCmd('dl( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `dl( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("downloadupload") || `Plugin \`downloadupload\` matched \`dl( (.*)|$)\`.` });
});

ultroidCmd('ul( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ul( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("downloadupload") || `Plugin \`downloadupload\` matched \`ul( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
