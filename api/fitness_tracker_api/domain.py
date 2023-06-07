from fitness_tracker_api import model, schema
from sqlalchemy.orm import Session


def create_activity(db: Session, activity: schema.Activity) -> None:
    db_activity = model.Activity(
        id=activity.id,
        name=activity.name,
        other_names=activity.other_names,
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity


def get_activity(db: Session, id: model.ActivityId) -> model.Activity | None:
    return db.query(model.Activity).get(id)


# TODO: consider if it makes sense making this an iterator
# def get_activities_modified_since(db: Session, since: datetime.datetime) -> list[model.Activity]:
#     return db.query(model.Activity).filter(model.Activity.last_modified >= since)


def get_completed_activity(
    db: Session, id: model.CompletedActivityId
) -> model.CompletedActivity | None:
    return db.query(model.CompletedActivity).get(id)
