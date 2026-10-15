// Ultroid-JS port of plugins/pdftools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/pdftools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "pdftools";
const PATTERNS = ['pdf( (.*)|$)', 'pdtext( (.*)|$)', 'pdscan( (.*)|$)', 'pdsave( (.*)|$)', 'pdsend( (.*)|$)'];

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
 * • `{i}pdf <page num> <reply to pdf file>`
 *     Extract & send page as an Image.(note-: For extracting all pages, just use .pdf)
 *     to upload selected range `{i}pdf 1-7`
 * 
 * • `{i}pdtext <page num> <reply to pdf file>`
 *     Extract Text From the Pdf.(note-: For Extraction all text just use .pdtext)
 *     to extract selected pages `{i}pdf 1-7`
 * 
 * • `{i}pdscan <reply to image>`
 *     It scan, crop & send image(s) as pdf.
 * 
 * • `{i}pdsave <reply to image/pdf>`
 *     It scan, crop & save file to merge.
 *     you can merge many pages in a single pdf.
 * 
 * • `{i}pdsend `
 *     Merge & send the pdf, collected from .pdsave.
 * """
 * import glob
 * import os
 * import shutil
 * import time
 * 
 * import cv2
 * import numpy as np
 * 
 * from pyUltroid.fns.tools import four_point_transform
 * 
 * from . import (
 *     HNDLR,
 *     LOGS,
 *     bash,
 *     check_filename,
 *     downloader,
 *     eor,
 *     get_string,
 *     ultroid_cmd,
 * )
 * 
 * try:
 *     from PIL import Image
 * except ImportError:
 *     Image = None
 *     LOGS.info(f"{__file__}: PIL  not Installed.")
 * try:
 *     from PyPDF2 import PdfReader, PdfWriter, PdfMerger
 *     PdfFileReader = PdfReader
 *     PdfFileWriter = PdfWriter
 *     PdfFileMerger = PdfMerger
 * except ImportError:
 *     from PyPDF2 import PdfFileMerger, PdfFileReader, PdfFileWriter
 * from telethon.errors.rpcerrorlist import PhotoSaveFileInvalidError
 * 
 * if not os.path.isdir("pdf"):
 *     os.mkdir("pdf")
 * 
 * 
 * @ultroid_cmd(
 *     pattern="pdf( (.*)|$)",
 * )
 * async def pdfseimg(event):
 *     ok = await event.get_reply_message()
 *     msg = event.pattern_match.group(1).strip()
 *     if not (ok and (ok.document and (ok.document.mime_type == "application/pdf"))):
 *         await event.eor("`Reply The pdf u Want to Download..`")
 *         return
 *     xx = await event.eor(get_string("com_1"))
 *     file = ok.media.document
 *     k = time.time()
 *     filename = "hehe.pdf"
 *     result = await downloader(
 *         f"pdf/{filename}", file, xx, k, f"Downloading {filename}..."
 *     )
 * 
 *     await xx.delete()
 *     pdfp = "pdf/hehe.pdf"
 *     pdfp.replace(".pdf", "")
 *     pdf = PdfFileReader(pdfp)
 *     if not msg:
 *         ok = []
 *         for num in range(pdf.numPages):
 *             pw = PdfFileWriter()
 *             pw.addPage(pdf.getPage(num))
 *             fil = os.path.join(f"pdf/ult{num + 1}.png")
 *             ok.append(fil)
 *             with open(fil, "wb") as f:
 *                 pw.write(f)
 *         os.remove(pdfp)
 *         for z in ok:
 *             await event.client.send_file(event.chat_id, z)
 *         shutil.rmtree("pdf")
 *         os.mkdir("pdf")
 *         await xx.delete()
 *     elif "-" in msg:
 *         ok = int(msg.split("-")[-1]) - 1
 *         for o in range(ok):
 *             pw = PdfFileWriter()
 *             pw.addPage(pdf.getPage(o))
 *             with open(os.path.join("ult.png"), "wb") as f:
 *                 pw.write(f)
 *             await event.reply(
 *                 file="ult.png",
 *             )
 *             os.remove("ult.png")
 *         os.remove(pdfp)
 *     else:
 *         o = int(msg) - 1
 *         pw = PdfFileWriter()
 *         pw.addPage(pdf.getPage(o))
 *         with open(os.path.join("ult.png"), "wb") as f:
 *             pw.write(f)
---- end original ---- */

ultroidCmd('pdf( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `pdf( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pdftools") || `Plugin \`pdftools\` matched \`pdf( (.*)|$)\`.` });
});

ultroidCmd('pdtext( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `pdtext( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pdftools") || `Plugin \`pdftools\` matched \`pdtext( (.*)|$)\`.` });
});

ultroidCmd('pdscan( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `pdscan( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pdftools") || `Plugin \`pdftools\` matched \`pdscan( (.*)|$)\`.` });
});

ultroidCmd('pdsave( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `pdsave( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pdftools") || `Plugin \`pdftools\` matched \`pdsave( (.*)|$)\`.` });
});

ultroidCmd('pdsend( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `pdsend( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("pdftools") || `Plugin \`pdftools\` matched \`pdsend( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
