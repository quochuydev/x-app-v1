import { NextResponse } from 'next/server';
import { BinanceService } from '@/lib/binance.service';

export async function GET() {
  try {
    const intervals = BinanceService.getSupportedIntervals();

    return NextResponse.json({
      success: true,
      data: intervals,
    });
  } catch (error) {
    console.error('Error fetching intervals:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch intervals'
      },
      { status: 500 }
    );
  }
}