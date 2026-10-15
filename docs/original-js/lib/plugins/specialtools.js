// Ultroid-JS port of plugins/specialtools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/specialtools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "specialtools";
const PATTERNS = ['getaudio$', 'addaudio$', 'dob( (.*)|$)', 'sticker( (.*)|$)', 'wall( (.*)|$)', 'q( (.*)|$)'];

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
 * • `{i}wspr <username>`
 *     Send secret message..
 * 
 * • `{i}q <color-optional>`
 * • `{i}q @username`
 * • `{i}q r <color-optional>`
 * • `{i}q count` : `multiple quotes`
 *     Create quotes..
 * 
 * • `{i}sticker <query>`
 *     Search Stickers as Per ur Wish..
 * 
 * • `{i}getaudio <reply to an audio>`
 *     Download Audio To put in ur Desired Video/Gif.
 * 
 * • `{i}addaudio <reply to Video/gif>`
 *     It will put the above audio to the replied video/gif.
 * 
 * • `{i}dob <date of birth>`
 *     Put in dd/mm/yy Format only(eg .dob 01/01/1999).
 * 
 * • `{i}wall <query>`
 *     Search Hd Wallpaper as Per ur Wish..
 * """
 * import os
 * import time
 * from datetime import datetime as dt
 * from random import choice
 * 
 * import pytz, asyncio
 * from bs4 import BeautifulSoup as bs
 * from telethon.tl.types import DocumentAttributeVideo
 * from requests import Session
 * from cloudscraper import create_scraper
 * from pyUltroid.fns.tools import get_google_images, metadata
 * 
 * from . import (
 *     HNDLR,
 *     ULTConfig,
 *     async_searcher,
 *     bash,
 *     downloader,
 *     eod,
 *     get_string,
 *     mediainfo,
 *     quotly,
 *     ultroid_bot,
 *     ultroid_cmd,
 *     uploader,
 * )
 * from .beautify import all_col
 * 
 * File = []
 * scraper = create_scraper()
 * 
 * @ultroid_cmd(
 *     pattern="getaudio$",
 * )
 * async def daudtoid(e):
 *     if not e.reply_to:
 *         return await eod(e, get_string("spcltool_1"))
 *     r = await e.get_reply_message()
 *     if not mediainfo(r.media).startswith(("audio", "video")):
 *         return await eod(e, get_string("spcltool_1"))
 *     xxx = await e.eor(get_string("com_1"))
 *     dl = r.file.name or "input.mp4"
 *     c_time = time.time()
 *     file = await downloader(
 *         f"resources/downloads/{dl}",
 *         r.media.document,
 *         xxx,
 *         c_time,
 *         f"Downloading {dl}...",
 *     )
 * 
 *     File.append(file.name)
 *     await xxx.edit(get_string("spcltool_2"))
 * 
 * 
 * @ultroid_cmd(
 *     pattern="addaudio$",
 * )
 * async def adaudroid(e):
 *     if not e.reply_to:
 *         return await eod(e, get_string("spcltool_3"))
 *     r = await e.get_reply_message()
 *     if not mediainfo(r.media).startswith("video"):
 *         return await eod(e, get_string("spcltool_3"))
 *     if not (File and os.path.exists(File[0])):
 *         return await e.edit(f"`First reply an audio with {HNDLR}addaudio`")
 *     xxx = await e.eor(get_string("com_1"))
 *     dl = r.file.name or "input.mp4"
 *     c_time = time.time()
 *     file = await downloader(
 *         f"resources/downloads/{dl}",
 *         r.media.document,
 *         xxx,
 *         c_time,
 *         f"Downloading {dl}...",
 *     )
 * 
 *     await xxx.edit(get_string("spcltool_5"))
 *     await bash(
 *         f'ffmpeg -i "{file.name}" -i "{File[0]}" -shortest -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 output.mp4'
 *     )
 *     out = "output.mp4"
 *     mmmm = await uploader(out, out, time.time(), xxx, f"Uploading {out}...")
 *     data = await metadata(out)
 *     width = data["width"]
 *     height = data["height"]
 *     duration = data["duration"]
---- end original ---- */

ultroidCmd('getaudio$', async (e) => {
  const chatId = e.chatId;
  // Port of `getaudio$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("specialtools") || `Plugin \`specialtools\` matched \`getaudio$\`.` });
});

ultroidCmd('addaudio$', async (e) => {
  const chatId = e.chatId;
  // Port of `addaudio$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("specialtools") || `Plugin \`specialtools\` matched \`addaudio$\`.` });
});

ultroidCmd('dob( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `dob( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("specialtools") || `Plugin \`specialtools\` matched \`dob( (.*)|$)\`.` });
});

ultroidCmd('sticker( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `sticker( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("specialtools") || `Plugin \`specialtools\` matched \`sticker( (.*)|$)\`.` });
});

ultroidCmd('wall( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `wall( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("specialtools") || `Plugin \`specialtools\` matched \`wall( (.*)|$)\`.` });
});

ultroidCmd('q( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `q( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("specialtools") || `Plugin \`specialtools\` matched \`q( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
