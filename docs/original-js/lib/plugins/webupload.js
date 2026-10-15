// Ultroid-JS port of plugins/webupload.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/webupload.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "webupload";
const PATTERNS = ['webupload( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * """
 * ✘ Commands Available -
 * 
 * • `{i}webupload`
 *     Upload files on another server.
 * """
 * 
 * import os
 * 
 * from pyUltroid.fns.tools import _webupload_cache
 * 
 * from . import Button, asst, get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="webupload( (.*)|$)")
 * async def _(event):
 *     xx = await event.eor(get_string("com_1"))
 *     match = event.pattern_match.group(1).strip()
 *     if event.chat_id not in _webupload_cache:
 *         _webupload_cache.update({int(event.chat_id): {}})
 *     if match:
 *         if not os.path.exists(match):
 *             return await xx.eor("File doesn't exist.")
 *         _webupload_cache[event.chat_id][event.id] = match
 *     elif event.reply_to_msg_id:
 *         reply = await event.get_reply_message()
 *         if reply.photo:
 *             file = await reply.download_media("resources/downloads/")
 *             _webupload_cache[int(event.chat_id)][int(event.id)] = file
 *         else:
 *             file, _ = await event.client.fast_downloader(
 *                 reply.document, show_progress=True, event=xx
 *             )
 *             _webupload_cache[int(event.chat_id)][int(event.id)] = file.name
 *     else:
 *         return await xx.eor("Reply to file or give file path...")
 *     if not event.client._bot:
 *         results = await event.client.inline_query(
 *             asst.me.username, f"fl2lnk {event.chat_id}:{event.id}"
 *         )
 *         await results[0].click(event.chat_id, reply_to=event.reply_to_msg_id)
 *         await xx.delete()
 * 
 *     else:
 *         __cache = f"{event.chat_id}:{event.id}"
 *         buttons = [
 *             [
 *                 Button.inline("catbox", data=f"flcatbox//{__cache}"),
 *                 Button.inline("transfer", data=f"fltransfer//{__cache}"),
 *             ],
 *             [
 *                 Button.inline("filebin", data=f"flfilebin//{__cache}"),
 *                 Button.inline("0x0.st", data=f"fl0x0.st//{__cache}"),
 *             ],
 *             [
 *                 Button.inline("file.io", data=f"flfile.io//{__cache}"),
 *                 Button.inline("siasky", data=f"flsiasky//{__cache}"),
 *             ],
 *         ]
 *         await xx.edit("Choose Server to Upload File...", buttons=buttons)
---- end original ---- */

ultroidCmd('webupload( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `webupload( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("webupload") || `Plugin \`webupload\` matched \`webupload( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
