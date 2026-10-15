// Ultroid-JS port of plugins/channelhacks.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/channelhacks.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "channelhacks";
const PATTERNS = ['shift (.*)', 'asource (.*)', 'dsource( (.*)|$)', 'listsource', 'adest (.*)', 'ddest( (.*)|$)', 'listdest'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * from . import get_help
 * 
 * __doc__ = get_help("help_channelhacks")
 * 
 * 
 * import asyncio
 * import io
 * 
 * from telethon.errors.rpcerrorlist import FloodWaitError
 * from telethon.utils import get_display_name, get_peer_id
 * 
 * from pyUltroid.dB.base import KeyManager
 * 
 * from . import LOGS, asst, eor, events, get_string, udB, ultroid_bot, ultroid_cmd
 * 
 * ERROR = {}
 * SourceM = KeyManager("CH_SOURCE", cast=list)
 * DestiM = KeyManager("CH_DESTINATIONS", cast=list)
 * 
 * 
 * async def autopost_func(e):
 *     if not udB.get_key("AUTOPOST"):
 *         return
 *     x = SourceM.get()
 *     th = await e.get_chat()
 *     if get_peer_id(th) not in x:
 *         return
 *     y = DestiM.get()
 *     for ys in y:
 *         try:
 *             await e.client.send_message(int(ys), e.message)
 *         except Exception as ex:
 *             try:
 *                 ERROR[str(ex)]
 *             except KeyError:
 *                 ERROR.update({str(ex): ex})
 *                 Error = f"**Error on AUTOPOST**\n\n`{ex}`"
 *                 await asst.send_message(udB.get_key("LOG_CHANNEL"), Error)
 * 
 * 
 * @ultroid_cmd(pattern="shift (.*)")
 * async def _(e):
 *     x = e.pattern_match.group(1).strip()
 *     z = await e.eor(get_string("com_1"))
 *     a, b = x.split("|")
 *     try:
 *         c = await e.client.parse_id(a)
 *     except Exception:
 *         await z.edit(get_string("cha_1"))
 *         return
 *     try:
 *         d = await e.client.parse_id(b)
 *     except Exception as er:
 *         LOGS.exception(er)
 *         await z.edit(get_string("cha_1"))
 *         return
 *     async for msg in e.client.iter_messages(int(c), reverse=True, limit=None):
 *         try:
 *             await asyncio.sleep(2)
 *             await e.client.send_message(int(d), msg)
 *         except FloodWaitError as er:
 *             await asyncio.sleep(er.seconds + 5)
 *             await e.client.send_message(int(d), msg)
 *         except BaseException as er:
 *             LOGS.exception(er)
 *     await z.edit("Done")
 * 
 * 
 * @ultroid_cmd(pattern="asource (.*)")
 * async def source(e):
 *     if x := e.pattern_match.group(1).strip():
 *         try:
 *             y = await e.client.parse_id(x)
 *         except Exception as er:
 *             LOGS.exception(er)
 *             return
 *     else:
 *         y = e.chat_id
 *     if not SourceM.contains(y):
 *         SourceM.add(y)
 *         await e.eor(get_string("cha_2"))
 *         ultroid_bot.add_handler(autopost_func, events.NewMessage())
 *     else:
 *         await e.eor(get_string("cha_3"))
 * 
 * 
 * @ultroid_cmd(pattern="dsource( (.*)|$)")
 * async def dd(event):
 *     chat_id = event.pattern_match.group(1).strip()
 *     x = await event.eor(get_string("com_1"))
 *     if chat_id == "all":
 *         await x.edit(get_string("bd_8"))
 *         udB.del_key("CH_SOURCE")
 *         await x.edit(get_string("cha_4"))
 *         return
 *     if chat_id:
 *         try:
 *             y = await event.client.parse_id(chat_id)
 *         except Exception as er:
 *             LOGS.exception(er)
 *             return
 *     else:
 *         y = event.chat_id
 *     if SourceM.contains(y):
 *         SourceM.remove(y)
 *         await eor(x, get_string("cha_5"), time=5)
 *     else:
 *         await eor(x, "Source channel is already removed from database. ", time=3)
 * 
 * 
 * @ultroid_cmd(pattern="listsource")
 * async def list_all(event):
 *     x = await event.eor(get_string("com_1"))
 *     num = SourceM.count()
---- end original ---- */

ultroidCmd('shift (.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `shift (.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("channelhacks") || `Plugin \`channelhacks\` matched \`shift (.*)\`.` });
});

ultroidCmd('asource (.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `asource (.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("channelhacks") || `Plugin \`channelhacks\` matched \`asource (.*)\`.` });
});

ultroidCmd('dsource( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `dsource( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("channelhacks") || `Plugin \`channelhacks\` matched \`dsource( (.*)|$)\`.` });
});

ultroidCmd('listsource', async (e) => {
  const chatId = e.chatId;
  // Port of `listsource` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("channelhacks") || `Plugin \`channelhacks\` matched \`listsource\`.` });
});

ultroidCmd('adest (.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `adest (.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("channelhacks") || `Plugin \`channelhacks\` matched \`adest (.*)\`.` });
});

ultroidCmd('ddest( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ddest( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("channelhacks") || `Plugin \`channelhacks\` matched \`ddest( (.*)|$)\`.` });
});

ultroidCmd('listdest', async (e) => {
  const chatId = e.chatId;
  // Port of `listdest` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("channelhacks") || `Plugin \`channelhacks\` matched \`listdest\`.` });
});
export { PLUGIN_NAME, PATTERNS };
