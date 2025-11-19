export default function PluginPreview() {
  const knobs = ['Cutoff', 'Resonance', 'Attack'];
  const sliders = ['Volume', 'Pan'];

  return (
    <div className="w-full max-w-sm">
      <div className="border-2 border-black bg-white">
        {/* Plugin Header */}
        <div className="border-b-2 border-black p-3 bg-black text-white">
          <p className="text-xs font-black uppercase">AI Synthesizer</p>
        </div>

        {/* Plugin Body */}
        <div className="p-4 space-y-4">
          {/* Knobs Row */}
          <div className="grid grid-cols-3 gap-3">
            {knobs.map((label, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto border-2 border-black rounded-full bg-white mb-2 flex items-center justify-center">
                  <div
                    className="w-1 h-6 bg-black"
                    style={{ transform: `rotate(${(i + 1) * 30}deg)` }}
                  />
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
            {sliders.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <p className="text-xs font-black uppercase w-16">{label}</p>
                <div className="flex-grow border-2 border-black h-6 bg-white relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-black"
                    style={{ width: `${(i + 1) * 30}%` }}
                  />
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
  );
}
