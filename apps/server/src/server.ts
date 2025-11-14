import http from 'http';
import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';

interface ClientInfo {
  id: string;
  ws: WebSocket;
  connectedAt: Date;
}

interface ConnectionMessage {
  type: 'connection';
  clientId: string;
  action: 'connected' | 'disconnected';
  totalConnections: number;
  timestamp: string;
}

interface ClientMessage {
  type: 'message';
  clientId: string;
  text: string;
  timestamp: string;
}

interface StreamMessage {
  type: 'stream';
  text: string;
  timestamp: string;
}

type ServerMessage = ConnectionMessage | ClientMessage | StreamMessage;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Store connected clients with metadata
const clients = new Map<string, ClientInfo>();
let nextClientId = 1;

// Broadcast message to all connected clients
function broadcast(message: ServerMessage): void {
  const messageStr = JSON.stringify(message);
  clients.forEach((clientInfo) => {
    if (clientInfo.ws.readyState === WebSocket.OPEN) {
      clientInfo.ws.send(messageStr);
    }
  });
}

// Send current connection list to a specific client
function sendConnectionList(ws: WebSocket): void {
  const connectionList = Array.from(clients.values()).map((client) => ({
    id: client.id,
    connectedAt: client.connectedAt.toISOString(),
  }));
  
  ws.send(JSON.stringify({
    type: 'connection-list',
    connections: connectionList,
  }));
}

wss.on('connection', (ws: WebSocket) => {
  const clientId = `client_${nextClientId++}`;
  const clientInfo: ClientInfo = {
    id: clientId,
    ws,
    connectedAt: new Date(),
  };
  
  clients.set(clientId, clientInfo);
  console.log(`Client connected: ${clientId}`);

  // Send connection list to the new client
  sendConnectionList(ws);

  // Broadcast connection event to all clients
  broadcast({
    type: 'connection',
    clientId,
    action: 'connected',
    totalConnections: clients.size,
    timestamp: new Date().toISOString(),
  });

  // Handle incoming messages from client
  ws.on('message', (data: Buffer) => {
    try {
      const text = data.toString();
      console.log(`Message from ${clientId}: ${text}`);

      // Broadcast message to all clients (including sender)
      const message: ClientMessage = {
        type: 'message',
        clientId,
        text,
        timestamp: new Date().toISOString(),
      };
      
      broadcast(message);
    } catch (error) {
      console.error(`Error processing message from ${clientId}:`, error);
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${clientId}`);
    clients.delete(clientId);

    // Broadcast disconnection event to all clients
    broadcast({
      type: 'connection',
      clientId,
      action: 'disconnected',
      totalConnections: clients.size,
      timestamp: new Date().toISOString(),
    });
  });

  ws.on('error', (error: Error) => {
    console.error(`WebSocket error for ${clientId}:`, error);
    clients.delete(clientId);
  });
});

// Broadcast "Iberion nie zyje" every 5 seconds to all connected clients
setInterval(() => {
  if (clients.size > 0) {
    const message: StreamMessage = {
      type: 'stream',
      text: 'Iberion nie zyje',
      timestamp: new Date().toISOString(),
    };
    
    broadcast(message);
    console.log(`Broadcasted to ${clients.size} clients: Iberion nie zyje`);
  }
}, 5000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
  console.log(`Streaming "Iberion nie zyje" every 5 seconds`);
});
