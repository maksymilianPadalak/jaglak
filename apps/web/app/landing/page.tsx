'use client';

import Link from 'next/link';
import { Music, Zap, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white p-4 pt-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="border-2 border-black mb-6 p-8 bg-white text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black mb-4">
            First Ever AI Plugin Generator
          </h1>
          <p className="text-lg font-bold text-black max-w-2xl mx-auto">
            Create professional-quality audio plugins with artificial intelligence.
            No coding required. Start building your dream sound in minutes.
          </p>
        </div>

        {/* Choose Your Path */}
        <div className="mb-8">
          <h2 className="text-2xl font-black uppercase text-black mb-4 text-center">
            Choose What You Want to Build
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Instrument Option */}
            <Link href="/chat" className="group">
              <div className="border-2 border-black p-6 bg-white hover:bg-black hover:text-white transition-colors h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <Music className="w-8 h-8" />
                  <h3 className="text-2xl font-black uppercase">Instrument</h3>
                </div>
                <p className="text-sm font-bold mb-4 flex-grow">
                  Generate synthesizers, samplers, and virtual instruments.
                  Create unique sounds and melodies with AI-powered audio generation.
                </p>
                <div className="flex items-center gap-2 text-sm font-black uppercase">
                  <span>Start Building</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Effect Option */}
            <Link href="/chat" className="group">
              <div className="border-2 border-black p-6 bg-white hover:bg-black hover:text-white transition-colors h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-8 h-8" />
                  <h3 className="text-2xl font-black uppercase">Effect</h3>
                </div>
                <p className="text-sm font-bold mb-4 flex-grow">
                  Build reverbs, delays, distortions, and creative effects.
                  Transform your audio with AI-designed signal processing.
                </p>
                <div className="flex items-center gap-2 text-sm font-black uppercase">
                  <span>Start Building</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Instrument Showcase */}
        <div className="border-2 border-black mb-6 bg-white">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: Info */}
            <div className="p-8 border-b-2 md:border-b-0 md:border-r-2 border-black">
              <div className="flex items-center gap-3 mb-4">
                <Music className="w-10 h-10" />
                <h2 className="text-3xl font-black uppercase tracking-tighter">
                  Instrument
                </h2>
              </div>
              <p className="text-base font-bold text-black mb-4">
                AI-powered virtual instruments that bring your musical ideas to life.
                Our generator creates fully functional synthesizers and samplers tailored
                to your specifications.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span className="text-sm font-bold">Custom oscillators and waveforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span className="text-sm font-bold">Advanced modulation routing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span className="text-sm font-bold">Built-in effects and filtering</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span className="text-sm font-bold">MIDI support and automation</span>
                </li>
              </ul>
              <Link
                href="/chat"
                className="inline-block border-2 border-black px-6 py-3 font-black text-sm uppercase transition-colors hover:bg-black hover:text-white"
              >
                Build Your Instrument
              </Link>
            </div>

            {/* Right: Plugin Preview */}
            <div className="p-8 bg-gray-50 flex items-center justify-center">
              <div className="w-full max-w-sm">
                {/* Plugin Window Mockup */}
                <div className="border-2 border-black bg-white">
                  {/* Plugin Header */}
                  <div className="border-b-2 border-black p-3 bg-black text-white">
                    <p className="text-xs font-black uppercase">AI Synthesizer</p>
                  </div>

                  {/* Plugin Body */}
                  <div className="p-4 space-y-4">
                    {/* Knobs Row */}
                    <div className="grid grid-cols-3 gap-3">
                      {['Cutoff', 'Resonance', 'Attack'].map((label, i) => (
                        <div key={i} className="text-center">
                          <div className="w-16 h-16 mx-auto border-2 border-black rounded-full bg-white mb-2 flex items-center justify-center">
                            <div className="w-1 h-6 bg-black" style={{transform: `rotate(${(i + 1) * 30}deg)`}}></div>
                          </div>
                          <p className="text-xs font-black uppercase">{label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Waveform Display */}
                    <div className="border-2 border-black p-3 bg-black h-20 flex items-center justify-center">
                      <svg viewBox="0 0 200 40" className="w-full h-full">
                        <path
                          d="M 0 20 Q 25 5 50 20 T 100 20 T 150 20 T 200 20"
                          stroke="white"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    </div>

                    {/* Sliders */}
                    <div className="space-y-2">
                      {['Volume', 'Pan'].map((label, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <p className="text-xs font-black uppercase w-16">{label}</p>
                          <div className="flex-grow border-2 border-black h-6 bg-white relative">
                            <div
                              className="absolute top-0 left-0 h-full bg-black"
                              style={{width: `${(i + 1) * 30}%`}}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs font-bold text-center mt-3 text-gray-600">
                  Preview: AI-Generated Plugin Interface
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border-2 border-black p-8 bg-black text-white text-center">
          <h2 className="text-3xl font-black uppercase mb-4">
            Ready to Create?
          </h2>
          <p className="text-base font-bold mb-6 max-w-2xl mx-auto">
            Join the future of audio plugin development. Start building your first
            AI-generated plugin today.
          </p>
          <Link
            href="/chat"
            className="inline-block border-2 border-white px-8 py-4 font-black text-sm uppercase transition-colors hover:bg-white hover:text-black"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </main>
  );
}
