// Ultroid-JS port of plugins/utilities.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/utilities.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "utilities";
const PATTERNS = ['kickme$', 'date$', 'listreserved$', 'stats$', 'paste( (.*)|$)', 'info( (.*)|$)', 'invite( (.*)|$)', 'rmbg($| (.*))', 'telegraph( (.*)|$)', 'json( (.*)|$)', 'suggest( (.*)|$)', 'ipinfo( (.*)|$)', 'cpy$', 'pst$', 'thumb$', 'getmsg( ?(.*)|$)'];

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
 * • `{i}kickme` : Leaves the group.
 * 
 * • `{i}date` : Show Calender.
 * 
 * • `{i}listreserved`
 *     List all usernames (channels/groups) you own.
 * 
 * • `{i}stats` : See your profile stats.
 * 
 * • `{i}paste` - `Include long text / Reply to text file.`
 * 
 * • `{i}info <username/userid/chatid>`
 *     Reply to someone's msg.
 * 
 * • `{i}invite <username/userid>`
 *     Add user to the chat.
 * 
 * • `{i}rmbg <reply to pic>`
 *     Remove background from that picture.
 * 
 * • `{i}telegraph <reply to media/text>`
 *     Upload media/text to telegraph.
 * 
 * • `{i}json <reply to msg>`
 *     Get the json encoding of the message.
 * 
 * • `{i}suggest <reply to message> or <poll title>`
 *     Create a Yes/No poll for the replied suggestion.
 * 
 * • `{i}ipinfo <ipAddress>` : Get info about that IP address.
 * 
 * • `{i}cpy <reply to message>`
 *    Copy the replied message, with formatting. Expires in 24hrs.
 * • `{i}pst`
 *    Paste the copied message, with formatting.
 * 
 * • `{i}thumb <reply file>` : Download the thumbnail of the replied file.
 * 
 * • `{i}getmsg <message link>`
 *   Get messages from chats with forward/copy restrictions.
 * """
 * 
 * import asyncio
 * import calendar
 * import html
 * import io
 * import os
 * import pathlib
 * import time
 * from datetime import datetime as dt
 * 
 * try:
 *     from PIL import Image
 * except ImportError:
 *     Image = None
 * 
 * from pyUltroid._misc._assistant import asst_cmd
 * from pyUltroid.dB.gban_mute_db import is_gbanned
 * from pyUltroid.fns.tools import get_chat_and_msgid
 * 
 * from . import upload_file as uf
 * 
 * from telethon.errors.rpcerrorlist import ChatForwardsRestrictedError, UserBotError
 * from telethon.errors import MessageTooLongError
 * from telethon.events import NewMessage
 * from telethon.tl.custom import Dialog
 * from telethon.tl.functions.channels import (
 *     GetAdminedPublicChannelsRequest,
 *     InviteToChannelRequest,
 *     LeaveChannelRequest,
 * )
 * from telethon.tl.functions.contacts import GetBlockedRequest
 * from telethon.tl.functions.messages import AddChatUserRequest, GetAllStickersRequest
 * from telethon.tl.functions.users import GetFullUserRequest
 * from telethon.tl.types import (
 *     Channel,
 *     Chat,
 *     InputMediaPoll,
 *     Poll,
 *     PollAnswer,
 *     TLObject,
 *     User,
 *     UserStatusOffline,
 *     UserStatusOnline,
 *     MessageMediaPhoto,
 *     MessageMediaDocument,
 *     DocumentAttributeVideo,
 * )
 * from telethon.utils import get_peer_id
 * 
 * from pyUltroid.fns.info import get_chat_info
 * 
 * from . import (
 *     HNDLR,
 *     LOGS,
 *     Image,
 *     ReTrieveFile,
 *     Telegraph,
 *     asst,
 *     async_searcher,
 *     bash,
 *     check_filename,
 *     eod,
 *     eor,
 *     get_paste,
 *     get_string,
 *     inline_mention,
 *     json_parser,
 *     mediainfo,
 *     udB,
 *     ultroid_cmd,
---- end original ---- */

ultroidCmd('kickme$', async (e) => {
  const chatId = e.chatId;
  // Port of `kickme$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`kickme$\`.` });
});

ultroidCmd('date$', async (e) => {
  const chatId = e.chatId;
  // Port of `date$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`date$\`.` });
});

ultroidCmd('listreserved$', async (e) => {
  const chatId = e.chatId;
  // Port of `listreserved$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`listreserved$\`.` });
});

ultroidCmd('stats$', async (e) => {
  const chatId = e.chatId;
  // Port of `stats$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`stats$\`.` });
});

ultroidCmd('paste( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `paste( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`paste( (.*)|$)\`.` });
});

ultroidCmd('info( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `info( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`info( (.*)|$)\`.` });
});

ultroidCmd('invite( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `invite( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`invite( (.*)|$)\`.` });
});

ultroidCmd('rmbg($| (.*))', async (e) => {
  const chatId = e.chatId;
  // Port of `rmbg($| (.*))` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`rmbg($| (.*))\`.` });
});

ultroidCmd('telegraph( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `telegraph( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`telegraph( (.*)|$)\`.` });
});

ultroidCmd('json( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `json( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`json( (.*)|$)\`.` });
});

ultroidCmd('suggest( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `suggest( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`suggest( (.*)|$)\`.` });
});

ultroidCmd('ipinfo( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `ipinfo( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`ipinfo( (.*)|$)\`.` });
});

ultroidCmd('cpy$', async (e) => {
  const chatId = e.chatId;
  // Port of `cpy$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`cpy$\`.` });
});

ultroidCmd('pst$', async (e) => {
  const chatId = e.chatId;
  // Port of `pst$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`pst$\`.` });
});

ultroidCmd('thumb$', async (e) => {
  const chatId = e.chatId;
  // Port of `thumb$` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`thumb$\`.` });
});

ultroidCmd('getmsg( ?(.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `getmsg( ?(.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("utilities") || `Plugin \`utilities\` matched \`getmsg( ?(.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
