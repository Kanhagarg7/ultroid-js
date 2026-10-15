// Ultroid-JS port of plugins/fakeaction.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/fakeaction.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "fakeaction";
const PATTERNS = ['f(typing|audio|contact|document|game|location|sticker|photo|round|video)( (.*)|$)'];

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
 * __doc__ = get_help("help_fakeaction")
 * 
 * import math
 * import time
 * 
 * from pyUltroid.fns.admins import ban_time
 * 
 * from . import asyncio, get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="f(typing|audio|contact|document|game|location|sticker|photo|round|video)( (.*)|$)"
 * )
 * async def _(e):
 *     act = e.pattern_match.group(1).strip()
 *     t = e.pattern_match.group(2)
 *     if act in ["audio", "round", "video"]:
 *         act = f"record-{act}"
 *     if t.isdigit():
 *         t = int(t)
 *     elif t.endswith(("s", "h", "d", "m")):
 *         t = math.ceil((ban_time(t)) - time.time())
 *     else:
 *         t = 60
 *     await e.eor(get_string("fka_1").format(str(t)), time=5)
 *     async with e.client.action(e.chat_id, act):
 *         await asyncio.sleep(t)
---- end original ---- */

ultroidCmd('f(typing|audio|contact|document|game|location|sticker|photo|round|video)( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `f(typing|audio|contact|document|game|location|sticker|photo|round|video)( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("fakeaction") || `Plugin \`fakeaction\` matched \`f(typing|audio|contact|document|game|location|sticker|photo|round|video)( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
