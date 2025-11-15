'use client';

import Link from 'next/link';

export default function CaremateLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            CareMate Robotics
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-4">
            Compassionate Care, Powered by Innovation
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Revolutionary robotic companions designed to enhance the quality of life for seniors
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Schedule a Demo
            </button>
            <button className="bg-white hover:bg-gray-50 text-blue-600 font-semibold px-8 py-3 rounded-lg border-2 border-blue-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Why Choose CareMate?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              24/7 Companionship
            </h3>
            <p className="text-gray-600">
              Our robots provide constant companionship, reducing loneliness and promoting mental well-being through conversation and activities.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">💊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Medication Management
            </h3>
            <p className="text-gray-600">
              Automated medication reminders and dispensing ensure your loved ones never miss their prescribed medications.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🚨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Emergency Response
            </h3>
            <p className="text-gray-600">
              Advanced fall detection and emergency alert systems provide peace of mind for families and caregivers.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🏃</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Mobility Assistance
            </h3>
            <p className="text-gray-600">
              Gentle support for walking, standing, and moving around safely within the home environment.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Family Connection
            </h3>
            <p className="text-gray-600">
              Video calling and remote monitoring keep families connected and informed about their loved ones' well-being.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Cognitive Engagement
            </h3>
            <p className="text-gray-600">
              Interactive games, memory exercises, and stimulating conversations help maintain cognitive function.
            </p>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Meet Our CareMate Models
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">CareMate Essential</h3>
              <p className="text-lg mb-4">Perfect for daily assistance and companionship</p>
              <ul className="space-y-2 mb-6">
                <li>✓ Voice-activated assistance</li>
                <li>✓ Medication reminders</li>
                <li>✓ Fall detection</li>
                <li>✓ Video calling</li>
                <li>✓ Activity scheduling</li>
              </ul>
              <p className="text-3xl font-bold">$2,499/month</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border-2 border-white">
              <div className="bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-4">CareMate Premium</h3>
              <p className="text-lg mb-4">Advanced care with full mobility support</p>
              <ul className="space-y-2 mb-6">
                <li>✓ All Essential features</li>
                <li>✓ Physical mobility assistance</li>
                <li>✓ Advanced AI conversation</li>
                <li>✓ Health monitoring sensors</li>
                <li>✓ Personalized care plans</li>
                <li>✓ 24/7 human support hotline</li>
              </ul>
              <p className="text-3xl font-bold">$3,999/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          What Families Are Saying
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-50 p-6 rounded-xl">
            <p className="text-gray-700 mb-4 italic">
              "CareMate has been a lifesaver for my mother. She lives independently and the robot helps her remember medications and stay connected with us."
            </p>
            <p className="font-semibold text-gray-900">- Sarah M., Daughter</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <p className="text-gray-700 mb-4 italic">
              "The companionship feature is amazing. Dad actually looks forward to his daily conversations with CareMate. It's reduced his loneliness significantly."
            </p>
            <p className="font-semibold text-gray-900">- Michael R., Son</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <p className="text-gray-700 mb-4 italic">
              "As a caregiver, CareMate gives me peace of mind. I can monitor my clients remotely and know they're safe even when I'm not there."
            </p>
            <p className="font-semibold text-gray-900">- Lisa K., Professional Caregiver</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Enhance Your Loved One's Quality of Life?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Schedule a free in-home demonstration and see how CareMate can make a difference
          </p>
          <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-10 py-4 rounded-lg text-lg transition-colors">
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">CareMate Robotics</h3>
              <p className="text-sm">
                Pioneering the future of elder care through innovative robotics and compassionate technology.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">CareMate Essential</a></li>
                <li><a href="#" className="hover:text-white">CareMate Premium</a></li>
                <li><a href="#" className="hover:text-white">Accessories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">User Manual</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 CareMate Robotics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
