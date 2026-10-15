// Ultroid-JS - schema.js
// Port of pyUltroid dB layer + startup/_database.py to Telegram Serverless SQLite.
// Original Python used Redis / Mongo / SQL via udB KeyManager.
// Here every udB key lives in the `kv` table, plus typed tables for hot paths.
// Deploy with: npx tgcloud push && npx tgcloud migrate
import { table, integer, text, real, boolean, json, index } from 'sdk/db';

// Generic key-value store replacing udB/Redis (pyUltroid/startup/_database.py,
// pyUltroid/dB/base.py KeyManager). Values are JSON-encoded.
export const kv = table('kv', {
  key: text('key').primaryKey(),
  value: json('value'),
});

// Per-user / per-chat state
export const users = table(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tgId: integer('tg_id').unique(),
    username: text('username'),
    lang: text('lang').default('en'),
    isSudo: boolean('is_sudo').default(false),
    isOwner: boolean('is_owner').default(false),
  },
  (t) => ({
    tgIdx: index('idx_users_tgid').on(t.tgId),
  })
);

// AFK state (pyUltroid/dB/afk_db.py) - single row per bot (id=1)
export const afk = table('afk', {
  id: integer('id').primaryKey(),
  text: text('text'),
  mediaType: text('media_type'),
  media: text('media'),
  since: integer('since'),
});

// PM permit approvals (plugins/pmpermit.py)
export const pmApproved = table('pm_approved', {
  userId: integer('user_id').primaryKey(),
  reason: text('reason'),
  date: integer('date'),
});

// Filters (pyUltroid/dB/filter_db.py)
export const filters = table(
  'filters',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chatId: integer('chat_id').notNull(),
    keyword: text('keyword').notNull(),
    reply: text('reply'),
    mediaFileId: text('media_file_id'),
  },
  (t) => ({
    chatKwIdx: index('idx_filters_chat_kw').on(t.chatId, t.keyword),
  })
);

// Notes (pyUltroid/dB/notes_db.py)
export const notes = table(
  'notes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chatId: integer('chat_id').notNull(),
    name: text('name').notNull(),
    content: text('content'),
    mediaFileId: text('media_file_id'),
  },
  (t) => ({
    chatNameIdx: index('idx_notes_chat_name').on(t.chatId, t.name),
  })
);

// Snips (pyUltroid/dB/snips_db.py) - global
export const snips = table('snips', {
  name: text('name').primaryKey(),
  content: text('content'),
  mediaFileId: text('media_file_id'),
});

// Warns (pyUltroid/dB/warn_db.py)
export const warns = table(
  'warns',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chatId: integer('chat_id').notNull(),
    userId: integer('user_id').notNull(),
    count: integer('count').notNull().default(0),
    reasons: json('reasons').default([]),
  },
  (t) => ({
    chatUserIdx: index('idx_warns_chat_user').on(t.chatId, t.userId),
  })
);

// GBan / GMute (pyUltroid/dB/gban_mute_db.py)
export const gbans = table('gbans', {
  userId: integer('user_id').primaryKey(),
  reason: text('reason'),
  date: integer('date'),
});
export const gmutes = table('gmutes', {
  userId: integer('user_id').primaryKey(),
  reason: text('reason'),
  date: integer('date'),
});

// Local mutes (pyUltroid/dB/mute_db.py)
export const mutes = table(
  'mutes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chatId: integer('chat_id').notNull(),
    userId: integer('user_id').notNull(),
  },
  (t) => ({
    chatUserIdx: index('idx_mutes_chat_user').on(t.chatId, t.userId),
  })
);

// Blacklists (pyUltroid/dB/blacklist_db.py, blacklist_chat_db.py)
export const blacklistWords = table(
  'blacklist_words',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chatId: integer('chat_id').notNull(),
    word: text('word').notNull(),
  },
  (t) => ({
    chatWordIdx: index('idx_bl_chat_word').on(t.chatId, t.word),
  })
);
export const blacklistChats = table('blacklist_chats', {
  chatId: integer('chat_id').primaryKey(),
  reason: text('reason'),
});

// Greetings (pyUltroid/dB/greetings_db.py: welcome/goodbye)
export const greetings = table(
  'greetings',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chatId: integer('chat_id').notNull(),
    kind: text('kind').notNull(),
    text: text('text'),
    mediaFileId: text('media_file_id'),
    enabled: boolean('enabled').default(true),
  },
  (t) => ({
    chatKindIdx: index('idx_greetings_chat_kind').on(t.chatId, t.kind),
  })
);

// Antiflood (pyUltroid/dB/antiflood_db.py)
export const antiflood = table('antiflood', {
  chatId: integer('chat_id').primaryKey(),
  limit: integer('limit').default(5),
  windowSec: integer('window_sec').default(5),
  action: text('action').default('mute'),
});
export const floodTrack = table(
  'flood_track',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chatId: integer('chat_id').notNull(),
    userId: integer('user_id').notNull(),
    count: integer('count').default(0),
    windowStart: integer('window_start'),
  },
  (t) => ({
    chatUserIdx: index('idx_flood_chat_user').on(t.chatId, t.userId),
  })
);

// Echo (pyUltroid/dB/echo_db.py)
export const echos = table(
  'echos',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chatId: integer('chat_id').notNull(),
    userId: integer('user_id').notNull(),
  },
  (t) => ({
    chatUserIdx: index('idx_echo_chat_user').on(t.chatId, t.userId),
  })
);

// Bot chats / logs (pyUltroid/dB/botchat_db.py)
export const botChats = table('bot_chats', {
  chatId: integer('chat_id').primaryKey(),
  kind: text('kind').default('user'),
});

// File store (pyUltroid/dB/filestore_db.py)
export const filestore = table('filestore', {
  name: text('name').primaryKey(),
  fileId: text('file_id'),
  kind: text('kind'),
});

// Force subscribe (pyUltroid/dB/forcesub_db.py)
export const forcesub = table('forcesub', {
  chatId: integer('chat_id').primaryKey(),
  channel: text('channel'),
});

// NSFW (pyUltroid/dB/nsfw_db.py)
export const nsfwChats = table('nsfw_chats', {
  chatId: integer('chat_id').primaryKey(),
  enabled: boolean('enabled').default(true),
});

// Assistant commands (pyUltroid/dB/asstcmd_db.py)
export const asstCmds = table('asst_cmds', {
  name: text('name').primaryKey(),
  reply: text('reply'),
  mediaFileId: text('media_file_id'),
});

// VC sudos (pyUltroid/dB/vc_sudos.py)
export const vcSudos = table('vc_sudos', {
  userId: integer('user_id').primaryKey(),
});

// Scheduled messages (plugins/schedulemsg.py)
export const scheduled = table('scheduled', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  chatId: integer('chat_id').notNull(),
  text: text('text').notNull(),
  fireAt: integer('fire_at').notNull(),
  createdBy: integer('created_by'),
});

// Reminders / todos shared by misc plugins
export const reminders = table('reminders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  text: text('text').notNull(),
  fireAt: integer('fire_at'),
  done: boolean('done').default(false),
});
