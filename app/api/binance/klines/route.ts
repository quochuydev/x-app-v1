import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BINANCE_BASE_URL = 'https://api.binance.com';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol') || 'BTCUSDT';
  const interval = searchParams.get('interval') || '1h';
  const limit = searchParams.get('limit') || '100';

  try {
    const response = await axios.get(`${BINANCE_BASE_URL}/api/v3/klines`, {
      params: {
        symbol,
        interval,
        limit: parseInt(limit),
      },
    });

    const klineData = response.data.map((kline: any[]) => ({
      openTime: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
      closeTime: kline[6],
      quoteAssetVolume: parseFloat(kline[7]),
      numberOfTrades: kline[8],
      takerBuyBaseAssetVolume: parseFloat(kline[9]),
      takerBuyQuoteAssetVolume: parseFloat(kline[10]),
    }));

    return NextResponse.json({
      success: true,
      data: klineData,
      symbol,
      interval,
    });
  } catch (error) {
    console.error('Error fetching Binance kline data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch kline data from Binance',
      },
      { status: 500 }
    );
  }
}