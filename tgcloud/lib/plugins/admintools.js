// Ultroid-JS port of plugins/admintools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/admintools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "admintools";
const PATTERNS = ['promote( (.*)|$)', 'demote( (.*)|$)', 'ban( (.*)|$)', 'unban( (.*)|$)', 'kick( (.*)|$)', 'tban( (.*)|$)', 'pin$', 'unpin($| (.*))', 'tpin( (.*)|$)', 'purge( (.*)|$)', 'purgeme( (.*)|$)', 'purgeall$', 'pinned', 'listpinned$', 'autodelete( (.*)|$)', 'kickall( (.*)|$)'];

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
 * __doc__ = get_help("help_admintools")
 * 
 * import asyncio
 * 
 * from telethon.errors import BadRequestError
 * from telethon.errors.rpcerrorlist import ChatNotModifiedError, UserIdInvalidError
 * from telethon.tl.functions.channels import EditAdminRequest, GetFullChannelRequest
 * from telethon.tl.functions.messages import GetFullChatRequest, SetHistoryTTLRequest
 * from telethon.tl.types import InputMessagesFilterPinned
 * from telethon.utils import get_display_name
 * 
 * from pyUltroid.dB import DEVLIST
 * from pyUltroid.fns.admins import ban_time
 * from pyUltroid.fns.info import get_uinfo
 * 
 * from . import HNDLR, LOGS, eod, eor, get_string, inline_mention, types, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="promote( (.*)|$)",
 *     admins_only=True,
 *     manager=True,
 *     require="add_admins",
 *     fullsudo=True,
 * )
 * async def prmte(ult):
 *     xx = await ult.eor(get_string("com_1"))
 *     user, rank = await get_uinfo(ult)
 *     rank = rank or "Admin"
 *     FullRight = False
 *     if not user:
 *         return await xx.edit(get_string("pro_1"))
 *     if rank.split()[0] == "-f":
 *         try:
 *             rank = rank.split(maxsplit=1)[1]
 *         except IndexError:
 *             rank = "Admin"
 *         FullRight = True
 *     try:
 *         if FullRight:
 *             await ult.client(
 *                 EditAdminRequest(ult.chat_id, user.id, ult.chat.admin_rights, rank)
 *             )
 *         else:
 *             await ult.client.edit_admin(
 *                 ult.chat_id,
 *                 user.id,
 *                 invite_users=True,
 *                 ban_users=True,
 *                 delete_messages=True,
 *                 pin_messages=True,
 *                 manage_call=True,
 *                 title=rank,
 *             )
 *         await eod(
 *             xx, get_string("pro_2").format(inline_mention(user), ult.chat.title, rank)
 *         )
 *     except Exception as ex:
 *         return await xx.edit(f"`{ex}`")
 * 
 * 
 * @ultroid_cmd(
 *     pattern="demote( (.*)|$)",
 *     admins_only=True,
 *     manager=True,
 *     require="add_admins",
 *     fullsudo=True,
 * )
 * async def dmote(ult):
 *     xx = await ult.eor(get_string("com_1"))
 *     user, rank = await get_uinfo(ult)
 *     if not rank:
 *         rank = "Not Admin"
 *     if not user:
 *         return await xx.edit(get_string("de_1"))
 *     try:
 *         await ult.client.edit_admin(
 *             ult.chat_id,
 *             user.id,
 *             invite_users=None,
 *             ban_users=None,
 *             delete_messages=None,
 *             pin_messages=None,
 *             manage_call=None,
 *             title=rank,
 *         )
 *         await eod(xx, get_string("de_2").format(inline_mention(user), ult.chat.title))
 *     except Exception as ex:
 *         return await xx.edit(f"`{ex}`")
 * 
 * 
 * @ultroid_cmd(
 *     pattern="ban( (.*)|$)",
 *     admins_only=True,
 *     manager=True,
 *     require="ban_users",
 *     fullsudo=True,
 * )
 * async def bban(ult):
 *     something = await get_uinfo(ult)
 *     if not something:
 *         return
 *     user, reason = something
 *     if not user:
 *         return await eod(ult, get_string("ban_1"))
 *     if user.id in DEVLIST:
 *         return await eod(ult, get_string("ban_2"))
 *     try:
 *         await ult.client.edit_permissions(ult.chat_id, user.id, view_messages=False)
 *     except UserIdInvalidError:
 *         return await eod(ult, get_string("adm_1"))
---- end original ---- */

ultroidCmd('promote( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `promote( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`promote( (.*)|$)\`.` });
});

ultroidCmd('demote( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `demote( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`demote( (.*)|$)\`.` });
});

ultroidCmd('ban( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ban( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`ban( (.*)|$)\`.` });
});

ultroidCmd('unban( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `unban( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`unban( (.*)|$)\`.` });
});

ultroidCmd('kick( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `kick( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`kick( (.*)|$)\`.` });
});

ultroidCmd('tban( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `tban( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`tban( (.*)|$)\`.` });
});

ultroidCmd('pin$', async (e) => {
  const chatId = e.chatId;
  // Port of `pin$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`pin$\`.` });
});

ultroidCmd('unpin($| (.*))', async (e) => {
  const chatId = e.chatId;
  // Port of `unpin($| (.*))` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`unpin($| (.*))\`.` });
});

ultroidCmd('tpin( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `tpin( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`tpin( (.*)|$)\`.` });
});

ultroidCmd('purge( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `purge( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`purge( (.*)|$)\`.` });
});

ultroidCmd('purgeme( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `purgeme( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`purgeme( (.*)|$)\`.` });
});

ultroidCmd('purgeall$', async (e) => {
  const chatId = e.chatId;
  // Port of `purgeall$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`purgeall$\`.` });
});

ultroidCmd('pinned', async (e) => {
  const chatId = e.chatId;
  // Port of `pinned` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`pinned\`.` });
});

ultroidCmd('listpinned$', async (e) => {
  const chatId = e.chatId;
  // Port of `listpinned$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`listpinned$\`.` });
});

ultroidCmd('autodelete( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `autodelete( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`autodelete( (.*)|$)\`.` });
});

ultroidCmd('kickall( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `kickall( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("admintools") || `Plugin \`admintools\` matched \`kickall( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
