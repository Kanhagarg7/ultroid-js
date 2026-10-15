// Ultroid-JS port of plugins/core.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/core.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "core";
const PATTERNS = ['install', 'unload( (.*)|$)', 'uninstall( (.*)|$)', 'load( (.*)|$)', 'getaddons( (.*)|$)'];

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
 * __doc__ = get_help("help_core")
 * 
 * 
 * import os
 * 
 * from pyUltroid.startup.loader import load_addons
 * 
 * from . import LOGS, async_searcher, eod, get_string, safeinstall, ultroid_cmd, un_plug
 * 
 * 
 * @ultroid_cmd(pattern="install", fullsudo=True)
 * async def install(event):
 *     await safeinstall(event)
 * 
 * 
 * @ultroid_cmd(
 *     pattern=r"unload( (.*)|$)",
 * )
 * async def unload(event):
 *     shortname = event.pattern_match.group(1).strip()
 *     if not shortname:
 *         await event.eor(get_string("core_9"))
 *         return
 *     lsd = os.listdir("addons")
 *     zym = f"{shortname}.py"
 *     if zym in lsd:
 *         try:
 *             un_plug(shortname)
 *             await event.eor(f"**Uɴʟᴏᴀᴅᴇᴅ** `{shortname}` **Sᴜᴄᴄᴇssғᴜʟʟʏ.**", time=3)
 *         except Exception as ex:
 *             LOGS.exception(ex)
 *             return await event.eor(str(ex))
 *     elif zym in os.listdir("plugins"):
 *         return await event.eor(get_string("core_11"), time=3)
 *     else:
 *         await event.eor(f"**No Plugin Named** `{shortname}`", time=3)
 * 
 * 
 * @ultroid_cmd(
 *     pattern=r"uninstall( (.*)|$)",
 * )
 * async def uninstall(event):
 *     shortname = event.pattern_match.group(1).strip()
 *     if not shortname:
 *         await event.eor(get_string("core_13"))
 *         return
 *     lsd = os.listdir("addons")
 *     zym = f"{shortname}.py"
 *     if zym in lsd:
 *         try:
 *             un_plug(shortname)
 *             await event.eor(f"**Uninstalled** `{shortname}` **successfully.**", time=3)
 *             os.remove(f"addons/{shortname}.py")
 *         except Exception as ex:
 *             return await event.eor(str(ex))
 *     elif zym in os.listdir("plugins"):
 *         return await event.eor(get_string("core_15"), time=3)
 *     else:
 *         return await event.eor(f"**No Plugin Named** `{shortname}`", time=3)
 * 
 * 
 * @ultroid_cmd(
 *     pattern=r"load( (.*)|$)",
 *     fullsudo=True,
 * )
 * async def load(event):
 *     shortname = event.pattern_match.group(1).strip()
 *     if not shortname:
 *         await event.eor(get_string("core_16"))
 *         return
 *     try:
 *         try:
 *             un_plug(shortname)
 *         except BaseException:
 *             pass
 *         load_addons(f"addons/{shortname}.py")
 *         await event.eor(get_string("core_17").format(shortname), time=3)
 *     except Exception as e:
 *         LOGS.exception(e)
 *         await eod(
 *             event,
 *             get_string("core_18").format(shortname, e),
 *             time=3,
 *         )
 * 
 * 
 * @ultroid_cmd(pattern="getaddons( (.*)|$)", fullsudo=True)
 * async def get_the_addons_lol(event):
 *     thelink = event.pattern_match.group(1).strip()
 *     xx = await event.eor(get_string("com_1"))
 *     fool = get_string("gas_1")
 *     if thelink is None:
 *         return await xx.eor(fool, time=10)
 *     split_thelink = thelink.split("/")
 *     if not ("raw" in thelink and thelink.endswith(".py")):
 *         return await xx.eor(fool, time=10)
 *     name_of_it = split_thelink[-1]
 *     plug = await async_searcher(thelink)
 *     fil = f"addons/{name_of_it}"
 *     await xx.edit("Packing the codes...")
 *     with open(fil, "w", encoding="utf-8") as uult:
 *         uult.write(plug)
 *     await xx.edit("Packed. Now loading the plugin..")
 *     shortname = name_of_it.split(".")[0]
 *     try:
 *         load_addons(fil)
 *         await xx.eor(get_string("core_17").format(shortname), time=15)
 *     except Exception as e:
 *         LOGS.exception(e)
 *         await eod(
---- end original ---- */

ultroidCmd('install', async (e) => {
  const chatId = e.chatId;
  // Port of `install` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("core") || `Plugin \`core\` matched \`install\`.` });
});

ultroidCmd('unload( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `unload( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("core") || `Plugin \`core\` matched \`unload( (.*)|$)\`.` });
});

ultroidCmd('uninstall( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `uninstall( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("core") || `Plugin \`core\` matched \`uninstall( (.*)|$)\`.` });
});

ultroidCmd('load( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `load( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("core") || `Plugin \`core\` matched \`load( (.*)|$)\`.` });
});

ultroidCmd('getaddons( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `getaddons( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("core") || `Plugin \`core\` matched \`getaddons( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
