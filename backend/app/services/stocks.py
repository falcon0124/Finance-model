"""Live stock price + short history via yFinance, with a simple in-memory TTL cache."""
import time
import yfinance as yf

CACHE_TTL_SECONDS = 300  # 5 minutes
_cache: dict[str, tuple[float, dict]] = {}


def get_stock_data(ticker: str) -> dict:
    ticker = ticker.upper()

    cached = _cache.get(ticker)
    if cached and (time.time() - cached[0]) < CACHE_TTL_SECONDS:
        return cached[1]

    yf_ticker = yf.Ticker(ticker)
    hist = yf_ticker.history(period="1mo")

    if hist.empty:
        raise ValueError(f"No stock data found for ticker '{ticker}'")

    closes = hist["Close"]
    latest_price = float(closes.iloc[-1])
    prev_price = float(closes.iloc[-2]) if len(closes) > 1 else latest_price
    day_change_pct = ((latest_price - prev_price) / prev_price) * 100 if prev_price else 0.0

    history = [
        {"date": ts.strftime("%Y-%m-%d"), "close": round(float(price), 2)}
        for ts, price in closes.items()
    ]

    data = {
        "ticker": ticker,
        "price": round(latest_price, 2),
        "day_change_pct": round(day_change_pct, 2),
        "history": history,
    }

    _cache[ticker] = (time.time(), data)
    return data
