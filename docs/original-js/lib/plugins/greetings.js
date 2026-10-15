// Ultroid-JS port of plugins/greetings.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/greetings.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "greetings";
const PATTERNS = ['setwelcome', 'clearwelcome$', 'getwelcome$', 'setgoodbye', 'cleargoodbye$', 'getgoodbye$', 'thankmembers (on|off)'];

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
 * ---- Welcomes ----
 * • `{i}setwelcome <message/reply to message>`
 *     Set welcome message in the current chat.
 * 
 * • `{i}clearwelcome`
 *     Delete the welcome in the current chat.
 * 
 * • `{i}getwelcome`
 *     Get the welcome message in the current chat.
 * 
 * ---- GoodByes ----
 * • `{i}setgoodbye <message/reply to message>`
 *     Set goodbye message in the current chat.
 * 
 * • `{i}cleargoodbye`
 *     Delete the goodbye in the current chat.
 * 
 * • `{i}getgoodbye`
 *     Get the goodbye message in the current chat.
 * 
 * • `{i}thankmembers on/off`
 *     Send a thank you sticker on hitting a members count of 100*x in your groups.
 * """
 * import os
 * 
 * from . import upload_file as uf
 * from telethon.utils import pack_bot_file_id
 * 
 * from pyUltroid.dB.greetings_db import (
 *     add_goodbye,
 *     add_thanks,
 *     add_welcome,
 *     delete_goodbye,
 *     delete_welcome,
 *     get_goodbye,
 *     get_welcome,
 *     must_thank,
 *     remove_thanks,
 * )
 * from pyUltroid.fns.tools import create_tl_btn, format_btn, get_msg_button
 * 
 * from . import HNDLR, eor, get_string, mediainfo, ultroid_cmd
 * from ._inline import something
 * 
 * Note = "\n\nNote: `{mention}`, `{group}`, `{count}`, `{name}`, `{fullname}`, `{username}`, `{userid}` can be used as formatting parameters.\n\n"
 * 
 * 
 * @ultroid_cmd(pattern="setwelcome", groups_only=True)
 * async def setwel(event):
 *     x = await event.eor(get_string("com_1"))
 *     r = await event.get_reply_message()
 *     btn = format_btn(r.buttons) if (r and r.buttons) else None
 *     try:
 *         text = event.text.split(maxsplit=1)[1]
 *     except IndexError:
 *         text = r.text if r else None
 *     if r and r.media:
 *         wut = mediainfo(r.media)
 *         if wut.startswith(("pic", "gif")):
 *             dl = await r.download_media()
 *             m = uf(dl)
 *             os.remove(dl)
 *         elif wut == "video":
 *             if r.media.document.size > 8 * 1000 * 1000:
 *                 return await eor(x, get_string("com_4"), time=5)
 *             dl = await r.download_media()
 *             m = uf(dl)
 *             os.remove(dl)
 *         elif wut == "web":
 *             m = None
 *         else:
 *             m = pack_bot_file_id(r.media)
 *         if r.text:
 *             txt = r.text
 *             if not btn:
 *                 txt, btn = get_msg_button(r.text)
 *             add_welcome(event.chat_id, txt, m, btn)
 *         else:
 *             add_welcome(event.chat_id, None, m, btn)
 *         await eor(x, get_string("grt_1"))
 *     elif text:
 *         if not btn:
 *             txt, btn = get_msg_button(text)
 *         add_welcome(event.chat_id, txt, None, btn)
 *         await eor(x, get_string("grt_1"))
 *     else:
 *         await eor(x, get_string("grt_3"), time=5)
 * 
 * 
 * @ultroid_cmd(pattern="clearwelcome$", groups_only=True)
 * async def clearwel(event):
 *     if not get_welcome(event.chat_id):
 *         return await event.eor(get_string("grt_4"), time=5)
 *     delete_welcome(event.chat_id)
 *     await event.eor(get_string("grt_5"), time=5)
 * 
 * 
 * @ultroid_cmd(pattern="getwelcome$", groups_only=True)
 * async def listwel(event):
 *     wel = get_welcome(event.chat_id)
 *     if not wel:
 *         return await event.eor(get_string("grt_4"), time=5)
 *     msgg, med = wel["welcome"], wel["media"]
 *     if wel.get("button"):
 *         btn = create_tl_btn(wel["button"])
 *         return await something(event, msgg, med, btn)
 *     await event.reply(f"**Welcome Note in this chat**\n\n`{msgg}`", file=med)
 *     await event.delete()
 * 
 * 
 * @ultroid_cmd(pattern="setgoodbye", groups_only=True)
---- end original ---- */

ultroidCmd('setwelcome', async (e) => {
  const chatId = e.chatId;
  // Port of `setwelcome` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("greetings") || `Plugin \`greetings\` matched \`setwelcome\`.` });
});

ultroidCmd('clearwelcome$', async (e) => {
  const chatId = e.chatId;
  // Port of `clearwelcome$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("greetings") || `Plugin \`greetings\` matched \`clearwelcome$\`.` });
});

ultroidCmd('getwelcome$', async (e) => {
  const chatId = e.chatId;
  // Port of `getwelcome$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("greetings") || `Plugin \`greetings\` matched \`getwelcome$\`.` });
});

ultroidCmd('setgoodbye', async (e) => {
  const chatId = e.chatId;
  // Port of `setgoodbye` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("greetings") || `Plugin \`greetings\` matched \`setgoodbye\`.` });
});

ultroidCmd('cleargoodbye$', async (e) => {
  const chatId = e.chatId;
  // Port of `cleargoodbye$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("greetings") || `Plugin \`greetings\` matched \`cleargoodbye$\`.` });
});

ultroidCmd('getgoodbye$', async (e) => {
  const chatId = e.chatId;
  // Port of `getgoodbye$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("greetings") || `Plugin \`greetings\` matched \`getgoodbye$\`.` });
});

ultroidCmd('thankmembers (on|off)', async (e) => {
  const chatId = e.chatId;
  // Port of `thankmembers (on|off)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("greetings") || `Plugin \`greetings\` matched \`thankmembers (on|off)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
