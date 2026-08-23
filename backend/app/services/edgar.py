"""SEC EDGAR access: ticker -> CIK lookup, latest 10-K URL, fetch + clean."""
import os
import re
import requests
from bs4 import BeautifulSoup

USER_AGENT = os.environ.get("SEC_EDGAR_USER_AGENT", "dev dev@example.com")
HEADERS = {"User-Agent": USER_AGENT}

_TICKER_MAP_URL = "https://www.sec.gov/files/company_tickers.json"
_ticker_to_cik_cache: dict[str, dict] | None = None


class CompanyNotFoundError(Exception):
    pass


def _load_ticker_map() -> dict[str, dict]:
    global _ticker_to_cik_cache
    if _ticker_to_cik_cache is None:
        resp = requests.get(_TICKER_MAP_URL, headers=HEADERS)
        resp.raise_for_status()
        data = resp.json()
        _ticker_to_cik_cache = {
            entry["ticker"].upper(): entry for entry in data.values()
        }
    return _ticker_to_cik_cache


def lookup_company(ticker: str) -> tuple[str, str]:
    """Returns (cik_str, company_name) for a ticker, zero-padded CIK to 10 digits."""
    ticker_map = _load_ticker_map()
    entry = ticker_map.get(ticker.upper())
    if entry is None:
        raise CompanyNotFoundError(f"No company found for ticker '{ticker}'")
    cik = str(entry["cik_str"]).zfill(10)
    return cik, entry["title"]


def get_latest_10k_url(cik: str) -> str:
    submissions_url = f"https://data.sec.gov/submissions/CIK{cik}.json"
    resp = requests.get(submissions_url, headers=HEADERS)
    resp.raise_for_status()
    data = resp.json()

    recent = data["filings"]["recent"]
    for i, form in enumerate(recent["form"]):
        if form == "10-K":
            accession = recent["accessionNumber"][i].replace("-", "")
            primary_doc = recent["primaryDocument"][i]
            return f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{accession}/{primary_doc}"

    raise CompanyNotFoundError(f"No 10-K found for CIK {cik}")


def fetch_and_clean(url: str) -> str:
    resp = requests.get(url, headers=HEADERS)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "lxml")

    for tag in soup(["script", "style"]):
        tag.decompose()

    text = soup.get_text(separator="\n")
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()
