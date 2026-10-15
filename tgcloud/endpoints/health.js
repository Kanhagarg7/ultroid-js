// Mini App endpoint example (optional). Called via Telegram.WebApp.Serverless.call('health', ...).
export default async function (input, ctx) {
  return { ok: true, bot: 'ultroid-js', version: '2.1.2-js.1', user: ctx?.initData?.user?.id ?? null };
}
