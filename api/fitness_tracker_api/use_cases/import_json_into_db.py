import logging
from pathlib import Path

from fitness_tracker_api import fs
from fitness_tracker_api.config import Config
from fitness_tracker_api.db import get_db_session
from fitness_tracker_api.domain import create_activity
from fitness_tracker_api.model import Activity

logger = logging.getLogger(__name__)


def import_json_into_db(path: Path, config: Config):
    db = get_db_session(config=config)

    backup = fs.read_backup(path=path)

    db.begin()

    for i, activity in enumerate(backup.activities):
        print(f"{i} Adding {activity!r}")
        db.add(activity)

    for i, completed_activity in enumerate(backup.completed_activities):
        print(f"{i} Adding {completed_activity!r}")
        db.add(completed_activity)

    db.commit()
