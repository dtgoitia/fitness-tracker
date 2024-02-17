from dataclasses import replace
import datetime
from datetime import timedelta
from src.model import Backup
from src.domain import merge_backups
from tests.helpers import (
    build_activity,
    build_backup,
    build_completed_activity,
    build_trainable,
)


def test_merge_backups_when_an_activity_is_updated() -> None:
    original = build_activity(id="act_000001", name="name")
    updated = build_activity(
        id=original.id,
        last_modified=original.last_modified + timedelta(days=1),
        name="updated name",
    )

    a = build_backup(
        date=datetime.datetime.fromisoformat("2020-01-01 00:00:00+00:00"),
        activities=[original],
    )

    b = build_backup(
        date=datetime.datetime.fromisoformat("2020-01-11 00:00:00+00:00"),
        activities=[updated],
    )

    consolidated = merge_backups(a=a, b=b)

    assert consolidated == b


def test_merge_backups_when_a_completed_activity_is_updated() -> None:
    original = build_completed_activity(id="cpa_000001", duration="short")
    updated = build_completed_activity(
        id=original.id,
        last_modified=original.last_modified + timedelta(days=1),
        duration="long",
    )

    a = build_backup(
        date=datetime.datetime.fromisoformat("2020-01-01 00:00:00+00:00"),
        activities=[original],
    )

    b = build_backup(
        date=datetime.datetime.fromisoformat("2020-01-11 00:00:00+00:00"),
        activities=[updated],
    )

    consolidated = merge_backups(a=a, b=b)

    assert consolidated == b


def test_merge_backups_when_a_trainable_is_updated() -> None:
    original = build_trainable(id="imp_000001", name="name")
    updated = build_trainable(
        id=original.id,
        last_modified=original.last_modified + timedelta(days=1),
        name="updated name",
    )

    a = build_backup(
        date=datetime.datetime.fromisoformat("2020-01-01 00:00:00+00:00"),
        activities=[original],
    )

    b = build_backup(
        date=datetime.datetime.fromisoformat("2020-01-11 00:00:00+00:00"),
        activities=[updated],
    )

    consolidated = merge_backups(a=a, b=b)

    assert consolidated == b
