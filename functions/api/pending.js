export async function onRequestGet(context) {
  const upstream = await fetch('https://n8n.gogolop.com/webhook/approval-pending', {
    headers: { 'Accept': 'application/json' },
  });
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
