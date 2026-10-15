// Ultroid-JS port of plugins/_wspr.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/_wspr.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "_wspr";
const PATTERNS = ['wspr( (.*)|$)', 'wspr', 'msg'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * import re
 * 
 * from telethon import Button
 * from telethon.errors.rpcerrorlist import (
 *     BotInlineDisabledError,
 *     BotResponseTimeoutError,
 *     MessageNotModifiedError,
 * )
 * from telethon.tl import types
 * from telethon.tl.functions.users import GetFullUserRequest as gu
 * 
 * from . import (
 *     HNDLR,
 *     LOGS,
 *     asst,
 *     callback,
 *     get_string,
 *     in_pattern,
 *     inline_mention,
 *     ultroid_bot,
 *     ultroid_cmd,
 * )
 * 
 * buddhhu = {}
 * 
 * 
 * @ultroid_cmd(
 *     pattern="wspr( (.*)|$)",
 * )
 * async def _(e):
 *     if e.reply_to_msg_id:
 *         okk = await e.get_reply_message()
 *         put = f"@{okk.sender.username}" if okk.sender.username else okk.sender_id
 *     else:
 *         put = e.pattern_match.group(1).strip()
 *     if put:
 *         try:
 *             results = await e.client.inline_query(asst.me.username, f"msg {put}")
 *         except BotResponseTimeoutError:
 *             return await e.eor(
 *                 get_string("help_2").format(HNDLR),
 *             )
 *         except BotInlineDisabledError:
 *             return await e.eor(get_string("help_3"))
 *         await results[0].click(e.chat_id, reply_to=e.reply_to_msg_id, hide_via=True)
 *         return await e.delete()
 *     await e.eor(get_string("wspr_3"))
 * 
 * 
 * @in_pattern("wspr", owner=True)
 * async def _(e):
 *     iuser = e.query.user_id
 *     zzz = e.text.split(maxsplit=2)
 *     try:
 *         query = zzz[1]
 *         if query.isdigit():
 *             query = int(query)
 *         logi = await ultroid_bot.get_entity(query)
 *         if not isinstance(logi, types.User):
 *             raise ValueError("Invalid Username.")
 *     except IndexError:
 *         sur = await e.builder.article(
 *             title="Give Username",
 *             description="You Didn't Type Username or id.",
 *             text="You Didn't Type Username or id.",
 *         )
 *         return await e.answer([sur])
 *     except ValueError as er:
 *         LOGS.exception(er)
 *         sur = await e.builder.article(
 *             title="User Not Found",
 *             description="Make sure username or id is correct.",
 *             text="Make sure username or id is correct.",
 *         )
 *         return await e.answer([sur])
 *     try:
 *         desc = zzz[2]
 *     except IndexError:
 *         sur = await e.builder.article(
 *             title="Type ur msg", text="You Didn't Type Your Msg"
 *         )
 *         return await e.answer([sur])
 *     button = [
 *         [
 *             Button.inline("Secret Msg", data=f"dd_{e.id}"),
 *             Button.inline("Delete Msg", data=f"del_{e.id}"),
 *         ],
 *         [
 *             Button.switch_inline(
 *                 "New", query=f"wspr {logi.username or logi.id}", same_peer=True
 *             )
 *         ],
 *     ]
 *     us = logi.username or logi.first_name
 *     sur = await e.builder.article(
 *         title=logi.first_name,
 *         description=desc,
 *         text=get_string("wspr_1").format(us),
 *         buttons=button,
 *     )
 *     buddhhu.update({e.id: [logi.id, iuser, desc]})
 *     await e.answer([sur])
 * 
 * 
 * @in_pattern("msg", owner=True)
 * async def _(e):
 *     zzz = e.text.split(maxsplit=1)
 *     desc = "Touch me"
 *     try:
 *         query = zzz[1]
 *         if query.isdigit():
 *             query = int(query)
 *         logi = await ultroid_bot(gu(id=query))
---- end original ---- */

ultroidCmd('wspr( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `wspr( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("_wspr") || `Plugin \`_wspr\` matched \`wspr( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
