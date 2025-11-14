'use client';

import { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff, Image as ImageIcon, MessageSquare, Activity, Send } from 'lucide-react';

interface Message {
  id: string;
  type: 'text' | 'image';
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [prompt, setPrompt] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const messageIdRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev.slice(-99), message]); // Keep last 100 messages
        } else if (data.type === 'text' && data.text) {
          // Handle text message
          const message: Message = {
            id: `msg_${messageIdRef.current++}`,
            type: 'text',
            content: data.text,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev.slice(-99), message]);
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
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev.slice(-99), message]);
              return;
            }
          }
          
          // Regular text message
          const message: Message = {
            id: `msg_${messageIdRef.current++}`,
            type: 'text',
            content: text,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev.slice(-99), message]);
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollContainerRef.current && messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 50);
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const sendMessage = () => {
    if (!prompt.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const messageText = prompt.trim();
    
    // Send message to WebSocket server (server will process with OpenAI)
    wsRef.current.send(messageText);
    
    // Clear input
    setPrompt('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="min-h-screen bg-white p-4 pt-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-2 border-black mb-4 p-3 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter mb-1 text-black">
                WebSocket Monitor
              </h1>
              <p className="text-sm font-bold text-black uppercase">
                Real-time message stream
              </p>
            </div>
            <div className={`border-2 border-black px-4 py-2 flex items-center gap-2 font-black text-sm uppercase ${
              isConnected ? 'bg-black text-white' : 'bg-white text-black'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span>Disconnected</span>
                </>
              )}
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <div className="border-2 border-black px-3 py-1.5 bg-black text-white font-bold text-xs uppercase">
              <Activity className="inline-block h-3 w-3 mr-1.5" />
              {messages.length} Total
            </div>
            <div className="border-2 border-black px-3 py-1.5 bg-white text-black font-bold text-xs uppercase">
              <MessageSquare className="inline-block h-3 w-3 mr-1.5" />
              {messages.filter(m => m.type === 'text').length} Text
            </div>
            <div className="border-2 border-black px-3 py-1.5 bg-white text-black font-bold text-xs uppercase">
              <ImageIcon className="inline-block h-3 w-3 mr-1.5" />
              {messages.filter(m => m.type === 'image').length} Images
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="border-2 border-black bg-white">
          <div 
            ref={scrollContainerRef}
            className="h-[calc(100vh-280px)] min-h-[500px] overflow-y-auto p-4"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="border-2 border-black p-6 mb-4">
                  <MessageSquare className="h-12 w-12 text-black" />
                </div>
                <p className="text-xl font-black uppercase text-black mb-2">
                  Waiting for messages
                </p>
                <p className="text-sm font-bold text-black uppercase">
                  No messages received yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className="border-2 border-black bg-white p-4"
                  >
                    {/* Message Header */}
                    <div className="flex items-start justify-between mb-3 pb-2 border-b-2 border-black">
                      <div className="flex items-center gap-2">
                        {msg.type === 'image' ? (
                          <div className="border-2 border-black px-2 py-1 bg-black text-white font-black text-xs uppercase">
                            <ImageIcon className="inline-block h-3 w-3 mr-1" />
                            Image
                          </div>
                        ) : (
                          <div className="border-2 border-black px-2 py-1 bg-white text-black font-black text-xs uppercase">
                            <MessageSquare className="inline-block h-3 w-3 mr-1" />
                            Text
                          </div>
                        )}
                      </div>
                      <div className="border-2 border-black px-2 py-1 bg-black text-white font-mono font-bold text-xs">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                    
                    {/* Message Content */}
                    {msg.type === 'image' ? (
                      <div className="border-2 border-black p-2 bg-white">
                        <img 
                          src={msg.content} 
                          alt="Received image" 
                          className="max-w-full max-h-[600px] mx-auto object-contain"
                          onError={(e) => {
                            console.error('Image load error:', e);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="border-2 border-black p-4 bg-white">
                        <pre className="text-xl font-mono text-black whitespace-pre-wrap break-words leading-relaxed font-bold">
                          {msg.content}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Section */}
        <div className="border-2 border-black mt-4 p-3 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message and press Enter..."
              className="flex-1 border-2 border-black px-4 py-2 font-mono text-sm bg-white text-black placeholder-black/50 focus:outline-none focus:bg-black focus:text-white uppercase"
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || !prompt.trim()}
              className={`border-2 border-black px-6 py-2 font-black text-sm uppercase flex items-center gap-2 ${
                isConnected && prompt.trim()
                  ? 'bg-black text-white hover:bg-white hover:text-black'
                  : 'bg-white text-black opacity-50 cursor-not-allowed'
              } transition-colors`}
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
          <p className="text-xs text-black/70 mt-2 font-bold uppercase">
            {isConnected ? 'Connected - Messages sent to server, AI responses for questions (?)' : 'Disconnected - Cannot send messages'}
          </p>
        </div>
      </div>
    </main>
  );
}
