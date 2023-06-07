import os
from dataclasses import dataclass, replace
from functools import lru_cache
from pathlib import Path
from typing import Any, Self


@dataclass(frozen=True)
class Config:
    db_path: Path

    def extend(self: Self, **changes: dict[str, Any]) -> Self:
        return replace(self, **changes)

    @property
    def sqlite_db_uri(self) -> str:
        if not self.db_path.exists():
            raise FileNotFoundError(f"Expected a file at {self.db_path.absolute()}")

        return f"sqlite:///{self.db_path}"


def _path_from_env(envvar: str) -> Path:
    return Path(os.environ[envvar]).resolve().expanduser()


def _optional_path_from_env(envvar: str) -> Path | None:
    try:
        return _path_from_env(envvar=envvar)
    except KeyError:
        return None


@lru_cache
def get_config() -> Config:
    return Config(
        db_path=_optional_path_from_env("DB_PATH"),
    )
