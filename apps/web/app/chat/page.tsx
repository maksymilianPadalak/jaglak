'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollContainerRef.current && messages.length > 0) {
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

  const sendMessage = async () => {
    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: `msg_${messageIdRef.current++}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Express server API endpoint
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: `msg_${messageIdRef.current++}`,
        role: 'assistant',
        content: data.response || 'No response received',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `msg_${messageIdRef.current++}`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get AI response'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendImageForAnalysis = async () => {
    if (!selectedImage || isAnalyzingImage) return;

    setIsAnalyzingImage(true);

    const userMessage: Message = {
      id: `msg_${messageIdRef.current++}`,
      role: 'user',
      content: 'Analyzing image...',
      timestamp: new Date(),
      imageUrl: selectedImage,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      // Convert data URL to base64
      const base64Data = selectedImage.split(',')[1] || selectedImage;
      
      const response = await fetch(`${API_URL}/api/chat/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Data }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      
      // Format the response nicely
      const formattedContent = `Description: ${data.description}\n\nAction: ${data.action}`;
      
      const aiMessage: Message = {
        id: `msg_${messageIdRef.current++}`,
        role: 'assistant',
        content: formattedContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      const errorMessage: Message = {
        id: `msg_${messageIdRef.current++}`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to analyze image'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  return (
    <main className="min-h-screen bg-white p-4 pt-12">
      <div className="max-w-4xl mx-auto">
        {/* Header with Navigation */}
        <div className="border-2 border-black mb-4 p-3 bg-white">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="border-2 border-black px-4 py-2 font-black text-sm uppercase flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-black">
              AI Chat
            </h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Messages Container */}
        <div className="border-2 border-black bg-white mb-4">
          <div 
            ref={scrollContainerRef}
            className="h-[calc(100vh-320px)] min-h-[500px] overflow-y-auto p-4"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <p className="text-xl font-black uppercase text-black mb-2">
                  Start a conversation
                </p>
                <p className="text-sm font-bold text-black uppercase">
                  Ask me anything
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`border-2 border-black p-4 ${
                      msg.role === 'user' ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2 pb-2 border-b-2 border-current">
                      <div className="font-black text-xs uppercase">
                        {msg.role === 'user' ? 'You' : 'AI'}
                      </div>
                      <div className="text-xs font-mono opacity-70">
                        {msg.timestamp.toLocaleTimeString('en-US', { 
                          hour12: false, 
                          hour: '2-digit', 
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </div>
                    {msg.imageUrl && (
                      <div className="mb-3 border-2 border-current p-2">
                        <img 
                          src={msg.imageUrl} 
                          alt="User uploaded" 
                          className="max-w-full max-h-[300px] object-contain"
                        />
                      </div>
                    )}
                    <div className="text-xl font-mono whitespace-pre-wrap break-words leading-relaxed font-bold">
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="border-2 border-black p-4 bg-white text-black">
                    <div className="font-black text-xs uppercase mb-2">AI</div>
                    <div className="text-xl font-mono">Thinking...</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input Section */}
        <div className="border-2 border-black p-3 bg-white">
          {selectedImage && (
            <div className="mb-3 border-2 border-black p-2 bg-white relative">
              <button
                onClick={removeSelectedImage}
                className="absolute top-2 right-2 border-2 border-black bg-black text-white p-1 hover:bg-white hover:text-black transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="max-w-full max-h-[200px] object-contain"
              />
              <button
                onClick={sendImageForAnalysis}
                disabled={isAnalyzingImage}
                className={`mt-2 w-full border-2 border-black px-4 py-2 font-black text-sm uppercase ${
                  !isAnalyzingImage
                    ? 'bg-black text-white hover:bg-white hover:text-black'
                    : 'bg-white text-black opacity-50 cursor-not-allowed'
                } transition-colors`}
              >
                {isAnalyzingImage ? 'Analyzing...' : 'Analyze Image'}
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="border-2 border-black px-4 py-2 font-black text-sm uppercase bg-white text-black hover:bg-black hover:text-white transition-colors cursor-pointer flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Photo
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border-2 border-black px-4 py-2 font-mono text-sm bg-white text-black placeholder-black/50 focus:outline-none focus:bg-black focus:text-white uppercase"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className={`border-2 border-black px-6 py-2 font-black text-sm uppercase flex items-center gap-2 ${
                !isLoading && input.trim()
                  ? 'bg-black text-white hover:bg-white hover:text-black'
                  : 'bg-white text-black opacity-50 cursor-not-allowed'
              } transition-colors`}
            >
              <Send className="h-4 w-4" />
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

