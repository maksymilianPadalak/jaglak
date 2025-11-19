import Link from 'next/link';
import { Music } from 'lucide-react';
import PluginPreview from './PluginPreview';

export default function InstrumentShowcase() {
  const features = [
    'Custom oscillators and waveforms',
    'Advanced modulation routing',
    'Built-in effects and filtering',
    'MIDI support and automation',
  ];

  return (
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
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-black mt-1">•</span>
                <span className="text-sm font-bold">{feature}</span>
              </li>
            ))}
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
          <PluginPreview />
        </div>
      </div>
    </div>
  );
}
