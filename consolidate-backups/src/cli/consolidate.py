"""
Look for backup files in the hardcoded directory and consolidate (merge) them
all into a single file.
"""

from __future__ import annotations

import datetime
import sys
import argparse
import logging
from pathlib import Path
from typing import Iterator


from src.io import read_backup_file, write_backup_to_file
from src.model import Backup
from src.domain import Decisions, merge_backups, is_backup_corrupted

logger = logging.getLogger(__name__)


def _build_cli_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog=Path(__file__).name, description=__doc__)
    parser.add_argument("--verbose", action="store_true", help="show debug logs")
    parser.add_argument(
        "--path", help="directory to search for JSON-like fitness-tracker backups"
    )

    return parser


def parse_cli_argument() -> argparse.Namespace:
    args = _build_cli_parser().parse_args()
    return args


def _load_all_files(files: Iterator[Path]) -> Iterator[Backup]:
    def _load_file(path: Path) -> Backup:
        backup = read_backup_file(path=path)
        logger.info("validating backup")
        is_backup_corrupted(backup=backup)
        logger.info("validating backup completed without errors")
        return backup

    backups = map(_load_file, files)

    backups_per_date = {backup.date: backup for backup in backups}

    dates = sorted(backups_per_date.keys())

    return (backups_per_date[date] for date in dates)


def _consolidate(backups: Iterator[Backup], decisions: Decisions) -> Backup:
    logger.info("consolidating backups...")
    consolidated = Backup(
        date=datetime.datetime.fromisoformat("1990-01-01 00:00:00+00:00"),
        activities=[],
        completed_activities=[],
        trainings=[],
        trainables=[],
        shortcuts=[],
    )
    for backup in backups:
        consolidated = merge_backups(a=consolidated, b=backup, decisions=decisions)

    logger.info("consolidating backups completed")

    return consolidated


def main(search_dir: Path) -> None:
    paths = search_dir.glob("fitness-tracker__*.json")

    # Load previously made decisions
    decisions_path = Path("decisions__deleted-completed-activities.csv")
    if decisions_path.exists():
        decisions = Decisions.from_file(path=decisions_path)
    else:
        decisions = Decisions(decisions=[], path=decisions_path)

    backups = _load_all_files(files=paths)
    consolidated = _consolidate(backups=backups, decisions=decisions)
    write_backup_to_file(backup=consolidated, output_dir=Path.cwd())


if __name__ == "__main__":
    args = parse_cli_argument()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format=(
            "%(asctime)s:%(levelname)s:%(filename)s:%(lineno)d:%(message)s"
            if args.verbose
            else "%(levelname)s:%(message)s"
        ),
    )

    logger.debug(f"{sys.argv=}")

    main(search_dir=Path(args.path))
