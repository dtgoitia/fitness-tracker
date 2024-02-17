"""
Convert a single backup file into CSVs (one per object type).

Purpose: easier visual inspection - which sometimes is more convenient than
writing SQL queries.
"""

from __future__ import annotations

import sys
import argparse
import logging
from pathlib import Path

import pandas as pd

from src.io import read_backup_file
from src.domain import is_backup_correpted

logger = logging.getLogger(__name__)


def _build_cli_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog=Path(__file__).name, description=__doc__)
    parser.add_argument("--verbose", action="store_true", help="show debug logs")
    parser.add_argument("--path", help="JSON backup file to be converted into CSVs")

    args = parser.parse_args()
    return args


def main(backup_path: Path) -> None:
    backup = read_backup_file(path=backup_path)
    is_backup_correpted(backup=backup)

    output_dir = Path.cwd()

    prefix = backup_path.name
    activities_path = output_dir / f"{prefix}__activities.csv"
    completed_activities_path = output_dir / f"{prefix}__completed-activities.csv"
    trainables_path = output_dir / f"{prefix}__trainables.csv"
    trainings_path = output_dir / f"{prefix}__trainings.csv"

    pd.DataFrame(backup.activities).to_csv(activities_path, index=False)
    pd.DataFrame(backup.completed_activities).to_csv(
        completed_activities_path, index=False
    )
    pd.DataFrame(backup.trainables).to_csv(trainables_path, index=False)
    pd.DataFrame(backup.trainings).to_csv(trainings_path, index=False)


if __name__ == "__main__":
    args = _build_cli_parser()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format=(
            "%(asctime)s:%(levelname)s:%(filename)s:%(lineno)d:%(message)s"
            if args.verbose
            else "%(levelname)s:%(message)s"
        ),
    )

    logger.debug(f"{sys.argv=}")

    main(backup_path=Path(args.path))
