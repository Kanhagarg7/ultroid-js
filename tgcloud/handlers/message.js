// tgcloud/handlers/message.js
// Main entry point. Routes every incoming Message update.
// Replaces: pyUltroid Telethon NewMessage handlers + @ultroid_cmd dispatch +
// assistant/start.py + plugins/_chatactions.py passive monitors.
// Only Bot API messages arrive here (no outgoing MTProto events on Serverless).
import { api, db } from 'sdk';
import { eq, and } from 'sdk/db';
import { loadConfig, getKey, get_string, CMD_REGISTRY, PASSIVE_MONITORS } from '../lib/core.js';

// Register all ported plugins (side-effect: fills CMD_REGISTRY etc.)
import '../lib/plugins.js';

function stripPrefix(text, hndlrs) {
  if (!text) return null;
  const first = text[0];
  if (hndlrs.includes(first)) {
    // strip prefix and any bot username suffix on slash commands (/cmd@bot)
    let body = text.slice(1);
    if (first === '/') body = body.split('@')[0] + (body.includes(' ') ? body.slice(body.indexOf(' ')) : '');
    return body;
  }
  return null;
}

export default async function (message) {
  try {
    const cfg = await loadConfig();
    const hndlrs = [cfg.HNDLR, cfg.DUAL_HNDLR, cfg.SUDO_HNDLR, '.', '/', '!', '?'].filter(Boolean);
    const uniq = [...new Set(hndlrs)];
    const text = (message.text || message.caption || '').trim();
    const chatId = message.chat?.id;
    const userId = message.from?.id;
    if (!chatId || !userId) return null;

    // 1) Passive monitors first (AFK auto-reply, filters, notes, blacklist,
    //    antiflood, chatbot, echo, greetings, nsfw...) - mirrors _chatactions.py
    try {
      for (const mon of PASSIVE_MONITORS) await mon({ message, api, db, cfg });
    } catch (e) {
      console.error('monitors failed', e?.stack || e);
    }

    // 2) Command dispatch
    const body = stripPrefix(text, uniq);
    if (!body) return null;
    const [cmdWord, ...rest] = body.split(/\s+/);
    const cmdBody = body; // full body after prefix, patterns expect this

    const ownerId = cfg.OWNER_ID ? Number(cfg.OWNER_ID) : null;
    const sudoUsers = (await getKey('SUDO_USERS')) || [];
    const isOwner = ownerId && Number(userId) === ownerId;
    const isSudo = isOwner || sudoUsers.map(Number).includes(Number(userId));

    for (const reg of CMD_REGISTRY) {
      let m = null;
      try {
        m = cmdBody.match(reg.pattern);
      } catch {
        continue;
      }
      if (!m) continue;
      if (reg.owner_only && !isOwner) continue;
      if (reg.sudo && !isSudo) continue;
      if (reg.groups_only && event.isPrivate) {
        try {
          await api.sendMessage({ chat_id: chatId, text: get_string('py_d3') });
        } catch {}
        return { handled: reg.source };
      }
      // groups_only / admins_only enforced inside handlers via Bot API
      const event = {
        message,
        chatId,
        userId,
        text,
        body: cmdBody,
        args: rest.join(' '),
        pattern_match: m,
        match: m,
        isPrivate: message.chat?.type === 'private',
        replyTo: message.reply_to_message,
        api,
        db,
        cfg,
        client: { isBot: true },
      };
      try {
        await reg.handler(event);
      } catch (e) {
        console.error(`cmd ${reg.source} failed`, e?.stack || e);
        try {
          await api.sendMessage({ chat_id: chatId, text: `Error in \`${reg.source}\`` });
        } catch {}
      }
      return { handled: reg.source };
    }
    return null;
  } catch (e) {
    console.error('handlers/message fatal', e?.stack || e);
    return null;
  }
}
