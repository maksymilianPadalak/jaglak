'use client';

import { useState, useRef } from 'react';
import { Play, Download, Mic, FileAudio } from 'lucide-react';

export default function AudioPage() {
  // Transcription state
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [isLoadingTranscription, setIsLoadingTranscription] = useState(false);
  const [responseAudioUrl, setResponseAudioUrl] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const responseAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setTranscriptionError('Please select an audio file');
      return;
    }

    setSelectedAudioFile(file);
    setTranscriptionError(null);
    setResponseAudioUrl(null);
  };

  const handleTranscribe = async () => {
    if (!selectedAudioFile) {
      setTranscriptionError('Please select an audio file');
      return;
    }

    setIsLoadingTranscription(true);
    setTranscriptionError(null);
    setResponseAudioUrl(null);

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
          if (data.audio) {
            setResponseAudioUrl(data.audio);
          } else {
            throw new Error('No audio response received');
          }
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

  return (
    <main className="min-h-screen bg-white p-4 pt-12">
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black">
            Audio
          </h1>
        </div>

        {/* Audio Transcription Section */}
        <div className="border-2 border-black bg-white">
          <div className="border-b-2 border-black p-4 bg-black text-white">
            <h2 className="text-xl font-black uppercase flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Audio to Audio
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
            {selectedAudioFile && !isLoadingTranscription && !responseAudioUrl && (
              <div className="border-2 border-black p-3 bg-white">
                <div className="text-xs font-black uppercase text-black mb-1">Selected File</div>
                <div className="text-sm font-mono text-black">{selectedAudioFile.name}</div>
                <div className="text-xs font-bold text-black opacity-70 mt-1">
                  {(selectedAudioFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            )}

            {/* Transcribe Button */}
            {!isLoadingTranscription && !responseAudioUrl && (
              <button
                onClick={handleTranscribe}
                disabled={!selectedAudioFile}
                className={`w-full border-2 border-black px-6 py-3 font-black text-sm uppercase flex items-center justify-center gap-2 transition-colors ${
                  selectedAudioFile
                    ? 'bg-black text-white hover:bg-white hover:text-black'
                    : 'bg-white text-black opacity-50 cursor-not-allowed'
                }`}
              >
                <Mic className="h-5 w-5" />
                Process Audio
              </button>
            )}

            {/* Loading State */}
            {isLoadingTranscription && (
              <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-black bg-white">
                <div className="relative w-20 h-20 border-4 border-black">
                  <div className="absolute inset-0 border-4 border-black border-t-transparent animate-spin-brutal"></div>
                  <div className="absolute inset-2 border-2 border-black border-r-transparent animate-spin-brutal" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}></div>
                </div>
                <div className="flex flex-col gap-1 text-center">
                  <span className="text-lg font-black uppercase text-black">
                    Processing audio...
                  </span>
                  <span className="text-sm font-bold uppercase text-black opacity-60">
                    Transcribing → Generating Response → Creating Audio
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {transcriptionError && (
              <div className="border-2 border-red-500 bg-red-50 p-3">
                <p className="text-sm font-bold uppercase text-red-600">{transcriptionError}</p>
              </div>
            )}

            {/* Generated Audio Response */}
            {responseAudioUrl && !isLoadingTranscription && (
              <div className="border-2 border-black bg-white p-4">
                <div className="text-xs font-black uppercase text-black mb-3">Audio Response</div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold uppercase text-black opacity-70">
                    Generated audio from your input
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => responseAudioRef.current?.play()}
                      className="border-2 border-black px-3 py-1.5 font-black text-xs uppercase bg-black text-white hover:bg-white hover:text-black transition-colors flex items-center gap-1"
                    >
                      <Play className="h-3 w-3" />
                      Play
                    </button>
                    <button
                      onClick={() => {
                        if (responseAudioUrl) {
                          const link = document.createElement('a');
                          link.href = responseAudioUrl;
                          link.download = 'ai-response.mp3';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                      className="border-2 border-black px-3 py-1.5 font-black text-xs uppercase bg-white text-black hover:bg-black hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                  </div>
                </div>
                <audio ref={responseAudioRef} src={responseAudioUrl} controls className="w-full" />
                
                {/* Reset Button */}
                <button
                  onClick={() => {
                    setSelectedAudioFile(null);
                    setResponseAudioUrl(null);
                    setTranscriptionError(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="mt-4 w-full border-2 border-black px-4 py-2 font-black text-sm uppercase bg-white text-black hover:bg-black hover:text-white transition-colors"
                >
                  Process Another Audio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
