const N8N_BASE = 'https://n8n.gogolop.com/webhook';

async function fetchOnce(targetPath, request) {
  const init = {
    method: request.method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (request.method === 'POST') {
    init.body = await request.text();
  }
  const upstream = await fetch(N8N_BASE + targetPath, init);
  const buf = await upstream.arrayBuffer();
  return { status: upstream.status, buf };
}

async function proxy(targetPath, request) {
  // n8n's webhook responses are intermittently empty-bodied even on a real
  // 200 (a flake in its chunked-response handling, not client-specific).
  // Retry a few times whenever that happens before giving up.
  let result = await fetchOnce(targetPath, request);
  let attempts = 1;
  while (result.buf.byteLength === 0 && attempts < 4) {
    await new Promise((r) => setTimeout(r, 200 * attempts));
    result = await fetchOnce(targetPath, request);
    attempts += 1;
  }

  if (result.buf.byteLength === 0) {
    return new Response(
      JSON.stringify({ success: false, message: 'The server did not respond properly after several tries. Please try again.' }),
      { status: 502, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } }
    );
  }

  return new Response(result.buf, {
    status: result.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/pending' && request.method === 'GET') {
      return proxy('/approval-pending', request);
    }
    if (url.pathname === '/api/decide' && request.method === 'POST') {
      return proxy('/approval-decide', request);
    }
    if (url.pathname === '/api/submit' && request.method === 'POST') {
      return proxy('/approval-submit', request);
    }
    if (url.pathname === '/api/history' && request.method === 'GET') {
      return proxy('/approval-history', request);
    }

    return env.ASSETS.fetch(request);
  },
};
