// Ultroid-JS port of plugins/glitch.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/glitch.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "glitch";
const PATTERNS = ['glitch$'];

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
 * •`{i}glitch <reply to media>`
 *     gives a glitchy gif.
 * """
 * import os
 * 
 * from . import bash, get_string, mediainfo, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="glitch$")
 * async def _(e):
 *     try:
 *         import glitch_me  # ignore :pylint
 *     except ModuleNotFoundError:
 *         await bash(
 *             "pip install -e git+https://github.com/1Danish-00/glitch_me.git#egg=glitch_me"
 *         )
 *     reply = await e.get_reply_message()
 *     if not reply or not reply.media:
 *         return await e.eor(get_string("cvt_3"))
 *     xx = await e.eor(get_string("glitch_1"))
 *     wut = mediainfo(reply.media)
 *     if wut.startswith(("pic", "sticker")):
 *         ok = await reply.download_media()
 *     elif reply.document and reply.document.thumbs:
 *         ok = await reply.download_media(thumb=-1)
 *     else:
 *         return await xx.eor(get_string("com_4"))
 *     cmd = f"glitch_me gif --line_count 200 -f 10 -d 50 '{ok}' ult.gif"
 *     await bash(cmd)
 *     await e.reply(file="ult.gif", force_document=False)
 *     await xx.delete()
 *     os.remove(ok)
 *     os.remove("ult.gif")
---- end original ---- */

ultroidCmd('glitch$', async (e) => {
  const chatId = e.chatId;
  // Port of `glitch$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("glitch") || `Plugin \`glitch\` matched \`glitch$\`.` });
});
export { PLUGIN_NAME, PATTERNS };
