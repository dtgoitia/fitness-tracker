import {
  Activity,
  CompletedActivity,
  ISODatetimeString,
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
