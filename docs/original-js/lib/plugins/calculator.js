// Ultroid-JS port of plugins/calculator.py — full logic.
// Original used inline buttons + @callback("calc...") state in CALC dict.
// Serverless: same buttons via Bot API inline keyboards, state in kv store.
import { ultroidCmd, callback as regCallback } from '../decorators.js';
import { get_string } from '../strings.js';
import { getKey, setKey } from '../database.js';
import { safeEval } from '../tools.js';

const KEYS = ['AC','C','⌫','%','7','8','9','+','4','5','6','-','1','2','3','x','00','0','.','÷'];

function keyboard() {
  const btn = (t) => ({ text: t, callback_data: `calc${t}` });
  const rows = [];
  for (let i = 0; i < 5; i++) rows.push(KEYS.slice(i * 4, i * 4 + 4).map(btn));
  rows.push([btn('=')]);
  return { inline_keyboard: rows };
}

ultroidCmd('calc', async (e) => {
  await e.api.sendMessage({ chat_id: e.chatId, text: get_string('calc_1'), reply_markup: keyboard() });
});

regCallback(/^calc(.*)$/)(async (ev) => {
  const { api, query, data_match } = ev;
  const x = data_match[1];
  const user = String(query.from.id);
  const key = `calc:${user}`;
  let cur = (await getKey(key)) || '';
  const answer = (t, alert = false) => api.answerCallbackQuery({ callback_query_id: query.id, text: String(t).slice(0, 200), show_alert: alert }).catch(() => {});
  if (x === 'AC' || x === 'C') {
    await setKey(key, '');
    return answer('cleared');
  }
  if (x === '⌫') {
    await setKey(key, cur.slice(0, -1));
    return answer(cur.slice(0, -1) || 'cleared');
  }
  if (x === '%') { await setKey(key, cur + '/100'); return answer(cur + '/100'); }
  if (x === '÷') { await setKey(key, cur + '/'); return answer(cur + '/'); }
  if (x === 'x') { await setKey(key, cur + '*'); return answer(cur + '*'); }
  if (x === '=') {
    if (!cur) return answer('None');
    let expr = cur;
    if (/[*./\-+]$/.test(expr)) expr = expr.slice(0, -1);
    try {
      const out = safeEval(expr);
      return answer(`Answer : ${Number(out)}`, true);
    } catch {
      await setKey(key, '');
      return answer(get_string('sf_8'), true);
    }
  }
  await setKey(key, cur + x);
  return answer(cur + x);
});

export const PLUGIN_NAME = 'calculator';
export const PATTERNS = ['calc'];
