import { Storage } from "../../localStorage";
import { ActivityManager } from "../activities";
import { BrowserStorage } from "../browserStorage";
import { CompletedActivityManager } from "../completedActivities";
import { ShortcutManager } from "../shortcuts";
import { TrainingManager } from "../trainings";
import { App } from "./app";

/**
 * Instantiate app and set up their dependencies. Initialization logic does not
 * happen here. Instead it's sent
 */
export function setUpApp(): App {
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

  const app = new App({
    activityManager,
    completedActivityManager,
    trainingManager,
    shortcutManager,
    browserStorage,
  });

  return app;
}
