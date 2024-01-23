import { ActivityManager, sortActivitiesAlphabetically } from "../domain/activities";
import { Backup } from "../domain/backup";
import { CompletedActivityManager } from "../domain/completedActivities";
import { Activity, ActivityId, TrainableId } from "../domain/model";
import { ShortcutManager } from "../domain/shortcuts";
import { TrainableManager } from "../domain/trainables";
import { TrainingManager } from "../domain/trainings";
import { BrowserStorage } from "./browserStorage";
import { BehaviorSubject, Observable, Subject } from "rxjs";

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

    this.statusSubject = new BehaviorSubject<AppStatus>({ kind: "app-not-initialized" });
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
    this.statusSubject.next({ kind: "app-initializing" });

    const activities = this.browserStorage.getActivities();
    console.log(`${logPrefix}::${activities?.length || "0"} activities found`);

    const completedActivities = this.browserStorage.getCompletedActivities();
    console.log(
      `${logPrefix}::${completedActivities?.length || "0"} completed activities found`
    );

    const trainings = this.browserStorage.getTrainings();
    console.log(`${logPrefix}::${trainings?.length || "0"} trainings found`);

    const shortcuts = this.browserStorage.getShortcuts();
    console.log(`${logPrefix}::${shortcuts?.length || "0"} shortcuts found`);

    const trainables = this.browserStorage.getTrainables();
    console.log(`${logPrefix}::${trainables?.length || "0"} trainables found`);

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

  public deleteTrainable({ id }: { id: TrainableId }): DeleteTrainableResult {
    const previous = this.trainableManager.get(id);
    if (previous === undefined) {
      console.debug(
        `App.deleteTrainable::no trainable found with ID ${id}, nothing will be deleted`
      );
      return { kind: "trainable-not-found" };
    }

    console.log(`App.deleteTrainable::Removing trainable (ID: ${id})`);

    const activityIds = this.activityManager.getByTrainable({
      trainableId: id,
    });

    if (activityIds.size > 0) {
      return {
        kind: "trainable-found-but-was-not-deleted",
        reason: [
          `This trainable cannot be removed because these activities are using it: `,
          [...activityIds]
            .map((activityId) => this.activityManager.get(activityId))
            .filter((activity) => activity !== undefined)
            .map((activity) => activity as Activity)
            .sort(sortActivitiesAlphabetically)
            .map(({ id, name }) => `  - (${id}) ${name}`)
            .join("\n"),
        ].join(""),
      };
    }

    this.trainableManager.deleteUnsafe({ id });
    return { kind: "trainable-successfully-deleted" };
  }

  public restoreData({ backup }: { backup: Backup }): void {
    const logPrefix = `App.name::restoreData`;
    const { activities, completedActivities, trainings, trainables, shortcuts } = backup;

    console.log(`${logPrefix}: backup contains ${activities?.length || "0"} activities`);
    if (activities) {
      this.browserStorage.storeActivities(activities);
    }

    console.log(
      `${logPrefix}: backup contains ${
        completedActivities?.length || "0"
      } completed activities`
    );
    if (completedActivities) {
      this.browserStorage.storeCompletedActivities(completedActivities);
    }

    console.log(`${logPrefix}: backup contains ${trainings?.length || "0"} trainings`);
    if (trainings) {
      this.browserStorage.storeTrainings(trainings);
    }

    console.log(`${logPrefix}: backup contains ${trainables?.length || "0"} trainables`);
    if (trainables) {
      this.browserStorage.storeTrainables(trainables);
    }

    console.log(`${logPrefix}: backup contains ${shortcuts?.length || "0"} shortcuts`);
    if (shortcuts) {
      this.browserStorage.storeShortcuts(shortcuts);
    }
  }
}

type AppStatus =
  | { kind: "app-not-initialized" }
  | { kind: "app-initializing" }
  | { kind: "app-initialized" };

type DeleteActivityResult =
  | { kind: "activity-successfully-deleted" }
  | { kind: "activity-not-found" }
  | { kind: "activity-found-but-was-not-deleted"; reason: string };

type DeleteTrainableResult =
  | { kind: "trainable-successfully-deleted" }
  | { kind: "trainable-not-found" }
  | { kind: "trainable-found-but-was-not-deleted"; reason: string };
