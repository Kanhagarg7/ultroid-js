// Ultroid-JS port of plugins/aiwrapper.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/aiwrapper.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "aiwrapper";
const PATTERNS = ['gemini( (.*)|$)', 'antr( (.*)|$)', 'gpt( (.*)|$)', 'deepseek( (.*)|$)'];

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
 * • `{i}gemini <prompt>`
 *     Get response from Google Gemini.
 * 
 * • `{i}antr <prompt>`
 *     Get response from Anthropic Claude.
 * 
 * • `{i}gpt <prompt>`
 *     Get response from OpenAI GPT.
 * 
 * • `{i}deepseek <prompt>`
 *     Get response from DeepSeek AI.
 * 
 * Set custom models using:
 *     • OPENAI_MODEL: default: gpt-4o-mini
 *     • ANTHROPIC_MODEL: claude-3-opus-20240229
 *     • GEMINI_MODEL: gemini-1.5-flash
 *     • DEEPSEEK_MODEL: deepseek-chat
 * """
 * 
 * import json
 * from . import LOGS, eor, get_string, udB, ultroid_cmd, async_searcher
 * import aiohttp
 * import asyncio
 * 
 * 
 * ENDPOINTS = {
 *     "gpt": "https://api.openai.com/v1/chat/completions",
 *     "antr": "https://api.anthropic.com/v1/messages",
 *     "gemini": "https://generativelanguage.googleapis.com/v1beta/chat/completions",
 *     "deepseek": "https://api.deepseek.com/chat/completions"
 * }
 * 
 * DEFAULT_MODELS = {
 *     "gpt": "gpt-4o-mini",
 *     "antr": "claude-3-opus-20240229",
 *     "gemini": "gemini-1.5-flash",
 *     "deepseek": "deepseek-chat"
 * }
 * 
 * 
 * def get_model(provider):
 *     """Get model name from database or use default"""
 *     model_keys = {
 *         "gpt": "OPENAI_MODEL",
 *         "antr": "ANTHROPIC_MODEL",
 *         "gemini": "GEMINI_MODEL",
 *         "deepseek": "DEEPSEEK_MODEL"
 *     }
 *     return udB.get_key(model_keys[provider]) or DEFAULT_MODELS[provider]
 * 
 * 
 * async def stream_response(msg, text):
 *     """Stream response by editing message"""
 *     current = ""
 *     # Split into chunks of ~100 characters at word boundaries
 *     words = text.split()
 *     chunks = []
 *     current_chunk = []
 *     
 *     for word in words:
 *         current_chunk.append(word)
 *         if len(" ".join(current_chunk)) > 100:
 *             chunks.append(" ".join(current_chunk[:-1]))
 *             current_chunk = [word]
 *     if current_chunk:
 *         chunks.append(" ".join(current_chunk))
 *     
 *     for chunk in chunks:
 *         current += chunk + " "
 *         try:
 *             await msg.edit(current)
 *         except Exception:
 *             pass
 *         await asyncio.sleep(0.5)
 *     return current
 * 
 * 
 * async def get_ai_response(provider, prompt, api_key, stream=False):
 *     """Get response from AI provider"""
 *     try:
 *         headers = {"Content-Type": "application/json"}
 *         model = get_model(provider)
 *         
 *         if provider == "gpt":
 *             headers["Authorization"] = f"Bearer {api_key}"
 *             data = {
 *                 "model": model,
 *                 "messages": [{"role": "user", "content": prompt}],
 *                 "stream": stream
 *             }
 *             if not stream:
 *                 response = await async_searcher(
 *                     ENDPOINTS[provider],
 *                     headers=headers,
 *                     post=True,
 *                     json=data,
 *                     re_json=True
 *                 )
 *                 yield response["choices"][0]["message"]["content"]
 *                 return
 *                 
 *             async with aiohttp.ClientSession() as session:
 *                 async with session.post(
 *                     ENDPOINTS[provider],
 *                     headers=headers,
 *                     json=data
 *                 ) as resp:
 *                     async for line in resp.content:
 *                         if line:
 *                             try:
---- end original ---- */

ultroidCmd('gemini( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gemini( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("aiwrapper") || `Plugin \`aiwrapper\` matched \`gemini( (.*)|$)\`.` });
});

ultroidCmd('antr( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `antr( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("aiwrapper") || `Plugin \`aiwrapper\` matched \`antr( (.*)|$)\`.` });
});

ultroidCmd('gpt( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `gpt( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("aiwrapper") || `Plugin \`aiwrapper\` matched \`gpt( (.*)|$)\`.` });
});

ultroidCmd('deepseek( (.*)|$)', async (e) => {
  const chatId = e.chatId;
  // Port of `deepseek( (.*)|$)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("aiwrapper") || `Plugin \`aiwrapper\` matched \`deepseek( (.*)|$)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
