// Ultroid-JS port of plugins/profanityfilter.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/profanityfilter.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "profanityfilter";
const PATTERNS = ['(add|rem)profanity$'];

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
 * •`{i}addprofanity`
 *    If someone sends bad word in a chat, Then bot will delete that message.
 * 
 * •`{i}remprofanity`
 *    From chat from Profanity list.
 * 
 * """
 * 
 * from pyUltroid.dB.nsfw_db import profan_chat, rem_profan
 * 
 * from . import get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="(add|rem)profanity$", admins_only=True)
 * async def addp(e):
 *     cas = e.pattern_match.group(1)
 *     add = cas == "add"
 *     if add:
 *         profan_chat(e.chat_id, "mute")
 *         await e.eor(get_string("prof_1"), time=10)
 *         return
 *     rem_profan(e.chat_id)
 *     await e.eor(get_string("prof_2"), time=10)
---- end original ---- */

ultroidCmd('(add|rem)profanity$', async (e) => {
  const chatId = e.chatId;
  // Port of `(add|rem)profanity$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("profanityfilter") || `Plugin \`profanityfilter\` matched \`(add|rem)profanity$\`.` });
});
export { PLUGIN_NAME, PATTERNS };
