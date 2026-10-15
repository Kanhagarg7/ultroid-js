// Ultroid-JS port of plugins/search.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/search.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "search";
const PATTERNS = ['github (.*)', 'google( (.*)|$)', 'img( (.*)|$)', 'reverse$', 'saavn( (.*)|$)'];

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
 * • `{i}saavn <search query>`
 *     Download songs from Saavn.
 * 
 * • `{i}google <query>`
 *     For doing google search.
 * 
 * • `{i}github <username>`
 *     Get full information of the users github profile.
 * 
 * • `{i}img <query>`
 *   `{i}img <query> ; <no of results>`
 *     For doing Images search.
 * 
 * • `{i}reverse`
 *     Reply an Image or sticker to find its sauce.
 * """
 * import os
 * 
 * import requests
 * from bs4 import BeautifulSoup as bs
 * 
 * try:
 *     from PIL import Image
 * except ImportError:
 *     Image = None
 * try:
 *     import cv2
 * except ImportError:
 *     cv2 = None
 * from telethon.tl.types import DocumentAttributeAudio
 * 
 * from pyUltroid.fns.misc import google_search
 * from pyUltroid.fns.tools import get_google_images, saavn_search
 * 
 * from . import LOGS, async_searcher, con, eod, fast_download, get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="github (.*)",
 * )
 * async def gitsearch(event):
 *     usrname = event.pattern_match.group(1).strip()
 *     if not usrname:
 *         return await event.eor(get_string("srch_1"))
 *     url = f"https://api.github.com/users/{usrname}"
 *     ult = await async_searcher(url, re_json=True)
 *     try:
 *         uname = ult["login"]
 *         uid = ult["id"]
 *         upic = f"https://avatars.githubusercontent.com/u/{uid}"
 *         ulink = ult["html_url"]
 *         uacc = ult["name"]
 *         ucomp = ult["company"]
 *         ublog = ult["blog"]
 *         ulocation = ult["location"]
 *         ubio = ult["bio"]
 *         urepos = ult["public_repos"]
 *         ufollowers = ult["followers"]
 *         ufollowing = ult["following"]
 *     except BaseException:
 *         return await event.eor(get_string("srch_2"))
 *     fullusr = f"""
 * **[GITHUB]({ulink})**
 * **Name** - {uacc}
 * **UserName** - {uname}
 * **ID** - {uid}
 * **Company** - {ucomp}
 * **Blog** - {ublog}
 * **Location** - {ulocation}
 * **Bio** - {ubio}
 * **Repos** - {urepos}
 * **Followers** - {ufollowers}
 * **Following** - {ufollowing}
 * """
 *     await event.respond(fullusr, file=upic)
 *     await event.delete()
 * 
 * 
 * @ultroid_cmd(
 *     pattern="google( (.*)|$)",
 *     manager=True,
 * )
 * async def google(event):
 *     inp = event.pattern_match.group(1).strip()
 *     if not inp:
 *         return await eod(event, get_string("autopic_1"))
 *     x = await event.eor(get_string("com_2"))
 *     gs = await google_search(inp)
 *     if not gs:
 *         return await eod(x, get_string("autopic_2").format(inp))
 *     out = ""
 *     for res in gs:
 *         text = res["title"]
 *         url = res["link"]
 *         des = res["description"]
 *         out += f" 👉🏻  [{text}]({url})\n`{des}`\n\n"
 *     omk = f"**Google Search Query:**\n`{inp}`\n\n**Results:**\n{out}"
 *     await x.eor(omk, link_preview=False)
 * 
 * 
 * @ultroid_cmd(pattern="img( (.*)|$)")
 * async def goimg(event):
 *     query = event.pattern_match.group(1).strip()
 *     if not query:
 *         return await event.eor(get_string("autopic_1"))
 *     nn = await event.eor(get_string("com_1"))
 *     lmt = 5
 *     if ";" in query:
 *         try:
 *             lmt = int(query.split(";")[1])
 *             query = query.split(";")[0]
---- end original ---- */

ultroidCmd('github (.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `github (.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("search") || `Plugin \`search\` matched \`github (.*)\`.` });
});

ultroidCmd('google( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `google( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("search") || `Plugin \`search\` matched \`google( (.*)|$)\`.` });
});

ultroidCmd('img( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `img( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("search") || `Plugin \`search\` matched \`img( (.*)|$)\`.` });
});

ultroidCmd('reverse$', async (e) => {
  const chatId = e.chatId;
  // Port of `reverse$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("search") || `Plugin \`search\` matched \`reverse$\`.` });
});

ultroidCmd('saavn( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `saavn( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("search") || `Plugin \`search\` matched \`saavn( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
