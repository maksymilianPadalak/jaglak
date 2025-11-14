'use client';

import { useEffect, useRef, useState } from 'react';

interface Connection {
  id: string;
  connectedAt: string;
}

interface Message {
  id: string;
  type: 'connection' | 'message' | 'stream';
  clientId?: string;
  text?: string;
  timestamp?: string;
  action?: 'connected' | 'disconnected';
  totalConnections?: number;
}

export default function MonitorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messageIdRef = useRef(0);

  useEffect(() => {
    // Connect to production WebSocket server
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 
      (typeof window !== 'undefined' && window.location.protocol === 'https:' 
        ? 'wss://jaglak.onrender.com' 
        : 'ws://localhost:3000');
    
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to monitoring server');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle connection list (sent when first connecting)
        if (data.type === 'connection-list') {
          setConnections(data.connections || []);
          return;
        }

        // Handle connection events
        if (data.type === 'connection') {
          const message: Message = {
            id: `msg_${messageIdRef.current++}`,
            type: 'connection',
            clientId: data.clientId,
            action: data.action,
            totalConnections: data.totalConnections,
            timestamp: data.timestamp,
          };
          setMessages((prev) => [...prev.slice(-199), message]); // Keep last 200 messages
          
          // Update connections list
          if (data.action === 'connected') {
            setConnections((prev) => [...prev, { id: data.clientId, connectedAt: data.timestamp }]);
          } else if (data.action === 'disconnected') {
            setConnections((prev) => prev.filter((conn) => conn.id !== data.clientId));
          }
          return;
        }

        // Handle client messages
        if (data.type === 'message') {
          const message: Message = {
            id: `msg_${messageIdRef.current++}`,
            type: 'message',
            clientId: data.clientId,
            text: data.text,
            timestamp: data.timestamp,
          };
          setMessages((prev) => [...prev.slice(-199), message]);
          return;
        }

        // Handle stream messages
        if (data.type === 'stream') {
          const message: Message = {
            id: `msg_${messageIdRef.current++}`,
            type: 'stream',
            text: data.text,
            timestamp: data.timestamp,
          };
          setMessages((prev) => [...prev.slice(-199), message]);
          return;
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from monitoring server');
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatDate = (timestamp?: string): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              WebSocket Monitor
            </h1>
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? '● Connected' : '○ Disconnected'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Active Connections</div>
              <div className="text-3xl font-bold text-blue-800">{connections.length}</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium">Total Messages</div>
              <div className="text-3xl font-bold text-purple-800">{messages.length}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">Connection Events</div>
              <div className="text-3xl font-bold text-green-800">
                {messages.filter(m => m.type === 'connection').length}
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-sm text-orange-600 font-medium">Client Messages</div>
              <div className="text-3xl font-bold text-orange-800">
                {messages.filter(m => m.type === 'message').length}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Connections Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Active Connections ({connections.length})
              </h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {connections.length === 0 ? (
                  <div className="text-gray-500 text-sm text-center py-8">
                    No active connections
                  </div>
                ) : (
                  connections.map((conn) => (
                    <div key={conn.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-sm font-mono font-semibold text-blue-700 mb-1">
                        {conn.id}
                      </div>
                      <div className="text-xs text-gray-600">
                        Connected: {formatDate(conn.connectedAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Messages Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                All Messages ({messages.length})
              </h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-gray-500 text-center py-12">
                    Waiting for messages...
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`text-sm rounded-lg p-3 border-2 ${
                        msg.type === 'connection'
                          ? msg.action === 'connected'
                            ? 'border-green-300 bg-green-50'
                            : 'border-red-300 bg-red-50'
                          : msg.type === 'message'
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-purple-300 bg-purple-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {msg.type === 'connection' && (
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${
                              msg.action === 'connected' 
                                ? 'bg-green-200 text-green-800' 
                                : 'bg-red-200 text-red-800'
                            }`}>
                              {msg.action === 'connected' ? '✓ Connected' : '✗ Disconnected'}
                            </span>
                          )}
                          {msg.type === 'message' && (
                            <span className="text-xs px-2 py-1 rounded bg-blue-200 text-blue-800 font-semibold">
                              📨 Message
                            </span>
                          )}
                          {msg.type === 'stream' && (
                            <span className="text-xs px-2 py-1 rounded bg-purple-200 text-purple-800 font-semibold">
                              📡 Stream
                            </span>
                          )}
                          {msg.clientId && (
                            <span className="text-xs font-mono text-gray-600">
                              {msg.clientId}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                      {msg.text && (
                        <div className="text-gray-800 font-mono text-sm bg-white/50 p-2 rounded mt-1 break-words">
                          {msg.text}
                        </div>
                      )}
                      {msg.type === 'connection' && (
                        <div className="text-xs text-gray-600 mt-1">
                          Total connections: {msg.totalConnections}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

