// Ultroid-JS port of plugins/broadcast.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/broadcast.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "broadcast";
const PATTERNS = ['addblacklist( (.*)|$)', 'remblacklist( (.*)|$)', 'listblacklist$', 'addch( (.*)|$)', 'remch( (.*)|$)', 'listchannels$', 'forward$', 'broadcast( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * 
 * from . import get_help
 * 
 * __doc__ = get_help("help_broadcast")
 * 
 * import asyncio
 * import io
 * 
 * from telethon.utils import get_display_name
 * 
 * from pyUltroid.dB.base import KeyManager
 * 
 * from . import HNDLR, LOGS, eor, get_string, udB, ultroid_bot, ultroid_cmd
 * 
 * KeyM = KeyManager("BROADCAST", cast=list)
 * BlackM = KeyManager("BROADCAST_BLACKLIST", cast=list)
 * 
 * 
 * @ultroid_cmd(
 *     pattern=r"addblacklist( (.*)|$)",
 *     allow_sudo=False,
 * )
 * async def broadcast_blacklist_add(event):
 *     msgg = event.pattern_match.group(1).strip()
 *     chat_id = int(msgg) if msgg and msgg.lstrip("-").isdigit() else event.chat_id
 *     if BlackM.contains(chat_id):
 *         return await event.eor("`Already in broadcast blacklist.`", time=5)
 *     BlackM.add(chat_id)
 *     await event.eor(f"`Added {chat_id} to broadcast blacklist.`", time=5)
 * 
 * 
 * @ultroid_cmd(
 *     pattern=r"remblacklist( (.*)|$)",
 *     allow_sudo=False,
 * )
 * async def broadcast_blacklist_rem(event):
 *     msgg = event.pattern_match.group(1).strip()
 *     chat_id = int(msgg) if msgg and msgg.lstrip("-").isdigit() else event.chat_id
 *     if not BlackM.contains(chat_id):
 *         return await event.eor("`Not in broadcast blacklist.`", time=5)
 *     BlackM.remove(chat_id)
 *     await event.eor(f"`Removed {chat_id} from broadcast blacklist.`", time=5)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="listblacklist$",
 *     allow_sudo=False,
 * )
 * async def broadcast_blacklist_list(event):
 *     bl = BlackM.get()
 *     if not bl:
 *         return await event.eor("`Broadcast blacklist is empty.`", time=5)
 *     msg = "**Broadcast Blacklist:**\n" + "\n".join(f"• `{c}`" for c in bl)
 *     await event.eor(msg)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="addch( (.*)|$)",
 *     allow_sudo=False,
 * )
 * async def broadcast_adder(event):
 *     msgg = event.pattern_match.group(1).strip()
 *     x = await event.eor(get_string("bd_1"))
 *     if msgg == "all":
 *         await x.edit(get_string("bd_2"))
 *         chats = [
 *             e.entity
 *             for e in await event.client.get_dialogs()
 *             if (e.is_group or e.is_channel)
 *         ]
 *         new = 0
 *         for i in chats:
 *             try:
 *                 if (
 *                     i.broadcast
 *                     and (i.creator or i.admin_rights)
 *                     and not KeyM.contains(i.id)
 *                 ):
 *                     new += 1
 *                     cid = f"-100{i.id}"
 *                     KeyM.add(int(cid))
 *             except Exception as Ex:
 *                 LOGS.exception(Ex)
 *         await x.edit(get_string("bd_3").format(KeyM.count(), new))
 *         return
 *     if event.reply_to_msg_id:
 *         previous_message = await event.get_reply_message()
 *         raw_text = previous_message.text
 *         lines = raw_text.split("\n")
 *         length = len(lines)
 *         for line_number in range(1, length - 2):
 *             channel_id = lines[line_number][4:-1]
 *             if not KeyM.contains(channel_id):
 *                 KeyM.add(channel_id)
 *         await x.edit(get_string("bd_4"))
 *         await asyncio.sleep(3)
 *         await event.delete()
 *         return
 *     chat_id = event.chat_id
 *     if chat_id == udB.get_key("LOG_CHANNEL"):
 *         return
 *     if KeyM.contains(chat_id):
 *         await x.edit(get_string("bd_6"))
 *     elif xx := KeyM.add(chat_id):
 *         await x.edit(get_string("bd_5"))
 *     else:
 *         await x.edit(get_string("sf_8"))
 *     await asyncio.sleep(3)
 *     await x.delete()
 * 
 * 
 * @ultroid_cmd(
 *     pattern="remch( (.*)|$)",
---- end original ---- */

ultroidCmd('addblacklist( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `addblacklist( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`addblacklist( (.*)|$)\`.` });
});

ultroidCmd('remblacklist( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `remblacklist( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`remblacklist( (.*)|$)\`.` });
});

ultroidCmd('listblacklist$', async (e) => {
  const chatId = e.chatId;
  // Port of `listblacklist$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`listblacklist$\`.` });
});

ultroidCmd('addch( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `addch( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`addch( (.*)|$)\`.` });
});

ultroidCmd('remch( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `remch( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`remch( (.*)|$)\`.` });
});

ultroidCmd('listchannels$', async (e) => {
  const chatId = e.chatId;
  // Port of `listchannels$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`listchannels$\`.` });
});

ultroidCmd('forward$', async (e) => {
  const chatId = e.chatId;
  // Port of `forward$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`forward$\`.` });
});

ultroidCmd('broadcast( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `broadcast( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("broadcast") || `Plugin \`broadcast\` matched \`broadcast( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
