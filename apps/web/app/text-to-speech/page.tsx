'use client';

import { useState, useRef } from 'react';
import { Volume2, Play, Download, Loader2 } from 'lucide-react';

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [voiceId, setVoiceId] = useState('JBFqnCBsd6RMkjVDRZzb');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const endpoint = API_URL ? `${API_URL}/api/elevenlabs/tts` : '/api/elevenlabs/tts';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voiceId,
          text: text.trim(),
          modelId: 'eleven_multilingual_v2',
          outputFormat: 'mp3_44100_128',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      // Get audio as blob
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate speech');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'speech.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <main className="min-h-screen bg-white p-4 pt-12">
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black">
            Text to Speech
          </h1>
        </div>

        {/* Input Section */}
        <div className="border-2 border-black bg-white mb-4">
          <div className="border-b-2 border-black p-4 bg-black text-white">
            <h2 className="text-xl font-black uppercase">Generate Speech</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Voice ID Input */}
            <div>
              <label className="text-xs font-black uppercase text-black mb-2 block">
                Voice ID
              </label>
              <input
                type="text"
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                placeholder="JBFqnCBsd6RMkjVDRZzb"
                className="w-full border-2 border-black px-4 py-3 font-mono text-sm bg-white text-black placeholder-black/50 focus:outline-none focus:bg-black focus:text-white transition-colors"
              />
            </div>

            {/* Text Input */}
            <div>
              <label className="text-xs font-black uppercase text-black mb-2 block">
                Text to Convert
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to convert to speech..."
                rows={8}
                className="w-full border-2 border-black px-4 py-3 font-mono text-sm bg-white text-black placeholder-black/50 focus:outline-none focus:bg-black focus:text-white transition-colors resize-none"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !text.trim()}
              className={`w-full border-2 border-black px-6 py-3 font-black text-sm uppercase flex items-center justify-center gap-2 transition-colors ${
                !isLoading && text.trim()
                  ? 'bg-black text-white hover:bg-white hover:text-black'
                  : 'bg-white text-black opacity-50 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="relative w-5 h-5 border-2 border-current">
                    <div className="absolute inset-0 border-2 border-current border-t-transparent animate-spin-brutal"></div>
                  </div>
                  Generating...
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5" />
                  Generate Speech
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="border-2 border-red-500 bg-red-50 p-3">
                <p className="text-sm font-bold uppercase text-red-600">{error}</p>
              </div>
            )}

            {/* Audio Player */}
            {audioUrl && (
              <div className="border-2 border-black bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-black uppercase text-black">Generated Audio</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePlay}
                      className="border-2 border-black px-3 py-1.5 font-black text-xs uppercase bg-black text-white hover:bg-white hover:text-black transition-colors flex items-center gap-1"
                    >
                      <Play className="h-3 w-3" />
                      Play
                    </button>
                    <button
                      onClick={handleDownload}
                      className="border-2 border-black px-3 py-1.5 font-black text-xs uppercase bg-white text-black hover:bg-black hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                  </div>
                </div>
                <audio ref={audioRef} src={audioUrl} controls className="w-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

