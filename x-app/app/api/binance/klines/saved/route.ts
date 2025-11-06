import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'This endpoint has been removed. Database storage is no longer supported.',
      message: 'Use the main /api/binance/klines endpoint to fetch live data from Binance API.',
    },
    { status: 410 } // Gone
  );
}