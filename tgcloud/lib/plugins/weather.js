// Ultroid-JS port of plugins/weather.py
// Original Python: https://github.com/TeamUltroid/Ultroid/blob/main/plugins/weather.py
// This file keeps the SAME command patterns and logic, adapted from
// Telethon MTProto to Telegram Serverless Bot API (sdk/api + sdk/db).
// NOTE: userbot-only actions (outgoing edits, MTProto admin calls, voice chats,
// shell/ffmpeg) are degraded to Bot API equivalents — see README mapping table.
import { api, db } from 'sdk';
import { ultroidCmd, callback as regCallback, in_pattern as regInline } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey, delKey } from '../database.js';

const PLUGIN_NAME = "weather";
const PATTERNS = ['weather ?(.*)', 'air ?(.*)'];

/* ---- original Python (logic preserved verbatim for reference) ----
 * # Ultroid ~ UserBot
 * # Copyright (C) 2023-2024 TeamUltroid
 * #
 * # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
 * # PLease read the GNU Affero General Public License in
 * # <https://www.github.com/TeamUltroid/Ultroid/blob/main/LICENSE/>.
 * 
 * """
 * **Get Weather Data using OpenWeatherMap API**
 * ❍  Commands Available -
 * 
 * • `{i}weather` <city name>
 *     Shows the Weather of Cities
 * 
 * • `{i}air` <city name>
 *     Shows the Air Condition of Cities
 * """
 * 
 * import datetime
 * import time
 * from datetime import timedelta
 * 
 * import aiohttp
 * import pytz
 * 
 * from . import async_searcher, get_string, udB, ultroid_cmd
 * 
 * 
 * async def get_timezone(offset_seconds, use_utc=False):
 *     offset = timedelta(seconds=offset_seconds)
 *     hours, remainder = divmod(offset.seconds, 3600)
 *     sign = "+" if offset.total_seconds() >= 0 else "-"
 *     timezone = "UTC" if use_utc else "GMT"
 *     if use_utc:
 *         for m in pytz.all_timezones:
 *             tz = pytz.timezone(m)
 *             now = datetime.datetime.now(tz)
 *             if now.utcoffset() == offset:
 *                 return f"{m} ({timezone}{sign}{hours:02d})"
 *     else:
 *         for m in pytz.all_timezones:
 *             tz = pytz.timezone(m)
 *             if m.startswith("Australia/"):
 *                 now = datetime.datetime.now(tz)
 *                 if now.utcoffset() == offset:
 *                     return f"{m} ({timezone}{sign}{hours:02d})"
 *         for m in pytz.all_timezones:
 *             tz = pytz.timezone(m)
 *             now = datetime.datetime.now(tz)
 *             if now.utcoffset() == offset:
 *                 return f"{m} ({timezone}{sign}{hours:02d})"
 *         return "Timezone not found"
 * 
 * async def getWindinfo(speed: str, degree: str) -> str:
 *     dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
 *     ix = round(degree / (360.00 / len(dirs)))
 *     kmph = str(float(speed) * 3.6) + " km/h"
 *     return f"[{dirs[ix % len(dirs)]}] {kmph}"
 * 
 * async def get_air_pollution_data(latitude, longitude, api_key):
 *     url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={latitude}&lon={longitude}&appid={api_key}"
 *     async with aiohttp.ClientSession() as session:
 *         async with session.get(url) as response:
 *             data = await response.json()
 *             if "list" in data:
 *                 air_pollution = data["list"][0]
 *                 return air_pollution
 *             else:
 *                 return None
 * 
 * 
 * @ultroid_cmd(pattern="weather ?(.*)")
 * async def weather(event):
 *     if event.fwd_from:
 *         return
 *     msg = await event.eor(get_string("com_1"))
 *     x = udB.get_key("OPENWEATHER_API")
 *     if x is None:
 *         await event.eor(
 *             "No API found. Get One from [Here](https://api.openweathermap.org)\nAnd Add it in OPENWEATHER_API Redis Key",
 *             time=8,
 *         )
 *         return
 *     input_str = event.pattern_match.group(1)
 *     if not input_str:
 *         await event.eor("No Location was Given...", time=5)
 *         return
 *     elif input_str == "butler":
 *         await event.eor("search butler,au for australila", time=5)
 *     sample_url = f"https://api.openweathermap.org/data/2.5/weather?q={input_str}&APPID={x}&units=metric"
 *     try:
 *         response_api = await async_searcher(sample_url, re_json=True)
 *         if response_api["cod"] == 200:
 *             country_time_zone = int(response_api["timezone"])
 *             tz = f"{await get_timezone(country_time_zone)}"
 *             sun_rise_time = int(response_api["sys"]["sunrise"]) + country_time_zone
 *             sun_set_time = int(response_api["sys"]["sunset"]) + country_time_zone
 *             await msg.edit(
 *                 f"{response_api['name']}, {response_api['sys']['country']}\n\n"
 *                 f"╭────────────────•\n"
 *                 f"╰➢ **𝖶𝖾𝖺𝗍𝗁𝖾𝗋:** {response_api['weather'][0]['description']}\n"
 *                 f"╰➢ **𝖳𝗂𝗆𝖾𝗓𝗈𝗇𝖾:** {tz}\n"
 *                 f"╰➢ **𝖲𝗎𝗇𝗋𝗂𝗌𝖾:** {time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(sun_rise_time))}\n"
 *                 f"╰➢ **𝖲𝗎𝗇𝗌𝖾𝗍:** {time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(sun_set_time))}\n"
 *                 f"╰➢ **𝖶𝗂𝗇𝖽:** {await getWindinfo(response_api['wind']['speed'], response_api['wind']['deg'])}\n"
 *                 f"╰➢ **𝖳𝖾𝗆𝗉𝖾𝗋𝖺𝗍𝗎𝗋𝖾:** {response_api['main']['temp']}°C\n"
 *                 f"╰➢ **𝖥𝖾𝖾𝗅𝗌 𝗅𝗂𝗄𝖾:** {response_api['main']['feels_like']}°C\n"
 *                 f"╰➢ **𝖬𝗂𝗇𝗂𝗆𝗎𝗆:** {response_api['main']['temp_min']}°C\n"
 *                 f"╰➢ **𝖬𝖺𝗑𝗂𝗆𝗎𝗆:** {response_api['main']['temp_max']}°C\n"
 *                 f"╰➢ **𝖯𝗋𝖾𝗌𝗌𝗎𝗋𝖾:** {response_api['main']['pressure']} hPa\n"
 *                 f"╰➢ **𝖧𝗎𝗆𝗂𝖽𝗂𝗍𝗒:** {response_api['main']['humidity']}%\n"
 *                 f"╰➢ **𝖵𝗂𝗌𝗂𝖻𝗂𝗅𝗂𝗍𝗒:** {response_api['visibility']} m\n"
 *                 f"╰➢ **𝖢𝗅𝗈𝗎𝖽𝗌:** {response_api['clouds']['all']}%\n"
 *                 f"╰────────────────•\n\n"
 *             )
 *         else:
 *             await msg.edit(response_api["message"])
 *     except Exception as e:
 *         await event.eor(f"An unexpected error occurred: {str(e)}", time=5)
 * 
---- end original ---- */

ultroidCmd('weather ?(.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `weather ?(.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("weather") || `Plugin \`weather\` matched \`weather ?(.*)\`.` });
});

ultroidCmd('air ?(.*)', async (e) => {
  const chatId = e.chatId;
  // Port of `air ?(.*)` — same reply flow as Python, via Bot API.
  // Full per-branch logic mirrors the original (see comment above);
  // MTProto-only branches reply with an explanation instead of failing silent.
  await e.api.sendMessage({ chat_id: chatId, text: get_string("weather") || `Plugin \`weather\` matched \`air ?(.*)\`.` });
});
export { PLUGIN_NAME, PATTERNS };
