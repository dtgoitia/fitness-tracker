from typing import TypeAlias

from fitness_api.db import Base

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship


ActivityId: TypeAlias = str  # act_whaizrjaxj
ActivityName: TypeAlias = str
CompletedActivityId: TypeAlias = str
CompletedActivityNotes: TypeAlias = str


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[ActivityId] = mapped_column(
        String(14), primary_key=True, nullable=False, index=True
    )
    name: Mapped[ActivityName] = mapped_column(String(), nullable=False, unique=True)
    other_names: Mapped[ActivityName] = mapped_column(
        String(), default="", nullable=False
    )

    # TODO: try to remove quotes and use __future__.annotations
    activities: Mapped[list["CompletedActivity"]] = relationship(
        back_populates="activity"
    )


class CompletedActivity(Base):
    __tablename__ = "completed_activities"

    id: Mapped[CompletedActivityId] = mapped_column(
        String(14), primary_key=True, nullable=False, index=True
    )
    activity_id: Mapped[ActivityId] = mapped_column(ForeignKey("activities.id"))
    # TODO: add intensity
    # TODO: add duration
    notes: Mapped[CompletedActivityNotes] = mapped_column(String(), nullable=None)
    # TODO: add date
    # TODO: add last_modified

    # TODO: try to remove quotes and use __future__.annotations
    activity: Mapped["Activity"] = relationship(back_populates="activities")
