import { envConfig, type ApiKeyNames, type Provider } from './env.config';

type HelloOutput = {
  ok: true;
  provider: Provider;
  model: string;
  message: string;
};

type GeminiGenerateContent = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

type OpenAiChatCompletion = {
  choices?: Array<{ message?: { content?: string } }>;
};

const COMMON_HEADERS = {
  'Content-Type': 'application/json',
};

async function postToAi<T>(
  url: string,
  body: object,
  apiKey?: string
): Promise<T> {
  const headers: Record<string, string> = { ...COMMON_HEADERS };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON response from ${url}`, {
      cause: error,
    });
  }
}

async function helloGemini(): Promise<HelloOutput> {
  const apiKey = envConfig.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY is not set');

  const model = 'gemini-2.5-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const json = await postToAi<GeminiGenerateContent>(url, {
    contents: [{ parts: [{ text: 'say a short hello' }] }],
  });

  const text =
    json.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Hello as default';

  return {
    ok: true,
    provider: 'gemini',
    model,
    message: String(text).trim(),
  };
}

async function helloGroq(): Promise<HelloOutput> {
  const apiKey = envConfig.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const model = 'llama-3.1-8b-instant';
  const url = `https://api.groq.com/openai/v1/chat/completions`;

  const json = await postToAi<OpenAiChatCompletion>(
    url,
    {
      model,
      messages: [{ role: 'user', content: 'say a short hello' }],
      temperature: 0,
    },
    apiKey
  );

  const content = json.choices?.[0]?.message?.content ?? 'Hello as default';

  return {
    ok: true,
    provider: 'groq',
    model,
    message: String(content).trim(),
  };
}

async function helloOpenAi(): Promise<HelloOutput> {
  const apiKey = envConfig.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const model = 'gpt-4o-mini-2024-07-18';
  const url = `https://api.openai.com/v1/chat/completions`;

  const json = await postToAi<OpenAiChatCompletion>(
    url,
    {
      model,
      messages: [{ role: 'user', content: 'say a short hello' }],
      temperature: 0,
    },
    apiKey
  );
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
  const forced = envConfig.PROVIDER;

  const providers: Record<
    Provider,
    { fn: () => Promise<HelloOutput>; key: ApiKeyNames }
  > = {
    gemini: { fn: helloGemini, key: 'GOOGLE_API_KEY' },
    groq: { fn: helloGroq, key: 'GROQ_API_KEY' },
    openai: { fn: helloOpenAi, key: 'OPENAI_API_KEY' },
  } as const;

  // 1. Handle explicit forced provider
  if (forced && forced in providers) {
    const config = providers[forced as Provider];
    if (!envConfig[config.key]) {
      throw new Error(
        `Unsupported or empty ${forced} provider. Use ${Object.keys(providers).join('|')} or set ${config.key}`
      );
    }
    return config.fn();
  }

  let attemptedCount = 0;

  // 2. Auto discover based on available keys
  for (const { fn, key } of Object.values(providers)) {
    if (envConfig[key]) {
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
    `All attempted providers (${attemptedCount}) failed`
  );
}
