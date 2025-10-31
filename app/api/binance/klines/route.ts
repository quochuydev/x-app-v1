import { NextRequest, NextResponse } from 'next/server';
import { BinanceService } from '@/lib/binance.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTCUSDT';
    const interval = searchParams.get('interval') as '1m' | '5m' | '1h' || '1m';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

    const klinesData = await BinanceService.getKlines({
      symbol,
      interval,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: klinesData,
      count: klinesData.length,
    });
  } catch (error) {
    console.error('Error fetching klines:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch klines data'
      },
      { status: 500 }
    );
  }
}