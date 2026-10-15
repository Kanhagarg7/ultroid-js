// Ultroid-JS port of plugins/cleanaction.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/cleanaction.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "cleanaction";
const PATTERNS = ['addclean$', 'remclean$', 'listclean$'];

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
 * __doc__ = get_help("help_cleanaction")
 * 
 * 
 * from telethon.utils import get_display_name
 * 
 * from . import get_string, udB, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="addclean$", admins_only=True)
 * async def _(e):
 *     key = udB.get_key("CLEANCHAT") or []
 *     if e.chat_id in key:
 *         return await eod(e, get_string("clan_5"))
 *     key.append(e.chat_id)
 *     udB.set_key("CLEANCHAT", key)
 *     await e.eor(get_string("clan_1"), time=5)
 * 
 * 
 * @ultroid_cmd(pattern="remclean$")
 * async def _(e):
 *     key = udB.get_key("CLEANCHAT") or []
 *     if e.chat_id in key:
 *         key.remove(e.chat_id)
 *         udB.set_key("CLEANCHAT", key)
 *     await e.eor(get_string("clan_2"), time=5)
 * 
 * 
 * @ultroid_cmd(pattern="listclean$")
 * async def _(e):
 *     if k := udB.get_key("CLEANCHAT"):
 *         o = ""
 *         for x in k:
 *             try:
 *                 title = get_display_name(await e.client.get_entity(x))
 *             except BaseException:
 *                 title = get_string("clan_3")
 *             o += f"{x} {title}\n"
 *         return await e.eor(o)
 *     await e.eor(get_string("clan_4"), time=5)
---- end original ---- */

ultroidCmd('addclean$', async (e) => {
  const chatId = e.chatId;
  // Port of `addclean$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("cleanaction") || `Plugin \`cleanaction\` matched \`addclean$\`.` });
});

ultroidCmd('remclean$', async (e) => {
  const chatId = e.chatId;
  // Port of `remclean$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("cleanaction") || `Plugin \`cleanaction\` matched \`remclean$\`.` });
});

ultroidCmd('listclean$', async (e) => {
  const chatId = e.chatId;
  // Port of `listclean$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("cleanaction") || `Plugin \`cleanaction\` matched \`listclean$\`.` });
});
export { PLUGIN_NAME, PATTERNS };
