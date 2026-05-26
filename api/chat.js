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

    const engines = [];

    // Engine 0: Gemini Key 1
    if (process.env.GEMINI_API_KEY_1) {
      engines.push({
        type: 'gemini',
        name: 'Gemini Primary',
        key: process.env.GEMINI_API_KEY_1
      });
    }

    // Engine 1: Gemini Key 2 (Fallback 1)
    if (process.env.GEMINI_API_KEY_2) {
      engines.push({
        type: 'gemini',
        name: 'Gemini Backup',
        key: process.env.GEMINI_API_KEY_2
      });
    }



    if (engines.length === 0) {
      return new Response(JSON.stringify({ error: 'No API keys configured on server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let finalRes = null;
    let usedEngine = null;
    let usedEngineIndex = 0;
    let lastErrorData = null;

    for (let i = 0; i < engines.length; i++) {
      const engine = engines[i];
      try {
        if (engine.type === 'gemini') {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash:streamGenerateContent?key=${engine.key}&alt=sse`;
          finalRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents }),
          });

        }

        if (finalRes.status === 429) {
          console.warn(`${engine.name} rate limited. Trying next...`);
          continue;
        }
        
        if (!finalRes.ok) {
          try {
            lastErrorData = await finalRes.json();
          } catch (e) {
            lastErrorData = { message: finalRes.statusText };
          }
          console.warn(`${engine.name} returned ${finalRes.status}. Trying next...`);
          continue;
        }

        usedEngine = engine;
        usedEngineIndex = i;
        break; // Success
      } catch (e) {
        console.warn(`${engine.name} fetch failed:`, e.message);
        continue;
      }
    }

    if (!finalRes || !finalRes.ok) {
      return new Response(JSON.stringify({ 
        error: '所有 API 引擎均失敗或達上限 (All API engines failed or rate limited).',
        details: lastErrorData 
      }), {
        status: finalRes ? finalRes.status : 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const headers = new Headers(finalRes.headers);
    headers.set('X-Used-Engine-Index', usedEngineIndex.toString());
    headers.set('X-Used-Engine-Type', usedEngine.type);

    return new Response(finalRes.body, {
      status: finalRes.status,
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
