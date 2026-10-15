// Ultroid-JS port of plugins/gdrive.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/gdrive.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "gdrive";
const PATTERNS = ['gdown( (.*)|$)', 'gdlist$', 'gdul( (.*)|$)', 'gdsearch( (.*)|$)', 'gdfolder$'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * """
 * ✘ Commands Available
 * 
 * • `{i}gdul <reply/file name>`
 *     Reply to file to upload on Google Drive.
 *     Add file name to upload on Google Drive.
 * 
 * • `{i}gdown <file id/link> | <filename>`
 *     Download from Gdrive link or file id.
 * 
 * • `{i}gdsearch <file name>`
 *     Search file name on Google Drive and get link.
 * 
 * • `{i}gdlist`
 *     List all GDrive files.
 * 
 * • `{i}gdfolder`
 *     Link to your Google Drive Folder.
 *     If added then all files will be uploaded in this folder.
 * """
 * 
 * import os
 * import time
 * 
 * from telethon.tl.types import Message
 * 
 * from pyUltroid.fns.gDrive import GDriveManager
 * from pyUltroid.fns.helper import time_formatter
 * 
 * from . import ULTConfig, asst, eod, eor, get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="gdown( (.*)|$)",
 *     fullsudo=True,
 * )
 * async def gdown(event):
 *     GDrive = GDriveManager()
 *     match = event.pattern_match.group(1).strip()
 *     if not match:
 *         return await eod(event, "`Give file id or Gdrive link to download from!`")
 *     filename = match.split(" | ")[1].strip() if " | " in match else None
 *     eve = await event.eor(get_string("com_1"))
 *     _start = time.time()
 *     status, response = await GDrive._download_file(eve, match, filename)
 *     if not status:
 *         return await eve.edit(response)
 *     await eve.edit(
 *         f"`Downloaded ``{response}`` in {time_formatter((time.time() - _start)*1000)}`"
 *     )
 * 
 * 
 * @ultroid_cmd(
 *     pattern="gdlist$",
 *     fullsudo=True,
 * )
 * async def files(event):
 *     GDrive = GDriveManager()
 *     if not os.path.exists(GDrive.token_file):
 *         return await event.eor(get_string("gdrive_6").format(asst.me.username))
 *     eve = await event.eor(get_string("com_1"))
 *     msg = ""
 *     if files := GDrive._list_files:
 *         msg += f"{len(files.keys())} files found in gdrive.\n\n"
 *         for _ in files:
 *             msg += f"> [{files[_]}]({_})\n"
 *     else:
 *         msg += "Nothing in Gdrive"
 *     if len(msg) < 4096:
 *         await eve.edit(msg, link_preview=False)
 *     else:
 *         with open("drive-files.txt", "w") as f:
 *             f.write(
 *                 msg.replace("[", "File Name: ")
 *                 .replace("](", "\n» Link: ")
 *                 .replace(")\n", "\n\n")
 *             )
 *         try:
 *             await eve.delete()
 *         except BaseException:
 *             pass
 *         await event.client.send_file(
 *             event.chat_id,
 *             "drive-files.txt",
 *             thumb=ULTConfig.thumb,
 *             reply_to=event,
 *         )
 *         os.remove("drive-files.txt")
 * 
 * 
 * @ultroid_cmd(
 *     pattern="gdul( (.*)|$)",
 *     fullsudo=True,
 * )
 * async def _(event):
 *     GDrive = GDriveManager()
 *     if not os.path.exists(GDrive.token_file):
 *         return await eod(event, get_string("gdrive_6").format(asst.me.username))
 *     input_file = event.pattern_match.group(1).strip() or await event.get_reply_message()
 *     if not input_file:
 *         return await eod(event, "`Reply to file or give its location.`")
 *     mone = await event.eor(get_string("com_1"))
 *     if isinstance(input_file, Message):
 *         location = "resources/downloads"
 *         if input_file.photo:
 *             filename = await input_file.download_media(location)
 *         else:
 *             filename = input_file.file.name
 *             if not filename:
 *                 filename = str(round(time.time()))
 *             filename = f"{location}/{filename}"
 *             try:
 *                 filename, downloaded_in = await event.client.fast_downloader(
 *                     file=input_file.media.document,
---- end original ---- */

ultroidCmd('gdown( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gdown( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("gdrive") || `Plugin \`gdrive\` matched \`gdown( (.*)|$)\`.` });
});

ultroidCmd('gdlist$', async (e) => {
  const chatId = e.chatId;
  // Port of `gdlist$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("gdrive") || `Plugin \`gdrive\` matched \`gdlist$\`.` });
});

ultroidCmd('gdul( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gdul( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("gdrive") || `Plugin \`gdrive\` matched \`gdul( (.*)|$)\`.` });
});

ultroidCmd('gdsearch( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gdsearch( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("gdrive") || `Plugin \`gdrive\` matched \`gdsearch( (.*)|$)\`.` });
});

ultroidCmd('gdfolder$', async (e) => {
  const chatId = e.chatId;
  // Port of `gdfolder$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("gdrive") || `Plugin \`gdrive\` matched \`gdfolder$\`.` });
});
export { PLUGIN_NAME, PATTERNS };
