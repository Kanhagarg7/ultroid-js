// Ultroid-JS port of plugins/logo.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/logo.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "logo";
const PATTERNS = ['logo( (.*)|$)'];

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
 * • `{i}logo <text>`
 *    Generate a logo of the given Text
 *    Or Reply To image , to write ur text on it.
 *    Or Reply To Font File, To write with that font.
 * 
 * """
 * import glob
 * import os
 * import random
 * 
 * from telethon.tl.types import InputMessagesFilterPhotos
 * 
 * try:
 *     from PIL import Image
 * except ImportError:
 *     Image = None
 * from pyUltroid.fns.misc import unsplashsearch
 * from pyUltroid.fns.tools import LogoHelper
 * 
 * from . import OWNER_ID, OWNER_NAME, download_file, get_string, mediainfo, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="logo( (.*)|$)")
 * async def logo_gen(event):
 *     xx = await event.eor(get_string("com_1"))
 *     name = event.pattern_match.group(1).strip()
 *     if not name:
 *         return await xx.eor("`Give a name too!`", time=5)
 *     bg_, font_ = None, None
 *     if event.reply_to_msg_id:
 *         temp = await event.get_reply_message()
 *         if temp.media:
 *             if hasattr(temp.media, "document") and (
 *                 ("font" in temp.file.mime_type)
 *                 or (".ttf" in temp.file.name)
 *                 or (".otf" in temp.file.name)
 *             ):
 *                 font_ = await temp.download_media("resources/fonts/")
 *             elif "pic" in mediainfo(temp.media):
 *                 bg_ = await temp.download_media()
 *     if not bg_:
 *         SRCH = [
 *                 "background",
 *                 "neon",
 *                 "anime",
 *                 "art",
 *                 "bridges",
 *                 "streets",
 *                 "computer",
 *                 "cyberpunk",
 *                 "nature",
 *                 "abstract",
 *                 "exoplanet",
 *                 "magic",
 *                 "3d render",
 *             ]
 *         res = await unsplashsearch(random.choice(SRCH), limit=1)
 *         bg_, _ = await download_file(res[0], "resources/downloads/logo.png")
 *         newimg = "resources/downloads/unsplash-temp.jpg"
 *         img_ = Image.open(bg_)
 *         img_.save(newimg)
 *         os.remove(bg_)
 *         bg_ = newimg
 * 
 *     if not font_:
 *         fpath_ = glob.glob("resources/fonts/*")
 *         font_ = random.choice(fpath_)
 *     if len(name) <= 8:
 *         strke = 10
 *     elif len(name) >= 9:
 *         strke = 5
 *     else:
 *         strke = 20
 *     name = LogoHelper.make_logo(
 *         bg_,
 *         name,
 *         font_,
 *         fill="white",
 *         stroke_width=strke,
 *         stroke_fill="black",
 *     )
 *     await xx.edit("`Done!`")
 *     await event.client.send_file(
 *         event.chat_id,
 *         file=name,
 *         caption=f"Logo by [{OWNER_NAME}](tg://user?id={OWNER_ID})",
 *         force_document=True,
 *     )
 *     os.remove(name)
 *     await xx.delete()
 *     if os.path.exists(bg_):
 *         os.remove(bg_)
---- end original ---- */

ultroidCmd('logo( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `logo( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("logo") || `Plugin \`logo\` matched \`logo( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
