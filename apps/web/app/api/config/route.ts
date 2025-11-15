import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const config = {
      wsUrl: process.env.NEXT_PUBLIC_WS_URL || null,
      apiUrl: process.env.NEXT_PUBLIC_API_URL || null,
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error getting config:', error);
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500 }
    );
  }
}

