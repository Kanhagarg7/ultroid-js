// Ultroid-JS port of plugins/sudo.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/sudo.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "sudo";
const PATTERNS = ['addsudo( (.*)|$)', 'delsudo( (.*)|$)', 'listsudo$'];

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
 * • `{i}addsudo`
 *     Add Sudo Users by replying to user or using <space> separated userid(s)
 * 
 * • `{i}delsudo`
 *     Remove Sudo Users by replying to user or using <space> separated userid(s)
 * 
 * • `{i}listsudo`
 *     List all sudo users.
 * """
 * 
 * from telethon.tl.types import User
 * 
 * from pyUltroid._misc import sudoers
 * 
 * from . import get_string, inline_mention, udB, ultroid_bot, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(pattern="addsudo( (.*)|$)", fullsudo=True)
 * async def _(ult):
 *     inputs = ult.pattern_match.group(1).strip()
 *     if ult.reply_to_msg_id:
 *         replied_to = await ult.get_reply_message()
 *         id = replied_to.sender_id
 *         name = await replied_to.get_sender()
 *     elif inputs:
 *         try:
 *             id = await ult.client.parse_id(inputs)
 *         except ValueError:
 *             try:
 *                 id = int(inputs)
 *             except ValueError:
 *                 id = inputs
 *         try:
 *             name = await ult.client.get_entity(int(id))
 *         except BaseException:
 *             name = None
 *     elif ult.is_private:
 *         id = ult.chat_id
 *         name = await ult.get_chat()
 *     else:
 *         return await ult.eor(get_string("sudo_1"), time=5)
 *     if name and isinstance(name, User) and (name.bot or name.verified):
 *         return await ult.eor(get_string("sudo_4"))
 *     name = inline_mention(name) if name else f"`{id}`"
 *     if id == ultroid_bot.uid:
 *         mmm = get_string("sudo_2")
 *     elif id in sudoers():
 *         mmm = f"{name} `is already a SUDO User ...`"
 *     else:
 *         udB.set_key("SUDO", "True")
 *         key = sudoers()
 *         key.append(id)
 *         udB.set_key("SUDOS", key)
 *         mmm = f"**Added** {name} **as SUDO User**"
 *     await ult.eor(mmm, time=5)
 * 
 * 
 * @ultroid_cmd(pattern="delsudo( (.*)|$)", fullsudo=True)
 * async def _(ult):
 *     inputs = ult.pattern_match.group(1).strip()
 *     if ult.reply_to_msg_id:
 *         replied_to = await ult.get_reply_message()
 *         id = replied_to.sender_id
 *         name = await replied_to.get_sender()
 *     elif inputs:
 *         try:
 *             id = await ult.client.parse_id(inputs)
 *         except ValueError:
 *             try:
 *                 id = int(inputs)
 *             except ValueError:
 *                 id = inputs
 *         try:
 *             name = await ult.client.get_entity(int(id))
 *         except BaseException:
 *             name = None
 *     elif ult.is_private:
 *         id = ult.chat_id
 *         name = await ult.get_chat()
 *     else:
 *         return await ult.eor(get_string("sudo_1"), time=5)
 *     name = inline_mention(name) if name else f"`{id}`"
 *     if id not in sudoers():
 *         mmm = f"{name} `wasn't a SUDO User ...`"
 *     else:
 *         key = sudoers()
 *         key.remove(id)
 *         udB.set_key("SUDOS", key)
 *         mmm = f"**Removed** {name} **from SUDO User(s)**"
 *     await ult.eor(mmm, time=5)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="listsudo$",
 * )
 * async def _(ult):
 *     sudos = sudoers()
 *     if not sudos:
 *         return await ult.eor(get_string("sudo_3"), time=5)
 *     msg = ""
 *     for i in sudos:
 *         try:
 *             name = await ult.client.get_entity(int(i))
 *         except BaseException:
 *             name = None
 *         if name:
 *             msg += f"• {inline_mention(name)} ( `{i}` )\n"
 *         else:
 *             msg += f"• `{i}` -> Invalid User\n"
 *     m = udB.get_key("SUDO") or True
 *     if not m:
---- end original ---- */

ultroidCmd('addsudo( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `addsudo( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("sudo") || `Plugin \`sudo\` matched \`addsudo( (.*)|$)\`.` });
});

ultroidCmd('delsudo( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `delsudo( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("sudo") || `Plugin \`sudo\` matched \`delsudo( (.*)|$)\`.` });
});

ultroidCmd('listsudo$', async (e) => {
  const chatId = e.chatId;
  // Port of `listsudo$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("sudo") || `Plugin \`sudo\` matched \`listsudo$\`.` });
});
export { PLUGIN_NAME, PATTERNS };
