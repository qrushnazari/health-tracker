const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

function getOpenAIKey() {
  return (localStorage.getItem('openai_key') || '').trim()
}

export async function parseHealthLog(text) {
  const key = getOpenAIKey()
  if (!key) throw new Error('No OpenAI API key configured')

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a nutrition and fitness parser. Extract meals and training from the user's log entry.
Return ONLY a JSON object with this exact structure:
{
  "meals": [{ "description": string, "kcal": number, "protein": number }],
  "training": [{ "type": string, "duration": number }]
}
Rules:
- Estimate kcal and protein (grams) based on common nutritional data
- Duration is in minutes
- If nothing fits a category, return an empty array
- Be generous with descriptions, keep them natural
- For Turkish foods: sucuk ~350kcal/100g ~18g protein, börek ~300kcal/100g, etc.`,
        },
        { role: 'user', content: text },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || `OpenAI error: ${res.status}`)
  }

  const data = await res.json()
  const parsed = JSON.parse(data.choices[0].message.content)
  return {
    meals: (parsed.meals || []).map(m => ({ ...m, id: crypto.randomUUID(), time: new Date().toTimeString().slice(0, 5) })),
    training: (parsed.training || []).map(t => ({ ...t, id: crypto.randomUUID() })),
  }
}

export { getOpenAIKey }
