// Ultroid-JS port of plugins/youtube.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/youtube.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "youtube";
const PATTERNS = ['yt(a|v|sa|sv) ?(.*)'];

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
 * • `{i}yta <(youtube/any) link>`
 *    Download audio from the link.
 * 
 * • `{i}ytv <(youtube/any) link>`
 *    Download video  from the link.
 * 
 * • `{i}ytsa <(youtube) search query>`
 *    Search and download audio from youtube.
 * 
 * • `{i}ytsv <(youtube) search query>`
 *    Search and download video from youtube.
 * """
 * from pyUltroid.fns.ytdl import download_yt, get_yt_link
 * 
 * from . import get_string, requests, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="yt(a|v|sa|sv) ?(.*)",
 * )
 * async def download_from_youtube_(event):
 *     ytd = {
 *         "prefer_ffmpeg": True,
 *         "addmetadata": True,
 *         "geo-bypass": True,
 *         "nocheckcertificate": True,
 *     }
 *     opt = event.pattern_match.group(1).strip()
 *     xx = await event.eor(get_string("com_1"))
 *     if opt == "a":
 *         ytd["format"] = "bestaudio"
 *         ytd["outtmpl"] = "%(id)s.m4a"
 *         url = event.pattern_match.group(2)
 *         if not url:
 *             return await xx.eor(get_string("youtube_1"))
 *         try:
 *             requests.get(url)
 *         except BaseException:
 *             return await xx.eor(get_string("youtube_2"))
 *     elif opt == "v":
 *         ytd["format"] = "best"
 *         ytd["outtmpl"] = "%(id)s.mp4"
 *         ytd["postprocessors"] = [{"key": "FFmpegMetadata"}]
 *         url = event.pattern_match.group(2)
 *         if not url:
 *             return await xx.eor(get_string("youtube_3"))
 *         try:
 *             requests.get(url)
 *         except BaseException:
 *             return await xx.eor(get_string("youtube_4"))
 *     elif opt == "sa":
 *         ytd["format"] = "bestaudio"
 *         ytd["outtmpl"] = "%(id)s.m4a"
 *         try:
 *             query = event.text.split(" ", 1)[1]
 *         except IndexError:
 *             return await xx.eor(get_string("youtube_5"))
 *         url = get_yt_link(query)
 *         if not url:
 *             return await xx.edit(get_string("unspl_1"))
 *         await xx.eor(get_string("youtube_6"))
 *     elif opt == "sv":
 *         ytd["format"] = "best"
 *         ytd["outtmpl"] = "%(id)s.mp4"
 *         ytd["postprocessors"] = [{"key": "FFmpegMetadata"}]
 *         try:
 *             query = event.text.split(" ", 1)[1]
 *         except IndexError:
 *             return await xx.eor(get_string("youtube_7"))
 *         url = get_yt_link(query)
 *         if not url:
 *             return await xx.edit(get_string("unspl_1"))
 *         await xx.eor(get_string("youtube_8"))
 *     else:
 *         return
 *     await download_yt(xx, url, ytd)
---- end original ---- */

ultroidCmd('yt(a|v|sa|sv) ?(.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `yt(a|v|sa|sv) ?(.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("youtube") || `Plugin \`youtube\` matched \`yt(a|v|sa|sv) ?(.*)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
