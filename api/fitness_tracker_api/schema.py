from fitness_tracker_api.model import (
    ActivityId,
    ActivityName,
    CompletedActivityId,
    CompletedActivityNotes,
    LastModified,
)
from pydantic import BaseModel

"""
`orm_mode`

SQLAlchemy and many others are by default "lazy loading".
Without orm_mode, if you returned a SQLAlchemy model from your path operation, it wouldn't include the relationship data.
docs: https://fastapi.tiangolo.com/tutorial/sql-databases/
"""


class Activity(BaseModel):
    id: ActivityId
    name: ActivityName
    other_names: ActivityName
    last_modified: LastModified

    class Config:
        # See comment at the top of the file
        orm_mode = True


class ActivityCreate(Activity):
    ...


class CompletedActivity(BaseModel):
    id: CompletedActivityId
    activity_id: ActivityId
    notes: CompletedActivityNotes

    class Config:
        # See comment at the top of the file
        orm_mode = True
