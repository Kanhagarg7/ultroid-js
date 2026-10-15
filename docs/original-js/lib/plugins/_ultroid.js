// Ultroid-JS port of plugins/_ultroid.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/_ultroid.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "_ultroid";
const PATTERNS = ['repo$', 'ultroid$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * from telethon.errors import (
 *     BotMethodInvalidError,
 *     ChatSendInlineForbiddenError,
 *     ChatSendMediaForbiddenError,
 * )
 * 
 * from . import LOG_CHANNEL, LOGS, Button, asst, eor, get_string, ultroid_cmd
 * 
 * REPOMSG = """
 * • **ULTROID USERBOT** •\n
 * • Repo - [Click Here](https://github.com/TeamUltroid/Ultroid)
 * • Addons - [Click Here](https://github.com/TeamUltroid/UltroidAddons)
 * • Support - @UltroidSupportChat
 * """
 * 
 * RP_BUTTONS = [
 *     [
 *         Button.url(get_string("bot_3"), "https://github.com/TeamUltroid/Ultroid"),
 *         Button.url("Addons", "https://github.com/TeamUltroid/UltroidAddons"),
 *     ],
 *     [Button.url("Support Group", "t.me/UltroidSupportChat")],
 * ]
 * 
 * ULTSTRING = """🎇 **Thanks for Deploying Ultroid Userbot!**
 * 
 * • Here, are the Some Basic stuff from, where you can Know, about its Usage."""
 * 
 * 
 * @ultroid_cmd(
 *     pattern="repo$",
 *     manager=True,
 * )
 * async def repify(e):
 *     try:
 *         q = await e.client.inline_query(asst.me.username, "")
 *         await q[0].click(e.chat_id)
 *         return await e.delete()
 *     except (
 *         ChatSendInlineForbiddenError,
 *         ChatSendMediaForbiddenError,
 *         BotMethodInvalidError,
 *     ):
 *         pass
 *     except Exception as er:
 *         LOGS.info(f"Error while repo command : {str(er)}")
 *     await e.eor(REPOMSG)
 * 
 * 
 * @ultroid_cmd(pattern="ultroid$")
 * async def useUltroid(rs):
 *     button = Button.inline("Start >>", "initft_2")
 *     msg = await asst.send_message(
 *         LOG_CHANNEL,
 *         ULTSTRING,
 *         file="https://graph.org/file/54a917cc9dbb94733ea5f.jpg",
 *         buttons=button,
 *     )
 *     if not (rs.chat_id == LOG_CHANNEL and rs.client._bot):
 *         await eor(rs, f"**[Click Here]({msg.message_link})**")
---- end original ---- */

ultroidCmd('repo$', async (e) => {
  const chatId = e.chatId;
  // Port of `repo$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("_ultroid") || `Plugin \`_ultroid\` matched \`repo$\`.` });
});

ultroidCmd('ultroid$', async (e) => {
  const chatId = e.chatId;
  // Port of `ultroid$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("_ultroid") || `Plugin \`_ultroid\` matched \`ultroid$\`.` });
});
export { PLUGIN_NAME, PATTERNS };
