from __future__ import annotations
from pathlib import Path
from apischema import deserialize
import pandas as pd
from dataclasses import dataclass, asdict
import datetime
import logging
from typing import Literal, TypeAlias
from src.model import (
    Activity,
    ActivityId,
    Backup,
    CompletedActivity,
    CompletedActivityId,
    Shortcut,
    TrainableId,
    Trainable,
    Training,
)

logger = logging.getLogger(__name__)


class CorruptedBackup(Exception): ...


def is_backup_correpted(*, backup: Backup) -> bool:
    is_corrupted = False

    trainables: set[TrainableId] = {
        trainable.id for trainable in (backup.trainables or set())
    }

    # every Activity must point to existing Trainables
    activities: set[ActivityId] = set()
    for activity in backup.activities:
        activities.add(activity.id)
        for trainable_id in activity.trainable_ids or set[Trainable]():
            if trainable_id not in trainables:
                logger.warning(
                    "corrupted-backup: "
                    f"Activity {activity.id!r} points to an Trainable"
                    f" {trainable_id!r} which is not present in the backup"
                )
                is_corrupted = True

    # every CompletedActivity must point to an existing Activity
    for completed_activity in backup.completed_activities:
        if completed_activity.activity_id not in activities:
            logger.warning(
                "corrupted-backup: "
                f"CompletedActivity {completed_activity.id!r} points to an"
                f" Activity {completed_activity.activity_id!r} which is not"
                " present in the backup"
            )
            is_corrupted = True

    # every Training must point to existing Activities
    for training in backup.trainings or set[Training]():
        for training_activity in training.activities:
            if training_activity.activityId not in activities:
                logger.warning(
                    "corrupted-backup: "
                    f"Training {training.id!r} points to an Activity"
                    f" {training_activity.activityId!r} which is not present in"
                    " the backup"
                )
                is_corrupted = True

    # every Shortcut must point to existing Activities
    for shortcut_activity_id in backup.shortcuts or set():
        if shortcut_activity_id not in activities:
            logger.warning(
                "corrupted-backup: "
                f"The Activity {shortcut_activity_id!r} is used in the"
                " shortcuts but this Activity is not present in the backup"
            )
            is_corrupted = True

    return is_corrupted


def merge_activites(earliest: Backup, latest: Backup) -> list[Activity]:
    merged: dict[ActivityId, Activity] = {
        activity.id: activity for activity in latest.activities
    }

    lower_boundary, upper_boundary = latest.time_range
    for old_activity in earliest.activities:
        if old_activity.id in merged:
            continue  # a newer version has already been included in the result

        # :S the old backup has an activity which does not exist in the new
        # backup, either:
        #    a) you've found one of the old backups created when the old records
        #       were removed from the app after backing them up (which is no
        #       longer the case)
        #    b) this records has been deleted on purpose
        #    c) this records has been deleted by mistake
        # if (b) or (c) are the case, then the user should be prompted
        if old_activity.last_modified < lower_boundary:
            # the activity was created
            ...
        logger.error(f"found some activities")
        breakpoint()

    return list(merged.values())


