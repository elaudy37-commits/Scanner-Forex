export interface PairSignal {
  symbol: string;
  signal: string;
  price: number;
  rsi: number;
  ema50_1h: number;
  ema200_1h: number; 
  status: string;
  message?: string;
}