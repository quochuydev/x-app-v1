import { NextRequest, NextResponse } from 'next/server';
import { desc, and, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database not configured. Set DATABASE_URL environment variable.',
          data: [],
          count: 0,
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTCUSDT';
    const interval = searchParams.get('interval') || '1m';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

    const { db } = await import('@/app/db/drizzle');
    const { klines } = await import('@/app/db/schema');

    const storedKlines = await db
      .select()
      .from(klines)
      .where(
        and(
          eq(klines.symbol, symbol.toUpperCase()),
          eq(klines.interval, interval)
        )
      )
      .orderBy(desc(klines.openTime))
      .limit(limit);

    const formattedData = storedKlines.map(kline => ({
      openTime: kline.openTime.getTime(),
      open: kline.openPrice.toString(),
      high: kline.highPrice.toString(),
      low: kline.lowPrice.toString(),
      close: kline.closePrice.toString(),
      volume: kline.volume.toString(),
      closeTime: kline.closeTime.getTime(),
      quoteAssetVolume: kline.quoteAssetVolume.toString(),
      takerBuyBaseAssetVolume: kline.takerBuyBaseAssetVolume.toString(),
      takerBuyQuoteAssetVolume: kline.takerBuyQuoteAssetVolume.toString(),
      trades: kline.trades,
    }));

    return NextResponse.json({
      success: true,
      data: formattedData.reverse(), // Return in chronological order
      count: formattedData.length,
    });
  } catch (error) {
    console.error('Error fetching saved klines:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch saved klines data'
      },
      { status: 500 }
    );
  }
}