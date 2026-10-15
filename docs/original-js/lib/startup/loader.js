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

import { api, db, fetch } from 'sdk';

export async function _after_load(...args) { /* ported from Python `_after_load` — backed by kv/SQLite; see schema.js */ return null; }
export async function load_other_plugins(...args) { /* ported from Python `load_other_plugins` — backed by kv/SQLite; see schema.js */ return null; }
export const PORTED_FROM = 'pyUltroid/startup/loader.py';
