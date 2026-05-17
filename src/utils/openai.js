const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

function getOpenAIKey() {
  return (localStorage.getItem('openai_key') || '').trim()
}

export async function parseHealthLog(text) {
  const key = getOpenAIKey()
  if (!key) throw new Error('No OpenAI API key configured')

  const now = new Date()
  const currentTime = now.toTimeString().slice(0, 5)
  const currentDate = now.toLocaleDateString('en-GB', { weekday: 'long', hour: '2-digit', minute: '2-digit' })

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
          content: `You are a nutrition and fitness log parser. Current time: ${currentTime} on ${currentDate}.

Extract meals, training, and fasting window from the user's log. Return ONLY this JSON structure:
{
  "meals": [{ "description": string, "kcal": number, "protein": number, "time": "HH:MM" }],
  "training": [{ "type": string, "duration": number, "time": "HH:MM" }],
  "fasting": { "open": "HH:MM" | null, "close": "HH:MM" | null, "closeNextDay": boolean | null }
}

Time rules:
- All times in 24h HH:MM format
- Resolve natural language times: "this morning" ~07:00, "breakfast" ~08:00, "lunch" ~12:30, "dinner" ~19:00, "just now" = current time
- If the user says "at 14:30" or "around 2pm" use that exactly
- If no time mentioned for a meal/activity, use current time (${currentTime})
- For fasting: "started fasting at X" or "last ate at X" → open=X, "broke fast at Y" or "first meal at Y" → close=Y
- closeNextDay=true if the fast break is the morning after the fast start (e.g. fast starts 18:00, breaks 11:00)
- If no fasting info mentioned, return fasting: { open: null, close: null, closeNextDay: null }

Nutrition rules:
- Estimate kcal and protein (grams) using common nutritional data
- Turkish foods: sucuk ~350kcal/100g ~18g protein, 1 slice sucuk ~25g, börek ~300kcal/100g, ayran ~60kcal ~3g protein
- Duration in minutes
- If nothing fits a category, return empty array`,
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
    meals: (parsed.meals || []).map(m => ({ ...m, id: crypto.randomUUID() })),
    training: (parsed.training || []).map(t => ({ ...t, id: crypto.randomUUID() })),
    fasting: parsed.fasting || { open: null, close: null, closeNextDay: null },
  }
}

export { getOpenAIKey }
