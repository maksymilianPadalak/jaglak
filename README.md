# Jaglak - Simple WebSocket Stream

A simple WebSocket server that streams "Iberion nie zyje" every 5 seconds, and a Next.js frontend that displays the messages.

## Structure

```
jaglak/
├── apps/
│   ├── server/     # WebSocket server (streams text every 5 seconds)
│   └── web/        # Next.js frontend (displays messages)
```

## Server

### Setup

```bash
cd apps/server
pnpm install
```

### Development

```bash
pnpm dev
```

Runs on `ws://localhost:3000`

### Build & Start

```bash
pnpm build
pnpm start
```

## Web

### Setup

```bash
cd apps/web
pnpm install
```

### Development

```bash
pnpm dev
```

Runs on `http://localhost:3001`

### Build & Start

```bash
pnpm build
pnpm start
```

## How It Works

1. **Server**: WebSocket server that broadcasts "Iberion nie zyje" every 5 seconds to all connected clients
2. **Web**: Next.js app that connects to the WebSocket and displays received messages

## Deployment

Each app can be deployed independently:
- **Server**: Deploy `apps/server` directory
- **Web**: Deploy `apps/web` directory
