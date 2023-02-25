from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from fitness_api.db import SessionLocal, engine
from fitness_api import domain, model, schema


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
