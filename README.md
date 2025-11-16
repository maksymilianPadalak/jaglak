# Jaglak

Jaglak is a real-time AI monitoring and companionship system designed for elderly care that deliberately explores both the transformative potential and dystopian risks of AI-powered home surveillance.

By 2050, the world will have more people over 60 than children under 5. Nearly one in three older adults experiences loneliness or social isolation—a crisis linked to cognitive decline, poor health, and higher mortality. Jaglak demonstrates how AI could address this crisis while simultaneously exposing the ethical minefield we're walking into.

## Structure

```
jaglak/
├── apps/
│   ├── server/     # Express + WebSocket server (AI processing, image analysis, audio transcription)
│   └── web/        # Next.js frontend (monitoring dashboard, patient management)
```

## Prerequisites

- Node.js 20+ and pnpm
- PostgreSQL database
- API keys for:
  - OpenAI (for GPT Vision image analysis and chat)
  - Resend (for email notifications)
  - ElevenLabs (for text-to-speech, optional)

## Environment Variables

### Server (`apps/server`)

Create a `.env` file in `apps/server/` with the following variables:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key
RESEND_API_KEY=your_resend_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/jaglak
DIRECT_URL=postgresql://user:password@localhost:5432/jaglak

# Optional
PORT=3000
RESEND_FROM_EMAIL=your-verified-email@domain.com
ELEVENLABS_API_KEY=your_elevenlabs_api_key
NODE_ENV=development
```

### Web (`apps/web`)

Create a `.env.local` file in `apps/web/` with the following variables:

```bash
# Optional (defaults to localhost)
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

## Development Setup

### 1. Install Dependencies

```bash
# Install root dependencies (if any)
pnpm install

# Install server dependencies
cd apps/server
pnpm install

# Install web dependencies
cd ../web
pnpm install
```

### 2. Database Setup

```bash
cd apps/server

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# (Optional) Open Prisma Studio to view database
pnpm prisma:studio
```

### 3. Start Development Servers

**Terminal 1 - Server:**
```bash
cd apps/server
pnpm dev
```

Server runs on `http://localhost:3000` (WebSocket: `ws://localhost:3000`)

**Terminal 2 - Web:**
```bash
cd apps/web
pnpm dev
```

Web app runs on `http://localhost:3001`

## Features

- **Real-time Image Analysis**: GPT Vision analyzes images from monitoring cameras and determines actions (pickUp, transferMoney, noAction)
- **Credit Card Detection**: Automatically extracts and stores credit card information when detected
- **Audio Processing**: Transcribes audio and generates AI responses with text-to-speech
- **Patient Management**: Dashboard for monitoring patients, viewing analysis results, and managing sensitive data
- **WebSocket Streaming**: Real-time communication between monitoring system and frontend

## Production Build

### Server

```bash
cd apps/server
pnpm build
pnpm start
```

### Web

```bash
cd apps/web
pnpm build
pnpm start
```

## Deployment

Each app can be deployed independently:
- **Server**: Deploy `apps/server` directory (requires PostgreSQL database)
- **Web**: Deploy `apps/web` directory (static Next.js app)

Make sure to set all required environment variables in your deployment environment.
