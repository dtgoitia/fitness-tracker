"""
Convert a single backup file into a SQLite database.

Purpose: allow SQL queries against normalized tables or a denormalized view.
"""

from __future__ import annotations

import sqlite3
import sys
import argparse
import logging
from pathlib import Path

import pandas as pd

from src.io import read_backup_file
from src.domain import is_backup_corrupted, ActivityId, TrainableId

logger = logging.getLogger(__name__)

queries_dir = Path(__file__).parent
CREATE_ACTIVITIES_TABLE_QUERY_PATH = queries_dir / "create-activities-table.sql"
CREATE_COMPLETED_ACTIVITIES_TABLE_QUERY_PATH = (
    queries_dir / "create-completed-activities-table.sql"
)
CREATE_TRAINABLES_TABLE_QUERY_PATH = queries_dir / "create-trainables-table.sql"
CREATE_ACTIVITIES_TRAINABLES_TABLE_QUERY_PATH = (
    queries_dir / "create-activity-trainables-table.sql"
)
CREATE_HISTORY_VIEW_PATH = queries_dir / "create-history-view.sql"


def _build_cli_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog=Path(__file__).name, description=__doc__)
    parser.add_argument("--verbose", action="store_true", help="show debug logs")
    parser.add_argument(
        "--path", help="JSON backup file to be converted into an SQLite database"
    )

    args = parser.parse_args()
    return args


def main(backup_path: Path) -> None:
    backup = read_backup_file(path=backup_path)
    is_backup_corrupted(backup=backup)

    output_path = Path.cwd() / f"{backup_path.stem}.sqlite"
    output_path.unlink(missing_ok=True)

    with sqlite3.connect(output_path) as db:
        for path in (
            #
            # tables
            CREATE_ACTIVITIES_TABLE_QUERY_PATH,
            CREATE_COMPLETED_ACTIVITIES_TABLE_QUERY_PATH,
            CREATE_TRAINABLES_TABLE_QUERY_PATH,
            #
            # through-models
            CREATE_ACTIVITIES_TRAINABLES_TABLE_QUERY_PATH,
            #
            # views
            CREATE_HISTORY_VIEW_PATH,
        ):
            query = path.read_text().strip()
            db.execute(query)

        activities = pd.DataFrame(
            activity.to_df_row() for activity in backup.activities
        )
        activities.drop(columns=["trainable_ids"], inplace=True)
        activities.to_sql(
            name="activities",
            con=db,
            if_exists="replace",
            index=False,
            chunksize=1_000,
        )

        _activities_trainables: list[dict[str, str]] = []
        for activity in backup.activities:
            for trainable_id in activity.trainable_ids:
                _activities_trainables.append(
                    {"activity_id": activity.id, "trainable_id": trainable_id}
                )

        activities_trainables = pd.DataFrame(_activities_trainables)
        activities_trainables.to_sql(
            name="activities_trainables",
            con=db,
            if_exists="replace",
            index=False,
            chunksize=1_000,
        )

        pd.DataFrame(backup.completed_activities).to_sql(
            name="completed_activities",
            con=db,
            if_exists="replace",
            index=False,
            chunksize=1_000,
        )
        pd.DataFrame(backup.trainables).to_sql(
            name="trainables",
            con=db,
            if_exists="replace",
            index=False,
            chunksize=1_000,
        )


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
