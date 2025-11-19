import { Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
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
  );
}
