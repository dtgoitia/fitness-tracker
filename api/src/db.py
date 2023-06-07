from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# TODO: load from envvars via AppConfig
SQLALCHEMY_DATABASE_URL = "sqlite:///./fitness-tracker.db"

# TODO: build the below stuff lazily, aka: not on module import
SQLITE_SPECIFIC_CONFIG={"check_same_thread": False}
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=SQLITE_SPECIFIC_CONFIG)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
