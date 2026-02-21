type Provider = 'gemini' | 'groq' | 'openai';

type HelloOutput = {
  ok: true;
  provider: Provider;
  model: string;
  message: string;
};

type GeminiGenerateContent = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

async function helloGemini(): Promise<HelloOutput> {
  const apiKey = process.env['GOOGLE_API_KEY'];
  if (!apiKey) throw new Error('GOOGLE_API_KEY is not set');

  const model = 'gemini-2.5-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: 'say a short hello',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok)
    throw new Error(`Gemini ${response.status}: ${await response.text()}`);

  const json = (await response.json()) as GeminiGenerateContent;
  const text =
    json.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Hello as default';

  return {
    ok: true,
    provider: 'gemini',
    model,
    message: String(text).trim(),
  };
}

type OpenAiChatCompletion = {
  choices?: Array<{ message?: { content?: string } }>;
};

async function helloGroq(): Promise<HelloOutput> {
  const apiKey = process.env['GROQ_API_KEY'];
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const model = 'llama-3.1-8b-instant';
  const url = `https://api.groq.com/openai/v1/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: 'say a short hello',
        },
      ],
      temperature: 0,
    }),
  });

  if (!response.ok)
    throw new Error(`Groq ${response.status}: ${await response.text()}`);

  const json = (await response.json()) as OpenAiChatCompletion;
  const content = json.choices?.[0]?.message?.content ?? 'Hello as default';

  return {
    ok: true,
    provider: 'groq',
    model,
    message: String(content).trim(),
  };
}

async function helloOpenAi(): Promise<HelloOutput> {
  const apiKey = process.env['OPENAI_API_KEY'];
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const model = 'gpt-4o-mini-2024-07-18';
  const url = `https://api.openai.com/v1/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: 'say a short hello',
        },
      ],
      temperature: 0,
    }),
  });

  if (!response.ok)
    throw new Error(`OpenAi ${response.status}: ${await response.text()}`);

  const json = (await response.json()) as OpenAiChatCompletion;
  const content = json.choices?.[0]?.message?.content ?? 'Hello as default';

  return {
    ok: true,
    provider: 'openai',
    model,
    message: String(content).trim(),
  };
}

export async function selectAndHello(): Promise<HelloOutput> {
  const errors: Error[] = [];
  const forced = (process.env['PROVIDER'] || '').toLowerCase();

  const providers = {
    gemini: { fn: helloGemini, key: 'GOOGLE_API_KEY' },
    groq: { fn: helloGroq, key: 'GROQ_API_KEY' },
    openai: { fn: helloOpenAi, key: 'OPENAI_API_KEY' },
  } as const;

  // 1. Handle explicit forced provider
  if (forced) {
    const config = providers[forced as keyof typeof providers];
    if (!config) {
      throw new Error(
        `Unsupported provider=${forced}. Use ${Object.keys(providers).join('|')}`
      );
    }
    return config.fn();
  }

  let attemptedCount = 0;

  // 2. Auto discover based on available keys
  for (const { fn, key } of Object.values(providers)) {
    if (process.env[key]) {
      attemptedCount++;
      try {
        return await fn();
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  if (attemptedCount === 0) {
    throw new Error(
      'No provider configured: Set GOOGLE_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY'
    );
  }

  throw new AggregateError(
    errors,
    `All ${attemptedCount} attempted providers failed`
  );
}
