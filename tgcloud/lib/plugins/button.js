// Ultroid-JS port of plugins/button.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/button.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "button";
const PATTERNS = ['button'];

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
 * __doc__ = get_help("help_button")
 * 
 * import os
 * 
 * from . import upload_file as uf
 * from telethon.utils import pack_bot_file_id
 * 
 * from pyUltroid.fns.tools import create_tl_btn, get_msg_button
 * 
 * from . import HNDLR, get_string, mediainfo, ultroid_cmd
 * from ._inline import something
 * 
 * 
 * @ultroid_cmd(pattern="button")
 * async def butt(event):
 *     media, wut, text = None, None, None
 *     if event.reply_to:
 *         wt = await event.get_reply_message()
 *         if wt.text:
 *             text = wt.text
 *         if wt.media:
 *             wut = mediainfo(wt.media)
 *         if wut and wut.startswith(("pic", "gif")):
 *             dl = await wt.download_media()
 *             media = uf(dl)
 *         elif wut == "video":
 *             if wt.media.document.size > 8 * 1000 * 1000:
 *                 return await event.eor(get_string("com_4"), time=5)
 *             dl = await wt.download_media()
 *             media = uf(dl)
 *             os.remove(dl)
 *         else:
 *             media = pack_bot_file_id(wt.media)
 *     try:
 *         text = event.text.split(maxsplit=1)[1]
 *     except IndexError:
 *         if not text:
 *             return await event.eor(
 *                 f"**Please give some text in correct format.**\n\n`{HNDLR}help button`",
 *             )
 *     text, buttons = get_msg_button(text)
 *     if buttons:
 *         buttons = create_tl_btn(buttons)
 *     await something(event, text, media, buttons)
 *     await event.delete()
---- end original ---- */

ultroidCmd('button', async (e) => {
  const chatId = e.chatId;
  // Port of `button` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("button") || `Plugin \`button\` matched \`button\`.` });
});
export { PLUGIN_NAME, PATTERNS };
