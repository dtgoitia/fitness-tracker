import { ActivityManager } from "../domain/activities";
import { CompletedActivityManager } from "../domain/completedActivities";
import { ActivityId } from "../domain/model";
import { ShortcutManager } from "../domain/shortcuts";
import { TrainableManager } from "../domain/trainables";
import { TrainingManager } from "../domain/trainings";
import { BrowserStorage } from "./browserStorage";
import { Observable, Subject } from "rxjs";

interface Args {
  trainableManager: TrainableManager;
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
  trainingManager: TrainingManager;
  shortcutManager: ShortcutManager;
  browserStorage: BrowserStorage;
}

export class App {
  public status$: Observable<AppStatus>;
  public trainableManager: TrainableManager;
  public activityManager: ActivityManager;
  public completedActivityManager: CompletedActivityManager;
  public trainingManager: TrainingManager;
  public shortcutManager: ShortcutManager;
  public browserStorage: BrowserStorage;

  private statusSubject: Subject<AppStatus>;

  constructor({
    trainableManager,
    activityManager,
    completedActivityManager,
    trainingManager,
    shortcutManager,
    browserStorage,
  }: Args) {
    this.trainableManager = trainableManager;
    this.activityManager = activityManager;
    this.completedActivityManager = completedActivityManager;
    this.trainingManager = trainingManager;
    this.shortcutManager = shortcutManager;
    this.browserStorage = browserStorage;

    this.statusSubject = new Subject<AppStatus>();
    this.status$ = this.statusSubject.asObservable();
  }

  public initialize(): void {
    const logPrefix = `${App.name}::${this.initialize.name}`;

    // ===================================================================================
    //
    //   Load persisted data
    //
    // ===================================================================================
    console.log(`${logPrefix}::Loading data...`);

    const activities = this.browserStorage.getActivities();
    console.log(`${logPrefix}::${activities.length} activities found`);

    const completedActivities = this.browserStorage.getCompletedActivities();
    console.log(`${logPrefix}::${completedActivities.length} completed activities found`);

    const trainings = this.browserStorage.getTrainings();
    console.log(`${logPrefix}::${trainings.length} trainings found`);

    const shortcuts = this.browserStorage.getShortcuts();
    console.log(`${logPrefix}::${shortcuts.length} shortcuts found`);

    const trainables = this.browserStorage.getTrainables();
    console.log(`${logPrefix}::${trainables.length} trainables found`);

    // ===================================================================================
    //
    //   Initialize domain
    //
    // ===================================================================================

    console.log(`${logPrefix}::Initializating ${TrainableManager.name} ...`);
    this.trainableManager.initialize({ trainables });

    console.log(`${logPrefix}::Initializating ${ActivityManager.name} ...`);
    this.activityManager.initialize({ activities });

    console.log(`${logPrefix}::Initializating ${CompletedActivityManager.name} ...`);
    this.completedActivityManager.initialize({ completedActivities });

    console.log(`${logPrefix}::Initializating ${TrainingManager.name} ...`);
    this.trainingManager.initialize({ trainings });

    console.log(`${logPrefix}::Initializating ${ShortcutManager.name} ...`);
    this.shortcutManager.init({ shortcuts });

    console.log(`${logPrefix}::Initialization completed`);
    this.statusSubject.next({ kind: "app-initialized" });
  }

  /**
   * Delete `Activity` after checking if any other entities will stay orphan,
   * e.g. a `CompletedActivity` that ends up pointing to a missing `Activity`.
   */
  public deleteActivity({ id }: { id: ActivityId }): DeleteActivityResult {
    const previous = this.activityManager.get(id);
    if (previous === undefined) {
      console.debug(
        `App.deleteActivity::no activity found with ID ${id}, nothing will be deleted`
      );
      return { kind: "activity-not-found" };
    }

    console.log(`App.deleteActivity::Removing activity (ID: ${id})`);

    if (this.completedActivityManager.isActivityUsedInHistory({ activityId: id })) {
      return {
        kind: "activity-found-but-was-not-deleted",
        reason: `This activity is used in the history, cannot be removed!`,
      };
    }

    this.activityManager.deleteUnsafe({ id });
    return { kind: "activity-successfully-deleted" };
  }
}

type AppStatus = { kind: "app-initialized" };

type DeleteActivityResult =
  | { kind: "activity-successfully-deleted" }
  | { kind: "activity-not-found" }
  | { kind: "activity-found-but-was-not-deleted"; reason: string };
