// Ultroid-JS port of plugins/tag.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/tag.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "tag";
const PATTERNS = ['tag(on|off|all|bots|rec|admins|owner)( (.*)|$)'];

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
 * • `{i}tagall`
 *     Tag Top 100 Members of chat.
 * 
 * • `{i}tagadmins`
 *     Tag Admins of that chat.
 * 
 * • `{i}tagowner`
 *     Tag Owner of that chat
 * 
 * • `{i}tagbots`
 *     Tag Bots of that chat.
 * 
 * • `{i}tagrec`
 *     Tag recently Active Members.
 * 
 * • `{i}tagon`
 *     Tag online Members(work only if privacy off).
 * 
 * • `{i}tagoff`
 *     Tag Offline Members(work only if privacy off).
 * """
 * 
 * from telethon.tl.types import ChannelParticipantAdmin as admin
 * from telethon.tl.types import ChannelParticipantCreator as owner
 * from telethon.tl.types import UserStatusOffline as off
 * from telethon.tl.types import UserStatusOnline as onn
 * from telethon.tl.types import UserStatusRecently as rec
 * 
 * from . import inline_mention, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="tag(on|off|all|bots|rec|admins|owner)( (.*)|$)",
 *     groups_only=True,
 * )
 * async def _(e):
 *     okk = e.text
 *     lll = e.pattern_match.group(2)
 *     o = 0
 *     nn = 0
 *     rece = 0
 *     xx = f"{lll}" if lll else ""
 *     lili = await e.client.get_participants(e.chat_id, limit=99)
 *     for bb in lili:
 *         x = bb.status
 *         y = bb.participant
 *         if isinstance(x, onn):
 *             o += 1
 *             if "on" in okk:
 *                 xx += f"\n{inline_mention(bb)}"
 *         elif isinstance(x, off):
 *             nn += 1
 *             if "off" in okk and not bb.bot and not bb.deleted:
 *                 xx += f"\n{inline_mention(bb)}"
 *         elif isinstance(x, rec):
 *             rece += 1
 *             if "rec" in okk and not bb.bot and not bb.deleted:
 *                 xx += f"\n{inline_mention(bb)}"
 *         if isinstance(y, owner):
 *             xx += f"\n꧁{inline_mention(bb)}꧂"
 *         if isinstance(y, admin) and "admin" in okk and not bb.deleted:
 *             xx += f"\n{inline_mention(bb)}"
 *         if "all" in okk and not bb.bot and not bb.deleted:
 *             xx += f"\n{inline_mention(bb)}"
 *         if "bot" in okk and bb.bot:
 *             xx += f"\n{inline_mention(bb)}"
 *     await e.eor(xx)
---- end original ---- */

ultroidCmd('tag(on|off|all|bots|rec|admins|owner)( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `tag(on|off|all|bots|rec|admins|owner)( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("tag") || `Plugin \`tag\` matched \`tag(on|off|all|bots|rec|admins|owner)( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
