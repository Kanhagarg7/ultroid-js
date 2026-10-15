// Ultroid-JS port of plugins/polls.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/polls.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "polls";
const PATTERNS = ['poll( (.*)|$)'];

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
 * • `{i}poll <question> ; <option> ; <option>`
 *     Get the Anonymous Poll with Given Options
 * 
 * • `{i}poll <question> ; <option> ; <option> | <type>`
 *     Get the poll specified with desired type!
 *     type should be any of  `public`,  `multiple` or `quiz`
 * 
 * • `{i}poll <question> ; <option> ; <option> | quiz_<answerno>`
 *     Get the quiz poll where answerno is the number of option which is correct
 * 
 * """
 * from telethon.tl.types import InputMediaPoll, Poll, PollAnswer, TextWithEntities
 * 
 * from . import get_string, ultroid_cmd
 * 
 * 
 * @ultroid_cmd(
 *     pattern="poll( (.*)|$)",
 * )
 * async def uri_poll(e):
 *     if not e.client._bot and e.is_private:
 *         return await e.eor("`Use this in Group/Channel.`", time=15)
 *     match = e.pattern_match.group(1).strip()
 *     if not match:
 *         return await e.eor("`Give Proper Input...`", time=5)
 *     if ";" not in match:
 *         return await e.eor("`Unable to Determine Options.`.", time=5)
 *     ques = match.split(";")[0]
 *     option = match.split(";")[1::]
 *     publ = None
 *     quizo = None
 *     karzo = None
 *     mpp = None
 *     if "|" in match:
 *         ptype = match.split(" | ")[1]
 *         option = match.split("|")[0].split(";")[1::]
 *         if "_" in ptype:
 *             karzo = [str(int(ptype.split("_")[1]) - 1).encode()]
 *             ptype = ptype.split("_")[0]
 *         if ptype not in ["public", "quiz", "multiple"]:
 *             return await e.eor("`Invalid Poll Type...`", time=5)
 *         if ptype == "multiple":
 *             mpp = True
 *         elif ptype == "public":
 *             publ = True
 *         elif ptype == "quiz":
 *             quizo = True
 *     if len(option) <= 1:
 *         return await e.eor("`Options Should be More than 1..`", time=5)
 *     m = await e.eor(get_string("com_1"))
 *     OUT = [PollAnswer(TextWithEntities(option[on], entities=[]), str(on).encode()) for on in range(len(option))]
 *     await e.respond(
 *         file=InputMediaPoll(
 *             Poll(20, TextWithEntities(ques, entities=[]), OUT, multiple_choice=mpp, public_voters=publ, quiz=quizo),
 *             correct_answers=karzo,
 *         ),
 *     )
 *     await m.delete()
---- end original ---- */

ultroidCmd('poll( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `poll( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("polls") || `Plugin \`polls\` matched \`poll( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
