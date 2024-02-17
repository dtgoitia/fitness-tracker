import datetime
from src.model import (
    ActivityName,
    ActivityNotes,
    Backup,
    Activity,
    ActivityId,
    CompletedActivity,
    Duration,
    Intensity,
    Shortcut,
    TrainableId,
    Trainable,
    TrainableName,
    TrainableNotes,
    Training,
    CompletedActivityId,
    CompletedActivityNotes,
)


def build_completed_activity(
    id: CompletedActivityId | None = None,
    activity_id: ActivityId | None = None,
    date: datetime.datetime | None = None,
    last_modified: datetime.datetime | None = None,
    duration: Duration | None = None,
    intensity: Intensity | None = None,
    notes: CompletedActivityNotes | None = None,
) -> CompletedActivity:
    return CompletedActivity(
        id="test_completed_activity_id" if id is None else id,
        activity_id="test_activity_id" if activity_id is None else activity_id,
        date=(
            datetime.datetime.fromisoformat("2020-01-02 00:00:00+00:00")
            if date is None
            else date
        ),
        duration="medium" if duration is None else duration,
        intensity="medium" if intensity is None else intensity,
        last_modified=(
            datetime.datetime.fromisoformat("2020-01-02 00:00:00+00:00")
            if last_modified is None
            else last_modified
        ),
        notes=None if notes is None else notes,
    )


def build_activity(
    id: ActivityId | None = None,
    name: ActivityName | None = None,
    other_names: list[ActivityName] | None = None,
    last_modified: datetime.datetime | None = None,
    trainableIds: list[TrainableId] | None = None,
    notes: ActivityNotes | None = None,
) -> Activity:
    return Activity(
        id="test_activity_id" if id is None else id,
        name="test_name" if name is None else name,
        other_names="test_other_names" if other_names is None else other_names,
        last_modified=(
            datetime.datetime.fromisoformat("2020-01-02 00:00:00+00:00")
            if last_modified is None
            else last_modified
        ),
        trainable_ids=None if trainableIds is None else trainableIds,
        notes=None if notes is None else notes,
    )


def build_trainable(
    id: TrainableId | None = None,
    name: TrainableName | None = None,
    last_modified: datetime.datetime | None = None,
    notes: TrainableNotes | None = None,
) -> Trainable:
    return Trainable(
        id="test_trainable_id" if id is None else id,
        name="test_name" if name is None else name,
        last_modified=(
            datetime.datetime.fromisoformat("2020-01-02 00:00:00+00:00")
            if last_modified is None
            else last_modified
        ),
        notes=None if notes is None else notes,
    )


def build_backup(
    date: datetime.datetime | None = None,
    activities: list[Activity] | None = None,
    completed_activities: list[CompletedActivity] | None = None,
    trainings: list[Training] | None = None,
    trainables: list[Trainable] | None = None,
    shortcuts: list[Shortcut] | None = None,
) -> Backup:
    return Backup(
        date=(
            datetime.datetime.fromisoformat("2020-01-00 00:00:00+00:00")
            if date is None
            else date
        ),
        activities=[] if activities is None else activities,
        completed_activities=(
            [] if completed_activities is None else completed_activities
        ),
        trainings=[] if trainings is None else trainings,
        trainables=[] if trainables is None else trainables,
        shortcuts=[] if shortcuts is None else shortcuts,
    )
