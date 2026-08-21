// --------------------------------------------------------------------------
// Thin, dependency-free clients for calling Claude and Gemini directly from
// the browser with a user-supplied API key ("BYOK"). No backend involved —
// which is great for a hackathon demo but means the API key sits in this
// tab's JS and is visible in network requests. Fine for personal/demo use;
// swap this for a small server-side proxy before shipping to real users so
// the key never reaches the browser.
// --------------------------------------------------------------------------

/**
 * Calls Anthropic's Messages API directly from the browser.
 * Requires the `anthropic-dangerous-direct-browser-access` header — without
 * it Anthropic's API rejects cross-origin browser requests with a CORS
 * error. See https://simonwillison.net/2024/Aug/23/anthropic-dangerous-direct-browser-access/
 */
export async function callClaude({ apiKey, model, prompt }) {
  if (!apiKey) throw new Error('Add your Claude API key first.')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = data?.error?.message || `Claude API request failed (${res.status})`
    throw new Error(message)
  }

  const text = data?.content?.find((block) => block.type === 'text')?.text
  if (!text) throw new Error('Claude returned an empty response.')
  return text
}

/**
 * Calls Google's Gemini generateContent REST endpoint directly from the
 * browser. The API key travels as a query param, which is how Google's own
 * client-side quickstarts do it — same BYOK caveat as callClaude above.
 */
export async function callGemini({ apiKey, model, prompt }) {
  if (!apiKey) throw new Error('Add your Gemini API key first.')

  const modelName = model || 'gemini-3.6-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = data?.error?.message || `Gemini API request failed (${res.status})`
    throw new Error(message)
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('')
  if (!text) throw new Error('Gemini returned an empty response.')
  return text
}

export async function askAI({ provider, apiKey, model, prompt }) {
  if (provider === 'gemini') return callGemini({ apiKey, model, prompt })
  return callClaude({ apiKey, model, prompt })
}
