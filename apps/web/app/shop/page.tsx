'use client';

import Link from 'next/link';
import { MessageCircle, Monitor, ShoppingCart, Check } from 'lucide-react';

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-2 border-black mb-4 p-3 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter mb-1 text-black">
                Jaglak System
              </h1>
              <p className="text-sm font-bold text-black uppercase">
                Robot + Cameras + AI Brain
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link 
                href="/"
                className="border-2 border-black px-4 py-2 font-black text-sm uppercase flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
              >
                <Monitor className="h-4 w-4" />
                Monitor
              </Link>
              <Link 
                href="/chat"
                className="border-2 border-black px-4 py-2 font-black text-sm uppercase flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                AI Chat
              </Link>
            </div>
          </div>
        </div>

        {/* Product Hero Section */}
        <div className="border-2 border-black mb-4 bg-white">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Product Image */}
            <div className="border-r-2 border-black p-6 flex items-center justify-center bg-gray-50">
              <div className="w-full aspect-square relative border-2 border-black bg-gray-200 flex items-center justify-center">
                <span className="text-black font-bold text-sm uppercase">
                  Product Image
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🤖</div>
                    <div className="text-xs font-black uppercase text-black opacity-50">
                      Jaglak Robot
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-black">
                  Jaglak System
                </h2>
                <p className="text-base font-bold text-black leading-relaxed mb-6">
                  This is the robot + cameras system in the house + ai brain system that takes care of elderly
                </p>
                
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-black text-black">€4,999</span>
                    <span className="text-lg font-bold text-black opacity-60 line-through">€6,999</span>
                  </div>
                  <p className="text-xs font-bold text-black uppercase opacity-70">
                    One-time purchase • Lifetime support included
                  </p>
                </div>

                {/* Buy Button */}
                <button className="w-full border-4 border-black bg-black text-white px-6 py-4 font-black text-lg uppercase hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 mb-4">
                  <ShoppingCart className="h-5 w-5" />
                  Buy Now
                </button>

                {/* Features List */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-black mt-0.5 shrink-0" />
                    <p className="text-sm font-bold text-black">
                      Advanced AI brain analyzes situations in real-time
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-black mt-0.5 shrink-0" />
                    <p className="text-sm font-bold text-black">
                      Network of cameras monitors the entire house
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-black mt-0.5 shrink-0" />
                    <p className="text-sm font-bold text-black">
                      Robot assistant provides physical support and companionship
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="border-2 border-black p-4 bg-white">
            <h3 className="text-lg font-black uppercase mb-2 text-black">
              AI Brain
            </h3>
            <p className="text-xs font-bold text-black opacity-70">
              Intelligent decision-making system that understands context and responds appropriately
            </p>
          </div>
          <div className="border-2 border-black p-4 bg-white">
            <h3 className="text-lg font-black uppercase mb-2 text-black">
              Camera Network
            </h3>
            <p className="text-xs font-bold text-black opacity-70">
              Comprehensive visual monitoring system covering all areas of the home
            </p>
          </div>
          <div className="border-2 border-black p-4 bg-white">
            <h3 className="text-lg font-black uppercase mb-2 text-black">
              Robot Assistant
            </h3>
            <p className="text-xs font-bold text-black opacity-70">
              Physical robot that can assist with tasks, provide companionship, and respond to emergencies
            </p>
          </div>
        </div>

        {/* Additional Product Info */}
        <div className="border-2 border-black p-6 bg-white mb-4">
          <h3 className="text-xl font-black uppercase mb-4 text-black">
            What&apos;s Included
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-black" />
                <span className="text-sm font-bold text-black">Jaglak Robot Unit</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-black" />
                <span className="text-sm font-bold text-black">1x HD Security Camera</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-black" />
                <span className="text-sm font-bold text-black">AI Brain Processing Unit</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-black" />
                <span className="text-sm font-bold text-black">Installation & Setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-black" />
                <span className="text-sm font-bold text-black">24/7 Support & Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-black" />
                <span className="text-sm font-bold text-black">2-Year Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials / Reviews */}
        <div className="border-2 border-black p-6 bg-white">
          <h3 className="text-xl font-black uppercase mb-4 text-black">
            Customer Reviews
          </h3>
          <div className="space-y-4">
            <div className="border-2 border-black p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black uppercase text-black">★★★★★</span>
                <span className="text-xs font-bold text-black opacity-70">Sarah M.</span>
              </div>
              <p className="text-sm font-bold text-black">
                &ldquo;Jaglak has been a lifesaver for my mother. The AI brain is incredibly smart and the robot provides real companionship.&rdquo;
              </p>
            </div>
            <div className="border-2 border-black p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black uppercase text-black">★★★★★</span>
                <span className="text-xs font-bold text-black opacity-70">Michael R.</span>
              </div>
              <p className="text-sm font-bold text-black">
                &ldquo;The camera network gives us peace of mind. We can check on dad anytime, and the robot helps him stay independent.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
