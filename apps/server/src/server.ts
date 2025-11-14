import http from 'http';
import express from 'express';
import path from 'path';
import { WebSocket, WebSocketServer } from 'ws';
import { ClientMessage, ServerMessage } from '@jaglak/shared-types';

interface Peer {
  ws: WebSocket;
  roomId: string | null;
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Store connected peers: Map<socketId, Peer>
const peers = new Map<string, Peer>();
// Store rooms: Map<roomId, Set<socketId>>
const rooms = new Map<string, Set<string>>();

let nextId = 1;

wss.on('connection', (ws: WebSocket) => {
  const socketId = `peer_${nextId++}`;
  peers.set(socketId, { ws, roomId: null });
  
  console.log(`Peer connected: ${socketId}`);

  ws.on('message', (message: Buffer) => {
    try {
      const data = JSON.parse(message.toString()) as ClientMessage;
      handleMessage(socketId, data);
    } catch (error) {
      console.error(`Error parsing message from ${socketId}:`, error);
      sendError(ws, 'Invalid JSON');
    }
  });

  ws.on('close', () => {
    console.log(`Peer disconnected: ${socketId}`);
    const peer = peers.get(socketId);
    if (peer && peer.roomId) {
      leaveRoom(socketId, peer.roomId);
    }
    peers.delete(socketId);
  });

  ws.on('error', (error: Error) => {
    console.error(`WebSocket error for ${socketId}:`, error);
  });

  // Send welcome message with socket ID
  send(ws, { type: 'connected', socketId });
});

function handleMessage(socketId: string, data: ClientMessage): void {
  const peer = peers.get(socketId);
  if (!peer) return;

  switch (data.type) {
    case 'join-room':
      joinRoom(socketId, data.roomId);
      break;
    
    case 'offer':
      forwardOffer(socketId, data);
      break;
    
    case 'answer':
      forwardAnswer(socketId, data);
      break;
    
    case 'ice-candidate':
      forwardIceCandidate(socketId, data);
      break;
    
    case 'leave-room':
      if (peer.roomId) {
        leaveRoom(socketId, peer.roomId);
      }
      break;
    
    default:
      sendError(peer.ws, `Unknown message type: ${(data as any).type}`);
  }
}

function joinRoom(socketId: string, roomId: string): void {
  const peer = peers.get(socketId);
  if (!peer) return;

  // Leave previous room if any
  if (peer.roomId && peer.roomId !== roomId) {
    leaveRoom(socketId, peer.roomId);
  }

  // Join new room
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }

  const room = rooms.get(roomId)!;
  room.add(socketId);
  peer.roomId = roomId;

  console.log(`Peer ${socketId} joined room ${roomId}`);

  // Send list of existing users
  const otherUsers = Array.from(room).filter(id => id !== socketId);
  send(peer.ws, { type: 'existing-users', users: otherUsers });

  // Notify other users
  otherUsers.forEach(userId => {
    const otherPeer = peers.get(userId);
    if (otherPeer) {
      send(otherPeer.ws, { type: 'user-joined', userId: socketId });
    }
  });
}

function leaveRoom(socketId: string, roomId: string): void {
  const peer = peers.get(socketId);
  if (!peer) return;

  const room = rooms.get(roomId);
  if (room) {
    room.delete(socketId);
    
    // Notify other users
    room.forEach(userId => {
      const otherPeer = peers.get(userId);
      if (otherPeer) {
        send(otherPeer.ws, { type: 'user-left', userId: socketId });
      }
    });

    // Clean up empty rooms
    if (room.size === 0) {
      rooms.delete(roomId);
    }
  }

  peer.roomId = null;
  console.log(`Peer ${socketId} left room ${roomId}`);
}

function forwardOffer(socketId: string, data: { target: string; offer: RTCSessionDescriptionInit }): void {
  const targetPeer = peers.get(data.target);
  if (!targetPeer) {
    const peer = peers.get(socketId);
    if (peer) {
      sendError(peer.ws, `Target peer not found: ${data.target}`);
    }
    return;
  }

  console.log(`Forwarding offer from ${socketId} to ${data.target}`);
  send(targetPeer.ws, {
    type: 'offer',
    offer: data.offer,
    sender: socketId
  });
}

function forwardAnswer(socketId: string, data: { target: string; answer: RTCSessionDescriptionInit }): void {
  const targetPeer = peers.get(data.target);
  if (!targetPeer) {
    const peer = peers.get(socketId);
    if (peer) {
      sendError(peer.ws, `Target peer not found: ${data.target}`);
    }
    return;
  }

  console.log(`Forwarding answer from ${socketId} to ${data.target}`);
  send(targetPeer.ws, {
    type: 'answer',
    answer: data.answer,
    sender: socketId
  });
}

function forwardIceCandidate(socketId: string, data: { target: string; candidate: RTCIceCandidateInit }): void {
  const targetPeer = peers.get(data.target);
  if (!targetPeer) {
    const peer = peers.get(socketId);
    if (peer) {
      sendError(peer.ws, `Target peer not found: ${data.target}`);
    }
    return;
  }

  console.log(`Forwarding ICE candidate from ${socketId} to ${data.target}`);
  send(targetPeer.ws, {
    type: 'ice-candidate',
    candidate: data.candidate,
    sender: socketId
  });
}

function send(ws: WebSocket, data: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function sendError(ws: WebSocket, message: string): void {
  send(ws, { type: 'error', message });
}

// Broadcast "Iberion nie zyje" every 5 seconds to all connected clients
setInterval(() => {
  const message: ServerMessage = {
    type: 'stream',
    text: 'Iberion nie zyje'
  };
  
  peers.forEach((peer) => {
    send(peer.ws, message);
  });
  
  console.log(`Broadcasted: ${message.text}`);
}, 5000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebRTC signaling server running on http://localhost:${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}`);
  console.log(`Ready for Unreal Engine and WebRTC clients`);
  console.log(`Streaming "Iberion nie zyje" every 5 seconds to all connected clients`);
});

