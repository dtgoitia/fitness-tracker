import datetime
import json
from dataclasses import dataclass
from pathlib import Path

from fitness_tracker_api.model import (
    Activity,
    CompletedActivity,
    Duration,
    Intensity,
    JsonDict,
)


@dataclass(frozen=True)
class Backup:
    date: datetime.datetime
    path: Path
    activities: frozenset[Activity]
    completed_activities: frozenset[CompletedActivity]
    # TODO: add trainings


def read_backup(path: Path) -> Backup:
    if not path.exists():
        raise FileNotFoundError(
            f"Expected to find a backfup file but found none at {path.absolute()}"
        )

    with path.open("r") as f:
        data: JsonDict = json.load(f)

    return Backup(
        date=datetime.datetime.fromisoformat(data["date"]),
        path=path,
        activities=frozenset(map(_read_activity, data.get("activities", []))),
        completed_activities=frozenset(
            map(_read_completed_activity, data.get("completedActivities", []))
        ),
    )


def _read_activity(raw: JsonDict) -> Activity:
    return Activity(
        id=raw["id"],
        last_modified=datetime.datetime.fromisoformat(raw["lastModified"]),
        name=raw["name"],
        other_names="|".join(raw["otherNames"]),
    )


def _read_completed_activity(raw: JsonDict) -> CompletedActivity:
    return CompletedActivity(
        id=raw["id"],
        last_modified=datetime.datetime.fromisoformat(raw["lastModified"]),
        activity_id=raw["activityId"],
        date=datetime.datetime.fromisoformat(raw["date"]),
        duration=Duration(raw["duration"]),
        intensity=Intensity(raw["intensity"]),
        notes=raw["notes"],
    )
