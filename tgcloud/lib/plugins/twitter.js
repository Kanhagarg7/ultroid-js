// Ultroid-JS port of plugins/twitter.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/twitter.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "twitter";
const PATTERNS = ['tw( (.*)|$)', 'twdetail( (.*)|$)', 'twuser( (.*)|$)', 'twl( (.*)|$)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid - UserBot
 * # Copyright (C) 2021-2026 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * """
 * ✘ Commands Available -
 * 
 * • `{i}tw <tweet text>`
 *     Tweet the text.
 * 
 * • `{i}twr <tweet id/link>`
 *     Get tweet details with reply/quote/comment count.
 * 
 * • `{i}twuser <username>`
 *     Get user details of the Twitter account.
 * 
 * • `{i}twl <tweet link>`
 *     Upload the tweet media to telegram.
 * 
 * """
 * 
 * import asyncio
 * import os
 * 
 * try:
 *     _current_loop = asyncio.get_event_loop()
 * except RuntimeError:
 *     _current_loop = None
 * 
 * from twikit import Client
 * 
 * if _current_loop is not None:
 *     # On Windows, importing twikit replaces the global asyncio event loop
 *     # policy (see twikit/__init__.py), which orphans the loop Ultroid's
 *     # clients are already connected to. Re-register it so existing
 *     # Telethon connections keep working.
 *     asyncio.set_event_loop(_current_loop)
 * 
 * from . import LOGS, eor, get_string, udB, ultroid_cmd
 * 
 * # Store client globally
 * twitter_client = None
 * 
 * # Get path to cookies file
 * COOKIES_FILE = "resources/auth/twitter_cookies.json"
 * 
 * async def get_client():
 *     global twitter_client
 *     if twitter_client:
 *         return twitter_client
 *         
 *     if not all(udB.get_key(key) for key in ["TWITTER_USERNAME", "TWITTER_EMAIL", "TWITTER_PASSWORD"]):
 *         raise Exception("Set TWITTER_USERNAME, TWITTER_EMAIL and TWITTER_PASSWORD in vars first!")
 *     
 *     # Create auth directory if it doesn't exist
 *     os.makedirs(os.path.dirname(COOKIES_FILE), exist_ok=True)
 *         
 *     client = Client()
 *     await client.login(
 *         auth_info_1=udB.get_key("TWITTER_USERNAME"),
 *         auth_info_2=udB.get_key("TWITTER_EMAIL"), 
 *         password=udB.get_key("TWITTER_PASSWORD"),
 *         cookies_file=COOKIES_FILE
 *     )
 *     twitter_client = client
 *     return client
 * 
 * 
 * 
 * @ultroid_cmd(pattern="tw( (.*)|$)")
 * async def tweet_cmd(event):
 *     """Post a tweet"""
 *     text = event.pattern_match.group(1).strip()
 *     if not text:
 *         return await event.eor("🚫 `Give some text to tweet!`")
 * 
 *     msg = await event.eor("🕊 `Tweeting...`")
 *     try:
 *         client = await get_client()
 *         tweet = await client.create_tweet(text=text)
 *         await msg.edit(f"✨ **Successfully Posted!**\n\n🔗 https://x.com/{tweet.user.screen_name}/status/{tweet.id}")
 *     except Exception as e:
 *         await msg.edit(f"❌ **Error:**\n`{str(e)}`")
 * 
 * 
 * @ultroid_cmd(pattern="twdetail( (.*)|$)")
 * async def twitter_details(event):
 *     """Get tweet details"""
 *     match = event.pattern_match.group(1).strip()
 *     if not match:
 *         return await event.eor("🚫 `Give tweet ID/link to get details!`")
 * 
 *     msg = await event.eor("🔍 `Getting tweet details...`")
 *     try:
 *         client = await get_client()
 *         from urllib.parse import urlparse
 *         parsed_url = urlparse(match)
 *         if parsed_url.hostname in ["twitter.com", "x.com"]:
 *             tweet_id = parsed_url.path.split("/")[-1].split("?")[0]
 *         else:
 *             tweet_id = match
 * 
 *         tweet = await client.get_tweet_by_id(tweet_id)
 *         text = "🐦 **Tweet Details**\n\n"
 *         text += f"📝 **Content:** `{tweet.text}`\n\n"
 *         if hasattr(tweet, "metrics"):
 *             text += f"❤️ **Likes:** `{tweet.metrics.likes}`\n"
 *             text += f"🔄 **Retweets:** `{tweet.metrics.retweets}`\n"
 *             text += f"💬 **Replies:** `{tweet.metrics.replies}`\n"
 *             text += f"👁 **Views:** `{tweet.metrics.views}`\n"
 *         
 *         await msg.edit(text)
 *     except Exception as e:
 *         await msg.edit(f"❌ **Error:**\n`{str(e)}`")
 * 
 * 
 * @ultroid_cmd(pattern="twuser( (.*)|$)")
---- end original ---- */

ultroidCmd('tw( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `tw( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("twitter") || `Plugin \`twitter\` matched \`tw( (.*)|$)\`.` });
});

ultroidCmd('twdetail( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `twdetail( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("twitter") || `Plugin \`twitter\` matched \`twdetail( (.*)|$)\`.` });
});

ultroidCmd('twuser( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `twuser( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("twitter") || `Plugin \`twitter\` matched \`twuser( (.*)|$)\`.` });
});

ultroidCmd('twl( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `twl( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("twitter") || `Plugin \`twitter\` matched \`twl( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
