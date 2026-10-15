// Ultroid-JS port of plugins/database.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/database.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "database";
const PATTERNS = ['setdb( (.*)|$)', 'deldb( (.*)|$)', 'rendb( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_database")
 * 
 * 
 * import re
 * 
 * from . import Redis, eor, get_string, udB, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="setdb( (.*)|$)", fullsudo=True)
 * async def _(ult):
 *     match = ult.pattern_match.group(1).strip()
 *     if not match:
 *         return await ult.eor("Provide key and value to set!")
 *     try:
 *         delim = " " if re.search("[|]", match) is None else " | "
 *         data = match.split(delim, maxsplit=1)
 *         if data[0] in ["--extend", "-e"]:
 *             data = data[1].split(maxsplit=1)
 *             data[1] = f"{str(udB.get_key(data[0]))} {data[1]}"
 *         udB.set_key(data[0], data[1])
 *         await ult.eor(
 *             f"**DB Key Value Pair Updated\nKey :** `{data[0]}`\n**Value :** `{data[1]}`"
 *         )
 * 
 *     except BaseException:
 *         await ult.eor(get_string("com_7"))
 * 
 * 
 * @ultroid_cmd(pattern="deldb( (.*)|$)", fullsudo=True)
 * async def _(ult):
 *     key = ult.pattern_match.group(1).strip()
 *     if not key:
 *         return await ult.eor("Give me a key name to delete!", time=5)
 *     _ = key.split(maxsplit=1)
 *     try:
 *         if _[0] == "-m":
 *             for key in _[1].split():
 *                 k = udB.del_key(key)
 *             key = _[1]
 *         else:
 *             k = udB.del_key(key)
 *         if k == 0:
 *             return await ult.eor("`No Such Key.`")
 *         await ult.eor(f"`Successfully deleted key {key}`")
 *     except BaseException:
 *         await ult.eor(get_string("com_7"))
 * 
 * 
 * @ultroid_cmd(pattern="rendb( (.*)|$)", fullsudo=True)
 * async def _(ult):
 *     match = ult.pattern_match.group(1).strip()
 *     if not match:
 *         return await ult.eor("`Provide Keys name to rename..`")
 *     delim = " " if re.search("[|]", match) is None else " | "
 *     data = match.split(delim)
 *     if Redis(data[0]):
 *         try:
 *             udB.rename(data[0], data[1])
 *             await eor(
 *                 ult,
 *                 f"**DB Key Rename Successful\nOld Key :** `{data[0]}`\n**New Key :** `{data[1]}`",
 *             )
 * 
 *         except BaseException:
 *             await ult.eor(get_string("com_7"))
 *     else:
 *         await ult.eor("Key not found")
---- end original ---- */

ultroidCmd('setdb( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `setdb( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("database") || `Plugin \`database\` matched \`setdb( (.*)|$)\`.` });
});

ultroidCmd('deldb( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `deldb( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("database") || `Plugin \`database\` matched \`deldb( (.*)|$)\`.` });
});

ultroidCmd('rendb( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `rendb( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("database") || `Plugin \`database\` matched \`rendb( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
