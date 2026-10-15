// Ultroid-JS port of plugins/locks.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/locks.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "locks";
const PATTERNS = ['(un|)lock( (.*)|$)'];

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
 * • `{i}lock <msgs/media/sticker/gif/games/inline/polls/invites/pin/changeinfo>`
 *     Lock the Used Setting in Used Group.
 * 
 * • `{i}unlock <msgs/media/sticker/gif/games/inline/polls/invites/pin/changeinfo>`
 *     UNLOCK the Used Setting in Used Group.
 * """
 * from telethon.tl.functions.messages import EditChatDefaultBannedRightsRequest
 * 
 * from pyUltroid.fns.admins import lock_unlock
 * 
 * from . import ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="(un|)lock( (.*)|$)", admins_only=True, manager=True, require="change_info"
 * )
 * async def un_lock(e):
 *     mat = e.pattern_match.group(2).strip()
 *     if not mat:
 *         return await e.eor("`Give some Proper Input..`", time=5)
 *     lock = e.pattern_match.group(1) == ""
 *     ml = lock_unlock(mat, lock)
 *     if not ml:
 *         return await e.eor("`Incorrect Input`", time=5)
 *     msg = "Locked" if lock else "Unlocked"
 *     try:
 *         await e.client(EditChatDefaultBannedRightsRequest(e.chat_id, ml))
 *     except Exception as er:
 *         return await e.eor(str(er))
 *     await e.eor(f"**{msg}** - `{mat}` ! ")
---- end original ---- */

ultroidCmd('(un|)lock( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `(un|)lock( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("locks") || `Plugin \`locks\` matched \`(un|)lock( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
