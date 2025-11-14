'use client';

import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  type: 'text' | 'image';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messageIdRef = useRef(0);

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
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'image' && data.data) {
          // Handle image message
          const message: Message = {
            id: `msg_${messageIdRef.current++}`,
            type: 'image',
            content: data.data,
          };
          setMessages((prev) => [...prev.slice(-49), message]); // Keep last 50 messages
        } else if (data.type === 'text' && data.text) {
          // Handle text message
          const message: Message = {
            id: `msg_${messageIdRef.current++}`,
            type: 'text',
            content: data.text,
          };
          setMessages((prev) => [...prev.slice(-49), message]);
        } else if (data.text) {
          // Legacy format - check if it's an image in text format
          const text = data.text;
          if (text.length > 1000) {
            // Try to detect base64 image data
            const base64Match = text.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
            if (base64Match) {
              const message: Message = {
                id: `msg_${messageIdRef.current++}`,
                type: 'image',
                content: base64Match[0],
              };
              setMessages((prev) => [...prev.slice(-49), message]);
              return;
            }
          }
          
          // Regular text message
          const message: Message = {
            id: `msg_${messageIdRef.current++}`,
            type: 'text',
            content: text,
          };
          setMessages((prev) => [...prev.slice(-49), message]);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
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
              messages.map((msg) => (
                <div key={msg.id} className="bg-white p-2 rounded border">
                  {msg.type === 'image' ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={msg.content} 
                        alt="Received image" 
                        className="max-w-full max-h-64 rounded border"
                        onError={(e) => {
                          console.error('Image load error:', e);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="text-xs text-gray-500 mt-1">Image</span>
                    </div>
                  ) : (
                    <div className="text-gray-700 font-mono text-sm break-words">
                      {msg.content}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
