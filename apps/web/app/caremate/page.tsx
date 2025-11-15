'use client';

import Link from 'next/link';
import { MessageCircle, Monitor } from 'lucide-react';
import Image from 'next/image';

export default function CaremateLandingPage() {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-2 border-black mb-4 p-3 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter mb-1 text-black">
                CareMate System
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

        {/* Hero Section with Image */}
        <div className="border-2 border-black mb-4 bg-white">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="border-r-2 border-black p-6 flex items-center justify-center bg-gray-50">
              <div className="w-full aspect-square relative border-2 border-black bg-gray-200 flex items-center justify-center">
                <span className="text-black font-bold text-sm uppercase">
                  Placeholder Image
                </span>
                {/* Placeholder for robot/camera system image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🤖</div>
                    <div className="text-xs font-black uppercase text-black opacity-50">
                      Robot + Cameras
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col justify-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 text-black">
                Revolutionary Elder Care System
              </h2>
              <p className="text-base font-bold text-black leading-relaxed mb-4">
                This is the robot + cameras system in the house + ai brain system that takes care of elderly
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-black text-black">•</span>
                  <p className="text-sm font-bold text-black">
                    Advanced AI brain analyzes situations in real-time
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-black text-black">•</span>
                  <p className="text-sm font-bold text-black">
                    Network of cameras monitors the entire house
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-black text-black">•</span>
                  <p className="text-sm font-bold text-black">
                    Robot assistant provides physical support and companionship
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
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
      </div>
    </div>
  );
}
