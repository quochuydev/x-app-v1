'use client';

import { useState, useEffect } from 'react';
import { KlineData } from '@/lib/binance.service';

interface Interval {
  value: string;
  label: string;
}

export default function BinancePage() {
  const [klinesData, setKlinesData] = useState<KlineData[]>([]);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [selectedInterval, setSelectedInterval] = useState<string>('1m');
  const [symbol, setSymbol] = useState<string>('BTCUSDT');
  const [limit, setLimit] = useState<number>(100);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [useSavedData, setUseSavedData] = useState<boolean>(false);

  useEffect(() => {
    fetchIntervals();
  }, []);

  useEffect(() => {
    fetchKlinesData();
  }, [selectedInterval, symbol, limit, useSavedData]);

  const fetchIntervals = async () => {
    try {
      const response = await fetch('/api/binance/intervals');
      const data = await response.json();
      if (data.success) {
        setIntervals(data.data);
      }
    } catch (error) {
      console.error('Error fetching intervals:', error);
    }
  };

  const fetchKlinesData = async () => {
    setLoading(true);
    setError('');

    try {
      const endpoint = useSavedData ? '/api/binance/klines/saved' : '/api/binance/klines';
      const params = new URLSearchParams({
        symbol,
        interval: selectedInterval,
        limit: limit.toString(),
      });

      if (!useSavedData) {
        params.append('save', 'true');
      }

      const response = await fetch(`${endpoint}?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setKlinesData(data.data);
      } else {
        setError(data.error || 'Failed to fetch klines data');
      }
    } catch (error) {
      setError('Error fetching klines data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: string, decimals: number = 2) => {
    return parseFloat(value).toFixed(decimals);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <section>
      <h1>Binance Klines Data</h1>
      <p>
        Fetch BTC/USDT Kline data from Binance API with selectable intervals.
      </p>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Controls</h3>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="symbol" style={{ marginRight: '10px' }}>Symbol:</label>
          <input
            type="text"
            id="symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            style={{ marginRight: '20px', padding: '5px' }}
          />

          <label htmlFor="interval" style={{ marginRight: '10px' }}>Interval:</label>
          <select
            id="interval"
            value={selectedInterval}
            onChange={(e) => setSelectedInterval(e.target.value)}
            style={{ marginRight: '20px', padding: '5px' }}
          >
            {intervals.map((interval) => (
              <option key={interval.value} value={interval.value}>
                {interval.label}
              </option>
            ))}
          </select>

          <label htmlFor="limit" style={{ marginRight: '10px' }}>Limit:</label>
          <input
            type="number"
            id="limit"
            value={limit}
            onChange={(e) => setLimit(Math.max(1, Math.min(1000, parseInt(e.target.value) || 100)))}
            min="1"
            max="1000"
            style={{ marginRight: '20px', padding: '5px', width: '80px' }}
          />
        </div>

        <div>
          <label style={{ marginRight: '10px' }}>
            <input
              type="checkbox"
              checked={useSavedData}
              onChange={(e) => setUseSavedData(e.target.checked)}
              style={{ marginRight: '5px' }}
            />
            Use saved data from database
          </label>

          <button
            onClick={fetchKlinesData}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '4px' }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3>Data Summary</h3>
        <p>
          Showing {klinesData.length} records for {symbol} at {intervals.find(i => i.value === selectedInterval)?.label} interval
        </p>
        {klinesData.length > 0 && (
          <p>
            Latest price: {formatNumber(klinesData[klinesData.length - 1].close)} USDT
          </p>
        )}
      </div>

      {klinesData.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <h3>Recent Klines</h3>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '800px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Open Time</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>Open</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>High</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>Low</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>Close</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>Volume</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>Trades</th>
              </tr>
            </thead>
            <tbody>
              {klinesData.slice(-20).reverse().map((kline, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '12px' }}>
                    {formatTime(kline.openTime)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                    {formatNumber(kline.open)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                    {formatNumber(kline.high)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                    {formatNumber(kline.low)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                    {formatNumber(kline.close)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                    {formatNumber(kline.volume, 2)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                    {kline.trades.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {klinesData.length > 20 && (
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              Showing latest 20 records. Total records: {klinesData.length}
            </p>
          )}
        </div>
      )}

      {!loading && klinesData.length === 0 && !error && (
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          No data available. Click "Refresh Data" to fetch from Binance API.
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <h3>API Endpoints</h3>
        <ul>
          <li>
            <strong>GET /api/binance/klines</strong> - Fetch klines data from Binance
          </li>
          <li>
            <strong>GET /api/binance/klines/saved</strong> - Get saved klines data from database
          </li>
          <li>
            <strong>GET /api/binance/intervals</strong> - Get supported intervals
          </li>
        </ul>
      </div>
    </section>
  );
}