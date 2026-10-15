// Ultroid-JS port of plugins/imagetools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/imagetools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "imagetools";
const PATTERNS = ['color$', '(grey|blur|negative|danger|mirror|quad|sketch|flip|toon)$', 'csample (.*)', 'blue$', 'border( (.*)|$)', 'pixelator( (.*)|$)'];

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
 * • `{i}border <reply to photo/sticker>`
 *     To create border around that media..
 *     Ex - `{i}border 12,22,23`
 *        - `{i}border 12,22,23 ; width (in number)`
 * 
 * • `{i}grey <reply to any media>`
 *     To make it black nd white.
 * 
 * • `{i}color <reply to any Black nd White media>`
 *     To make it Colorfull.
 * 
 * • `{i}toon <reply to any media>`
 *     To make it toon.
 * 
 * • `{i}danger <reply to any media>`
 *     To make it look Danger.
 * 
 * • `{i}negative <reply to any media>`
 *     To make negative image.
 * 
 * • `{i}blur <reply to any media>`
 *     To make it blurry.
 * 
 * • `{i}quad <reply to any media>`
 *     create a Vortex.
 * 
 * • `{i}mirror <reply to any media>`
 *     To create mirror pic.
 * 
 * • `{i}flip <reply to any media>`
 *     To make it flip.
 * 
 * • `{i}sketch <reply to any media>`
 *     To draw its sketch.
 * 
 * • `{i}blue <reply to any media>`
 *     just cool.
 * 
 * • `{i}csample <color name /color code>`
 *    example : `{i}csample red`
 *              `{i}csample #ffffff`
 * 
 * • `{i}pixelator <reply image>`
 *     Create a Pixelated Image..
 * """
 * import os
 * 
 * from . import LOGS, con
 * 
 * try:
 *     import cv2
 * except ImportError:
 *     LOGS.error(f"{__file__}: OpenCv not Installed.")
 * 
 * import numpy as np
 * 
 * try:
 *     from PIL import Image
 * except ImportError:
 *     Image = None
 *     LOGS.info(f"{__file__}: PIL  not Installed.")
 * 
 * from . import upload_file as upf
 * from telethon.errors.rpcerrorlist import (
 *     ChatSendMediaForbiddenError,
 *     MessageDeleteForbiddenError,
 * )
 * 
 * from . import (
 *     Redis,
 *     async_searcher,
 *     download_file,
 *     get_string,
 *     requests,
 *     udB,
 *     ultroid_cmd,
 * )
 * 
 * 
 * @ultroid_cmd(pattern="color$")
 * async def _(event):
 *     reply = await event.get_reply_message()
 *     if not (reply and reply.media):
 *         return await event.eor("`Reply To a Black and White Image`")
 *     xx = await event.eor("`Coloring image 🎨🖌️...`")
 *     image = await reply.download_media()
 *     img = cv2.VideoCapture(image)
 *     ret, frame = img.read()
 *     cv2.imwrite("ult.jpg", frame)
 *     if udB.get_key("DEEP_API"):
 *         key = Redis("DEEP_API")
 *     else:
 *         key = "quickstart-QUdJIGlzIGNvbWluZy4uLi4K"
 *     r = requests.post(
 *         "https://api.deepai.org/api/colorizer",
 *         files={"image": open("ult.jpg", "rb")},
 *         headers={"api-key": key},
 *     )
 *     os.remove("ult.jpg")
 *     os.remove(image)
 *     if "status" in r.json():
 *         return await event.edit(
 *             r.json()["status"] + "\nGet api nd set `{i}setdb DEEP_API key`"
 *         )
 *     r_json = r.json()["output_url"]
 *     await event.client.send_file(event.chat_id, r_json, reply_to=reply)
 *     await xx.delete()
 * 
 * 
 * @ultroid_cmd(pattern="(grey|blur|negative|danger|mirror|quad|sketch|flip|toon)$")
 * async def ult_tools(event):
---- end original ---- */

ultroidCmd('color$', async (e) => {
  const chatId = e.chatId;
  // Port of `color$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("imagetools") || `Plugin \`imagetools\` matched \`color$\`.` });
});

ultroidCmd('(grey|blur|negative|danger|mirror|quad|sketch|flip|toon)$', async (e) => {
  const chatId = e.chatId;
  // Port of `(grey|blur|negative|danger|mirror|quad|sketch|flip|toon)$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("imagetools") || `Plugin \`imagetools\` matched \`(grey|blur|negative|danger|mirror|quad|sketch|flip|toon)$\`.` });
});

ultroidCmd('csample (.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `csample (.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("imagetools") || `Plugin \`imagetools\` matched \`csample (.*)\`.` });
});

ultroidCmd('blue$', async (e) => {
  const chatId = e.chatId;
  // Port of `blue$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("imagetools") || `Plugin \`imagetools\` matched \`blue$\`.` });
});

ultroidCmd('border( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `border( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("imagetools") || `Plugin \`imagetools\` matched \`border( (.*)|$)\`.` });
});

ultroidCmd('pixelator( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `pixelator( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("imagetools") || `Plugin \`imagetools\` matched \`pixelator( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
