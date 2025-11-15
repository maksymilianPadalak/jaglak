'use client';

import { useState, useEffect } from 'react';

interface CreditCard {
  id: string;
  numbers: string;
  expirationDate: string;
  cvc: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function DbPage() {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchCreditCards();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
            <button
              onClick={fetchCreditCards}
              disabled={loading}
              className="border-2 border-black px-4 py-2 font-black text-sm uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-black hover:text-white"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="border-2 border-black bg-black text-white p-3 mb-4">
            <p className="text-sm font-bold uppercase">{error}</p>
          </div>
        )}

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
