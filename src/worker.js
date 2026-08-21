const N8N_BASE = 'https://n8n.gogolop.com/webhook';

async function proxy(targetPath, request) {
  const init = {
    method: request.method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (request.method === 'POST') {
    init.body = await request.text();
  }
  const upstream = await fetch(N8N_BASE + targetPath, init);
  // Fully buffer the body before responding — streaming pass-through was
  // intermittently producing empty bodies against n8n's chunked responses.
  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Length': String(buf.byteLength),
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

    return env.ASSETS.fetch(request);
  },
};
