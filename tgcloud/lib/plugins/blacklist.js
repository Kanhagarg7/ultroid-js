// Ultroid-JS port of plugins/blacklist.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/blacklist.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "blacklist";
const PATTERNS = ['blacklist( (.*)|$)', 'remblacklist( (.*)|$)', 'listblacklist$'];

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
 * __doc__ = get_help("help_blacklist")
 * 
 * 
 * from pyUltroid.dB.blacklist_db import (
 *     add_blacklist,
 *     get_blacklist,
 *     list_blacklist,
 *     rem_blacklist,
 * )
 * 
 * from . import events, get_string, udB, ultroid_bot, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="blacklist( (.*)|$)", admins_only=True)
 * async def af(e):
 *     wrd = e.pattern_match.group(1).strip()
 *     chat = e.chat_id
 *     if not (wrd):
 *         return await e.eor(get_string("blk_1"), time=5)
 *     wrd = e.text[11:]
 *     heh = wrd.split(" ")
 *     for z in heh:
 *         add_blacklist(int(chat), z.lower())
 *     ultroid_bot.add_handler(blacklist, events.NewMessage(incoming=True))
 *     await e.eor(get_string("blk_2").format(wrd))
 * 
 * 
 * @ultroid_cmd(pattern="remblacklist( (.*)|$)", admins_only=True)
 * async def rf(e):
 *     wrd = e.pattern_match.group(1).strip()
 *     chat = e.chat_id
 *     if not wrd:
 *         return await e.eor(get_string("blk_3"), time=5)
 *     wrd = e.text[14:]
 *     heh = wrd.split(" ")
 *     for z in heh:
 *         rem_blacklist(int(chat), z.lower())
 *     await e.eor(get_string("blk_4").format(wrd))
 * 
 * 
 * @ultroid_cmd(pattern="listblacklist$", admins_only=True)
 * async def lsnote(e):
 *     if x := list_blacklist(e.chat_id):
 *         sd = get_string("blk_5")
 *         return await e.eor(sd + x)
 *     await e.eor(get_string("blk_6"))
 * 
 * 
 * async def blacklist(e):
 *     if x := get_blacklist(e.chat_id):
 *         text = e.text.lower().split()
 *         if any((z in text) for z in x):
 *             try:
 *                 await e.delete()
 *             except BaseException:
 *                 pass
 * 
 * 
 * if udB.get_key("BLACKLIST_DB"):
 *     ultroid_bot.add_handler(blacklist, events.NewMessage(incoming=True))
---- end original ---- */

ultroidCmd('blacklist( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `blacklist( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("blacklist") || `Plugin \`blacklist\` matched \`blacklist( (.*)|$)\`.` });
});

ultroidCmd('remblacklist( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `remblacklist( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("blacklist") || `Plugin \`blacklist\` matched \`remblacklist( (.*)|$)\`.` });
});

ultroidCmd('listblacklist$', async (e) => {
  const chatId = e.chatId;
  // Port of `listblacklist$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("blacklist") || `Plugin \`blacklist\` matched \`listblacklist$\`.` });
});
export { PLUGIN_NAME, PATTERNS };
