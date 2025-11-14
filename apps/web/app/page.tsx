'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to production WebSocket server
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 
      (typeof window !== 'undefined' && window.location.protocol === 'https:' 
        ? 'wss://jaglak.onrender.com' 
        : 'ws://jaglak.onrender.com');
    
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to server');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.text) {
        setMessages((prev) => [...prev.slice(-49), data.text]); // Keep last 50 messages
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          WebSocket Stream
        </h1>

        <div className={`p-4 rounded-lg mb-6 text-center ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
          <div className="text-sm font-semibold text-gray-800 mb-4">
            Messages ({messages.length}):
          </div>
          <div className="space-y-2">
            {messages.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                Waiting for messages...
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="text-gray-700 font-mono text-sm bg-white p-2 rounded border">
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
