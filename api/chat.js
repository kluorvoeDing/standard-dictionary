export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { contents } = body;

    if (!contents) {
      return new Response(JSON.stringify({ error: 'Missing contents' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Try keys from process.env (Vercel automatically injects them)
    // We try VITE_GEMINI_API_KEY_1 first, then fallback to VITE_GEMINI_API_KEY_2
    const keys = [
      process.env.VITE_GEMINI_API_KEY_1,
      process.env.VITE_GEMINI_API_KEY_2
    ].filter(Boolean);

    if (keys.length === 0) {
      return new Response(JSON.stringify({ error: 'No API keys configured on server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let googleRes = null;
    let usedKeyIndex = 0;

    for (let i = 0; i < keys.length; i++) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${keys[i]}&alt=sse`;
      
      googleRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });

      if (googleRes.status === 429) {
        console.warn(`Key ${i+1} rate limited. Trying next key if available...`);
        continue; // Try next key
      }

      usedKeyIndex = i;
      break; // Success or non-429 error
    }

    // Create response directly from Google's stream
    // We add a custom header so the frontend knows if a fallback occurred
    const headers = new Headers(googleRes.headers);
    headers.set('X-Used-Key-Index', usedKeyIndex.toString());

    return new Response(googleRes.body, {
      status: googleRes.status,
      headers: headers,
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
