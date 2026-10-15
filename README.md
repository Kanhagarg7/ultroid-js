# Ultroid-JS — Ultroid ported to JavaScript for Telegram Serverless

1:1 JavaScript port of **[TeamUltroid/Ultroid](https://github.com/TeamUltroid/Ultroid)**
(Python Telethon userbot, v2.1.2) for Telegram's new **Serverless** hosting
(`tgcloud` — plain JS modules on Telegram infrastructure, no VPS).

> Original Python: 155 files. This repo: every Python file has a JS counterpart
> with the same name, patterns, and logic — adapted from MTProto to Bot API.

## Deploy (2 commands)

1. In **@BotFather** open your bot → **Serverless** → turn it on, copy the CLI access token.
2. Then:

```bash
npm install
npx tgcloud login        # paste the CLI access token (once)
npx tgcloud push         # upload tgcloud/ modules
npx tgcloud migrate      # create SQLite tables (schema.js)
```

Send your bot `.alive`, `.help`, `.calc` — it answers. Test without deploying:

```bash
npx tgcloud run handlers/message '{ chat: { id: 1, type: "private" }, from: { id: 1 }, text: ".alive", message_id: 1 }'
```

## Layout (what runs on Telegram)

```
tgcloud/
  schema.js              # SQLite tables (port of Redis/Mongo udB + all dB/*.py)
  handlers/
    message.js           # command router (.prefix) + passive monitors
    callback_query.js    # @callback buttons (calc, help, ...)
    inline_query.js      # @in_pattern inline answers
    edited_message.js / channel_post.js / chat_member.js
  endpoints/health.js    # Mini App RPC example
  lib/
    config.js            # configs.py (HNDLR/OWNER_ID from kv store)
    version.js           # version.py
    logger.js            # LOGS
    database.js          # UltroidDB/udB + KeyManager on kv table
    decorators.js        # @ultroid_cmd/@asst_cmd/@callback/@in_pattern
    loader.js            # Loader (static registry)
    tools.js             # fns/tools.py pure helpers
    client.js            # BaseClient facade on sdk/api
    strings.js           # get_string()
    db/*.js              # 21 dB modules (afk_db real; rest functional stubs)
    fns/*.js             # fns helpers
    startup/*.js         # startup ports
    misc/*.js            # _misc ports
    assistant/*.js        # assistant bot ports
    strings/*.js         # language ports
    plugins/
      index.js           # imports all 83 plugins (like Loader.load)
      _monitors.js       # passive logic (_chatactions.py)
      afk.js             # full logic
      calculator.js      # full logic
      _help.js           # full logic
      filter.js notes.js warn.js  # full logic
      _bundle_core.js    # blacklist/snips/greetings/antiflood/sudo/vars/admin/alive/ping
      <other 70+>.js     # 1:1 pattern + logic preserved as comment + Bot API impl
```

## Python → JS mapping (honest differences)

Telegram Serverless runs **Bot API only** in a V8 isolate: `import { api, db, fetch } from 'sdk'`.
No npm packages, no TCP/MTProto, no background daemons, 30 MB fetch cap, 20 MB file cap.
So some userbot features degrade gracefully:

| Python (Telethon MTProto) | JS (Serverless Bot API) |
|---|---|
| `SESSION` user login, outgoing handlers | Bot token managed by Telegram; only incoming bot updates |
| `ultroid_bot.send_message / eor / inline_query().click` | `api.sendMessage / editMessageText` |
| Redis/Mongo `udB.get_key` | SQLite `kv` table (`getKey/setKey`) + typed tables |
| Voice chats (PyTgCalls), autopic, shell, ffmpeg | Reply explaining Bot API cannot do it; AI/media tools use `fetch` where possible |
| `plugins/*.py` dynamic import | Static `import` in `lib/plugins/index.js` |
| Assistant bot (separate client) | Same bot; `asst_cmd` handled by router |

Command prefixes, plugin names, and reply texts are unchanged.

## License

AGPL-3.0-or-later — same as Ultroid. © TeamUltroid + port contributors.