def merge_completed_activities(
    earliest: Backup, latest: Backup, decisions: Decisions
) -> list[CompletedActivity]:
    merged: dict[CompletedActivityId, CompletedActivity] = {
        completed_activity.id: completed_activity
        for completed_activity in latest.completed_activities
    }

    activities = {act.id: act for act in earliest.activities}

    lower_boundary, upper_boundary = latest.time_range

    for old_completed_activity in earliest.completed_activities:
        old_id = old_completed_activity.id
        if old_id in merged:
            continue  # a newer version has already been included in the result

        # :S the old backup has a completed activity which does not exist in the
        # new backup, either:
        #    a) you've found one of the old backups created when the old records
        #       were removed from the app after backing them up (which is no
        #       longer the case)
        #    b) this records has been deleted on purpose
        #    c) this records has been deleted by mistake
        # if (b) or (c) are the case, then the user should be prompted

        if old_completed_activity.date < lower_boundary:
            # the CompletedActivity from the old backup happened before the time
            # range of the new backup, this is case (a)
            merged[old_id] = old_completed_activity
        else:
            # the old CompletedActivity in the old backup happened inside the
            # time range of the new backup, this is case either (b) or (c)
            logger.info(f"earliest backup contains {old_id!r} but the latest doesn't")
            logger.info(f"looking for previous decisions regarding {old_id!r}...")
            if previous_decision := decisions.find(id=old_id):
                if previous_decision.must_be_deleted:
                    logger.info(f"found decision: {old_id!r} must be deleted")
                    continue
                else:
                    logger.info(f"found decision: {old_id!r} must be kept")
                    merged[old_id] = old_completed_activity
            else:
                activity = activities[old_completed_activity.activity_id]
                print()
                print()
                print(f"lower_boundary:              {lower_boundary}")
                print(f"upper_boundary:              {upper_boundary}")
                print(f"old_completed_activity.date: {old_completed_activity.date}")
                print(
                    f"the {CompletedActivity.__name__} {old_id!r} ({activity.name})"
                    " exists in old backup, but it's not in the new backup"
                )
                print()
                must_delete = ask_user_if_comp_activity_should_be_deleted(id=old_id)
                decisions.decide(
                    id=old_id,
                    reviewed_at=datetime.datetime.now(tz=datetime.timezone.utc),
                    must_be_deleted=must_delete,
                )
                if must_delete:
                    logger.info(f"decision made: {old_id!r} must be deleted")
                    continue
                else:
                    logger.info(f"decision made: {old_id!r} must be kept")
                    merged[old_id] = old_completed_activity

    return list(merged.values())


def merge_trainables(
    earliest: list[Trainable], latest: list[Trainable]
) -> list[Trainable]:
    if latest is None:
        return earliest or []

    merged: dict[TrainableId, Trainable] = {
        trainable.id: trainable for trainable in latest
    }

    for old_trainable in earliest:
        if old_trainable.id in merged:
            continue  # we want to keep the latest version
        else:
            merged[old_trainable.id] = old_trainable

    return list(merged.values())


def merge_backups(a: Backup, b: Backup, decisions: Decisions) -> Backup:
    if a.date < b.date:
        earliest, latest = a, b
    else:
        earliest, latest = b, a

    logger.info(f"merging backups: earliest={earliest.date} latest={latest.date}")

    return Backup(
        date=latest.date,
        activities=merge_activites(earliest=earliest, latest=latest),
        completed_activities=merge_completed_activities(
            earliest=earliest, latest=latest, decisions=decisions
        ),
        trainings=latest.trainings,
        trainables=merge_trainables(
            earliest=earliest.trainables, latest=latest.trainables
        ),
        shortcuts=latest.shortcuts,
    )


@dataclass(frozen=True)
class Decision:
    id: CompletedActivityId
    reviewed_at: datetime.datetime
    must_be_deleted: bool


MustBeDeleted: TypeAlias = bool


class Decisions:
    def __init__(self, decisions: list[Decision], path: Path) -> None:
        self.path = path
        self._decisions = {decision.id: decision for decision in decisions}

    def find(self, id: CompletedActivityId) -> Decision | None:
        if previous_decision := self._decisions.get(id):
            return previous_decision
        return None

    def decide(
        self,
        id: CompletedActivityId,
        reviewed_at: datetime.datetime,
        must_be_deleted: MustBeDeleted,
    ) -> None:
        self._decisions[id] = Decision(
            id=id,
            reviewed_at=reviewed_at,
            must_be_deleted=must_be_deleted,
        )
        self._save_to_file()

    def _save_to_file(self) -> None:
        df = pd.DataFrame(map(asdict, self._decisions.values()))
        df.sort_values(by="reviewed_at", inplace=True)
        df.to_csv(self.path, index=False)

    @staticmethod
    def from_file(path: Path) -> Decisions:
        return Decisions(
            decisions=deserialize(list[Decision], pd.read_csv(path).to_dict("records")),
            path=path,
        )


def ask_user_if_comp_activity_should_be_deleted(id: CompletedActivityId) -> bool:
    message = f"should {CompletedActivity.__name__} {id!r} be [k]ept or [d]eleted? "
    answer: Literal["k", "d"] | None = None

    while not answer:
        answer = input(message).lower()

    match answer:
        case "k":
            return False  # must not delete
        case "d":
            return True  # must delete
        case _:
            raise NotImplementedError(f"unsupported answer found: {answer!r}")
