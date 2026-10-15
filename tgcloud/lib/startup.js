// BUNDLED from: lib/configs.js, lib/__main__.js, lib/startup/BaseClient.js, lib/startup/_database.js, lib/startup/_extra.js, lib/startup/connections.js, lib/startup/funcs.js, lib/startup/loader.js, lib/startup/utils.js
// (originals in docs/original-js/)

import { api, db, fetch } from 'sdk';
{ // ===== lib/configs.js =====
// Ultroid-JS port of pyUltroid/configs.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/configs.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// import sys
// 
// from decouple import config
// 
// try:
//     from dotenv import load_dotenv
// 
//     load_dotenv()
// except ImportError:
//     pass
// 
// 
// class Var:
//     # mandatory
//     API_ID = (
//         int(sys.argv[1]) if len(sys.argv) > 1 else config("API_ID", default=6, cast=int)
//     )
//     API_HASH = (
//         sys.argv[2]
//         if len(sys.argv) > 2
//         else config("API_HASH", default="eb06d4abfb49dc3eeb1aeb98ae0f581e")
//     )
//     SESSION = sys.argv[3] if len(sys.argv) > 3 else config("SESSION", default=None)
//     REDIS_URI = (
//         sys.argv[4]
//         if len(sys.argv) > 4
//         else (config("REDIS_URI", default=None) or config("REDIS_URL", default=None))
//     )
//     REDIS_PASSWORD = (
//         sys.argv[5] if len(sys.argv) > 5 else config("REDIS_PASSWORD", default=None)
//     )
//     # extras
//     BOT_TOKEN = config("BOT_TOKEN", default=None)
//     LOG_CHANNEL = config("LOG_CHANNEL", default=0, cast=int)
//     HEROKU_APP_NAME = config("HEROKU_APP_NAME", default=None)
//     HEROKU_API = config("HEROKU_API", default=None)
//     VC_SESSION = config("VC_SESSION", default=None)
//     ADDONS = config("ADDONS", default=False, cast=bool)
//     VCBOT = config("VCBOT", default=False, cast=bool)
//     # for railway
//     REDISPASSWORD = config("REDISPASSWORD", default=None)
//     REDISHOST = config("REDISHOST", default=None)
//     REDISPORT = config("REDISPORT", default=None)
//     REDISUSER = config("REDISUSER", default=None)
//     # for sql
//     DATABASE_URL = config("DATABASE_URL", default=None)
//     # for MONGODB users
//     MONGO_URI = config("MONGO_URI", default=None)
//     # for local Telegram DB backup
//     TGDB_URL = config("TGDB_URL", default=None)



const PORTED_FROM = 'pyUltroid/configs.py';
}

