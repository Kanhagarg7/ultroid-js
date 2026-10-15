// Ultroid-JS port of strings/__init__.py + pyUltroid/fns/helper.py get_string
// Original loaded language YAMLs; here we keep the same keys with English defaults
// so every ported plugin keeps working. Add more languages by extending STRINGS.
const STRINGS = {
  afk_1: 'Back! Was AFK for `{}`.',
  afk_2: 'AFK off after {}.',
  afk_3: 'AFK since {}.\nReason: {}',
  afk_4: 'AFK since {}.',
  afk_5: 'AFK on.\nReason: {}',
  afk_6: 'AFK on.',
  help_2: 'Use {}help to see commands.',
  help_3: 'Inline mode is disabled. Enable it via BotFather.',
  help_4: 'Official',
  help_5: 'Addons',
  help_6: 'VCBot',
  help_7: 'Inline',
  help_8: 'Owner',
  help_9: 'Assistant',
  help_10: 'Close',
  help_11: 'Commands in `{}`:\n',
  inline_4: 'Ultroid-JS by {}.\nPlugins: {} official.\nCommands: {}',
  calc_1: 'Calculator — tap buttons.',
  calc_2: 'Restart',
  sf_8: 'Invalid expression.',
};

export function get_string(key, ...args) {
  let s = STRINGS[key] ?? key;
  // Support Python-style `{}` and `{0}` placeholders minimally
  let i = 0;
  s = s.replace(/\{\}/g, () => (args[i++] ?? ''));
  s = s.replace(/\{(\d+)\}/g, (_, n) => args[Number(n)] ?? '');
  return s;
}

export async function getString(key, ...args) {
  return get_string(key, ...args);
}
