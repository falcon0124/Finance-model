"""Phase 1: fetch Apple's latest 10-K from SEC EDGAR and save the raw text locally."""
import os
import re
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

USER_AGENT = os.environ.get("SEC_EDGAR_USER_AGENT", "dev dev@example.com")
HEADERS = {"User-Agent": USER_AGENT}

TICKER = "AAPL"
CIK = "0000320193"  # Apple's CIK, zero-padded to 10 digits

OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "aapl_10k.txt")


def get_latest_10k_url() -> str:
    submissions_url = f"https://data.sec.gov/submissions/CIK{CIK}.json"
    resp = requests.get(submissions_url, headers=HEADERS)
    resp.raise_for_status()
    data = resp.json()

    recent = data["filings"]["recent"]
    for i, form in enumerate(recent["form"]):
        if form == "10-K":
            accession = recent["accessionNumber"][i].replace("-", "")
            primary_doc = recent["primaryDocument"][i]
            return f"https://www.sec.gov/Archives/edgar/data/{int(CIK)}/{accession}/{primary_doc}"

    raise RuntimeError("No 10-K found in recent filings")


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


if __name__ == "__main__":
    print(f"Looking up latest 10-K for {TICKER}...")
    url = get_latest_10k_url()
    print(f"Found: {url}")

    print("Downloading and cleaning...")
    text = fetch_and_clean(url)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"Saved {len(text):,} chars to {OUT_PATH}")
