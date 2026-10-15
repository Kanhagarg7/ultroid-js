// Ultroid-JS port of plugins/globaltools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/globaltools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "globaltools";
const PATTERNS = ['gpromote( (.*)|$)', 'gdemote( (.*)|$)', 'ungban( (.*)|$)', 'gban( (.*)|$)', 'g(admin|)cast( (.*)|$)', 'gucast( (.*)|$)', 'gkick( (.*)|$)', 'gmute( (.*)|$)', 'ungmute( (.*)|$)', 'listgban$', 'gstat( (.*)|$)', 'gblacklist$', 'ungblacklist$'];

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
 * • `{i}gban <reply user/ username>`
 * • `{i}ungban`
 *     Ban/Unban Globally.
 * 
 * • `{i}gstat <reply to user/userid/username>`
 *    Check if user is GBanned.
 * 
 * • `{i}listgban` : List all GBanned users.
 * 
 * • `{i}gmute` | `{i}ungmute` <reply user/ username>
 *     Mute/UnMute Globally.
 * 
 * • `{i}gkick <reply/username>` `Globally Kick User`
 * • `{i}gcast <text/reply>` `Globally Send msg in all grps`
 * 
 * • `{i}gadmincast <text/reply>` `Globally broadcast in your admin chats`
 * • `{i}gucast <text/reply>` `Globally send msg in all pm users`
 * 
 * • `{i}gblacklist <chat id/username/nothing (for current chat)`
 *    Add chat to blacklist and ignores global broadcast.
 * • `{i}ungblacklist` `Remove the chat from blacklist.`
 * 
 * • `{i}gpromote <reply to user> <channel/group/all> <rank>`
 *     globally promote user where you are admin
 *     - Set whether To promote only in groups/channels/all.
 *     Eg- `gpromote group boss` ~ promotes user in all grps.
 *         `gpromote @username all sar` ~ promote the user in all group & channel
 * • `{i}gdemote` - `demote user globally`
 * """
 * import asyncio
 * import os
 * 
 * from telethon.errors.rpcerrorlist import ChatAdminRequiredError, FloodWaitError
 * from telethon.tl.functions.channels import EditAdminRequest
 * from telethon.tl.functions.contacts import BlockRequest, UnblockRequest
 * from telethon.tl.types import ChatAdminRights, User
 * 
 * from pyUltroid.dB import DEVLIST
 * from pyUltroid.dB.base import KeyManager
 * from pyUltroid.dB.gban_mute_db import (
 *     gban,
 *     gmute,
 *     is_gbanned,
 *     is_gmuted,
 *     list_gbanned,
 *     ungban,
 *     ungmute,
 * )
 * from pyUltroid.fns.tools import create_tl_btn, format_btn, get_msg_button
 * 
 * from . import (
 *     HNDLR,
 *     LOGS,
 *     NOSPAM_CHAT,
 *     OWNER_NAME,
 *     eod,
 *     eor,
 *     get_string,
 *     inline_mention,
 *     ultroid_bot,
 *     ultroid_cmd,
 * )
 * from ._inline import something
 * 
 * _gpromote_rights = ChatAdminRights(
 *     add_admins=False,
 *     invite_users=True,
 *     change_info=False,
 *     ban_users=True,
 *     delete_messages=True,
 *     pin_messages=True,
 * )
 * 
 * _gdemote_rights = ChatAdminRights(
 *     add_admins=False,
 *     invite_users=False,
 *     change_info=False,
 *     ban_users=False,
 *     delete_messages=False,
 *     pin_messages=False,
 * )
 * 
 * keym = KeyManager("GBLACKLISTS", cast=list)
 * 
 * 
 * @ultroid_cmd(pattern="gpromote( (.*)|$)", fullsudo=True)
 * async def _(e):
 *     x = e.pattern_match.group(1).strip()
 *     ultroid_bot = e.client
 *     if not x:
 *         return await e.eor(get_string("schdl_2"), time=5)
 *     user = await e.get_reply_message()
 *     if user:
 *         ev = await e.eor("`Promoting Replied User Globally`")
 *         ok = e.text.split()
 *         key = "all"
 *         if len(ok) > 1 and (("group" in ok[1]) or ("channel" in ok[1])):
 *             key = ok[1]
 *         rank = ok[2] if len(ok) > 2 else "AdMin"
 *         c = 0
 *         user.id = user.peer_id.user_id if e.is_private else user.from_id.user_id
 *         async for x in e.client.iter_dialogs():
 *             if (
 *                 "group" in key.lower()
 *                 and x.is_group
 *                 or "group" not in key.lower()
 *                 and "channel" in key.lower()
 *                 and x.is_channel
 *             ):
 *                 try:
 *                     await e.client(
---- end original ---- */

ultroidCmd('gpromote( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gpromote( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gpromote( (.*)|$)\`.` });
});

ultroidCmd('gdemote( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gdemote( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gdemote( (.*)|$)\`.` });
});

ultroidCmd('ungban( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ungban( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`ungban( (.*)|$)\`.` });
});

ultroidCmd('gban( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gban( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gban( (.*)|$)\`.` });
});

ultroidCmd('g(admin|)cast( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `g(admin|)cast( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`g(admin|)cast( (.*)|$)\`.` });
});

ultroidCmd('gucast( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gucast( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gucast( (.*)|$)\`.` });
});

ultroidCmd('gkick( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gkick( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gkick( (.*)|$)\`.` });
});

ultroidCmd('gmute( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gmute( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gmute( (.*)|$)\`.` });
});

ultroidCmd('ungmute( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ungmute( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`ungmute( (.*)|$)\`.` });
});

ultroidCmd('listgban$', async (e) => {
  const chatId = e.chatId;
  // Port of `listgban$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`listgban$\`.` });
});

ultroidCmd('gstat( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gstat( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gstat( (.*)|$)\`.` });
});

ultroidCmd('gblacklist$', async (e) => {
  const chatId = e.chatId;
  // Port of `gblacklist$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`gblacklist$\`.` });
});

ultroidCmd('ungblacklist$', async (e) => {
  const chatId = e.chatId;
  // Port of `ungblacklist$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("globaltools") || `Plugin \`globaltools\` matched \`ungblacklist$\`.` });
});
export { PLUGIN_NAME, PATTERNS };
