import { Storage } from "../localStorage";
import { ActivityManager } from "./activities";
import { CompletedActivityManager } from "./completedActivities";
import { unreachable } from "./devex";
import { Activity, CompletedActivity } from "./model";

interface BrowserStorageArgs {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
  storage: Storage;
}

export class BrowserStorage {
  private activityManager: ActivityManager;
  private completedActivityManager: CompletedActivityManager;
  private storage: Storage;

  constructor({
    activityManager,
    completedActivityManager,
    storage,
  }: BrowserStorageArgs) {
    this.activityManager = activityManager;
    this.completedActivityManager = completedActivityManager;
    this.storage = storage;

    this.activityManager.changes$.subscribe((_) => {
      this.handleActivityChanges();
    });
    this.completedActivityManager.changes$.subscribe((_) => {
      this.handleCompletedActivityChanges();
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

  private handleActivityChanges(): void {
    this.storage.activities.set(this.activityManager.getAll());
  }

  private handleCompletedActivityChanges(): void {
    this.storage.history.set(this.completedActivityManager.getAll());
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
