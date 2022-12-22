import { Storage } from "../localStorage";
import { ActivityManager } from "./activities";
import { BrowserStorage } from "./browserStorage";
import { CompletedActivityManager } from "./completedActivities";

interface App {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
}

export function initialize(): App {
  // Inject dependencies
  const storage = new Storage();
  const activityManager = new ActivityManager();
  const completedActivityManager = new CompletedActivityManager({ activityManager });
  const browserStorage = new BrowserStorage({
    activityManager,
    completedActivityManager,
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
  console.log(`initialize.ts::initialize::Initialization completed`);
  activityManager.initialize({ activities });
  completedActivityManager.initialize({ completedActivities });
  console.log(`initialize.ts::initialize::Initialization completed`);

  return { activityManager, completedActivityManager };
}
