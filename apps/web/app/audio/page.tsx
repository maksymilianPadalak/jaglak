'use client';

import { useState, useRef } from 'react';
import { Volume2, Play, Download, Loader2, Mic, FileAudio } from 'lucide-react';

export default function AudioPage() {
  // Text-to-Speech state
  const [text, setText] = useState('');
  const [voiceId, setVoiceId] = useState('JBFqnCBsd6RMkjVDRZzb');
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Transcription state
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [isLoadingTranscription, setIsLoadingTranscription] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateTTS = async () => {
    if (!text.trim()) {
      setTtsError('Please enter some text');
      return;
    }

    setIsLoadingTTS(true);
    setTtsError(null);
    setAudioUrl(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const endpoint = `${API_URL}/api/elevenlabs/tts`;

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
      setTtsError(err instanceof Error ? err.message : 'Failed to generate speech');
    } finally {
      setIsLoadingTTS(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setTranscriptionError('Please select an audio file');
      return;
    }

    setSelectedAudioFile(file);
    setTranscription(null);
    setTranscriptionError(null);
  };

  const handleTranscribe = async () => {
    if (!selectedAudioFile) {
      setTranscriptionError('Please select an audio file');
      return;
    }

    setIsLoadingTranscription(true);
    setTranscriptionError(null);
    setTranscription(null);
    setAiResponse(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target?.result as string;
          
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
          const endpoint = `${API_URL}/api/whisper/transcribe`;

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audio: base64Data,
              responseFormat: 'text',
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to transcribe audio');
          }

          const data = await response.json();
          setTranscription(data.transcription);
          setAiResponse(data.aiResponse || null);
        } catch (err) {
          setTranscriptionError(err instanceof Error ? err.message : 'Failed to transcribe audio');
        } finally {
          setIsLoadingTranscription(false);
        }
      };
      reader.onerror = () => {
        setTranscriptionError('Failed to read audio file');
        setIsLoadingTranscription(false);
      };
      reader.readAsDataURL(selectedAudioFile);
    } catch (err) {
      setTranscriptionError(err instanceof Error ? err.message : 'Failed to transcribe audio');
      setIsLoadingTranscription(false);
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
            Audio
          </h1>
        </div>

        {/* Text-to-Speech Section */}
        <div className="border-2 border-black bg-white mb-4">
          <div className="border-b-2 border-black p-4 bg-black text-white">
            <h2 className="text-xl font-black uppercase flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Text to Speech
            </h2>
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
              onClick={handleGenerateTTS}
              disabled={isLoadingTTS || !text.trim()}
              className={`w-full border-2 border-black px-6 py-3 font-black text-sm uppercase flex items-center justify-center gap-2 transition-colors ${
                !isLoadingTTS && text.trim()
                  ? 'bg-black text-white hover:bg-white hover:text-black'
                  : 'bg-white text-black opacity-50 cursor-not-allowed'
              }`}
            >
              {isLoadingTTS ? (
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
            {ttsError && (
              <div className="border-2 border-red-500 bg-red-50 p-3">
                <p className="text-sm font-bold uppercase text-red-600">{ttsError}</p>
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

        {/* Audio Transcription Section */}
        <div className="border-2 border-black bg-white">
          <div className="border-b-2 border-black p-4 bg-black text-white">
            <h2 className="text-xl font-black uppercase flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Audio Transcription
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {/* File Input */}
            <div>
              <label className="text-xs font-black uppercase text-black mb-2 block">
                Audio File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className="border-2 border-black px-4 py-3 font-black text-sm uppercase bg-white text-black hover:bg-black hover:text-white transition-colors cursor-pointer flex items-center gap-2 w-full justify-center"
              >
                <FileAudio className="h-4 w-4" />
                {selectedAudioFile ? selectedAudioFile.name : 'Select Audio File'}
              </label>
            </div>

            {/* Selected File Info */}
            {selectedAudioFile && (
              <div className="border-2 border-black p-3 bg-white">
                <div className="text-xs font-black uppercase text-black mb-1">Selected File</div>
                <div className="text-sm font-mono text-black">{selectedAudioFile.name}</div>
                <div className="text-xs font-bold text-black opacity-70 mt-1">
                  {(selectedAudioFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            )}

            {/* Transcribe Button */}
            <button
              onClick={handleTranscribe}
              disabled={isLoadingTranscription || !selectedAudioFile}
              className={`w-full border-2 border-black px-6 py-3 font-black text-sm uppercase flex items-center justify-center gap-2 transition-colors ${
                !isLoadingTranscription && selectedAudioFile
                  ? 'bg-black text-white hover:bg-white hover:text-black'
                  : 'bg-white text-black opacity-50 cursor-not-allowed'
              }`}
            >
              {isLoadingTranscription ? (
                <>
                  <div className="relative w-5 h-5 border-2 border-current">
                    <div className="absolute inset-0 border-2 border-current border-t-transparent animate-spin-brutal"></div>
                  </div>
                  Transcribing...
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Transcribe Audio
                </>
              )}
            </button>

            {/* Error Message */}
            {transcriptionError && (
              <div className="border-2 border-red-500 bg-red-50 p-3">
                <p className="text-sm font-bold uppercase text-red-600">{transcriptionError}</p>
              </div>
            )}

            {/* Transcription Result */}
            {transcription && (
              <div className="space-y-4">
                <div className="border-2 border-black bg-white p-4">
                  <div className="text-xs font-black uppercase text-black mb-3">Transcription</div>
                  <div className="border-2 border-black p-4 bg-white">
                    <p className="text-sm font-mono text-black whitespace-pre-wrap leading-relaxed">
                      {transcription}
                    </p>
                  </div>
                </div>
                
                {/* AI Response */}
                {aiResponse && (
                  <div className="border-2 border-black bg-white p-4">
                    <div className="text-xs font-black uppercase text-black mb-3">AI Response</div>
                    <div className="border-2 border-black p-4 bg-black text-white">
                      <p className="text-sm font-mono text-white whitespace-pre-wrap leading-relaxed">
                        {aiResponse}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

