'use client';

import { useState } from 'react';
import BinanceChart from '@/components/BinanceChart';
import IntervalSelector from '@/components/IntervalSelector';

export default function Home() {
  const [interval, setInterval] = useState('1h');
  const symbol = 'BTCUSDT';

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            BTC/USDT Live Chart
          </h1>
          <p className="text-lg text-gray-600">
            Real-time Bitcoin price chart powered by Binance API
          </p>
        </header>

        <div className="space-y-6">
          <IntervalSelector
            interval={interval}
            onIntervalChange={setInterval}
          />

          <BinanceChart
            symbol={symbol}
            interval={interval}
          />
        </div>

        <footer className="mt-12 text-center text-gray-500">
          <p>
            Data fetched from Binance API. Chart updates automatically when interval changes.
          </p>
        </footer>
      </div>
    </div>
  );
}