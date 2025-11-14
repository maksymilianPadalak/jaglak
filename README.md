# WebRTC Signaling Server

A raw WebSocket-based signaling server for WebRTC peer-to-peer connections. Compatible with Unreal Engine WebRTC and any WebRTC client.

## Features

- Raw WebSocket protocol (no Socket.io overhead)
- Room-based peer connections
- JSON message protocol
- Compatible with Unreal Engine WebRTC plugins
- Simple and lightweight

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Build TypeScript:
```bash
pnpm run build
```

3. Start the server:
```bash
pnpm start
```

For development with auto-reload (runs TypeScript directly):
```bash
pnpm dev
```

The server will run on `ws://localhost:3000`

## WebSocket Protocol

All messages are JSON formatted:

### Client → Server Messages

**Join Room:**
```json
{
  "type": "join-room",
  "roomId": "room1"
}
```

**Send Offer:**
```json
{
  "type": "offer",
  "target": "peer_1",
  "offer": { /* RTCSessionDescriptionInit */ }
}
```

**Send Answer:**
```json
{
  "type": "answer",
  "target": "peer_1",
  "answer": { /* RTCSessionDescriptionInit */ }
}
```

**Send ICE Candidate:**
```json
{
  "type": "ice-candidate",
  "target": "peer_1",
  "candidate": { /* RTCIceCandidateInit */ }
}
```

**Leave Room:**
```json
{
  "type": "leave-room"
}
```

### Server → Client Messages

**Connected:**
```json
{
  "type": "connected",
  "socketId": "peer_1"
}
```

**Existing Users:**
```json
{
  "type": "existing-users",
  "users": ["peer_2", "peer_3"]
}
```

**User Joined:**
```json
{
  "type": "user-joined",
  "userId": "peer_2"
}
```

**User Left:**
```json
{
  "type": "user-left",
  "userId": "peer_2"
}
```

**Offer/Answer/ICE Candidate** (forwarded from other peers):
```json
{
  "type": "offer", // or "answer" or "ice-candidate"
  "sender": "peer_2",
  "offer": { /* RTCSessionDescriptionInit */ }
}
```

**Error:**
```json
{
  "type": "error",
  "message": "Error description"
}
```

## Usage with Unreal Engine

1. Connect to `ws://localhost:3000` (or your server's IP)
2. Wait for `connected` message to get your `socketId`
3. Send `join-room` with your room ID
4. When you receive `existing-users` or `user-joined`, create WebRTC offers/answers
5. Exchange SDP offers/answers and ICE candidates through the server
6. Once connected, video/audio streams directly between peers

## Port

The server runs on port 3000 by default. Change it with:
```bash
PORT=8080 pnpm start
```

## Notes

- For production, use HTTPS/WSS (required by browsers for WebRTC)
- Consider adding a TURN server for better connectivity behind restrictive firewalls
- The server only handles signaling - actual media streams are peer-to-peer
