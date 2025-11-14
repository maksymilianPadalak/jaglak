# Web Frontend with OpenAI Integration

## Environment Variables

Set the following environment variable for OpenAI API access:

- `NEXT_PUBLIC_OPENAI_API_KEY` - Your OpenAI API key (required for AI features)

For local development, create a `.env.local` file in the `apps/web` directory:

```
NEXT_PUBLIC_OPENAI_API_KEY=your-api-key-here
```

For production deployment, add the environment variable in your deployment platform's dashboard.

## Features

- WebSocket connection for receiving messages from other clients
- Direct OpenAI GPT-4o-mini integration - send messages directly from the UI
- Real-time message display
- Auto-scroll to newest messages

## Usage

Type a message in the input field and press Enter or click Send. The message will be sent directly to OpenAI API and the response will appear in the message list.
