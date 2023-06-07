from pathlib import Path

import pytest
from fitness_tracker_api.config import Config, get_repo_path

TEST_DIR = get_repo_path() / "tests"


@pytest.fixture
def test_config() -> Config:
    return Config(
        db_path=TEST_DIR / "test_db.sqlite",
    )
