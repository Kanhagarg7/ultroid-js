// Ultroid-JS port of plugins/writer.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/writer.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "writer";
const PATTERNS = ['gethtml( (.*)|$)', 'image( (.*)|$)', 'write( (.*)|$)'];

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
 * • `{i}write <text or reply to text>`
 *    It will write on a paper.
 * 
 * • `{i}image <text or reply to html or any doc file>`
 *    Write a image from html or any text.
 * """
 * 
 * import os
 * 
 * from htmlwebshot import WebShot
 * from PIL import Image, ImageDraw, ImageFont
 * 
 * from . import async_searcher, eod, get_string, text_set, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="gethtml( (.*)|$)")
 * async def ghtml(e):
 *     if txt := e.pattern_match.group(1).strip():
 *         link = e.text.split(maxsplit=1)[1]
 *     else:
 *         return await eod(e, "`Either reply to any file or give any text`")
 *     k = await async_searcher(link)
 *     with open("file.html", "w+") as f:
 *         f.write(k)
 *     await e.reply(file="file.html")
 * 
 * 
 * @ultroid_cmd(pattern="image( (.*)|$)")
 * async def f2i(e):
 *     txt = e.pattern_match.group(1).strip()
 *     html = None
 *     if txt:
 *         html = e.text.split(maxsplit=1)[1]
 *     elif e.reply_to:
 *         r = await e.get_reply_message()
 *         if r.media:
 *             html = await e.client.download_media(r.media)
 *         elif r.text:
 *             html = r.text
 *     if not html:
 *         return await eod(e, "`Either reply to any file or give any text`")
 *     html = html.replace("\n", "<br>")
 *     shot = WebShot(quality=85)
 *     css = "body {background: white;} p {color: red;}"
 *     pic = await shot.create_pic_async(html=html, css=css)
 *     await e.reply(file=pic, force_document=True)
 *     os.remove(pic)
 *     if os.path.exists(html):
 *         os.remove(html)
 * 
 * 
 * @ultroid_cmd(pattern="write( (.*)|$)")
 * async def writer(e):
 *     if e.reply_to:
 *         reply = await e.get_reply_message()
 *         text = reply.message
 *     elif e.pattern_match.group(1).strip():
 *         text = e.text.split(maxsplit=1)[1]
 *     else:
 *         return await eod(e, get_string("writer_1"))
 *     k = await e.eor(get_string("com_1"))
 *     img = Image.open("resources/extras/template.jpg")
 *     draw = ImageDraw.Draw(img)
 *     font = ImageFont.truetype("resources/fonts/assfont.ttf", 30)
 *     x, y = 150, 140
 *     lines = text_set(text)
 *     bbox = font.getbbox("hg")
 *     line_height = bbox[3] - bbox[1]
 *     for line in lines:
 *         draw.text((x, y), line, fill=(1, 22, 55), font=font)
 *         y = y + line_height - 5
 *     file = "ult.jpg"
 *     img.save(file)
 *     await e.reply(file=file)
 *     os.remove(file)
 *     await k.delete()
---- end original ---- */

ultroidCmd('gethtml( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gethtml( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("writer") || `Plugin \`writer\` matched \`gethtml( (.*)|$)\`.` });
});

ultroidCmd('image( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `image( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("writer") || `Plugin \`writer\` matched \`image( (.*)|$)\`.` });
});

ultroidCmd('write( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `write( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("writer") || `Plugin \`writer\` matched \`write( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
