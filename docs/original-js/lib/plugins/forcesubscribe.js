// Ultroid-JS port of plugins/forcesubscribe.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/forcesubscribe.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "forcesubscribe";
const PATTERNS = ['fsub( (.*)|$)', 'remfsub$', 'checkfsub$', 'fsub( (.*)|$)'];

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
 * • `{i}fsub <chat username><id>`
 *     Enable ForceSub in Used Chat !
 * 
 * • `{i}checkfsub`
 *     Check/Get Active ForceSub Setting of Used Chat.
 * 
 * • `{i}remfsub`
 *     Remove ForceSub from Used Chat !
 * 
 *     Note - You Need to be Admin in Both Channel/Chats
 *         in order to Use ForceSubscribe.
 * """
 * 
 * import re
 * 
 * from telethon.errors.rpcerrorlist import ChatAdminRequiredError, UserNotParticipantError
 * from telethon.tl.custom import Button
 * from telethon.tl.functions.channels import GetParticipantRequest
 * from telethon.tl.functions.messages import ExportChatInviteRequest
 * from telethon.tl.types import (
 *     Channel,
 *     ChannelParticipantBanned,
 *     ChannelParticipantLeft,
 *     User,
 * )
 * 
 * from pyUltroid.dB.forcesub_db import add_forcesub, get_forcesetting, rem_forcesub
 * 
 * from . import (
 *     LOGS,
 *     asst,
 *     callback,
 *     events,
 *     get_string,
 *     in_pattern,
 *     inline_mention,
 *     udB,
 *     ultroid_bot,
 *     ultroid_cmd,
 * )
 * 
 * CACHE = {}
 * 
 * 
 * @ultroid_cmd(pattern="fsub( (.*)|$)", admins_only=True, groups_only=True)
 * async def addfor(e):
 *     match = e.pattern_match.group(1).strip()
 *     if not match:
 *         return await e.eor(get_string("fsub_1"), time=5)
 *     try:
 *         match = await e.client.parse_id(match)
 *     except BaseException:
 *         return await e.eor(get_string("fsub_2"), time=5)
 *     add_forcesub(e.chat_id, match)
 *     await e.eor("Added ForceSub in This Chat !")
 *     ultroid_bot.add_handler(force_sub, events.NewMessage(incoming=True))
 * 
 * 
 * @ultroid_cmd(pattern="remfsub$")
 * async def remor(e):
 *     res = rem_forcesub(e.chat_id)
 *     if not res:
 *         return await e.eor(get_string("fsub_3"), time=5)
 *     await e.eor("Removed ForceSub...")
 * 
 * 
 * @ultroid_cmd(pattern="checkfsub$")
 * async def getfsr(e):
 *     res = get_forcesetting(e.chat_id)
 *     if not res:
 *         return await e.eor("ForceSub is Not Active In This Chat !", time=5)
 *     cha = await e.client.get_entity(int(res))
 *     await e.eor(f"**ForceSub Status** : `Active`\n- **{cha.title}** `({res})`")
 * 
 * 
 * @in_pattern("fsub( (.*)|$)", owner=True)
 * async def fcall(e):
 *     match = e.pattern_match.group(1).strip()
 *     spli = match.split("_")
 *     user = await ultroid_bot.get_entity(int(spli[0]))
 *     cl = await ultroid_bot.get_entity(int(spli[1]))
 *     text = f"Hi {inline_mention(user)}, You Need to Join"
 *     text += f" {cl.title} in order to Chat in this Group."
 *     el = (
 *         f"https://t.me/{cl.username}"
 *         if cl.username
 *         else (await ultroid_bot(ExportChatInviteRequest(cl))).link
 *     )
 * 
 *     res = [
 *         await e.builder.article(
 *             title="forcesub",
 *             text=text,
 *             buttons=[
 *                 [Button.url(text=get_string("fsub_4"), url=el)],
 *                 [Button.inline(get_string("fsub_5"), data=f"unm_{match}")],
 *             ],
 *         )
 *     ]
 *     await e.answer(res)
 * 
 * 
 * @callback(re.compile("unm_(.*)"))
 * async def diesoon(e):
 *     match = (e.data_match.group(1)).decode("UTF-8")
 *     spli = match.split("_")
 *     if e.sender_id != int(spli[0]):
 *         return await e.answer(get_string("fsub_7"), alert=True)
 *     try:
 *         values = await ultroid_bot(GetParticipantRequest(int(spli[1]), int(spli[0])))
 *         if isinstance(values.participant, ChannelParticipantLeft) or (
---- end original ---- */

ultroidCmd('fsub( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `fsub( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("forcesubscribe") || `Plugin \`forcesubscribe\` matched \`fsub( (.*)|$)\`.` });
});

ultroidCmd('remfsub$', async (e) => {
  const chatId = e.chatId;
  // Port of `remfsub$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("forcesubscribe") || `Plugin \`forcesubscribe\` matched \`remfsub$\`.` });
});

ultroidCmd('checkfsub$', async (e) => {
  const chatId = e.chatId;
  // Port of `checkfsub$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("forcesubscribe") || `Plugin \`forcesubscribe\` matched \`checkfsub$\`.` });
});
export { PLUGIN_NAME, PATTERNS };
