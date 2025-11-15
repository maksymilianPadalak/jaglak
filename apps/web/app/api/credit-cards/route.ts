import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/credit-cards`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch credit cards' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching credit cards:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch credit cards' },
      { status: 500 }
    );
  }
}

