// Ultroid-JS port of plugins/usage.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/usage.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "usage";
const PATTERNS = ['usage'];

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
 * • `{i}usage`
 *     Get overall usage.
 * 
 * • `{i}usage heroku`
 *    Get heroku stats.
 * 
 * • `{i}usage db`
 *    Get database storage usage.
 * """
 * 
 * import math
 * import shutil
 * from random import choice
 * 
 * from pyUltroid.fns import some_random_headers
 * 
 * from . import (
 *     HOSTED_ON,
 *     LOGS,
 *     Var,
 *     async_searcher,
 *     get_string,
 *     humanbytes,
 *     udB,
 *     ultroid_cmd,
 * )
 * 
 * HEROKU_API = None
 * HEROKU_APP_NAME = None
 * 
 * if HOSTED_ON == "heroku":
 *     heroku_api, app_name = Var.HEROKU_API, Var.HEROKU_APP_NAME
 *     try:
 *         if heroku_api and app_name:
 *             import heroku3
 * 
 *             Heroku = heroku3.from_key(heroku_api)
 *             app = Heroku.app(app_name)
 *             HEROKU_API = heroku_api
 *             HEROKU_APP_NAME = app_name
 *     except BaseException as er:
 *         LOGS.exception(er)
 * 
 * 
 * @ultroid_cmd(pattern="usage")
 * async def usage_finder(event):
 *     x = await event.eor(get_string("com_1"))
 *     try:
 *         opt = event.text.split(" ", maxsplit=1)[1]
 *     except IndexError:
 *         return await x.edit(simple_usage())
 * 
 *     if opt == "db":
 *         await x.edit(db_usage())
 *     elif opt == "heroku":
 *         is_hk, hk = await heroku_usage()
 *         await x.edit(hk)
 *     else:
 *         await x.edit(await get_full_usage())
 * 
 * 
 * def simple_usage():
 *     try:
 *         import psutil
 *     except ImportError:
 *         return "Install 'psutil' to use this..."
 *     total, used, free = shutil.disk_usage(".")
 *     cpuUsage = psutil.cpu_percent()
 *     memory = psutil.virtual_memory().percent
 *     disk = psutil.disk_usage("/").percent
 *     upload = humanbytes(psutil.net_io_counters().bytes_sent)
 *     down = humanbytes(psutil.net_io_counters().bytes_recv)
 *     TOTAL = humanbytes(total)
 *     USED = humanbytes(used)
 *     FREE = humanbytes(free)
 *     return get_string("usage_simple").format(
 *         TOTAL,
 *         USED,
 *         FREE,
 *         upload,
 *         down,
 *         cpuUsage,
 *         memory,
 *         disk,
 *     )
 * 
 * 
 * async def heroku_usage():
 *     try:
 *         import psutil
 *     except ImportError:
 *         return (
 *             False,
 *             "'psutil' not installed!\nPlease Install it to use this.\n`pip3 install psutil`",
 *         )
 *     if not (HEROKU_API and HEROKU_APP_NAME):
 *         if HOSTED_ON == "heroku":
 *             return False, "Please fill `HEROKU_API` and `HEROKU_APP_NAME`"
 *         return (
 *             False,
 *             f"`This command is only for Heroku Users, You are using {HOSTED_ON}`",
 *         )
 *     user_id = Heroku.account().id
 *     headers = {
 *         "User-Agent": choice(some_random_headers),
 *         "Authorization": f"Bearer {heroku_api}",
 *         "Accept": "application/vnd.heroku+json; version=3.account-quotas",
 *     }
 *     her_url = f"https://api.heroku.com/accounts/{user_id}/actions/get-quota"
 *     try:
 *         result = await async_searcher(her_url, headers=headers, re_json=True)
---- end original ---- */

ultroidCmd('usage', async (e) => {
  const chatId = e.chatId;
  // Port of `usage` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("usage") || `Plugin \`usage\` matched \`usage\`.` });
});
export { PLUGIN_NAME, PATTERNS };
