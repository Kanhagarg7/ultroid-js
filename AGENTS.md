# AGENTS.md — Ultroid-JS (Telegram Serverless)

This is a `tgcloud` project. Everything Telegram runs lives in `tgcloud/`.
Only `.js` files in `tgcloud/schema.js`, `tgcloud/lib/`, `tgcloud/handlers/`, `tgcloud/endpoints/` deploy.

## Rules for AI edits
- Relative imports with `.js`: `import { x } from '../lib/tools.js'`.
- Platform SDK only: `import { api, db, fetch } from 'sdk'`; `import { table, eq, sql } from 'sdk/db'`.
- No npm packages, no `node:*`, no filesystem, no sockets. Every `db` call is async.
- One handler per update type in `tgcloud/handlers/` (flat). Shared code in `tgcloud/lib/`.
- Plugins register via `tgcloud/lib/decorators.js` (`ultroidCmd(pattern, fn)`); add import to `tgcloud/lib/plugins/index.js`.
- Schema changes: edit `tgcloud/schema.js`, then `npx tgcloud push` + `npx tgcloud migrate` (never auto-migrate on push).
- Port style: keep original Python pattern + logic; degrade MTProto-only branches with an explanatory reply.
