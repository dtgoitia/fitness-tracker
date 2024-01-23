import { App } from "../app/app";
import {
  Activity,
  CompletedActivity,
  ISODatetimeString,
  JsonString,
  Shortcut,
  Trainable,
  Training,
} from "./model";

export interface ActivityBackup extends Omit<Activity, "lastModified"> {
  readonly lastModified: ISODatetimeString;
}

export interface CompletedActivityBackup
  extends Omit<CompletedActivity, "date" | "lastModified"> {
  readonly date: ISODatetimeString;
  readonly lastModified: ISODatetimeString;
}

export interface TrainingBackup extends Omit<Training, "lastModified"> {
  readonly lastModified: ISODatetimeString;
}

export interface TrainableBackup extends Omit<Trainable, "lastModified"> {
  readonly lastModified: ISODatetimeString;
}

export type ShortcutBackup = Shortcut;

export interface Backup {
  readonly date: ISODatetimeString;
  readonly activities: ActivityBackup[];
  readonly completedActivities: CompletedActivityBackup[];
  readonly trainings: TrainingBackup[];
  readonly trainables: TrainableBackup[];
  readonly shortcuts: ShortcutBackup[];
}

export function generateFilename({ date }: { date: Date }): string {
  const formattedDate = date
    .toISOString()
    .replace(/-/, "")
    .replace(/:/, "")
    .replace("T", "-")
    .slice(0, 15);
  return `fitness-tracker__backup_${formattedDate}.txt`;
}

export function generateBackupFileContent({
  date,
  app,
}: {
  date: Date;
  app: App;
}): JsonString {
  const data = {
    date: date.toISOString(),
    activities: app.activityManager.getAll(),
    completedActivities: app.completedActivityManager.getAll(),
    trainings: app.trainingManager.getAll(),
    trainables: app.trainableManager.getAll(),
    shortcuts: app.shortcutManager.getAll(),
  };

  return JSON.stringify(data, null, 2);
}
