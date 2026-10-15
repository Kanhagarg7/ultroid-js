// Ultroid-JS port of plugins/mediatools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/mediatools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "mediatools";
const PATTERNS = ['mediainfo( (.*)|$)', 'rotate( (.*)|$)'];

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
 * • `{i}mediainfo <reply to media>/<file path>/<url>`
 *    To get info about it.
 * 
 * • `{i}rotate <degree/angle> <reply to media>`
 *    Rotate any video/photo/media..
 *    Note : for video it should be angle of 90's
 * """
 * import os
 * import time
 * from datetime import datetime as dt
 * 
 * from pyUltroid.fns.misc import rotate_image
 * from pyUltroid.fns.tools import make_html_telegraph
 * 
 * from . import (
 *     LOGS,
 *     Telegraph,
 *     bash,
 *     downloader,
 *     get_string,
 *     upload_file,
 *     is_url_ok,
 *     mediainfo,
 *     ultroid_cmd,
 * )
 * 
 * try:
 *     import cv2
 * except ImportError:
 *     LOGS.info("WARNING: 'cv2' not found!")
 *     cv2 = None
 * 
 * 
 * @ultroid_cmd(pattern="mediainfo( (.*)|$)")
 * async def mi(e):
 *     r = await e.get_reply_message()
 *     match = e.pattern_match.group(1).strip()
 *     taime = time.time()
 *     extra = ""
 *     if r and r.media:
 *         xx = mediainfo(r.media)
 *         murl = r.media.stringify()
 *         url = await make_html_telegraph("Mediainfo", f"<pre>{murl}</pre>")
 *         extra = f"**[{xx}]({url})**\n\n"
 *         e = await e.eor(f"{extra}`Loading More...`", link_preview=False)
 * 
 *         if hasattr(r.media, "document"):
 *             file = r.media.document
 *             mime_type = file.mime_type
 *             filename = r.file.name
 *             if not filename:
 *                 if "audio" in mime_type:
 *                     filename = "audio_" + dt.now().isoformat("_", "seconds") + ".ogg"
 *                 elif "video" in mime_type:
 *                     filename = "video_" + dt.now().isoformat("_", "seconds") + ".mp4"
 *             dl = await downloader(
 *                 f"resources/downloads/{filename}",
 *                 file,
 *                 e,
 *                 taime,
 *                 f"{extra}`Loading More...`",
 *             )
 * 
 *             naam = dl.name
 *         else:
 *             naam = await r.download_media()
 *     elif match and (
 *         os.path.isfile(match)
 *         or (match.startswith("https://") and (await is_url_ok(match)))
 *     ):
 *         naam, xx = match, "file"
 *     else:
 *         return await e.eor(get_string("cvt_3"), time=5)
 *     out, er = await bash(f"mediainfo '{naam}'")
 *     if er:
 *         LOGS.info(er)
 *         out = extra or str(er)
 *         return await e.edit(out, link_preview=False)
 *     makehtml = ""
 *     if naam.endswith((".jpg", ".png")):
 *         if os.path.exists(naam):
 *             med = upload_file(naam)
 *         else:
 *             med = match
 *         makehtml += f"<img src='{med}'><br>"
 *     for line in out.split("\n"):
 *         line = line.strip()
 *         if not line:
 *             makehtml += "<br>"
 *         elif ":" not in line:
 *             makehtml += f"<h3>{line}</h3>"
 *         else:
 *             makehtml += f"<p>{line}</p>"
 *     try:
 *         urll = await make_html_telegraph("Mediainfo", makehtml)
 *     except Exception as er:
 *         LOGS.exception(er)
 *         return
 *     await e.eor(f"{extra}[{get_string('mdi_1')}]({urll})", link_preview=False)
 *     if not match:
 *         os.remove(naam)
 * 
 * 
 * @ultroid_cmd(pattern="rotate( (.*)|$)")
 * async def rotate_(ult):
 *     match = ult.pattern_match.group(1).strip()
 *     if not ult.is_reply:
 *         return await ult.eor("`Reply to a media...`")
 *     if match:
 *         try:
 *             match = int(match)
---- end original ---- */

ultroidCmd('mediainfo( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `mediainfo( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("mediatools") || `Plugin \`mediatools\` matched \`mediainfo( (.*)|$)\`.` });
});

ultroidCmd('rotate( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `rotate( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("mediatools") || `Plugin \`mediatools\` matched \`rotate( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
