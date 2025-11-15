'use client';

import { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff, Image as ImageIcon, MessageSquare, Activity, MessageCircle, Music } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  type: 'text' | 'image' | 'audio';
  content: string;
  timestamp: Date;
  aiResponse?: string | null;
  transcription?: string | null;
  responseAudio?: string | null;
  isLoading?: boolean;
}

type FilterType = 'all' | 'text' | 'image' | 'audio';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
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
          // Handle image message - update existing message if same image, or create new one
          setMessages((prev) => {
            const existingIndex = prev.findIndex(
              (msg) => msg.type === 'image' && msg.content === data.data
            );
            
            if (existingIndex !== -1) {
              // Update existing message with AI response
              const updated = [...prev];
              updated[existingIndex] = {
                ...updated[existingIndex],
                aiResponse: data.aiResponse !== undefined ? data.aiResponse : updated[existingIndex].aiResponse,
                isLoading: data.isLoading !== undefined ? data.isLoading : updated[existingIndex].isLoading,
              };
              return updated;
            } else {
              // Create new message
              const message: Message = {
                id: `msg_${messageIdRef.current++}`,
                type: 'image',
                content: data.data,
                timestamp: new Date(),
                aiResponse: data.aiResponse ?? null,
                isLoading: data.isLoading ?? false,
              };
              return [...prev.slice(-99), message]; // Keep last 100 messages
            }
          });
        } else if (data.type === 'audio' && data.data) {
          // Handle audio message - update existing message if same audio, or create new one
          setMessages((prev) => {
            const existingIndex = prev.findIndex(
              (msg) => msg.type === 'audio' && msg.content === data.data && (msg.isLoading || !msg.transcription)
            );
            
            if (existingIndex !== -1) {
              // Update existing message with response
              const updated = [...prev];
              updated[existingIndex] = {
                ...updated[existingIndex],
                isLoading: data.isLoading !== undefined ? data.isLoading : updated[existingIndex].isLoading,
                transcription: data.transcription !== undefined ? data.transcription : updated[existingIndex].transcription,
                aiResponse: data.aiResponse !== undefined ? data.aiResponse : updated[existingIndex].aiResponse,
                responseAudio: data.responseAudio !== undefined ? data.responseAudio : updated[existingIndex].responseAudio,
              };
              return updated;
            } else {
              // Create new message
              const message: Message = {
                id: `msg_${messageIdRef.current++}`,
                type: 'audio',
                content: data.data,
                timestamp: new Date(),
                isLoading: data.isLoading ?? false,
                transcription: data.transcription ?? null,
                aiResponse: data.aiResponse ?? null,
                responseAudio: data.responseAudio ?? null,
              };
              return [...prev.slice(-99), message]; // Keep last 100 messages
            }
          });
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'all') return true;
    return msg.type === filter;
  });

  // Expose helper function for browser console to show success
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as typeof window & { showWSSuccess?: (message: string) => void }).showWSSuccess = (message: string) => {
        setSendSuccess(message);
        setTimeout(() => setSendSuccess(null), 3000);
      };
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollContainerRef.current && filteredMessages.length > 0) {
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
  }, [filteredMessages]);

  return (
    <main className="min-h-screen bg-white p-4 pt-12">
      <div className="max-w-6xl mx-auto">
        {/* Success Notification */}
        {sendSuccess && (
          <div className="fixed top-20 right-4 z-50 border-2 border-black bg-black text-white px-6 py-4 font-black text-sm uppercase shadow-lg animate-fade-in max-w-md">
            <div className="flex items-center gap-3">
              <div className="border-2 border-white w-6 h-6 flex items-center justify-center">
                <span className="text-white text-lg leading-none">✓</span>
              </div>
              <div className="flex-1">{sendSuccess}</div>
            </div>
          </div>
        )}
        
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
            <div className="flex items-center gap-2">
              <Link 
                href="/chat"
                className="border-2 border-black px-4 py-2 font-black text-sm uppercase flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                AI Chat
              </Link>
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
          </div>
          
          {/* Send Instructions */}
          <div className="mt-3 border-2 border-black bg-white p-3">
            <div className="text-xs font-black uppercase text-black mb-1">Send Files via Browser Console</div>
            <div className="text-xs font-bold text-black opacity-70">
              Use the WebSocket script in console to send images/audio files
            </div>
          </div>
          
          {/* Stats / Filters */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`border-2 border-black px-3 py-1.5 font-bold text-xs uppercase transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
            >
              <Activity className="inline-block h-3 w-3 mr-1.5" />
              {messages.length} Total
            </button>
            <button
              onClick={() => setFilter('text')}
              className={`border-2 border-black px-3 py-1.5 font-bold text-xs uppercase transition-colors cursor-pointer ${
                filter === 'text'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
            >
              <MessageSquare className="inline-block h-3 w-3 mr-1.5" />
              {messages.filter(m => m.type === 'text').length} Text
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`border-2 border-black px-3 py-1.5 font-bold text-xs uppercase transition-colors cursor-pointer ${
                filter === 'image'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
            >
              <ImageIcon className="inline-block h-3 w-3 mr-1.5" />
              {messages.filter(m => m.type === 'image').length} Images
            </button>
            <button
              onClick={() => setFilter('audio')}
              className={`border-2 border-black px-3 py-1.5 font-bold text-xs uppercase transition-colors cursor-pointer ${
                filter === 'audio'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
            >
              <Music className="inline-block h-3 w-3 mr-1.5" />
              {messages.filter(m => m.type === 'audio').length} Audio
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="border-2 border-black bg-white">
          <div 
            ref={scrollContainerRef}
            className="h-[calc(100vh-280px)] min-h-[500px] overflow-y-auto p-4"
          >
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="border-2 border-black p-6 mb-4">
                  {filter === 'all' ? (
                    <MessageSquare className="h-12 w-12 text-black" />
                  ) : filter === 'text' ? (
                    <MessageSquare className="h-12 w-12 text-black" />
                  ) : filter === 'image' ? (
                    <ImageIcon className="h-12 w-12 text-black" />
                  ) : (
                    <Music className="h-12 w-12 text-black" />
                  )}
                </div>
                <p className="text-xl font-black uppercase text-black mb-2">
                  {messages.length === 0 ? 'Waiting for messages' : `No ${filter === 'all' ? '' : filter} messages`}
                </p>
                <p className="text-sm font-bold text-black uppercase">
                  {messages.length === 0 ? 'No messages received yet' : `Try selecting a different filter`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMessages.map((msg) => (
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
                        ) : msg.type === 'audio' ? (
                          <div className="border-2 border-black px-2 py-1 bg-black text-white font-black text-xs uppercase">
                            <Music className="inline-block h-3 w-3 mr-1" />
                            Audio
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
                    {msg.type === 'audio' ? (
                      <div className="space-y-3">
                        {/* Audio Player */}
                        <div className="border-2 border-black p-2 bg-white">
                          <audio controls className="w-full">
                            <source src={msg.content} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                        
                        {/* Processing Status */}
                        <div className="border-2 border-black bg-white p-4">
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-black">
                            <div className="border-2 border-black px-2 py-1 bg-black text-white font-black text-xs uppercase">
                              Audio Processing
                            </div>
                          </div>
                          
                          {msg.isLoading ? (
                            <div className="flex items-center gap-4 py-6">
                              <div className="relative w-12 h-12 border-4 border-black">
                                <div className="absolute inset-0 border-4 border-black border-t-transparent animate-spin-brutal"></div>
                                <div className="absolute inset-2 border-2 border-black border-r-transparent animate-spin-brutal" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}></div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-base font-black uppercase text-black">
                                  Processing audio...
                                </span>
                                <span className="text-xs font-bold uppercase text-black opacity-60">
                                  Transcribing → Generating Response → Creating Audio
                                </span>
                              </div>
                            </div>
                          ) : msg.transcription && msg.aiResponse ? (
                            <div className="space-y-3">
                              {/* Transcription */}
                              <div className="border-2 border-black p-3 bg-black text-white">
                                <div className="text-xs font-black uppercase mb-2 opacity-70">Transcription</div>
                                <pre className="text-sm font-mono whitespace-pre-wrap break-words leading-relaxed">
                                  {msg.transcription}
                                </pre>
                              </div>
                              
                              {/* AI Response Text */}
                              <div className="border-2 border-black p-3 bg-black text-white">
                                <div className="text-xs font-black uppercase mb-2 opacity-70">AI Response</div>
                                <pre className="text-sm font-mono whitespace-pre-wrap break-words leading-relaxed">
                                  {msg.aiResponse}
                                </pre>
                              </div>
                              
                              {/* AI Response Audio */}
                              {msg.responseAudio && (
                                <div className="border-2 border-black p-3 bg-white">
                                  <div className="text-xs font-black uppercase mb-2 text-black">AI Audio Response</div>
                                  <audio controls className="w-full">
                                    <source src={msg.responseAudio} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                  </audio>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm font-bold uppercase text-black opacity-50">
                              No processing data available
                            </div>
                          )}
                        </div>
                      </div>
                    ) : msg.type === 'image' ? (
                      <div className="space-y-3">
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
                        
                        {/* AI Response Section */}
                        <div className="border-2 border-black bg-white p-4">
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-black">
                            <div className="border-2 border-black px-2 py-1 bg-black text-white font-black text-xs uppercase">
                              AI Analysis
                            </div>
                          </div>
                          
                          {msg.isLoading ? (
                            <div className="flex items-center gap-4 py-6">
                              <div className="relative w-12 h-12 border-4 border-black">
                                <div className="absolute inset-0 border-4 border-black border-t-transparent animate-spin-brutal"></div>
                                <div className="absolute inset-2 border-2 border-black border-r-transparent animate-spin-brutal" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}></div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-base font-black uppercase text-black">
                                  Analyzing image...
                                </span>
                                <span className="text-xs font-bold uppercase text-black opacity-60">
                                  GPT Vision processing
                                </span>
                              </div>
                            </div>
                          ) : msg.aiResponse ? (
                            <div className="border-2 border-black p-3 bg-black text-white">
                              <pre className="text-sm font-mono whitespace-pre-wrap break-words leading-relaxed">
                                {msg.aiResponse}
                              </pre>
                            </div>
                          ) : (
                            <div className="text-sm font-bold uppercase text-black opacity-50">
                              No analysis available
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-black p-4 bg-white">
                        {(() => {
                          // Check if message is an action JSON
                          try {
                            const parsed = JSON.parse(msg.content);
                            if (parsed.action) {
                              return (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="border-2 border-black bg-black text-white px-2 py-1 text-xs font-black uppercase">
                                      ✓ Action
                                    </div>
                                    <div className="border-2 border-black bg-white text-black px-2 py-1 text-xs font-black uppercase">
                                      {parsed.action}
                                    </div>
                                  </div>
                                  <div className="border-2 border-black bg-black text-white p-3">
                                    <pre className="text-sm font-mono whitespace-pre-wrap break-words leading-relaxed">
                                      {msg.content}
                                    </pre>
                                  </div>
                                </div>
                              );
                            }
                          } catch {
                            // Not JSON, display normally
                          }
                          return (
                            <pre className="text-xl font-mono text-black whitespace-pre-wrap break-words leading-relaxed font-bold">
                              {msg.content}
                            </pre>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      </main>
  );
}
