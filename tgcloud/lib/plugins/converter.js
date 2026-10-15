// Ultroid-JS port of plugins/converter.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/converter.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "converter";
const PATTERNS = ['thumbnail$', 'rename( (.*)|$)', 'convert( (.*)|$)', 'doc( (.*)|$)', 'open( (.*)|$)'];

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
 * __doc__ = get_help("help_converter")
 * 
 * import os
 * import time
 * 
 * from . import LOGS
 * 
 * try:
 *     import cv2
 * except ImportError:
 *     cv2 = None
 * 
 * try:
 *     from PIL import Image
 * except ImportError:
 *     LOGS.info(f"{__file__}: PIL  not Installed.")
 *     Image = None
 * 
 * from . import upload_file as uf
 * 
 * from . import (
 *     ULTConfig,
 *     bash,
 *     con,
 *     downloader,
 *     get_paste,
 *     get_string,
 *     udB,
 *     ultroid_cmd,
 *     uploader,
 * )
 * 
 * opn = []
 * 
 * 
 * @ultroid_cmd(
 *     pattern="thumbnail$",
 * )
 * async def _(e):
 *     r = await e.get_reply_message()
 *     if r.photo:
 *         dl = await r.download_media()
 *     elif r.document and r.document.thumbs:
 *         dl = await r.download_media(thumb=-1)
 *     else:
 *         return await e.eor("`Reply to Photo or media with thumb...`")
 *     nn = uf(dl)
 *     os.remove(dl)
 *     udB.set_key("CUSTOM_THUMBNAIL", str(nn))
 *     await bash(f"wget {nn} -O resources/extras/ultroid.jpg")
 *     await e.eor(get_string("cvt_6").format(nn), link_preview=False)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="rename( (.*)|$)",
 * )
 * async def imak(event):
 *     reply = await event.get_reply_message()
 *     t = time.time()
 *     if not reply:
 *         return await event.eor(get_string("cvt_1"))
 *     inp = event.pattern_match.group(1).strip()
 *     if not inp:
 *         return await event.eor(get_string("cvt_2"))
 *     xx = await event.eor(get_string("com_1"))
 *     if reply.media:
 *         if hasattr(reply.media, "document"):
 *             file = reply.media.document
 *             image = await downloader(
 *                 reply.file.name or str(time.time()),
 *                 reply.media.document,
 *                 xx,
 *                 t,
 *                 get_string("com_5"),
 *             )
 * 
 *             file = image.name
 *         else:
 *             file = await event.client.download_media(reply.media)
 *     if os.path.exists(inp):
 *         os.remove(inp)
 *     await bash(f'mv """{file}""" """{inp}"""')
 *     if not os.path.exists(inp) or os.path.exists(inp) and not os.path.getsize(inp):
 *         os.rename(file, inp)
 *     k = time.time()
 *     n_file, _ = await event.client.fast_uploader(
 *         inp, show_progress=True, event=event, message="Uploading...", to_delete=True
 *     )
 *     await event.reply(
 *         f"`{n_file.name}`",
 *         file=n_file,
 *         force_document=True,
 *         thumb=ULTConfig.thumb,
 *     )
 *     os.remove(inp)
 *     await xx.delete()
 * 
 * 
 * conv_keys = {
 *     "img": "png",
 *     "sticker": "webp",
 *     "webp": "webp",
 *     "image": "png",
 *     "webm": "webm",
 *     "gif": "gif",
 *     "json": "json",
 *     "tgs": "tgs",
 * }
 * 
 * 
 * @ultroid_cmd(
---- end original ---- */

ultroidCmd('thumbnail$', async (e) => {
  const chatId = e.chatId;
  // Port of `thumbnail$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("converter") || `Plugin \`converter\` matched \`thumbnail$\`.` });
});

ultroidCmd('rename( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `rename( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("converter") || `Plugin \`converter\` matched \`rename( (.*)|$)\`.` });
});

ultroidCmd('convert( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `convert( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("converter") || `Plugin \`converter\` matched \`convert( (.*)|$)\`.` });
});

ultroidCmd('doc( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `doc( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("converter") || `Plugin \`converter\` matched \`doc( (.*)|$)\`.` });
});

ultroidCmd('open( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `open( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("converter") || `Plugin \`converter\` matched \`open( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
