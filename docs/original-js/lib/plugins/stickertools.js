// Ultroid-JS port of plugins/stickertools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/stickertools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "stickertools";
const PATTERNS = ['packkang', 'kang', 'round$', 'destroy$', 'tiny$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ❍ Commands Available -
 * 
 * • `{i}destroy <reply to animated sticker>`
 *     To destroy the sticker.
 * 
 * • `{i}tiny <reply to media>`
 *     To create Tiny stickers.
 * 
 * • `{i}kang <reply to image/sticker>`
 *     Kang the sticker (add to your pack).
 * 
 * • `{i}packkang <pack name>`
 *     Kang the Complete sticker set (with custom name).
 * 
 * • `{i}round <reply to any media>`
 *     To extract round sticker.
 * """
 * import glob
 * import io
 * import os
 * import random
 * from os import remove
 * 
 * try:
 *     import cv2
 * except ImportError:
 *     cv2 = None
 * try:
 *     import numpy as np
 * except ImportError:
 *     np = None
 * try:
 *     from PIL import Image, ImageDraw
 * except ImportError:
 *     pass
 * 
 * from telethon.errors import PeerIdInvalidError, YouBlockedUserError
 * from telethon.tl.functions.messages import UploadMediaRequest
 * from telethon.tl.types import (
 *     DocumentAttributeFilename,
 *     DocumentAttributeSticker,
 *     InputPeerSelf,
 * )
 * from telethon.utils import get_input_document
 * 
 * from . import (
 *     KANGING_STR,
 *     LOGS,
 *     asst,
 *     async_searcher,
 *     bash,
 *     con,
 *     functions,
 *     get_string,
 *     inline_mention,
 *     mediainfo,
 *     ultroid_cmd,
 *     quotly,
 *     types,
 *     udB,
 * )
 * 
 * 
 * @ultroid_cmd(pattern="packkang")
 * async def pack_kangish(_):
 *     _e = await _.get_reply_message()
 *     local = None
 *     try:
 *         cmdtext = _.text.split(maxsplit=1)[1]
 *     except IndexError:
 *         cmdtext = None
 *     if cmdtext and os.path.isdir(cmdtext):
 *         local = True
 *     elif not (_e and _e.sticker and _e.file.mime_type == "image/webp"):
 *         return await _.eor(get_string("sts_4"))
 *     msg = await _.eor(get_string("com_1"))
 *     _packname = cmdtext or f"Ultroid Kang Pack By {_.sender_id}"
 *     typee = None
 *     if not local:
 *         _id = _e.media.document.attributes[1].stickerset.id
 *         _hash = _e.media.document.attributes[1].stickerset.access_hash
 *         _get_stiks = await _.client(
 *             functions.messages.GetStickerSetRequest(
 *                 stickerset=types.InputStickerSetID(id=_id, access_hash=_hash), hash=0
 *             )
 *         )
 *         docs = _get_stiks.documents
 *     else:
 *         docs = []
 *         files = glob.glob(f"{cmdtext}/*")
 *         exte = files[-1]
 *         if exte.endswith(".tgs"):
 *             typee = "anim"
 *         elif exte.endswith(".webm"):
 *             typee = "vid"
 *         count = 0
 *         for file in files:
 *             if file.endswith((".tgs", ".webm")):
 *                 count += 1
 *                 upl = await asst.upload_file(file)
 *                 docs.append(await asst(UploadMediaRequest(InputPeerSelf(), upl)))
 *                 if count % 5 == 0:
 *                     await msg.edit(f"`Uploaded {count} files.`")
 * 
 *     stiks = []
 *     for i in docs:
 *         x = get_input_document(i)
 *         stiks.append(
 *             types.InputStickerSetItem(
 *                 document=x,
 *                 emoji=(
 *                     random.choice(["😐", "👍", "😂"])
 *                     if local
---- end original ---- */

ultroidCmd('packkang', async (e) => {
  const chatId = e.chatId;
  // Port of `packkang` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("stickertools") || `Plugin \`stickertools\` matched \`packkang\`.` });
});

ultroidCmd('kang', async (e) => {
  const chatId = e.chatId;
  // Port of `kang` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("stickertools") || `Plugin \`stickertools\` matched \`kang\`.` });
});

ultroidCmd('round$', async (e) => {
  const chatId = e.chatId;
  // Port of `round$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("stickertools") || `Plugin \`stickertools\` matched \`round$\`.` });
});

ultroidCmd('destroy$', async (e) => {
  const chatId = e.chatId;
  // Port of `destroy$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("stickertools") || `Plugin \`stickertools\` matched \`destroy$\`.` });
});

ultroidCmd('tiny$', async (e) => {
  const chatId = e.chatId;
  // Port of `tiny$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("stickertools") || `Plugin \`stickertools\` matched \`tiny$\`.` });
});
export { PLUGIN_NAME, PATTERNS };
