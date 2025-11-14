# Jaglak - WebRTC Monorepo

A Turborepo monorepo containing a WebRTC signaling server and Next.js frontend.

## Structure

```
jaglak/
├── apps/
│   ├── server/     # WebRTC signaling server (Express + WebSocket)
│   └── web/         # Next.js frontend
├── packages/
│   └── shared-types/  # Shared TypeScript types
└── turbo.json       # Turborepo configuration
```

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Development

Run all apps in development mode:

```bash
pnpm dev
```

This will start:
- **Server**: `http://localhost:3000` (WebSocket signaling server)
- **Web**: `http://localhost:3001` (Next.js frontend)

### Build

Build all apps:

```bash
pnpm build
```

### Start Production

Start all apps in production mode:

```bash
pnpm start
```

## Individual App Commands

### Server

```bash
cd apps/server
pnpm dev    # Development with hot reload
pnpm build  # Build TypeScript
pnpm start  # Run production build
```

### Web (Next.js)

```bash
cd apps/web
pnpm dev    # Development server on port 3001
pnpm build  # Production build
pnpm start  # Production server on port 3001
```

## Environment Variables

### Web App

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

For production, use `wss://` (secure WebSocket):
```env
NEXT_PUBLIC_WS_URL=wss://your-server-domain.com
```

### Server

The server runs on port 3000 by default. Change it with:

```bash
PORT=8080 pnpm --filter @jaglak/server start
```

## How It Works

1. **Server** (`apps/server`): WebRTC signaling server using raw WebSocket
   - Handles room-based peer connections
   - Relays SDP offers/answers and ICE candidates
   - Broadcasts messages to connected clients

2. **Web** (`apps/web`): Next.js frontend
   - Connects to signaling server via WebSocket
   - Handles WebRTC peer connections
   - Displays local and remote video streams

3. **Shared Types** (`packages/shared-types`): TypeScript types shared between server and client

## Usage

1. Start the server: `pnpm dev` (or `pnpm --filter @jaglak/server dev`)
2. Open `http://localhost:3001` in your browser
3. Allow camera/microphone permissions
4. Enter a room ID and click "Join Room"
5. Share the room ID with your friend
6. Both users will see each other's video streams

## Technologies

- **Turborepo**: Monorepo build system
- **Next.js**: React framework
- **TypeScript**: Type safety
- **WebSocket**: Real-time signaling
- **WebRTC**: Peer-to-peer video/audio streaming
