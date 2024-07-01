import { Storage } from "../../localStorage";
import { now } from "../datetimeUtils";
import { unreachable } from "../devex";
import { ActivityManager } from "../domain/activities";
import {
  ActivityBackup,
  CompletedActivityBackup,
  ShortcutBackup,
  TrainableBackup,
  TrainingBackup,
} from "../domain/backup";
import { CompletedActivityManager } from "../domain/completedActivities";
import {
  Activity,
  CompletedActivity,
  Shortcut,
  Trainable,
  Training,
} from "../domain/model";
import { ShortcutManager } from "../domain/shortcuts";
import { TrainableManager } from "../domain/trainables";
import { TrainingManager } from "../domain/trainings";

interface BrowserStorageArgs {
  trainableManager: TrainableManager;
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
  trainingManager: TrainingManager;
  shortcutManager: ShortcutManager;
  storage: Storage;
}

export class BrowserStorage {
  private trainableManager: TrainableManager;
  private activityManager: ActivityManager;
  private completedActivityManager: CompletedActivityManager;
  private trainingManager: TrainingManager;
  private shortcutManager: ShortcutManager;
  private storage: Storage;

  constructor({
    trainableManager,
    activityManager,
    completedActivityManager,
    trainingManager,
    shortcutManager,
    storage,
  }: BrowserStorageArgs) {
    this.trainableManager = trainableManager;
    this.activityManager = activityManager;
    this.completedActivityManager = completedActivityManager;
    this.trainingManager = trainingManager;
    this.shortcutManager = shortcutManager;
    this.storage = storage;

    this.trainableManager.changes$.subscribe(() => {
      this.handleTrainableChanges();
    });
    this.activityManager.changes$.subscribe(() => {
      this.handleActivityChanges();
    });
    this.completedActivityManager.changes$.subscribe(() => {
      this.handleCompletedActivityChanges();
    });
    this.trainingManager.changes$.subscribe(() => {
      this.handleTrainingChanges();
    });
    this.shortcutManager.change$.subscribe(() => {
      this.handleShortcutsChange();
    });
  }

  public getTrainables(): Trainable[] {
    if (this.storage.trainables.exists() === false) {
      return [];
    }

    const rawTrainables = this.storage.trainables.read();
    if (!rawTrainables) {
      return [];
    }

    const trainables = rawTrainables.map(deserializeTrainable);
    return trainables;
  }

  public getActivities(): Activity[] {
    if (this.storage.activities.exists() === false) {
      return [];
    }

    const rawActivities = this.storage.activities.read();
    if (!rawActivities) {
      return [];
    }

    const activities = rawActivities.map(deserializeActivity);
    return activities;
  }

  public getCompletedActivities(): CompletedActivity[] {
    if (this.storage.history.exists() === false) {
      return [];
    }

    const rawHistory = this.storage.history.read();
    if (!rawHistory) {
      return [];
    }

    const completedActivities = rawHistory.map(deserializeCompletedActivity);
    return completedActivities;
  }

  public getTrainings(): Training[] {
    if (this.storage.trainings.exists() === false) {
      return [];
    }

    const rawTrainings = this.storage.trainings.read();
    if (!rawTrainings) {
      return [];
    }

    const trainings = rawTrainings.map(deserializeTraining);
    return trainings;
  }

  public getShortcuts(): Shortcut[] {
    if (this.storage.shortcuts.exists() === false) {
      return [];
    }

    const rawShortcuts = this.storage.shortcuts.read();
    if (!rawShortcuts) {
      return [];
    }

    const shortcuts = rawShortcuts.map(deserializeShortcut);
    return shortcuts;
  }

  public storeActivities(activities: (Activity | ActivityBackup)[]): void {
    this.storage.activities.set(activities);
  }

  public storeCompletedActivities(
    cActivities: (CompletedActivity | CompletedActivityBackup)[]
  ): void {
    this.storage.history.set(cActivities);
  }

  public storeTrainings(trainings: (Training | TrainingBackup)[]): void {
    this.storage.trainings.set(trainings);
  }

  public storeTrainables(trainables: (Trainable | TrainableBackup)[]): void {
    this.storage.trainables.set(trainables);
  }

  public storeShortcuts(shortcuts: (Shortcut | ShortcutBackup)[]): void {
    this.storage.shortcuts.set(shortcuts);
  }

  private handleActivityChanges(): void {
    this.storeActivities(this.activityManager.getAll());
  }

  private handleCompletedActivityChanges(): void {
    this.storeCompletedActivities(
      this.completedActivityManager.getAll({ order: "chronological" })
    );
  }

  private handleTrainingChanges(): void {
    this.storeTrainings(this.trainingManager.getAll());
  }

  private handleTrainableChanges(): void {
    this.storeTrainables(this.trainableManager.getAll());
  }

  private handleShortcutsChange(): void {
    this.storeShortcuts(this.shortcutManager.getAll());
  }
}

function deserializeTrainable(raw: object): Trainable {
  if (raw === null || raw === undefined) {
    throw unreachable();
  }

  return raw as Trainable;
}

function deserializeActivity(raw: object): Activity {
  if (raw === null || raw === undefined) {
    throw unreachable();
  }

  // Remove once all items have been migrated
  if ("lastModified" in raw === false) {
    return { ...raw, lastModified: now() } as Activity;
  }

  return raw as Activity;
}

function deserializeCompletedActivity(raw: any): CompletedActivity {
  if (raw === null || raw === undefined) {
    throw unreachable();
  }

  const completedActivity: CompletedActivity = {
    ...raw,
    date: deserializeDate(raw.date),
    lastModified:
      // Remove once all items have been migrated
      "lastModified" in raw === false ? now() : deserializeDate(raw.lastModified),
  };

  return completedActivity;
}

function deserializeTraining(raw: any): Training {
  if (raw === null || raw === undefined) {
    throw unreachable();
  }

  const training: Training = {
    ...raw,
    lastModified: deserializeDate(raw.lastModified),
    isOneOff: raw?.isOneOff === true,
  };

  return training;
}

function deserializeShortcut(raw: any): Shortcut {
  if (raw === null || raw === undefined) {
    throw unreachable();
  }

  const shortcut: Shortcut = raw;

  return shortcut;
}

function deserializeDate(raw: string): Date {
  return new Date(raw);
}
