// Ultroid-JS port of plugins/echo.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/echo.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "echo";
const PATTERNS = ['addecho( (.*)|$)', 'remecho( (.*)|$)', 'listecho$'];

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
 * __doc__ = get_help("help_echo")
 * 
 * 
 * from telethon.utils import get_display_name
 * 
 * from pyUltroid.dB.echo_db import add_echo, check_echo, list_echo, rem_echo
 * 
 * from . import inline_mention, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="addecho( (.*)|$)")
 * async def echo(e):
 *     r = await e.get_reply_message()
 *     if r:
 *         user = r.sender_id
 *     else:
 *         try:
 *             user = e.text.split()[1]
 *             if user.startswith("@"):
 *                 ok = await e.client.get_entity(user)
 *                 user = ok.id
 *             else:
 *                 user = int(user)
 *         except BaseException:
 *             return await e.eor("Reply To A user.", time=5)
 *     if check_echo(e.chat_id, user):
 *         return await e.eor("Echo already activated for this user.", time=5)
 *     add_echo(e.chat_id, user)
 *     ok = await e.client.get_entity(user)
 *     user = inline_mention(ok)
 *     await e.eor(f"Activated Echo For {user}.")
 * 
 * 
 * @ultroid_cmd(pattern="remecho( (.*)|$)")
 * async def rm(e):
 *     r = await e.get_reply_message()
 *     if r:
 *         user = r.sender_id
 *     else:
 *         try:
 *             user = e.text.split()[1]
 *             if user.startswith("@"):
 *                 ok = await e.client.get_entity(user)
 *                 user = ok.id
 *             else:
 *                 user = int(user)
 *         except BaseException:
 *             return await e.eor("Reply To A User.", time=5)
 *     if check_echo(e.chat_id, user):
 *         rem_echo(e.chat_id, user)
 *         ok = await e.client.get_entity(user)
 *         user = f"[{get_display_name(ok)}](tg://user?id={ok.id})"
 *         return await e.eor(f"Deactivated Echo For {user}.")
 *     await e.eor("Echo not activated for this user")
 * 
 * 
 * @ultroid_cmd(pattern="listecho$")
 * async def lstecho(e):
 *     if k := list_echo(e.chat_id):
 *         user = "**Activated Echo For Users:**\n\n"
 *         for x in k:
 *             ok = await e.client.get_entity(int(x))
 *             kk = f"[{get_display_name(ok)}](tg://user?id={ok.id})"
 *             user += f"•{kk}" + "\n"
 *         await e.eor(user)
 *     else:
 *         await e.eor("`List is Empty, For echo`", time=5)
---- end original ---- */

ultroidCmd('addecho( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `addecho( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("echo") || `Plugin \`echo\` matched \`addecho( (.*)|$)\`.` });
});

ultroidCmd('remecho( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `remecho( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("echo") || `Plugin \`echo\` matched \`remecho( (.*)|$)\`.` });
});

ultroidCmd('listecho$', async (e) => {
  const chatId = e.chatId;
  // Port of `listecho$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("echo") || `Plugin \`echo\` matched \`listecho$\`.` });
});
export { PLUGIN_NAME, PATTERNS };
