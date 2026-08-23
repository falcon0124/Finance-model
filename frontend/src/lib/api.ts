const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export interface Source {
  id: string;
  text: string;
}

export interface QueryResponse {
  ticker: string;
  answer: string;
  sources: Source[];
  ingested_now: boolean;
}

export interface StockPoint {
  date: string;
  close: number;
}

export interface StockData {
  ticker: string;
  price: number;
  day_change_pct: number;
  history: StockPoint[];
}

export interface CompareResponse {
  ticker_a: { ticker: string; stock: StockData; sources: string[] };
  ticker_b: { ticker: string; stock: StockData; sources: string[] };
  summary: string;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export async function query(ticker: string, question: string): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticker, question }),
  });
  return handle<QueryResponse>(res);
}

export async function getStock(ticker: string): Promise<StockData> {
  const res = await fetch(`${API_BASE}/stock/${ticker}`);
  return handle<StockData>(res);
}

export async function compare(tickerA: string, tickerB: string): Promise<CompareResponse> {
  const res = await fetch(`${API_BASE}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticker_a: tickerA, ticker_b: tickerB }),
  });
  return handle<CompareResponse>(res);
}
