import { now } from "../datetimeUtils";
import { ACTIVITY_PREFIX } from "../domain/activities";
import { COMPLETED_ACTIVITY_PREFIX } from "../domain/completedActivities";
import {
  Activity,
  ActivityId,
  ActivityName,
  CompletedActivity,
  Duration,
  Intensity,
} from "../domain/model";
import { generateId } from "../hash";

export function buildActivity({
  id,
  name,
}: {
  id?: ActivityId;
  name?: ActivityName;
}): Activity {
  return {
    id: id ? id : generateId({ prefix: ACTIVITY_PREFIX }),
    name: name ? name : "test activity",
    otherNames: [],
    lastModified: now(),
    trainableIds: [],
  };
}

export function buildCompletedActivity({
  activityId,
  date,
}: {
  activityId?: ActivityId;
  date?: Date;
}): CompletedActivity {
  return {
    id: generateId({ prefix: COMPLETED_ACTIVITY_PREFIX }),
    activityId: activityId ? activityId : generateId({ prefix: ACTIVITY_PREFIX }),
    date: date !== undefined ? date : now(),
    duration: Duration.short,
    intensity: Intensity.low,
    notes: "test notes",
    lastModified: now(),
  };
}
