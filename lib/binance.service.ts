import axios from 'axios';

export interface KlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
  trades: number;
}

export interface KlineRequest {
  symbol: string;
  interval: '1m' | '5m' | '1h';
  limit?: number;
  startTime?: number;
  endTime?: number;
}

export class BinanceService {
  private static readonly BASE_URL = 'https://api.binance.com/api/v3';

  static async getKlines(params: KlineRequest): Promise<KlineData[]> {
    const { symbol, interval, limit = 100, startTime, endTime } = params;

    const queryParams = new URLSearchParams({
      symbol: symbol.toUpperCase(),
      interval,
      limit: limit.toString(),
    });

    if (startTime) {
      queryParams.append('startTime', startTime.toString());
    }

    if (endTime) {
      queryParams.append('endTime', endTime.toString());
    }

    try {
      const response = await axios.get(`${this.BASE_URL}/klines?${queryParams.toString()}`);

      return response.data.map((kline: any[]) => ({
        openTime: kline[0],
        open: kline[1],
        high: kline[2],
        low: kline[3],
        close: kline[4],
        volume: kline[5],
        closeTime: kline[6],
        quoteAssetVolume: kline[7],
        takerBuyBaseAssetVolume: kline[9],
        takerBuyQuoteAssetVolume: kline[10],
        trades: parseInt(kline[8]),
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Binance API error: ${error.response?.data?.msg || error.message}`);
      }
      throw error;
    }
  }

  static getSupportedIntervals(): Array<{ value: string; label: string }> {
    return [
      { value: '1m', label: '1 minute' },
      { value: '5m', label: '5 minutes' },
      { value: '1h', label: '1 hour' },
    ];
  }

  static async getExchangeInfo() {
    try {
      const response = await axios.get(`${this.BASE_URL}/exchangeInfo`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Binance API error: ${error.response?.data?.msg || error.message}`);
      }
      throw error;
    }
  }
}