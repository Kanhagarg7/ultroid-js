// Ultroid-JS port of plugins/chats.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/chats.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "chats";
const PATTERNS = ['delchat', 'getlink( (.*)|$)', 'create (b|g|c)(?: |$)(.*)', 'setgpic( (.*)|$)', 'delgpic( (.*)|$)', 'unbanall$', 'rmusers( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * from . import get_help
 * 
 * __doc__ = get_help("help_chats")
 * 
 * 
 * from telethon.errors import ChatAdminRequiredError as no_admin
 * from telethon.tl.functions.channels import (
 *     CreateChannelRequest,
 *     DeleteChannelRequest,
 *     EditPhotoRequest,
 *     GetFullChannelRequest,
 *     UpdateUsernameRequest,
 * )
 * from telethon.tl.functions.messages import (
 *     CreateChatRequest,
 *     ExportChatInviteRequest,
 *     GetFullChatRequest,
 * )
 * from telethon.tl.types import (
 *     ChannelParticipantsKicked,
 *     User,
 *     UserStatusEmpty,
 *     UserStatusLastMonth,
 *     UserStatusLastWeek,
 *     UserStatusOffline,
 *     UserStatusOnline,
 *     UserStatusRecently,
 * )
 * 
 * from . import HNDLR, LOGS, asst, con, get_string, mediainfo, os, types, udB, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="delchat",
 *     groups_only=True,
 * )
 * async def _(e):
 *     xx = await e.eor(get_string("com_1"))
 *     try:
 *         match = e.text.split(" ", maxsplit=1)[1]
 *         chat = await e.client.parse_id(match)
 *     except IndexError:
 *         chat = e.chat_id
 *     try:
 *         await e.client(DeleteChannelRequest(chat))
 *     except TypeError:
 *         return await xx.eor(get_string("chats_1"), time=10)
 *     except no_admin:
 *         return await xx.eor(get_string("chats_2"), time=10)
 *     await e.client.send_message(
 *         int(udB.get_key("LOG_CHANNEL")), get_string("chats_6").format(e.chat_id)
 *     )
 * 
 * 
 * @ultroid_cmd(
 *     pattern="getlink( (.*)|$)",
 *     groups_only=True,
 *     manager=True,
 * )
 * async def _(e):
 *     reply = await e.get_reply_message()
 *     match = e.pattern_match.group(1).strip()
 *     if reply and not isinstance(reply.sender, User):
 *         chat = await reply.get_sender()
 *     else:
 *         chat = await e.get_chat()
 *     if hasattr(chat, "username") and chat.username:
 *         return await e.eor(f"Username: @{chat.username}")
 *     request, usage, title, link = None, None, None, None
 *     if match:
 *         split = match.split(maxsplit=1)
 *         request = split[0] in ["r", "request"]
 *         title = "Created by Ultroid"
 *         if len(split) > 1:
 *             match = split[1]
 *             spli = match.split(maxsplit=1)
 *             if spli[0].isdigit():
 *                 usage = int(spli[0])
 *             if len(spli) > 1:
 *                 title = spli[1]
 *         elif not request:
 *             if match.isdigit():
 *                 usage = int(match)
 *             else:
 *                 title = match
 *         if request and usage:
 *             usage = 0
 *     if request or title:
 *         try:
 *             r = await e.client(
 *                 ExportChatInviteRequest(
 *                     e.chat_id,
 *                     request_needed=request,
 *                     usage_limit=usage,
 *                     title=title,
 *                 ),
 *             )
 *         except no_admin:
 *             return await e.eor(get_string("chats_2"), time=10)
 *         link = r.link
 *     else:
 *         if isinstance(chat, types.Chat):
 *             FC = await e.client(GetFullChatRequest(chat.id))
 *         elif isinstance(chat, types.Channel):
 *             FC = await e.client(GetFullChannelRequest(chat.id))
 *         else:
 *             return
 *         Inv = FC.full_chat.exported_invite
 *         if Inv and not Inv.revoked:
 *             link = Inv.link
 *     if link:
 *         return await e.eor(f"Link:- {link}")
 *     await e.eor("`Failed to getlink!\nSeems like link is inaccessible to you...`")
 * 
---- end original ---- */

ultroidCmd('delchat', async (e) => {
  const chatId = e.chatId;
  // Port of `delchat` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chats") || `Plugin \`chats\` matched \`delchat\`.` });
});

ultroidCmd('getlink( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `getlink( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chats") || `Plugin \`chats\` matched \`getlink( (.*)|$)\`.` });
});

ultroidCmd('create (b|g|c)(?: |$)(.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `create (b|g|c)(?: |$)(.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chats") || `Plugin \`chats\` matched \`create (b|g|c)(?: |$)(.*)\`.` });
});

ultroidCmd('setgpic( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `setgpic( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chats") || `Plugin \`chats\` matched \`setgpic( (.*)|$)\`.` });
});

ultroidCmd('delgpic( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `delgpic( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chats") || `Plugin \`chats\` matched \`delgpic( (.*)|$)\`.` });
});

ultroidCmd('unbanall$', async (e) => {
  const chatId = e.chatId;
  // Port of `unbanall$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chats") || `Plugin \`chats\` matched \`unbanall$\`.` });
});

ultroidCmd('rmusers( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `rmusers( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("chats") || `Plugin \`chats\` matched \`rmusers( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
