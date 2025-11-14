'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wifi, WifiOff, Image as ImageIcon, MessageSquare, Activity } from 'lucide-react';

interface Message {
  id: string;
  type: 'text' | 'image';
  content: string;
  timestamp: Date;
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
    if (messages.length > 0) {
      // Find the ScrollArea viewport element
      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth',
          });
        }, 100);
      }
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-card/95 backdrop-blur-xl shadow-2xl border-border/50">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-2">
                <CardTitle className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  WebSocket Monitor
                </CardTitle>
                <CardDescription className="text-lg">
                  Real-time message and image streaming dashboard
                </CardDescription>
              </div>
              <Badge 
                variant={isConnected ? 'default' : 'destructive'}
                className="text-base px-5 py-2.5 flex items-center gap-2 h-auto"
              >
                {isConnected ? (
                  <>
                    <Wifi className="h-5 w-5" />
                    <span className="font-semibold">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5" />
                    <span className="font-semibold">Disconnected</span>
                  </>
                )}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <Badge variant="secondary" className="text-base px-4 py-2 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {messages.length} Total
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {messages.filter(m => m.type === 'text').length} Text
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                {messages.filter(m => m.type === 'image').length} Images
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-[calc(100vh-320px)] min-h-[700px] w-full rounded-lg">
              <div className="space-y-6 pr-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-32">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
                      <MessageSquare className="h-24 w-24 text-muted-foreground relative z-10" />
                    </div>
                    <p className="text-2xl text-muted-foreground font-semibold mt-8">Waiting for messages...</p>
                    <p className="text-base text-muted-foreground/70 mt-2">Messages and images will appear here when received</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <Card key={msg.id} className="bg-card shadow-lg hover:shadow-xl transition-all duration-300 border-border/50">
                      <CardContent className="p-8">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3">
                            {msg.type === 'image' ? (
                              <Badge variant="secondary" className="text-base px-4 py-2">
                                <ImageIcon className="h-5 w-5 mr-2" />
                                Image
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-base px-4 py-2">
                                <MessageSquare className="h-5 w-5 mr-2" />
                                Text Message
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground font-mono bg-muted px-3 py-1.5 rounded-md">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        
                        {msg.type === 'image' ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-full max-w-6xl overflow-hidden rounded-xl border-2 border-border bg-muted/30 p-6 shadow-inner">
                              <img 
                                src={msg.content} 
                                alt="Received image" 
                                className="max-w-full max-h-[800px] mx-auto rounded-lg shadow-2xl object-contain"
                                onError={(e) => {
                                  console.error('Image load error:', e);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-muted/50 rounded-xl p-8 border border-border">
                            <pre className="text-2xl font-mono text-foreground whitespace-pre-wrap break-words leading-relaxed">
                              {msg.content}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
