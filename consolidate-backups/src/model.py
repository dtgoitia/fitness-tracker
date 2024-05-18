from dataclasses import dataclass
import datetime
import functools
from typing import Annotated, Any, Literal, TypeAlias
from apischema import alias

JsonDict: TypeAlias = dict[str, Any]

ActivityId: TypeAlias = str
ActivityName: TypeAlias = str
ActivityNotes: TypeAlias = str
CompletedActivityId: TypeAlias = str
CompletedActivityNotes: TypeAlias = str
Duration: TypeAlias = Literal["short", "medium", "long"]
Intensity: TypeAlias = Literal["low", "medium", "high"]
TrainingId: TypeAlias = str
TrainingName: TypeAlias = str
TrainableId: TypeAlias = str
TrainableName: TypeAlias = str
TrainableNotes: TypeAlias = str
Shortcut = ActivityId


@dataclass(frozen=True)
class Activity:
    id: ActivityId
    name: ActivityName
    other_names: Annotated[list[ActivityName], alias("otherNames")]
    last_modified: Annotated[datetime.datetime | None, alias("lastModified")] = None
    trainable_ids: Annotated[list[TrainableId] | None, alias("trainableIds")] = None
    notes: ActivityNotes | None = None

    def to_df_row(self) -> dict:
        row = {
            "id": self.id,
            "name": self.name,
            "other_names": stringify_a_list(self.other_names),
            "last_modified": self.last_modified,
            "trainable_ids": stringify_a_list(self.trainable_ids),
            "notes": self.notes,
        }

        return row


def stringify_a_list(items: list) -> str:
    return "|".join(items)


@dataclass(frozen=True)
class CompletedActivity:
    id: CompletedActivityId
    activity_id: Annotated[ActivityId, alias("activityId")]
    date: datetime.datetime
    duration: Duration
    intensity: Intensity
    notes: CompletedActivityNotes
    last_modified: Annotated[datetime.datetime | None, alias("lastModified")] = None


@dataclass(frozen=True)
class TrainingActivity:
    activityId: ActivityId
    duration: Duration
    intensity: Intensity


@dataclass(frozen=True)
class Training:
    id: TrainingId
    name: TrainingName
    activities: list[TrainingActivity]
    last_modified: Annotated[datetime.datetime | None, alias("lastModified")] = None
    is_oneoff: Annotated[bool | None, alias("isOneOff")] = None


@dataclass(frozen=True)
class Trainable:
    id: TrainableId
    name: TrainableName
    notes: TrainableNotes
    last_modified: Annotated[datetime.datetime | None, alias("lastModified")] = None


@dataclass(frozen=True)
class Backup:
    date: datetime.datetime
    activities: list[Activity]
    completed_activities: Annotated[
        list[CompletedActivity], alias("completedActivities")
    ]
    trainings: list[Training] | None = None
    trainables: list[Trainable] | None = None
    shortcuts: list[Shortcut] | None = None

    @functools.cached_property
    def time_range(self) -> tuple[datetime.datetime, datetime.datetime]:
        if not self.completed_activities:
            raise NotImplementedError(
                f"expected some completed_activites, but found none"
            )

        earliest = latest = self.completed_activities[0].date

        for completed_activity in self.completed_activities:
            date = completed_activity.date
            earliest = min(earliest, date)
            latest = max(latest, date)

        return (earliest, latest)
