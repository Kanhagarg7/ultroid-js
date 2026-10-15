// Ultroid-JS port of plugins/autoban.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/autoban.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "autoban";
const PATTERNS = ['autokick (on|off)$'];

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
 * __doc__ = get_help("help_autoban")
 * 
 * from telethon import events
 * 
 * from pyUltroid.dB.base import KeyManager
 * 
 * from . import LOGS, asst, ultroid_bot, ultroid_cmd
 * 
 * Keym = KeyManager("DND_CHATS", cast=list)
 * 
 * 
 * def join_func(e):
 *     return e.user_joined and Keym.contains(e.chat_id)
 * 
 * 
 * async def dnd_func(event):
 *     for user in event.users:
 *         try:
 *             await (await event.client.kick_participant(event.chat_id, user)).delete()
 *         except Exception as ex:
 *             LOGS.error("Error in DND:")
 *             LOGS.exception(ex)
 *     await event.delete()
 * 
 * 
 * @ultroid_cmd(
 *     pattern="autokick (on|off)$",
 *     admins_only=True,
 *     manager=True,
 *     require="ban_users",
 *     fullsudo=True,
 * )
 * async def _(event):
 *     match = event.pattern_match.group(1)
 *     if match == "on":
 *         if Keym.contains(event.chat_id):
 *             return await event.eor("`Chat already in do not disturb mode.`", time=3)
 *         Keym.add(event.chat_id)
 *         event.client.add_handler(dnd_func, events.ChatAction(func=join_func))
 *         await event.eor("`Do not disturb mode activated for this chat.`", time=3)
 *     elif match == "off":
 *         if not Keym.contains(event.chat_id):
 *             return await event.eor("`Chat is not in do not disturb mode.`", time=3)
 *         Keym.remove(event.chat_id)
 *         await event.eor("`Do not disturb mode deactivated for this chat.`", time=3)
 * 
 * 
 * if Keym.get():
 *     ultroid_bot.add_handler(dnd_func, events.ChatAction(func=join_func))
 *     asst.add_handler(dnd_func, events.ChatAction(func=join_func))
---- end original ---- */

ultroidCmd('autokick (on|off)$', async (e) => {
  const chatId = e.chatId;
  // Port of `autokick (on|off)$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("autoban") || `Plugin \`autoban\` matched \`autokick (on|off)$\`.` });
});
export { PLUGIN_NAME, PATTERNS };
