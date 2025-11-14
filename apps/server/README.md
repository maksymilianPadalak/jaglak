# WebSocket Server with OpenAI Integration

## Environment Variables

Set the following environment variable:

- `OPENAI_API_KEY` - Your OpenAI API key (required for AI features)

For local development, create a `.env` file in the `apps/server` directory:

```
OPENAI_API_KEY=your-api-key-here
```

For production deployment (e.g., Render), add the environment variable in your deployment platform's dashboard.

## Features

- WebSocket server for real-time messaging
- Image and text message broadcasting
- OpenAI GPT-4o-mini integration for automatic responses to questions (messages ending with `?`)

## Usage

The server automatically processes text messages that end with `?` and generates AI responses using GPT-4o-mini.

