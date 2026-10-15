// Shared update handlers: edited messages, channel posts, joins.
// All delegate to the same command + monitor pipeline as message.js.
import messageHandler from './message.js';

export async function handleEdited(payload) {
  return messageHandler(payload);
}
export async function handleChannelPost(payload) {
  return messageHandler(payload);
}
