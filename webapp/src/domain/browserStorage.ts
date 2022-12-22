import { Storage } from "../localStorage";
import { ActivityManager } from "./activities";
import { CompletedActivityManager } from "./completedActivities";
import { unreachable } from "./devex";
import { Activity, CompletedActivity, Training, TrainingActivity } from "./model";
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
      // TODO: when you switch from localStorage to indexedDB, start handled each change
      //       type separately
      this.handleActivityChanges();
    });
    this.completedActivityManager.changes$.subscribe((_) => {
      // TODO: when you switch from localStorage to indexedDB, start handled each change
      //       type separately
      this.handleCompletedActivityChanges();
    });
    this.trainingManager.changes$.subscribe((_) => {
      // TODO: when you switch from localStorage to indexedDB, start handled each change
      //       type separately
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

  return raw as Activity;
}

function deserializeCompletedActivity(raw: any): CompletedActivity {
  if (raw === null || raw === undefined) {
    throw unreachable();
  }

  const completedActivity: CompletedActivity = {
    ...raw,
    date: new Date(raw.date),
  };

  return completedActivity;
}

function deserializeTraining(raw: any): Training {
  if (raw === null || raw === undefined) {
    throw unreachable();
  }

  return {
    ...raw,
    trainingActivities: raw.trainingActivities.map(
      (rawActivity: any): TrainingActivity => ({
        ...rawActivity,
      })
    ),
  };
}
