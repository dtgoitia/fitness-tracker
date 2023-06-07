import argparse
import logging
from pathlib import Path

from fitness_tracker_api.config import get_config
from fitness_tracker_api.use_cases.import_json_into_db import import_json_into_db

logger = logging.getLogger(__name__)


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--json-backup",
        help="Backup JSON file exported from the fitness-tracker webapp",
    )
    parser.add_argument(
        "--db-path",
        help="Overwrites the DB_PATH environment variable",
    )
    parser.add_argument("-v", "--verbose", action="store_true", help="Show debug logs")
    args = parser.parse_args()
    return args


def import_json_into_db_cmd(
    json_backup: str | None = None, db_path: str | None = None
) -> None:
    config = get_config()

    import_json_into_db(config=config)


if __name__ == "__main__":
    arguments = parse_arguments()

    log_level = logging.DEBUG if arguments.verbose else logging.INFO
    logging.basicConfig(level=log_level, format="%(message)s")
    logger.debug("Verbose mode: ON")

    import_json_into_db_cmd(wipman_dir=arguments.wipman_dir, db_path=arguments.db_path)