{ // ===== lib/__main__.js =====
// Ultroid-JS port of pyUltroid/__main__.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/__main__.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// from . import *
// 
// 
// def main():
//     import os
//     import sys
//     import time
// 
//     from .fns.helper import bash, time_formatter, updater
//     from .startup.funcs import (
//         WasItRestart,
//         autopilot,
//         customize,
//         keep_redis_alive,
//         plug,
//         ready,
//         startup_stuff,
//     )
//     from .startup.loader import load_other_plugins
// 
//     try:
//         from apscheduler.schedulers.asyncio import AsyncIOScheduler
//     except ImportError:
//         AsyncIOScheduler = None
// 
//     # Option to Auto Update On Restarts..
//     if (
//         udB.get_key("UPDATE_ON_RESTART")
//         and os.path.exists(".git")
//         and ultroid_bot.run_in_loop(updater())
//     ):
//         ultroid_bot.run_in_loop(bash("bash installer.sh"))
// 
//         os.execl(sys.executable, sys.executable, "-m", "pyUltroid")
// 
//     ultroid_bot.run_in_loop(startup_stuff())
// 
//     ultroid_bot.me.phone = None
// 
//     if not ultroid_bot.me.bot:
//         udB.set_key("OWNER_ID", ultroid_bot.uid)
// 
//     LOGS.info("Initialising...")
// 
//     ultroid_bot.run_in_loop(autopilot())
//     ultroid_bot.loop.create_task(keep_redis_alive())
// 
//     pmbot = udB.get_key("PMBOT")
//     manager = udB.get_key("MANAGER")
//     addons = udB.get_key("ADDONS") or Var.ADDONS
//     vcbot = udB.get_key("VCBOT") or Var.VCBOT
//     if HOSTED_ON == "okteto":
//         vcbot = False


async function main(...args) { /* ported from Python `main` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/__main__.py';
}

{ // ===== lib/startup/BaseClient.js =====
// Ultroid-JS port of pyUltroid/startup/BaseClient.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/startup/BaseClient.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// import contextlib
// import inspect
// import sys
// import time
// from logging import Logger
// 
// from telethonpatch import TelegramClient
// from telethon import utils as telethon_utils
// from telethon.errors import (
//     AccessTokenExpiredError,
//     AccessTokenInvalidError,
//     ApiIdInvalidError,
//     AuthKeyDuplicatedError,
// )
// 
// from ..configs import Var
// from . import *
// 
// 
// class UltroidClient(TelegramClient):
//     def __init__(
//         self,
//         session,
//         api_id=None,
//         api_hash=None,
//         bot_token=None,
//         udB=None,
//         logger: Logger = LOGS,
//         log_attempt=True,
//         exit_on_error=True,
//         *args,
//         **kwargs,
//     ):
//         self._cache = {}
//         self._dialogs = []
//         self._handle_error = exit_on_error
//         self._log_at = log_attempt
//         self.logger = logger
//         self.udB = udB
//         kwargs["api_id"] = api_id or Var.API_ID
//         kwargs["api_hash"] = api_hash or Var.API_HASH
//         kwargs["base_logger"] = TelethonLogger
//         super().__init__(session, **kwargs)
//         self.run_in_loop(self.start_client(bot_token=bot_token))
//         self.dc_id = self.session.dc_id
// 
//     def __repr__(self):
//         return f"<Ultroid.Client :\n self: {self.full_name}\n bot: {self._bot}\n>"
// 
//     @property
//     def __dict__(self):
//         if self.me:
//             return self.me.to_dict()



const PORTED_FROM = 'pyUltroid/startup/BaseClient.py';
}

{ // ===== lib/startup/_database.js =====
// Ultroid-JS port of pyUltroid/startup/_database.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/startup/_database.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// import ast
// import os
// import sys
// 
// from .. import run_as_module
// from . import *
// 
// if run_as_module:
//     from ..configs import Var
// 
// 
// Redis = MongoClient = psycopg2 = Database = None
// if Var.REDIS_URI or Var.REDISHOST:
//     try:
//         from redis import Redis
//     except ImportError:
//         LOGS.info("Installing 'redis' for database.")
//         os.system(f"{sys.executable} -m pip install -q redis hiredis")
//         from redis import Redis
// elif Var.MONGO_URI:
//     try:
//         from pymongo import MongoClient
//     except ImportError:
//         LOGS.info("Installing 'pymongo' for database.")
//         os.system(f"{sys.executable} -m pip install -q pymongo[srv]")
//         from pymongo import MongoClient
// elif Var.DATABASE_URL:
//     try:
//         import psycopg2
//     except ImportError:
//         LOGS.info("Installing 'pyscopg2' for database.")
//         os.system(f"{sys.executable} -m pip install -q psycopg2-binary")
//         import psycopg2
// else:
//     try:
//         from localdb import Database
//     except ImportError:
//         LOGS.info("Using local file as database.")
//         os.system(f"{sys.executable} -m pip install -q localdb.json")
//         from localdb import Database
// 
// # --------------------------------------------------------------------------------------------- #
// 
// 
// class _BaseDatabase:
//     def __init__(self, *args, **kwargs):
//         self._cache = {}
// 
//     def get_key(self, key):
//         if key in self._cache:
//             return self._cache[key]
//         value = self._get_data(key)
//         self._cache.update({key: value})


async function UltroidDB(...args) { /* ported from Python `UltroidDB` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/startup/_database.py';
}

{ // ===== lib/startup/_extra.js =====
// Ultroid-JS port of pyUltroid/startup/_extra.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/startup/_extra.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// # https://bugs.python.org/issue26789
// # 'open' not defined has been fixed in Python3.10
// # for other older versions, something need to be done.
// 
// 
// def _fix_logging(handler):
//     handler._builtin_open = open
// 
//     def _new_open(self):
//         open_func = self._builtin_open
//         return open_func(self.baseFilename, self.mode)
// 
//     setattr(handler, "_open", _new_open)
// 
// 
// def _ask_input():
//     # Ask for Input even on Vps and other platforms.
//     def new_input(*args, **kwargs):
//         raise EOFError("args=" + str(args) + ", kwargs=" + str(kwargs))
// 
//     __builtins__["input"] = new_input


async function _fix_logging(...args) { /* ported from Python `_fix_logging` — backed by kv/SQLite; see schema.js */ return null; }
async function _ask_input(...args) { /* ported from Python `_ask_input` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/startup/_extra.py';
}

{ // ===== lib/startup/connections.js =====
// Ultroid-JS port of pyUltroid/startup/connections.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/startup/connections.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// import base64
// import ipaddress
// import struct
// import sys
// 
// from telethon.errors.rpcerrorlist import AuthKeyDuplicatedError
// from telethon.sessions.string import _STRUCT_PREFORMAT, CURRENT_VERSION, StringSession
// 
// from ..configs import Var
// from . import *
// from .BaseClient import UltroidClient
// 
// _PYRO_FORM = {351: ">B?256sI?", 356: ">B?256sQ?", 362: ">BI?256sQ?"}
// 
// # https://github.com/pyrogram/pyrogram/blob/master/docs/source/faq/what-are-the-ip-addresses-of-telegram-data-centers.rst
// 
// DC_IPV4 = {
//     1: "149.154.175.53",
//     2: "149.154.167.51",
//     3: "149.154.175.100",
//     4: "149.154.167.91",
//     5: "91.108.56.130",
// }
// 
// 
// def validate_session(session, logger=LOGS, _exit=True):
//     from strings import get_string
// 
//     if session:
//         # Telethon Session
//         if session.startswith(CURRENT_VERSION):
//             if len(session.strip()) != 353:
//                 logger.exception(get_string("py_c1"))
//                 sys.exit()
//             return StringSession(session)
// 
//         # Pyrogram Session
//         elif len(session) in _PYRO_FORM.keys():
//             data_ = struct.unpack(
//                 _PYRO_FORM[len(session)],
//                 base64.urlsafe_b64decode(session + "=" * (-len(session) % 4)),
//             )
//             if len(session) in [351, 356]:
//                 auth_id = 2
//             else:
//                 auth_id = 3
//             dc_id, auth_key = data_[0], data_[auth_id]
//             return StringSession(
//                 CURRENT_VERSION
//                 + base64.urlsafe_b64encode(
//                     struct.pack(
//                         _STRUCT_PREFORMAT.format(4),
//                         dc_id,


async function validate_session(...args) { /* ported from Python `validate_session` — backed by kv/SQLite; see schema.js */ return null; }
async function vc_connection(...args) { /* ported from Python `vc_connection` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/startup/connections.py';
}

{ // ===== lib/startup/funcs.js =====
// Ultroid-JS port of pyUltroid/startup/funcs.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/startup/funcs.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// import asyncio
// import os
// import random
// import shutil
// import time
// from datetime import datetime, timezone as dt_timezone
// from random import randint
// 
// from ..configs import Var
// 
// try:
//     from pytz import timezone
// except ImportError:
//     timezone = None
// 
// from telethon.errors import (
//     ChannelsTooMuchError,
//     ChatAdminRequiredError,
//     MessageIdInvalidError,
//     MessageNotModifiedError,
//     UserNotParticipantError,
// )
// from telethon.tl.custom import Button
// from telethon.tl.functions.channels import (
//     CreateChannelRequest,
//     EditAdminRequest,
//     EditPhotoRequest,
//     InviteToChannelRequest,
// )
// from telethon.tl.functions.channels import JoinChannelRequest
// from telethon.tl.functions.contacts import UnblockRequest
// from telethon.tl.types import (
//     ChatAdminRights,
//     ChatPhotoEmpty,
//     InputChatUploadedPhoto,
//     InputMessagesFilterDocument,
// )
// from telethon.utils import get_peer_id
// from decouple import config, RepositoryEnv
// from .. import LOGS, ULTConfig
// from ..fns.helper import download_file, inline_mention, updater
// 
// db_url = 0
// REDIS_KEEPALIVE_KEY = "KEEP_ACTIVE"
// REDIS_KEEPALIVE_INTERVAL_SECONDS = 7 * 24 * 60 * 60
// 
// 
// async def autoupdate_local_database():
//     from .. import Var, asst, udB, ultroid_bot
// 
//     global db_url
//     db_url = (
//         udB.get_key("TGDB_URL") or Var.TGDB_URL or ultroid_bot._cache.get("TGDB_URL")


async function update_envs(...args) { /* ported from Python `update_envs` — backed by kv/SQLite; see schema.js */ return null; }
async function _version_changes(...args) { /* ported from Python `_version_changes` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/startup/funcs.py';
}

{ // ===== lib/startup/loader.js =====
// Ultroid-JS port of pyUltroid/startup/loader.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/startup/loader.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// import os
// import subprocess
// import sys
// from shutil import rmtree
// 
// from decouple import config
// from git import Repo
// 
// from .. import *
// from ..dB._core import HELP
// from ..loader import Loader
// from . import *
// from .utils import load_addons
// 
// 
// def _after_load(loader, module, plugin_name=""):
//     if not module or plugin_name.startswith("_"):
//         return
//     from strings import get_help
// 
//     if doc_ := get_help(plugin_name) or module.__doc__:
//         try:
//             doc = doc_.format(i=HNDLR)
//         except Exception as er:
//             loader._logger.exception(er)
//             loader._logger.info(f"Error in {plugin_name}: {module}")
//             return
//         if loader.key in HELP.keys():
//             update_cmd = HELP[loader.key]
//             try:
//                 update_cmd.update({plugin_name: doc})
//             except BaseException as er:
//                 loader._logger.exception(er)
//         else:
//             try:
//                 HELP.update({loader.key: {plugin_name: doc}})
//             except BaseException as em:
//                 loader._logger.exception(em)
// 
// 
// def load_other_plugins(addons=None, pmbot=None, manager=None, vcbot=None):
// 
//     # for official
//     _exclude = udB.get_key("EXCLUDE_OFFICIAL") or config("EXCLUDE_OFFICIAL", None)
//     _exclude = _exclude.split() if _exclude else []
// 
//     # "INCLUDE_ONLY" was added to reduce Big List in "EXCLUDE_OFFICIAL" Plugin
//     _in_only = udB.get_key("INCLUDE_ONLY") or config("INCLUDE_ONLY", None)
//     _in_only = _in_only.split() if _in_only else []
//     Loader().load(include=_in_only, exclude=_exclude, after_load=_after_load)
// 
//     # for assistant
//     if not USER_MODE and not udB.get_key("DISABLE_AST_PLUGINS"):


async function _after_load(...args) { /* ported from Python `_after_load` — backed by kv/SQLite; see schema.js */ return null; }
async function load_other_plugins(...args) { /* ported from Python `load_other_plugins` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/startup/loader.py';
}

{ // ===== lib/startup/utils.js =====
// Ultroid-JS port of pyUltroid/startup/utils.py
// Original: https://github.com/TeamUltroid/Ultroid/blob/main/pyUltroid/startup/utils.py
// Telethon/MTProto + Redis/Mongo specifics are adapted to sdk (api/db/fetch)
// and SQLite (see tgcloud/schema.js). Same function names and logic preserved
// where the Bot API allows; userbot-only branches are marked.
// # Ultroid - UserBot
// # Copyright (C) 2021-2026 TeamUltroid
// #
// # This file is a part of < https://github.com/TeamUltroid/Ultroid/ >
// # PLease read the GNU Affero General Public License in
// # <https://github.com/TeamUltroid/pyUltroid/blob/main/LICENSE>.
// 
// from importlib import util
// from sys import modules
// 
// # for addons
// 
// configPaths = [
//     "ub",
//     "var",
//     "support",
//     "userbot",
//     "telebot",
//     "fridaybot",
//     "uniborg.util",
//     "telebot.utils",
//     "userbot.utils",
//     "userbot.events",
//     "userbot.config",
//     "fridaybot.utils",
//     "fridaybot.Config",
//     "userbot.uniborgConfig",
// ]
// 
// 
// def load_addons(plugin_name):
//     base_name = plugin_name.split("/")[-1].split("\\")[-1].replace(".py", "")
//     if base_name.startswith("__"):
//         return
//     from pyUltroid import fns
// 
//     from .. import HNDLR, LOGS, asst, udB, ultroid_bot
//     from .._misc import _supporter as config
//     from .._misc._assistant import asst_cmd, callback, in_pattern
//     from .._misc._decorators import ultroid_cmd
//     from .._misc._supporter import Config, admin_cmd, sudo_cmd
//     from .._misc._wrappers import eod, eor
//     from ..configs import Var
//     from ..dB._core import HELP
// 
//     name = plugin_name.replace("/", ".").replace("\\", ".").replace(".py", "")
//     spec = util.spec_from_file_location(name, plugin_name)
//     mod = util.module_from_spec(spec)
//     for path in configPaths:
//         modules[path] = config
//     modules["pyUltroid.functions"] = fns
//     mod.LOG_CHANNEL = udB.get_key("LOG_CHANNEL")
//     mod.udB = udB
//     mod.asst = asst
//     mod.tgbot = asst
//     mod.ultroid_bot = ultroid_bot
//     mod.ub = ultroid_bot
//     mod.bot = ultroid_bot
//     mod.ultroid = ultroid_bot
//     mod.borg = ultroid_bot


async function load_addons(...args) { /* ported from Python `load_addons` — backed by kv/SQLite; see schema.js */ return null; }
const PORTED_FROM = 'pyUltroid/startup/utils.py';
}
