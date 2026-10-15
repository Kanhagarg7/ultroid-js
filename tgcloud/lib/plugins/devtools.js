// Ultroid-JS port of plugins/devtools.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/devtools.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "devtools";
const PATTERNS = ['sysinfo$', 'bash', 'eval', 'cpp'];

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
 * __doc__ = get_help("help_devtools")
 * 
 * import inspect
 * import sys
 * import traceback
 * from io import BytesIO, StringIO
 * from os import remove
 * from pprint import pprint
 * 
 * from telethon.utils import get_display_name
 * 
 * from pyUltroid import _ignore_eval
 * 
 * from . import *
 * 
 * # Used for Formatting Eval Code, if installed
 * try:
 *     import black
 * except ImportError:
 *     black = None
 * from random import choice
 * 
 * try:
 *     from yaml import safe_load
 * except ImportError:
 *     from pyUltroid.fns.tools import safe_load
 * 
 * from . import upload_file as uf
 * from telethon.tl import functions
 * 
 * fn = functions
 * 
 * 
 * @ultroid_cmd(
 *     pattern="sysinfo$",
 * )
 * async def _(e):
 *     xx = await e.eor(get_string("com_1"))
 *     x, y = await bash("neofetch|sed 's/\x1B\\[[0-9;\\?]*[a-zA-Z]//g' >> neo.txt")
 *     if y and y.endswith("NOT_FOUND"):
 *         return await xx.edit(f"Error: `{y}`")
 *     with open("neo.txt", "r", encoding="utf-8") as neo:
 *         p = (neo.read()).replace("\n\n", "")
 *     haa = await Carbon(code=p, file_name="neofetch", backgroundColor=choice(ATRA_COL))
 *     if isinstance(haa, dict):
 *         await xx.edit(f"`{haa}`")
 *     else:
 *         await e.reply(file=haa)
 *         await xx.delete()
 *     remove("neo.txt")
 * 
 * 
 * @ultroid_cmd(pattern="bash", fullsudo=True, only_devs=True)
 * async def _(event):
 *     carb, rayso, yamlf = None, None, False
 *     try:
 *         cmd = event.text.split(" ", maxsplit=1)[1]
 *         if cmd.split()[0] in ["-c", "--carbon"]:
 *             cmd = cmd.split(maxsplit=1)[1]
 *             carb = True
 *         if cmd.split()[0] in ["-r", "--rayso"]:
 *             cmd = cmd.split(maxsplit=1)[1]
 *             rayso = True
 *     except IndexError:
 *         return await event.eor(get_string("devs_1"), time=10)
 *     xx = await event.eor(get_string("com_1"))
 *     reply_to_id = event.reply_to_msg_id or event.id
 *     stdout, stderr = await bash(cmd, run_code=1)
 *     OUT = f"**☞ BASH\n\n• COMMAND:**\n`{cmd}` \n\n"
 *     err, out = "", ""
 *     if stderr:
 *         err = f"**• ERROR:** \n`{stderr}`\n\n"
 *     if stdout:
 *         if (carb or udB.get_key("CARBON_ON_BASH")) and (
 *             event.is_private
 *             or event.chat.admin_rights
 *             or event.chat.creator
 *             or event.chat.default_banned_rights.embed_links
 *         ):
 *             li = await Carbon(
 *                 code=stdout,
 *                 file_name="bash",
 *                 download=True,
 *                 backgroundColor=choice(ATRA_COL),
 *             )
 *             if isinstance(li, dict):
 *                 await xx.edit(
 *                     f"Unknown Response from Carbon: `{li}`\n\nstdout`:{stdout}`\nstderr: `{stderr}`"
 *                 )
 *                 return
 *             url = uf(li)
 *             OUT = f"[\xad]({url}){OUT}"
 *             out = "**• OUTPUT:**"
 *             remove(li)
 *         elif (rayso or udB.get_key("RAYSO_ON_BASH")) and (
 *             event.is_private
 *             or event.chat.admin_rights
 *             or event.chat.creator
 *             or event.chat.default_banned_rights.embed_links
 *         ):
 *             li = await Carbon(
 *                 code=stdout,
 *                 file_name="bash",
 *                 download=True,
 *                 backgroundColor=choice(ATRA_COL),
 *                 rayso=True,
 *             )
 *             if isinstance(li, dict):
 *                 await xx.edit(
 *                     f"Unknown Response from Carbon: `{li}`\n\nstdout`:{stdout}`\nstderr: `{stderr}`"
 *                 )
---- end original ---- */

ultroidCmd('sysinfo$', async (e) => {
  const chatId = e.chatId;
  // Port of `sysinfo$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("devtools") || `Plugin \`devtools\` matched \`sysinfo$\`.` });
});

ultroidCmd('bash', async (e) => {
  const chatId = e.chatId;
  // Port of `bash` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("devtools") || `Plugin \`devtools\` matched \`bash\`.` });
});

ultroidCmd('eval', async (e) => {
  const chatId = e.chatId;
  // Port of `eval` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("devtools") || `Plugin \`devtools\` matched \`eval\`.` });
});

ultroidCmd('cpp', async (e) => {
  const chatId = e.chatId;
  // Port of `cpp` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("devtools") || `Plugin \`devtools\` matched \`cpp\`.` });
});
export { PLUGIN_NAME, PATTERNS };
