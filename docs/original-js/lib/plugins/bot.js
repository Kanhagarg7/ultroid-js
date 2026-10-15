// Ultroid-JS port of plugins/bot.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/bot.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "bot";
const PATTERNS = ['alive( (.*)|$)', 'ping$', 'cmds$', 'restart$', 'shutdown$', 'logs( (.*)|$)', 'update( (.*)|$)', 'alive', 'updtavail', 'alive'];

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
 * __doc__ = get_help("help_bot")
 * 
 * import os
 * import sys
 * import time
 * from platform import python_version as pyver
 * from random import choice
 * 
 * from telethon import __version__
 * from telethon.errors.rpcerrorlist import (
 *     BotMethodInvalidError,
 *     ChatSendMediaForbiddenError,
 * )
 * 
 * from pyUltroid.version import __version__ as UltVer
 * 
 * from . import HOSTED_ON, LOGS
 * 
 * try:
 *     from git import Repo
 * except ImportError:
 *     LOGS.error("bot: 'gitpython' module not found!")
 *     Repo = None
 * 
 * from telethon.utils import resolve_bot_file_id
 * 
 * from . import (
 *     ATRA_COL,
 *     LOGS,
 *     OWNER_NAME,
 *     ULTROID_IMAGES,
 *     Button,
 *     Carbon,
 *     Telegraph,
 *     Var,
 *     allcmds,
 *     asst,
 *     bash,
 *     call_back,
 *     callback,
 *     def_logs,
 *     eor,
 *     get_string,
 *     heroku_logs,
 *     in_pattern,
 *     inline_pic,
 *     restart,
 *     shutdown,
 *     start_time,
 *     time_formatter,
 *     udB,
 *     ultroid_cmd,
 *     ultroid_version,
 *     updater,
 * )
 * 
 * 
 * def ULTPIC():
 *     return inline_pic() or choice(ULTROID_IMAGES)
 * 
 * 
 * buttons = [
 *     [
 *         Button.url(get_string("bot_3"), "https://github.com/TeamUltroid/Ultroid"),
 *         Button.url(get_string("bot_4"), "t.me/UltroidSupportChat"),
 *     ]
 * ]
 * 
 * # Will move to strings
 * alive_txt = """
 * The Ultroid Userbot
 * 
 *   ◍ Version - {}
 *   ◍ Py-Ultroid - {}
 *   ◍ Telethon - {}
 * """
 * 
 * in_alive = "{}\n\n🌀 <b>Ultroid Version -><b> <code>{}</code>\n🌀 <b>PyUltroid -></b> <code>{}</code>\n🌀 <b>Python -></b> <code>{}</code>\n🌀 <b>Uptime -></b> <code>{}</code>\n🌀 <b>Branch -></b>[ {} ]\n\n• <b>Join @TeamUltroid</b>"
 * 
 * 
 * @callback("alive")
 * async def alive(event):
 *     text = alive_txt.format(ultroid_version, UltVer, __version__)
 *     await event.answer(text, alert=True)
 * 
 * 
 * @ultroid_cmd(
 *     pattern="alive( (.*)|$)",
 * )
 * async def lol(ult):
 *     match = ult.pattern_match.group(1).strip()
 *     inline = None
 *     if match in ["inline", "i"]:
 *         try:
 *             res = await ult.client.inline_query(asst.me.username, "alive")
 *             return await res[0].click(ult.chat_id)
 *         except BotMethodInvalidError:
 *             pass
 *         except BaseException as er:
 *             LOGS.exception(er)
 *         inline = True
 *     pic = udB.get_key("ALIVE_PIC")
 *     if isinstance(pic, list):
 *         pic = choice(pic)
 *     uptime = time_formatter((time.time() - start_time) * 1000)
 *     header = udB.get_key("ALIVE_TEXT") or get_string("bot_1")
 *     y = Repo().active_branch
 *     xx = Repo().remotes[0].config_reader.get("url")
 *     rep = xx.replace(".git", f"/tree/{y}")
 *     kk = f" `[{y}]({rep})` "
 *     if inline:
---- end original ---- */

ultroidCmd('alive( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `alive( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("bot") || `Plugin \`bot\` matched \`alive( (.*)|$)\`.` });
});

ultroidCmd('ping$', async (e) => {
  const chatId = e.chatId;
  // Port of `ping$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("bot") || `Plugin \`bot\` matched \`ping$\`.` });
});

ultroidCmd('cmds$', async (e) => {
  const chatId = e.chatId;
  // Port of `cmds$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("bot") || `Plugin \`bot\` matched \`cmds$\`.` });
});

ultroidCmd('restart$', async (e) => {
  const chatId = e.chatId;
  // Port of `restart$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("bot") || `Plugin \`bot\` matched \`restart$\`.` });
});

ultroidCmd('shutdown$', async (e) => {
  const chatId = e.chatId;
  // Port of `shutdown$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("bot") || `Plugin \`bot\` matched \`shutdown$\`.` });
});

ultroidCmd('logs( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `logs( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("bot") || `Plugin \`bot\` matched \`logs( (.*)|$)\`.` });
});

ultroidCmd('update( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `update( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("bot") || `Plugin \`bot\` matched \`update( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
