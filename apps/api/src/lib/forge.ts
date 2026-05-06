const API_BASE = process.env.FORGE_API_BASE ?? 'https://node06.tail332136.ts.net/v1'
const API_KEY = process.env.FORGE_API_KEY ?? ''
const MODEL = process.env.FORGE_MODEL ?? 'forge'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  choices: { message: { content: string } }[]
}

export async function forgeChat(messages: Message[], maxTokens = 1500): Promise<string> {
  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Forge API error ${res.status}: ${text}`)
  }

  const json = (await res.json()) as ChatResponse
  return json.choices[0]?.message?.content ?? ''
}
