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
  // Stream the body straight through rather than buffering via .text() —
  // buffering was returning empty content for n8n's chunked responses.
  return new Response(upstream.body, {
    status: upstream.status,
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

    return env.ASSETS.fetch(request);
  },
};
