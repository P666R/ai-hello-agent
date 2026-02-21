# AI Hello Agent

A lightweight TypeScript CLI application that tests connectivity with multiple AI provider APIs (Google Gemini, Groq, and OpenAI) by sending a simple "hello" prompt and returning the response.

## Features

- **Multi-Provider Support**: Seamlessly work with Google Gemini, Groq, and OpenAI
- **Auto-Discovery**: Automatically detects available providers based on configured API keys
- **Provider Forcing**: Explicitly specify which provider to use via environment variable
- **Robust Error Handling**: Comprehensive error reporting for debugging API issues
- **Type-Safe**: Built with TypeScript for reliability and better development experience
- **Lightweight**: Minimal dependencies, fast startup time

## Supported Providers

| Provider      | Model                  | Environment Variable |
| ------------- | ---------------------- | -------------------- |
| Google Gemini | gemini-2.5-flash-lite  | `GOOGLE_API_KEY`     |
| Groq          | llama-3.1-8b-instant   | `GROQ_API_KEY`       |
| OpenAI        | gpt-4o-mini-2024-07-18 | `OPENAI_API_KEY`     |

## Installation

### Prerequisites

- Node.js 20+
- npm

### Setup

1. Clone the repository or extract the project files

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with your API keys:

   ```env
   # Add at least one API key
   GOOGLE_API_KEY=your_google_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here

   # Optional: Force a specific provider
   PROVIDER=gemini
   ```

## Configuration

### Environment Variables

- **`GOOGLE_API_KEY`** (optional): Google API key for Gemini
- **`GROQ_API_KEY`** (optional): Groq API key
- **`OPENAI_API_KEY`** (optional): OpenAI API key
- **`PROVIDER`** (optional): Force a specific provider (`gemini`, `groq`, or `openai`)

### Provider Selection Strategy

The application follows this priority:

1. **Explicit Provider**: If `PROVIDER` env var is set, use that provider (must be valid)
2. **Auto-Discovery**: Tries each configured provider in order: Gemini → Groq → OpenAI
3. **All Failed**: If all configured providers fail, throws an AggregateError with details

## Usage

### Development Mode

Run in watch mode with auto-reload:

```bash
npm run dev
```

### Example Output

```json
{
  "ok": true,
  "provider": "gemini",
  "model": "gemini-2.5-flash-lite",
  "message": "Hello! How can I assist you today?"
}
```

## Project Structure

```text
ai-hello-agent/
├── src/
│ ├── index.ts
│ ├── provider.ts
│ └── env.ts
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── README.md
```

## File Descriptions

### `src/index.ts`

The main entry point that:

- Loads environment variables
- Calls the provider selection logic
- Outputs results as formatted JSON
- Handles and reports errors with detailed messaging

### `src/provider.ts`

Contains:

- `helloGemini()`: Calls Google Generative AI API
- `helloGroq()`: Calls Groq API
- `helloOpenAi()`: Calls OpenAI API
- `selectAndHello()`: Core logic for provider selection and fallback

### `src/env.ts`

Utility for loading environment variables from `.env` file using `dotenv`

## Error Handling

The application provides detailed error messages for:

### Single Provider Errors

When a specific provider is forced or all providers fail:

```json
Error: GOOGLE_API_KEY is not set
```

### Provider-Specific Errors

API errors include HTTP status codes and response details:

```json
Error: Gemini 400: Invalid API key
```

### Multiple Provider Failures

When auto-discovering and multiple providers fail:

```json
All 2 attempted providers failed:
    1: GROQ_API_KEY is not set
    2: OpenAI 429: Rate limit exceeded
```

## Development

### Scripts

- `npm run dev` - Start development server with watch mode

### Formatting and Linting

This project uses:

- **ESLint**: Code quality and style (JavaScript)
- **Prettier**: Code formatting
- **TypeScript ESLint**: TypeScript-specific linting

## API Integration Details

### Request Format

All providers receive the same prompt:

```text
"say a short hello"
```

### Response Format

Responses are normalized to a consistent output:

```typescript
{
  ok: true,
  provider: 'gemini' | 'groq' | 'openai',
  model: string,
  message: string
}
```

## License

ISC

## Contributing

Feel free to submit issues and enhancement requests!
