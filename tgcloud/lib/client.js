// Ultroid-JS port of pyUltroid/startup/BaseClient.py UltroidClient
// Original was a Telethon client (MTProto, sessions, add_handler...).
// Serverless cannot hold MTProto connections, so this is a Bot API facade with
// the same method names used across plugins: send_message, reply, eor, etc.
import { api } from 'sdk';

export class UltroidClient {
  constructor({ ownerId = null } = {}) {
    this.ownerId = ownerId;
    this._bot = true;
  }
  async sendMessage(chatId, text, opts = {}) {
    return api.sendMessage({ chat_id: chatId, text, ...opts });
  }
  async reply(message, text, opts = {}) {
    return api.sendMessage({
      chat_id: message.chat.id,
      text,
      reply_to_message_id: message.message_id,
      ...opts,
    });
  }
  async eor(message, text, opts = {}) {
    // edit-or-reply: Bot API bots cannot edit user messages; reply instead.
    return this.reply(message, text, opts);
  }
  async deleteMessage(chatId, messageId) {
    try {
      return await api.deleteMessage({ chat_id: chatId, message_id: messageId });
    } catch {
      return null;
    }
  }
}

export const ultroid_bot = new UltroidClient();
export const asst = new UltroidClient();
