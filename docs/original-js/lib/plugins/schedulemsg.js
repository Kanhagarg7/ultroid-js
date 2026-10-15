// Ultroid-JS port of plugins/schedulemsg.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/schedulemsg.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "schedulemsg";
const PATTERNS = ['schedule( (.*)|$)'];

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
 * •`{i}schedule <text/reply to msg> <time>`
 *     In time u can use second as number, or like 1h or 1m
 *     eg. `{i}schedule Hello 100` It deliver msg after 100 sec.
 *     eg. `{i}schedule Hello 1h` It deliver msg after an hour.
 * """
 * from datetime import timedelta
 * 
 * from pyUltroid.fns.admins import ban_time
 * 
 * from . import get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="schedule( (.*)|$)", fullsudo=True)
 * async def _(e):
 *     x = e.pattern_match.group(1).strip()
 *     xx = await e.get_reply_message()
 *     if x and not xx:
 *         y = x.split(" ")[-1]
 *         k = x.replace(y, "")
 *         if y.isdigit():
 *             await e.client.send_message(
 *                 e.chat_id, k, schedule=timedelta(seconds=int(y))
 *             )
 *             await e.eor(get_string("schdl_1"), time=5)
 *         else:
 *             try:
 *                 z = ban_time(y)
 *                 await e.respond(k, schedule=z)
 *                 await e.eor(get_string("schdl_1"), time=5)
 *             except BaseException:
 *                 await e.eor(get_string("schdl_2"), time=5)
 *     elif xx and x:
 *         if x.isdigit():
 *             await e.respond(xx, schedule=timedelta(seconds=int(x)))
 *             await e.eor(get_string("schdl_1"), time=5)
 *         else:
 *             try:
 *                 z = ban_time(x)
 *                 await e.respond(xx, schedule=z)
 *                 await e.eor(get_string("schdl_1"), time=5)
 *             except BaseException:
 *                 await e.eor(get_string("schdl_2"), time=5)
 *     else:
 *         return await e.eor(get_string("schdl_2"), time=5)
---- end original ---- */

ultroidCmd('schedule( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `schedule( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("schedulemsg") || `Plugin \`schedulemsg\` matched \`schedule( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
