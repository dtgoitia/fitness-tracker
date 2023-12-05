import { Storage } from "../localStorage";
import { ActivityManager } from "./activities";
import { BrowserStorage } from "./browserStorage";
import { CompletedActivityManager } from "./completedActivities";
import { ShortcutManager } from "./shortcuts";
import { TrainingManager } from "./trainings";

interface App {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
  trainingManager: TrainingManager;
  shortcutManager: ShortcutManager;
}

export function initialize(): App {
  const logPrefix = `initialize.ts::${initialize.name}`;

  // ===================================================================================
  //
  //   Inject dependencies
  //
  // ===================================================================================

  console.log(`${logPrefix}::Starting initialization...`);

  const storage = new Storage();
  const activityManager = new ActivityManager();
  const completedActivityManager = new CompletedActivityManager({ activityManager });
  const trainingManager = new TrainingManager({ activityManager });
  const shortcutManager = new ShortcutManager({ activityManager });
  const browserStorage = new BrowserStorage({
    activityManager,
    completedActivityManager,
    trainingManager,
    shortcutManager,
    storage,
  });

  // ===================================================================================
  //
  //   Load persisted data
  //
  // ===================================================================================
  console.log(`${logPrefix}::Loading data...`);

  const activities = browserStorage.getActivities();
  console.log(`${logPrefix}::${activities.length} activities found`);

  const completedActivities = browserStorage.getCompletedActivities();
  console.log(`${logPrefix}::${completedActivities.length} completed activities found`);

  const trainings = browserStorage.getTrainings();
  console.log(`${logPrefix}::${trainings.length} trainings found`);

  const shortcuts = browserStorage.getShortcuts();
  console.log(`${logPrefix}::${shortcuts.length} shortcuts found`);

  // ===================================================================================
  //
  //   Initialize domain
  //
  // ===================================================================================

  console.log(`${logPrefix}::Initializating ${ActivityManager.name} ...`);
  activityManager.initialize({ activities });

  console.log(`${logPrefix}::Initializating ${CompletedActivityManager.name} ...`);
  completedActivityManager.initialize({ completedActivities });

  console.log(`${logPrefix}::Initializating ${TrainingManager.name} ...`);
  trainingManager.initialize({ trainings });

  console.log(`${logPrefix}::Initializating ${ShortcutManager.name} ...`);
  shortcutManager.init({ shortcuts });

  console.log(`${logPrefix}::Initialization completed`);

  return {
    activityManager,
    completedActivityManager,
    trainingManager,
    shortcutManager: shortcutManager,
  };
}
