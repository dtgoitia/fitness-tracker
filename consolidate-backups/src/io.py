import json
import logging
from pathlib import Path

from apischema import ValidationError, deserialize, serialize

from src.model import Backup, JsonDict


logger = logging.getLogger(__name__)


def read_json(path: Path) -> JsonDict:
    logger.debug(f"reading JSON file from {path}")
    resolved_path = path.expanduser().resolve()
    if not resolved_path.exists():
        raise FileNotFoundError(str(resolved_path))

    with resolved_path.open("r") as file_handler:
        data = json.load(file_handler)
        logger.debug(f"reading JSON file from {path} completed")
        return data


def write_json(path: Path, data: JsonDict) -> None:
    logger.debug(f"writing JSON file to {path}")
    with path.open("w") as file_handler:
        json.dump(data, fp=file_handler, indent=2)
        logger.debug(f"writing JSON file to {path} completed")


class UnsupportedBackupFile(Exception): ...


def read_backup_file(path: Path) -> Backup:
    logger.info(f"reading backup from {path}")
    data = read_json(path=path)
    logger.debug(f"reading backup from {path} completed")
    logger.info(f"deserializing backup")
    try:
        backup = deserialize(Backup, data)
        logger.debug(f"deserializing backup completed")
    except ValidationError as error:
        breakpoint()
        formatted_error = json.dumps(
            json.loads(str(error)[17:].replace("'", '"')),
            indent=2,
        )
        raise UnsupportedBackupFile(
            f"unsupported backup found at: {path}\n{formatted_error}"
        ) from None

    return backup


def write_backup_to_file(backup: Backup, output_dir: Path) -> None:
    timestamp = backup.date.isoformat().replace(" ", "T")
    path = output_dir / f"fitness-tracker__consolidated-backup__{timestamp}.json"
    logger.info(f"writing backup to {path}")
    write_json(data=serialize(Backup, backup), path=path)
    logger.debug(f"writing backup to {path} completed")
