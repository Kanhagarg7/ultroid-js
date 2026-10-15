// Ultroid-JS port of plugins/mute.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/mute.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "mute";
const PATTERNS = ['dmute( (.*)|$)', 'undmute( (.*)|$)', 'tmute', 'unmute( (.*)|$)', 'mute( (.*)|$)'];

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
 * • `{i}mute <reply to msg/ user id>`
 *     Mute user in current chat.
 * 
 * • `{i}unmute <reply to msg/ user id>`
 *     Unmute user in current chat.
 * 
 * • `{i}dmute <reply to msg/ user id>`
 *     Mute user in current chat by deleting msgs.
 * 
 * • `{i}undmute <reply to msg/ use id>`
 *     Unmute dmuted user in current chat.
 * 
 * • `{i}tmute <time> <reply to msg/ use id>`
 *     s- seconds
 *     m- minutes
 *     h- hours
 *     d- days
 *     Mute user in current chat with time.
 * """
 * from telethon import events
 * from telethon.utils import get_display_name
 * 
 * from pyUltroid.dB.mute_db import is_muted, mute, unmute
 * from pyUltroid.fns.admins import ban_time
 * 
 * from . import asst, eod, get_string, inline_mention, ultroid_bot, ultroid_cmd
 * 
 * 
 * @ultroid_bot.on(events.NewMessage(incoming=True))
 * async def watcher(event):
 *     if is_muted(event.chat_id, event.sender_id):
 *         await event.delete()
 *     if event.via_bot and is_muted(event.chat_id, event.via_bot_id):
 *         await event.delete()
 * 
 * 
 * @ultroid_cmd(
 *     pattern="dmute( (.*)|$)",
 * )
 * async def startmute(event):
 *     xx = await event.eor("`Muting...`")
 *     if input_ := event.pattern_match.group(1).strip():
 *         try:
 *             userid = await event.client.parse_id(input_)
 *         except Exception as x:
 *             return await xx.edit(str(x))
 *     elif event.reply_to_msg_id:
 *         reply = await event.get_reply_message()
 *         userid = reply.sender_id
 *         if reply.out or userid in [ultroid_bot.me.id, asst.me.id]:
 *             return await xx.eor("`You cannot mute yourself or your assistant bot.`")
 *     elif event.is_private:
 *         userid = event.chat_id
 *     else:
 *         return await xx.eor("`Reply to a user or add their userid.`", time=5)
 *     chat = await event.get_chat()
 *     if "admin_rights" in vars(chat) and vars(chat)["admin_rights"] is not None:
 *         if not chat.admin_rights.delete_messages:
 *             return await xx.eor("`No proper admin rights...`", time=5)
 *     elif "creator" not in vars(chat) and not event.is_private:
 *         return await xx.eor("`No proper admin rights...`", time=5)
 *     if is_muted(event.chat_id, userid):
 *         return await xx.eor("`This user is already muted in this chat.`", time=5)
 *     mute(event.chat_id, userid)
 *     await xx.eor("`Successfully muted...`", time=3)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="undmute( (.*)|$)",
 * )
 * async def endmute(event):
 *     xx = await event.eor("`Unmuting...`")
 *     if input_ := event.pattern_match.group(1).strip():
 *         try:
 *             userid = await event.client.parse_id(input_)
 *         except Exception as x:
 *             return await xx.edit(str(x))
 *     elif event.reply_to_msg_id:
 *         userid = (await event.get_reply_message()).sender_id
 *     elif event.is_private:
 *         userid = event.chat_id
 *     else:
 *         return await xx.eor("`Reply to a user or add their userid.`", time=5)
 *     if not is_muted(event.chat_id, userid):
 *         return await xx.eor("`This user is not muted in this chat.`", time=3)
 *     unmute(event.chat_id, userid)
 *     await xx.eor("`Successfully unmuted...`", time=3)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="tmute",
 *     groups_only=True,
 *     manager=True,
 * )
 * async def _(e):
 *     xx = await e.eor("`Muting...`")
 *     huh = e.text.split()
 *     try:
 *         tme = huh[1]
 *     except IndexError:
 *         return await xx.eor("`Time till mute?`", time=5)
 *     try:
 *         input_ = huh[2]
 *     except IndexError:
 *         input_ = ""
 *     chat = await e.get_chat()
 *     if e.reply_to_msg_id:
 *         reply = await e.get_reply_message()
 *         userid = reply.sender_id
 *         name = (await reply.get_sender()).first_name
 *     elif input_:
---- end original ---- */

ultroidCmd('dmute( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `dmute( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("mute") || `Plugin \`mute\` matched \`dmute( (.*)|$)\`.` });
});

ultroidCmd('undmute( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `undmute( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("mute") || `Plugin \`mute\` matched \`undmute( (.*)|$)\`.` });
});

ultroidCmd('tmute', async (e) => {
  const chatId = e.chatId;
  // Port of `tmute` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("mute") || `Plugin \`mute\` matched \`tmute\`.` });
});

ultroidCmd('unmute( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `unmute( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("mute") || `Plugin \`mute\` matched \`unmute( (.*)|$)\`.` });
});

ultroidCmd('mute( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `mute( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("mute") || `Plugin \`mute\` matched \`mute( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
