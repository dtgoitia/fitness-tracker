import { Storage } from "../localStorage";
import { ActivityManager } from "./activities";
import { CompletedActivityManager } from "./completedActivities";
import { now } from "./datetimeUtils";
import { unreachable } from "./devex";
import { Activity, CompletedActivity, Training } from "./model";
import { TrainingManager } from "./trainings";

interface BrowserStorageArgs {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
  trainingManager: TrainingManager;
  storage: Storage;
}

export class BrowserStorage {
  private activityManager: ActivityManager;
  private completedActivityManager: CompletedActivityManager;
  private trainingManager: TrainingManager;
  private storage: Storage;

  constructor({
    activityManager,
    completedActivityManager,
    trainingManager,
    storage,
  }: BrowserStorageArgs) {
    this.activityManager = activityManager;
    this.completedActivityManager = completedActivityManager;
    this.trainingManager = trainingManager;
    this.storage = storage;

    this.activityManager.changes$.subscribe((_) => {
      this.handleActivityChanges();
    });
    this.completedActivityManager.changes$.subscribe((_) => {
      this.handleCompletedActivityChanges();
    });
    this.trainingManager.changes$.subscribe((_) => {
      this.handleTrainingChanges();
    });
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

  private handleActivityChanges(): void {
    this.storage.activities.set(this.activityManager.getAll());
  }

  private handleCompletedActivityChanges(): void {
    this.storage.history.set(this.completedActivityManager.getAll());
  }
  private handleTrainingChanges(): void {
    this.storage.trainings.set(this.trainingManager.getAll());
  }
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
  };

  return training;
}

function deserializeDate(raw: string): Date {
  return new Date(raw);
}
