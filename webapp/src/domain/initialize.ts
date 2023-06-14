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
  // Inject dependencies
  const storage = new Storage();
  const activityManager = new ActivityManager();
  const completedActivityManager = new CompletedActivityManager({ activityManager });
  const trainingManager = new TrainingManager({ activityManager });
  const shortcutsManager = new ShortcutManager({ activityManager });
  const browserStorage = new BrowserStorage({
    activityManager,
    completedActivityManager,
    trainingManager,
    storage,
  });

  // Load persisted data
  console.log(`initialize.ts::initialize::Starting initialization...`);

  const activities = browserStorage.getActivities();
  console.log(`initialize.ts::initialize::${activities.length} activities found`);

  const completedActivities = browserStorage.getCompletedActivities();
  console.log(
    `initialize.ts::initialize::${completedActivities.length} completed activities found`
  );

  const trainings = browserStorage.getTrainings();

  console.log(`initialize.ts::initialize::Initializating ${ActivityManager.name} ...`);
  activityManager.initialize({ activities });
  console.log(
    `initialize.ts::initialize::Initializating ${CompletedActivityManager.name} ...`
  );
  completedActivityManager.initialize({ completedActivities });
  console.log(`initialize.ts::initialize::Initializating ${TrainingManager.name} ...`);
  trainingManager.initialize({ trainings });

  shortcutsManager.init({ shortcuts: [] });

  console.log(`initialize.ts::initialize::Initialization completed`);

  return {
    activityManager,
    completedActivityManager,
    trainingManager,
    shortcutManager: shortcutsManager,
  };
}
