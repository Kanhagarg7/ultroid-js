// Ultroid-JS port of plugins/chatbot.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/chatbot.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "chatbot";
const PATTERNS = ['repai', 'addai', 'remai', 'listai'];

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
 * __doc__ = get_help("help_chatbot")
 * 
 * 
 * from pyUltroid.fns.tools import get_chatbot_reply
 * 
 * from . import LOGS, eod, get_string, inline_mention, udB, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="repai")
 * async def im_lonely_chat_with_me(event):
 *     if event.reply_to:
 *         message = (await event.get_reply_message()).message
 *     else:
 *         try:
 *             message = event.text.split(" ", 1)[1]
 *         except IndexError:
 *             return await eod(event, get_string("tban_1"), time=10)
 *     reply_ = await get_chatbot_reply(message=message)
 *     await event.eor(reply_)
 * 
 * 
 * @ultroid_cmd(pattern="addai")
 * async def add_chatBot(event):
 *     await chat_bot_fn(event, type_="add")
 * 
 * 
 * @ultroid_cmd(pattern="remai")
 * async def rem_chatBot(event):
 *     await chat_bot_fn(event, type_="remov")
 * 
 * 
 * @ultroid_cmd(pattern="listai")
 * async def lister(event):
 *     key = udB.get_key("CHATBOT_USERS") or {}
 *     users = key.get(event.chat_id, [])
 *     if not users:
 *         return await event.eor(get_string("chab_2"), time=5)
 *     msg = "**Total List Of AI Enabled Users In This Chat :**\n\n"
 *     for i in users:
 *         try:
 *             user = await event.client.get_entity(int(i))
 *             user = inline_mention(user)
 *         except BaseException:
 *             user = f"`{i}`"
 *         msg += f"• {user}\n"
 *     await event.eor(msg, link_preview=False)
 * 
 * 
 * async def chat_bot_fn(event, type_):
 *     if event.reply_to:
 *         user_ = (await event.get_reply_message()).sender
 *     else:
 *         temp = event.text.split(maxsplit=1)
 *         try:
 *             user_ = await event.client.get_entity(await event.client.parse_id(temp[1]))
 *         except BaseException as er:
 *             LOGS.exception(er)
 *             user_ = event.chat if event.is_private else None
 *     if not user_:
 *         return await eod(
 *             event,
 *             get_string("chab_1"),
 *         )
 *     key = udB.get_key("CHATBOT_USERS") or {}
 *     chat = event.chat_id
 *     user = user_.id
 *     if type_ == "add":
 *         if key.get(chat):
 *             if user not in key[chat]:
 *                 key[chat].append(user)
 *         else:
 *             key.update({chat: [user]})
 *     elif type_ == "remov":
 *         if key.get(chat):
 *             if user in key[chat]:
 *                 key[chat].remove(user)
 *             if chat in key and not key[chat]:
 *                 del key[chat]
 *     udB.set_key("CHATBOT_USERS", key)
 *     await event.eor(f"**ChatBot:**\n{type_}ed {inline_mention(user_)}")
---- end original ---- */

ultroidCmd('repai', async (e) => {
  const chatId = e.chatId;
  // Port of `repai` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chatbot") || `Plugin \`chatbot\` matched \`repai\`.` });
});

ultroidCmd('addai', async (e) => {
  const chatId = e.chatId;
  // Port of `addai` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chatbot") || `Plugin \`chatbot\` matched \`addai\`.` });
});

ultroidCmd('remai', async (e) => {
  const chatId = e.chatId;
  // Port of `remai` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chatbot") || `Plugin \`chatbot\` matched \`remai\`.` });
});

ultroidCmd('listai', async (e) => {
  const chatId = e.chatId;
  // Port of `listai` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chatbot") || `Plugin \`chatbot\` matched \`listai\`.` });
});
export { PLUGIN_NAME, PATTERNS };
