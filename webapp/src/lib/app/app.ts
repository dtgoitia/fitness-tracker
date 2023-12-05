import { ActivityManager } from "../activities";
import { BrowserStorage } from "../browserStorage";
import { CompletedActivityManager } from "../completedActivities";
import { ShortcutManager } from "../shortcuts";
import { TrainingManager } from "../trainings";
import { Observable, Subject } from "rxjs";

interface Args {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
  trainingManager: TrainingManager;
  shortcutManager: ShortcutManager;
  browserStorage: BrowserStorage;
}

export class App {
  public status$: Observable<AppStatus>;
  public activityManager: ActivityManager;
  public completedActivityManager: CompletedActivityManager;
  public trainingManager: TrainingManager;
  public shortcutManager: ShortcutManager;
  public browserStorage: BrowserStorage;

  private statusSubject: Subject<AppStatus>;

  constructor({
    activityManager,
    completedActivityManager,
    trainingManager,
    shortcutManager,
    browserStorage,
  }: Args) {
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

    // ===================================================================================
    //
    //   Initialize domain
    //
    // ===================================================================================

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
}

type AppStatus = { kind: "app-initialized" };
