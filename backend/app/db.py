"""SQLite registry: tracks which companies we've already ingested."""
import os
import datetime
from sqlalchemy import create_engine, String, DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "registry.db")
engine = create_engine(f"sqlite:///{DB_PATH}")


class Base(DeclarativeBase):
    pass


class Company(Base):
    __tablename__ = "companies"

    ticker: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    cik: Mapped[str] = mapped_column(String)
    collection_name: Mapped[str] = mapped_column(String)
    last_ingested_at: Mapped[datetime.datetime] = mapped_column(DateTime)


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    Base.metadata.create_all(engine)


def get_company(ticker: str) -> Company | None:
    with Session(engine) as session:
        return session.get(Company, ticker.upper())


def upsert_company(ticker: str, name: str, cik: str, collection_name: str) -> None:
    with Session(engine) as session:
        company = session.get(Company, ticker.upper())
        if company is None:
            company = Company(ticker=ticker.upper(), name=name, cik=cik, collection_name=collection_name,
                               last_ingested_at=datetime.datetime.utcnow())
            session.add(company)
        else:
            company.name = name
            company.cik = cik
            company.collection_name = collection_name
            company.last_ingested_at = datetime.datetime.utcnow()
        session.commit()


def list_companies() -> list[Company]:
    with Session(engine) as session:
        return list(session.query(Company).all())
