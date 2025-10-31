import { NextRequest, NextResponse } from 'next/server';
import { BinanceService, KlineData } from '@/lib/binance.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTCUSDT';
    const interval = searchParams.get('interval') as '1m' | '5m' | '1h' || '1m';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const saveToDb = searchParams.get('save') === 'true';

    const klinesData = await BinanceService.getKlines({
      symbol,
      interval,
      limit,
    });

    if (saveToDb) {
      try {
        await saveKlinesToDatabase(klinesData, symbol, interval);
      } catch (dbError) {
        console.warn('Database save failed:', dbError);
        // Continue even if DB save fails
      }
    }

    return NextResponse.json({
      success: true,
      data: klinesData,
      count: klinesData.length,
      saved: saveToDb && !process.env.DATABASE_URL ? false : saveToDb,
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

async function saveKlinesToDatabase(klinesData: KlineData[], symbol: string, interval: string) {
  // Check if database is configured
  if (!process.env.DATABASE_URL) {
    throw new Error('Database not configured. Set DATABASE_URL environment variable.');
  }

  const { db } = await import('@/app/db/drizzle');
  const { klines } = await import('@/app/db/schema');

  const records = klinesData.map(kline => ({
    symbol: symbol.toUpperCase(),
    interval,
    openTime: new Date(kline.openTime),
    closeTime: new Date(kline.closeTime),
    openPrice: kline.open,
    highPrice: kline.high,
    lowPrice: kline.low,
    closePrice: kline.close,
    volume: kline.volume,
    quoteAssetVolume: kline.quoteAssetVolume,
    takerBuyBaseAssetVolume: kline.takerBuyBaseAssetVolume,
    takerBuyQuoteAssetVolume: kline.takerBuyQuoteAssetVolume,
    trades: kline.trades,
  }));

  await db.insert(klines).values(records).onConflictDoNothing();
}