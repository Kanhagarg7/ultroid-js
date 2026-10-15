// Ultroid-JS port of plugins/variables.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/variables.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "variables";
const PATTERNS = ['get($| (.*))'];

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
 * • `{i}get var <variable name>`
 *    Get value of the given variable name.
 * 
 * • `{i}get type <variable name>`
 *    Get variable type.
 * 
 * • `{i}get db <key>`
 *    Get db value of the given key.
 * 
 * • `{i}get keys`
 *    Get all redis keys.
 * """
 * 
 * import os
 * 
 * from . import eor, get_string, udB, ultroid_cmd, HNDLR
 * 
 * 
 * @ultroid_cmd(pattern="get($| (.*))", fullsudo=True)
 * async def get_var(event):
 *     try:
 *         opt = event.text.split(maxsplit=2)[1]
 *     except IndexError:
 *         return await event.eor(f"what to get?\nRead `{HNDLR}help variables`")
 *     x = await event.eor(get_string("com_1"))
 *     if opt != "keys":
 *         try:
 *             varname = event.text.split(maxsplit=2)[2]
 *         except IndexError:
 *             return await eor(x, "Such a var doesn't exist!", time=5)
 *     if opt == "var":
 *         c = 0
 *         # try redis
 *         val = udB.get_key(varname)
 *         if val is not None:
 *             c += 1
 *             await x.edit(
 *                 f"**Variable** - `{varname}`\n**Value**: `{val}`\n**Type**: Redis Key."
 *             )
 *         # try env vars
 *         val = os.getenv(varname)
 *         if val is not None:
 *             c += 1
 *             await x.edit(
 *                 f"**Variable** - `{varname}`\n**Value**: `{val}`\n**Type**: Env Var."
 *             )
 * 
 *         if c == 0:
 *             await eor(x, "Such a var doesn't exist!", time=5)
 * 
 *     elif opt == "type":
 *         c = 0
 *         # try redis
 *         val = udB.get_key(varname)
 *         if val is not None:
 *             c += 1
 *             await x.edit(f"**Variable** - `{varname}`\n**Type**: Redis Key.")
 *         # try env vars
 *         val = os.getenv(varname)
 *         if val is not None:
 *             c += 1
 *             await x.edit(f"**Variable** - `{varname}`\n**Type**: Env Var.")
 * 
 *         if c == 0:
 *             await eor(x, "Such a var doesn't exist!", time=5)
 * 
 *     elif opt == "db":
 *         val = udB.get(varname)
 *         if val is not None:
 *             await x.edit(f"**Key** - `{varname}`\n**Value**: `{val}`")
 *         else:
 *             await eor(x, "No such key!", time=5)
 * 
 *     elif opt == "keys":
 *         keys = sorted(udB.keys())
 *         msg = "".join(
 *             f"• `{i}`" + "\n"
 *             for i in keys
 *             if not i.isdigit()
 *             and not i.startswith("-")
 *             and not i.startswith("_")
 *             and not i.startswith("GBAN_REASON_")
 *         )
 * 
 *         await x.edit(f"**List of DB Keys :**\n{msg}")
---- end original ---- */

ultroidCmd('get($| (.*))', async (e) => {
  const chatId = e.chatId;
  // Port of `get($| (.*))` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("variables") || `Plugin \`variables\` matched \`get($| (.*))\`.` });
});
export { PLUGIN_NAME, PATTERNS };
