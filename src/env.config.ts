import '@dotenvx/dotenvx/config';
import { cleanEnv, str, port } from 'envalid';

export const providers = ['gemini', 'groq', 'openai'] as const; // ordered
export type Provider = (typeof providers)[number];

export const envConfig = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'test', 'production'],
    default: 'development',
    desc: 'Application environment',
  }),
  PORT: port({ default: 3000, desc: 'Application port' }),
  PROVIDER: str({
    default: '',
    choices: ['', ...providers],
    desc: 'Explicit AI provider (optional, enables auto-discovery if empty)',
  }),
  GOOGLE_API_KEY: str({
    default: '',
    desc: 'Gemini api key',
  }),
  GROQ_API_KEY: str({
    default: '',
    desc: 'Groq api key',
  }),
  OPENAI_API_KEY: str({
    default: '',
    desc: 'OpenAI api key',
  }),
});

export type ApiKeyNames = {
  [K in keyof typeof envConfig]: K extends `${string}_API_KEY` ? K : never;
}[keyof typeof envConfig];
