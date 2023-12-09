import { Storage } from "../../localStorage";
import { ActivityManager } from "../domain/activities";
import { CompletedActivityManager } from "../domain/completedActivities";
import { ShortcutManager } from "../domain/shortcuts";
import { TrainingManager } from "../domain/trainings";
import { App } from "./app";
import { BrowserStorage } from "./browserStorage";

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
