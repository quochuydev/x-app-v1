import { NextRequest, NextResponse } from 'next/server';

const BINANCE_API_BASE_URL = 'https://api.binance.com';

interface KlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
  ignore: string;
}

const VALID_INTERVALS = ['1m', '5m', '1h'] as const;
type Interval = typeof VALID_INTERVALS[number];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'BTCUSDT';
  const interval = searchParams.get('interval') || '1m';
  const limit = searchParams.get('limit') || '100';

  // Validate interval
  if (!VALID_INTERVALS.includes(interval as Interval)) {
    return NextResponse.json(
      {
        error: 'Invalid interval',
        validIntervals: VALID_INTERVALS,
        provided: interval
      },
      { status: 400 }
    );
  }

  try {
    const url = `${BINANCE_API_BASE_URL}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    console.log(`Fetching Klines from Binance API: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Binance API error: ${response.status} - ${errorText}`);

      // Fallback to mock data when Binance API is unavailable
      console.log('Using mock data due to Binance API restrictions');
      return getMockKlinesData(symbol, interval, limit);
    }

    const rawData: string[][] = await response.json();

    // Transform the data into a more readable format
    const formattedData: KlineData[] = rawData.map(item => ({
      openTime: item[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: item[5],
      closeTime: item[6],
      quoteAssetVolume: item[7],
      numberOfTrades: parseInt(item[8]),
      takerBuyBaseAssetVolume: item[9],
      takerBuyQuoteAssetVolume: item[10],
      ignore: item[11]
    }));

    const result = {
      success: true,
      symbol,
      interval,
      count: formattedData.length,
      data: formattedData,
      metadata: {
        source: 'Binance API',
        fetchedAt: new Date().toISOString(),
        apiUrl: url
      }
    };

    // Log results in JSON format as requested
    console.log('Klines data fetched successfully:');
    console.log(JSON.stringify(result, null, 2));

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching Klines data:', error);

    // Fallback to mock data on any error
    console.log('Using mock data due to error');
    return getMockKlinesData(symbol, interval, limit);
  }
}

function getMockKlinesData(symbol: string, interval: string, limit: string) {
  const limitNum = Math.min(parseInt(limit) || 100, 100);
  const now = Date.now();
  const intervalMs = getIntervalMs(interval);

  const mockData: KlineData[] = [];

  for (let i = limitNum - 1; i >= 0; i--) {
    const openTime = now - (i * intervalMs);
    const closeTime = openTime + intervalMs - 1;
    const basePrice = 65000 + Math.random() * 10000;

    mockData.push({
      openTime,
      open: basePrice.toFixed(2),
      high: (basePrice + Math.random() * 500).toFixed(2),
      low: (basePrice - Math.random() * 500).toFixed(2),
      close: (basePrice + (Math.random() - 0.5) * 200).toFixed(2),
      volume: (Math.random() * 100).toFixed(4),
      closeTime,
      quoteAssetVolume: (Math.random() * 6500000).toFixed(2),
      numberOfTrades: Math.floor(Math.random() * 1000) + 100,
      takerBuyBaseAssetVolume: (Math.random() * 50).toFixed(4),
      takerBuyQuoteAssetVolume: (Math.random() * 3250000).toFixed(2),
      ignore: '0'
    });
  }

  const result = {
    success: true,
    symbol,
    interval,
    count: mockData.length,
    data: mockData,
    metadata: {
      source: 'Mock Data (Binance API unavailable)',
      fetchedAt: new Date().toISOString(),
      note: 'This is simulated data for demonstration purposes'
    }
  };

  // Log results in JSON format as requested
  console.log('Mock Klines data generated:');
  console.log(JSON.stringify(result, null, 2));

  return NextResponse.json(result);
}

function getIntervalMs(interval: string): number {
  switch (interval) {
    case '1m': return 60 * 1000;
    case '5m': return 5 * 60 * 1000;
    case '1h': return 60 * 60 * 1000;
    default: return 5 * 60 * 1000; // default to 5m
  }
}