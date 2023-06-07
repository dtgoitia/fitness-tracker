import logging
import uvicorn
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from src.db import SessionLocal, engine
from src import domain, model, schema

logger = logging.getLogger(__name__)


# TODO: use alembic instead/here?
# https://fastapi.tiangolo.com/tutorial/sql-databases/#alembic-note
model.Base.metadata.create_all(bind=engine)

app = FastAPI()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return "Hey! Have a look at /docs :)"


@app.post("/activity/", response_model=schema.Activity)
def create_activity(activity: schema.ActivityCreate, db: Session = Depends(get_db)):
    db_activity = domain.create_activity(db, activity=activity)
    return db_activity


@app.get("/activities/{activity_id}")
def get_activity(activity_id: str, db: Session = Depends(get_db)):
    db_activity = domain.get_activity(db, activity_id)
    if db_activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")

    return db_activity

if __name__ == "__main__":
    # config = get_config()
    logging.basicConfig(level=logging.INFO)

    # logger.info(f"config: {config}")

    # By default, flask serves in `localhost`, which makes the webserver
    # inaccessible once you containerize it.
    host = "0.0.0.0"

    uvicorn.run("__main__:app", host=host, port=5000, reload=True)
