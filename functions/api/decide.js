export async function onRequestPost(context) {
  const body = await context.request.text();
  const upstream = await fetch('https://n8n.gogolop.com/webhook/approval-decide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
