const N8N_BASE = 'https://n8n.gogolop.com/webhook';

async function proxy(targetPath, request) {
  const init = {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      // Force n8n/nginx to skip compression entirely. Compressed responses
      // to this origin have been getting corrupted to empty bodies for
      // real browser-style clients; requesting identity avoids that path.
      'Accept-Encoding': 'identity',
    },
  };
  if (request.method === 'POST') {
    init.body = await request.text();
  }
  const upstream = await fetch(N8N_BASE + targetPath, init);
  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
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
