import { Storage } from "../localStorage";
import { ActivityManager } from "./activities";
import { BrowserStorage } from "./browserStorage";
import { CompletedActivityManager } from "./completedActivities";
import { TrainingManager } from "./trainings";

interface App {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
  trainingManager: TrainingManager;
}

export function initialize(): App {
  // Inject dependencies
  const storage = new Storage();
  const activityManager = new ActivityManager();
  const completedActivityManager = new CompletedActivityManager({ activityManager });
  const trainingManager = new TrainingManager({ activityManager });
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
  console.log(`initialize.ts::initialize::${trainings.length} trainings found`);

  console.log(`initialize.ts::initialize::Initialization completed`);
  activityManager.initialize({ activities });
  completedActivityManager.initialize({ completedActivities });
  trainingManager.initialize({ trainings });
  console.log(`initialize.ts::initialize::Initialization completed`);

  return { activityManager, completedActivityManager, trainingManager };
}
