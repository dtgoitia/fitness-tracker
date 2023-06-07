from __future__ import annotations

import datetime
import enum
from typing import Any, TypeAlias

from fitness_tracker_api.db import Base
from sqlalchemy import DateTime
from sqlalchemy import Enum as DbEnum
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

ActivityId: TypeAlias = str  # act_whaizrjaxj
ActivityName: TypeAlias = str
CompletedActivityId: TypeAlias = str
CompletedActivityNotes: TypeAlias = str
LastModified: TypeAlias = datetime.datetime

JsonDict: TypeAlias = dict[str, Any]


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[ActivityId] = mapped_column(
        String(14), primary_key=True, nullable=False, index=True
    )
    last_modified: Mapped[LastModified] = mapped_column(DateTime(), nullable=False)
    name: Mapped[ActivityName] = mapped_column(String(), nullable=False, unique=True)
    other_names: Mapped[ActivityName] = mapped_column(
        String(), default="", nullable=False
    )

    # TODO: try to remove quotes and use __future__.annotations
    activities: Mapped[list["CompletedActivity"]] = relationship(
        back_populates="activity"
    )

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} {self.name!r}>"


class Intensity(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Duration(enum.Enum):
    short = "short"
    medium = "medium"
    long = "long"


class CompletedActivity(Base):
    __tablename__ = "completed_activities"

    id: Mapped[CompletedActivityId] = mapped_column(
        String(14), primary_key=True, nullable=False, index=True
    )
    last_modified: Mapped[LastModified] = mapped_column(DateTime(), nullable=False)

    activity_id: Mapped[ActivityId] = mapped_column(ForeignKey("activities.id"))
    date: Mapped[LastModified] = mapped_column(DateTime(), nullable=False)
    intensity: Mapped[Intensity] = mapped_column(DbEnum(Intensity), nullable=False)
    duration: Mapped[Duration] = mapped_column(DbEnum(Duration), nullable=False)
    notes: Mapped[CompletedActivityNotes] = mapped_column(String(), nullable=None)

    # TODO: try to remove quotes and use __future__.annotations
    activity: Mapped["Activity"] = relationship(back_populates="activities")

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} {self.id!r}>"
