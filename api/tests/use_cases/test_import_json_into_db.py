from pathlib import Path

import pytest
from fitness_tracker_api.config import get_config
from fitness_tracker_api.db import get_db_session
from fitness_tracker_api.model import Activity, CompletedActivity
from fitness_tracker_api.use_cases.import_json_into_db import import_json_into_db
from sqlalchemy.dialects import sqlite


# @pytest.mark.skip(reason="only for development purposes")
def test_import_json_into_db() -> None:
    config = get_config()

    path = Path(
        "~/Dropbox/second-brain/health/fitness/my-training-log"
        "/fitness-tracker-webapp-csvs"
        "/fitness-tracker__backup_20230315-125301.json"
    ).expanduser()

    import_json_into_db(path=path, config=config)

    db = get_db_session(config=config)

    result = (
        db.query(CompletedActivity).join(Activity).filter(Activity.name == "abs").all()
    )
    breakpoint()

    raise NotImplementedError()
