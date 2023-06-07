import logging

from fitness_tracker_api.config import Config
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

logger = logging.getLogger(__name__)

_SQLITE_SPECIFIC_CONFIG = {"check_same_thread": False}


def get_db_session(config: Config) -> Session:
    db_url = config.sqlite_db_uri

    logger.info(f"Connecting to {db_url}")
    print(f"Connecting to {db_url}")

    engine = create_engine(
        url=db_url,
        connect_args=_SQLITE_SPECIFIC_CONFIG,
    )

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    session = SessionLocal()

    return session


Base = declarative_base()
