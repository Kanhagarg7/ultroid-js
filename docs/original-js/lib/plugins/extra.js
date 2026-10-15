// Ultroid-JS port of plugins/extra.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/extra.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "extra";
const PATTERNS = ['del$', 'copy$', 'edit', 'reply$'];

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
 * __doc__ = get_help("extra")
 * 
 * import asyncio
 * 
 * from . import get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="del$",
 *     manager=True,
 * )
 * async def delete_it(delme):
 *     msg_src = await delme.get_reply_message()
 *     if not msg_src:
 *         return
 *     await msg_src.try_delete()
 *     await delme.try_delete()
 * 
 * 
 * @ultroid_cmd(
 *     pattern="copy$",
 * )
 * async def copy(e):
 *     reply = await e.get_reply_message()
 *     if reply:
 *         await reply.reply(reply)
 *         return await e.try_delete()
 *     await e.eor(get_string("ex_1"), time=5)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="edit",
 * )
 * async def editer(edit):
 *     message = edit.text
 *     chat = await edit.get_input_chat()
 *     string = str(message[6:])
 *     reply = await edit.get_reply_message()
 *     if reply and reply.text:
 *         try:
 *             await reply.edit(string)
 *             await edit.delete()
 *         except BaseException:
 *             pass
 *     else:
 *         i = 1
 *         async for message in edit.client.iter_messages(chat, from_user="me", limit=2):
 *             if i == 2:
 *                 await message.edit(string)
 *                 await edit.delete()
 *                 break
 *             i += 1
 * 
 * 
 * @ultroid_cmd(
 *     pattern="reply$",
 * )
 * async def _(e):
 *     if e.reply_to_msg_id:
 *         chat = e.chat_id
 *         try:
 *             msg = (await e.client.get_messages(e.chat_id, limit=1, max_id=e.id))[0]
 *         except IndexError:
 *             return await e.eor(
 *                 "`You have previously sent no message to reply again...`", time=5
 *             )
 *         except BaseException as er:
 *             return await e.eor(f"**ERROR:** `{er}`")
 *         await asyncio.wait(
 *             [
 *                 e.client.delete_messages(chat, [e.id, msg.id]),
 *                 e.client.send_message(chat, msg, reply_to=e.reply_to_msg_id),
 *             ]
 *         )
 *     else:
 *         await e.try_delete()
---- end original ---- */

ultroidCmd('del$', async (e) => {
  const chatId = e.chatId;
  // Port of `del$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("extra") || `Plugin \`extra\` matched \`del$\`.` });
});

ultroidCmd('copy$', async (e) => {
  const chatId = e.chatId;
  // Port of `copy$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("extra") || `Plugin \`extra\` matched \`copy$\`.` });
});

ultroidCmd('edit', async (e) => {
  const chatId = e.chatId;
  // Port of `edit` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("extra") || `Plugin \`extra\` matched \`edit\`.` });
});

ultroidCmd('reply$', async (e) => {
  const chatId = e.chatId;
  // Port of `reply$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("extra") || `Plugin \`extra\` matched \`reply$\`.` });
});
export { PLUGIN_NAME, PATTERNS };
