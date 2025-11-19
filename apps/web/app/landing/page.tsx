'use client';

import { Music, Zap } from 'lucide-react';
import HeroSection from '../components/landing/HeroSection';
import ChoiceCard from '../components/landing/ChoiceCard';
import InstrumentShowcase from '../components/landing/InstrumentShowcase';
import CTASection from '../components/landing/CTASection';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white p-4 pt-12">
      <div className="max-w-6xl mx-auto">
        <HeroSection />

        {/* Choose Your Path */}
        <div className="mb-8">
          <h2 className="text-2xl font-black uppercase text-black mb-4 text-center">
            Choose What You Want to Build
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <ChoiceCard
              icon={Music}
              title="Instrument"
              description="Generate synthesizers, samplers, and virtual instruments. Create unique sounds and melodies with AI-powered audio generation."
              href="/chat"
            />
            <ChoiceCard
              icon={Zap}
              title="Effect"
              description="Build reverbs, delays, distortions, and creative effects. Transform your audio with AI-designed signal processing."
              href="/chat"
            />
          </div>
        </div>

        <InstrumentShowcase />
        <CTASection />
      </div>
    </main>
  );
}
