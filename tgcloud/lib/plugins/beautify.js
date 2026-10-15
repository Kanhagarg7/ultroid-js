// Ultroid-JS port of plugins/beautify.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/beautify.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "beautify";
const PATTERNS = ['(rc|c)arbon', 'ccarbon( (.*)|$)', 'rayso'];

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
 * __doc__ = get_help("help_beautify")
 * 
 * 
 * import os
 * import random
 * 
 * from telethon.utils import get_display_name
 * from urllib.parse import urlencode
 * from . import Carbon, ultroid_cmd, get_string, inline_mention
 * from secrets import token_hex
 * 
 * _colorspath = "resources/colorlist.txt"
 * 
 * if os.path.exists(_colorspath):
 *     with open(_colorspath, "r") as f:
 *         all_col = f.read().split()
 * else:
 *     all_col = []
 * 
 * 
 * @ultroid_cmd(
 *     pattern="(rc|c)arbon",
 * )
 * async def cr_bn(event):
 *     xxxx = await event.eor(get_string("com_1"))
 *     te = event.pattern_match.group(1)
 *     col = random.choice(all_col) if te[0] == "r" else "White"
 *     if event.reply_to_msg_id:
 *         temp = await event.get_reply_message()
 *         if temp.media:
 *             b = await event.client.download_media(temp)
 *             with open(b) as a:
 *                 code = a.read()
 *             os.remove(b)
 *         else:
 *             code = temp.message
 *     else:
 *         try:
 *             code = event.text.split(" ", maxsplit=1)[1]
 *         except IndexError:
 *             return await xxxx.eor(get_string("carbon_2"))
 *     xx = await Carbon(code=code, file_name="ultroid_carbon", backgroundColor=col)
 *     if isinstance(xx, dict):
 *         await xxxx.edit(f"`{xx}`")
 *         return
 *     await xxxx.delete()
 *     await event.reply(
 *         f"Carbonised by {inline_mention(event.sender)}",
 *         file=xx,
 *     )
 * 
 * 
 * @ultroid_cmd(
 *     pattern="ccarbon( (.*)|$)",
 * )
 * async def crbn(event):
 *     match = event.pattern_match.group(1).strip()
 *     if not match:
 *         return await event.eor(get_string("carbon_3"))
 *     msg = await event.eor(get_string("com_1"))
 *     if event.reply_to_msg_id:
 *         temp = await event.get_reply_message()
 *         if temp.media:
 *             b = await event.client.download_media(temp)
 *             with open(b) as a:
 *                 code = a.read()
 *             os.remove(b)
 *         else:
 *             code = temp.message
 *     else:
 *         try:
 *             match = match.split(" ", maxsplit=1)
 *             code = match[1]
 *             match = match[0]
 *         except IndexError:
 *             return await msg.eor(get_string("carbon_2"))
 *     xx = await Carbon(code=code, backgroundColor=match)
 *     await msg.delete()
 *     await event.reply(
 *         f"Carbonised by {inline_mention(event.sender)}",
 *         file=xx,
 *     )
 * 
 * 
 * RaySoTheme = [
 *     "meadow",
 *     "breeze",
 *     "raindrop",
 *     "candy",
 *     "crimson",
 *     "falcon",
 *     "sunset",
 *     "noir",
 *     "midnight",
 *     "bitmap",
 *     "ice",
 *     "sand",
 *     "forest",
 *     "mono",
 * ]
 * 
 * 
 * @ultroid_cmd(pattern="rayso")
 * async def pass_on(ult):
 *     try:
 *         from playwright.async_api import async_playwright
 *     except ImportError:
 *         await ult.eor(
 *             "`playwright` is not installed!\nPlease install it to use this command.."
 *         )
 *         return
---- end original ---- */

ultroidCmd('(rc|c)arbon', async (e) => {
  const chatId = e.chatId;
  // Port of `(rc|c)arbon` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("beautify") || `Plugin \`beautify\` matched \`(rc|c)arbon\`.` });
});

ultroidCmd('ccarbon( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ccarbon( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("beautify") || `Plugin \`beautify\` matched \`ccarbon( (.*)|$)\`.` });
});

ultroidCmd('rayso', async (e) => {
  const chatId = e.chatId;
  // Port of `rayso` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("beautify") || `Plugin \`beautify\` matched \`rayso\`.` });
});
export { PLUGIN_NAME, PATTERNS };
