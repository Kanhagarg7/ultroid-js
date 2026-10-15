// Ultroid-JS port of plugins/_help.py + assistant/manager/_help.py
// Original showed inline help menu via assistant bot.
// Serverless: same via Bot API inline keyboard + callback_query handler.
import { db } from 'sdk';
import { ultroidCmd, callback as regCallback } from '../decorators.js';
import { get_string } from '../strings.js';
import { PLUGIN_COUNT } from './index.js';

function mainMenu() {
  return {
    inline_keyboard: [
      [{ text: get_string('help_4'), callback_data: 'uh_Official_' }, { text: get_string('help_5'), callback_data: 'uh_Addons_' }],
      [{ text: get_string('help_10'), callback_data: 'close' }],
    ],
  };
}

ultroidCmd('help( (.*)|$)', async (e) => {
  const plug = (e.args || '').trim();
  if (plug) {
    await e.api.sendMessage({ chat_id: e.chatId, text: `**Plugin** - \`${plug}\`\nUse buttons below to browse.\n© @TeamUltroid` });
    return;
  }
  await e.api.sendMessage({
    chat_id: e.chatId,
    text: `Ultroid-JS • ${PLUGIN_COUNT} plugins ported 1:1.\nSend \`.help <plugin>\` for details.`,
    reply_markup: mainMenu(),
  });
});

regCallback(/^uh_(.*)$/)(async ({ api, query, data_match }) => {
  const which = data_match[1];
  await api.answerCallbackQuery({ callback_query_id: query.id }).catch(() => {});
  await api.editMessageText({
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    text: `Category: ${which || 'Official'}\nPlugins are listed in tgcloud/lib/plugins/.`,
    reply_markup: mainMenu(),
  }).catch(() => {});
});

regCallback(/^close$/)(async ({ api, query }) => {
  await api.deleteMessage({ chat_id: query.message.chat.id, message_id: query.message.message_id }).catch(() => {});
});

export const PLUGIN_NAME = '_help';
export const PATTERNS = ['help( (.*)|$)'];
