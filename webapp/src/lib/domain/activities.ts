import { Autocompleter, Word } from "../autocomplete";
import { now } from "../datetimeUtils";
import { unreachable } from "../devex";
import { generateId } from "../hash";
import { addToSet, assessSetOverlap, deleteFromSet } from "../setOperations";
import { SortAction } from "../sort";
import { Err, Ok, Result } from "../success";
import {
  Activity,
  ActivityId,
  ActivityName,
  Duration,
  Hash,
  Intensity,
  TrainableId,
} from "./model";
import { Observable, Subject } from "rxjs";

export const ACTIVITY_PREFIX = "act";

interface InitializeArgs {
  activities: Activity[];
}

interface AddActivityArgs {
  name: ActivityName;
  otherNames: ActivityName[];
}

interface UpdateActivityArgs {
  activity: Activity;
}

interface DeleteteActivityArgs {
  id: ActivityId;
}

export class ActivityManager {
  public changes$: Observable<ActivityChange>;

  private changesSubject: Subject<ActivityChange>;
  private activities: Map<ActivityId, Activity>;
  private activitiesByTrainable: Map<TrainableId, Set<ActivityId>>;
  private autocompleter: Autocompleter<Activity>;

  constructor() {
    this.autocompleter = new Autocompleter<Activity>({
      itemToWordMapper: activityToWords,
    });

    this.changesSubject = new Subject<ActivityChange>();
    this.changes$ = this.changesSubject.asObservable();

    this.activities = new Map<ActivityId, Activity>();
    this.activitiesByTrainable = new Map<TrainableId, Set<ActivityId>>();
  }

  public initialize({ activities }: InitializeArgs): void {
    const map = new Map<TrainableId, Set<ActivityId>>();

    for (let activity of activities) {
      // temporary migration operation to accommodate missing
      if (activity.trainableIds === undefined) {
        activity = { ...activity, trainableIds: [] };
      }

      this.activities.set(activity.id, activity);

      for (const trainableId of activity.trainableIds) {
        const trainableIds = map.get(trainableId);
        if (trainableIds === undefined) {
          map.set(trainableId, new Set<ActivityId>([activity.id]));
        } else {
          trainableIds.add(activity.id); // CAVEAT relies on mutation
          map.set(trainableId, trainableIds);
        }
      }
    }

    this.activitiesByTrainable = map;

    this.autocompleter.initialize({ items: activities });

    this.changesSubject.next({ kind: "activity-manager-initialized" });
  }

  public add({ name, otherNames }: AddActivityArgs): void {
    const id = this.generateActivityId();
    const activity: Activity = {
      id,
      name,
      otherNames,
      lastModified: now(),
      trainableIds: [],
    };
    this.activities.set(id, activity);
    this.autocompleter.addItem(activity);
    this.changesSubject.next({ kind: "activity-added", id });
  }

  public update({ activity: updated }: UpdateActivityArgs): Result {
    const { id } = updated;
    const previous = this.activities.get(id);
    if (previous === undefined) {
      return Err(
        `ActivityManager.update::No activity found with ID ${id}, nothing will be updated`
      );
    }

    this.activities.set(id, updated);

    // Update in-memory Activity<>Interval indexes
    const { inAButNotInB: removed, inBButNotInA: added } = assessSetOverlap({
      a: new Set(previous.trainableIds),
      b: new Set(updated.trainableIds),
    });
    for (const trainableId of added) {
      this.addActivityToTrainableIndex({ trainableId, activityId: id });
    }
    for (const trainableId of removed) {
      this.removeActivityFromTrainableIndex({ trainableId, activityId: id });
    }

    this.autocompleter.removeItem(previous);
    this.autocompleter.addItem(updated);

    this.changesSubject.next({ kind: "activity-updated", id });
    return Ok(undefined);
  }

  /**
   * Delete `Activity` without checking if any other entities will stay orphan,
   * e.g. a `CompletedActivity` that ends up pointing to a missing `Activity`.
   */
  public deleteUnsafe({ id }: DeleteteActivityArgs): void {
    const previous = this.activities.get(id);
    if (previous === undefined) {
      console.debug(
        `ActivityManager.delete::No activity found with ID ${id}, nothing will be deleted`
      );
      return;
    }

    this.activities.delete(id);

    for (const trainableId of previous.trainableIds) {
      this.removeActivityFromTrainableIndex({ trainableId, activityId: id });
    }

    this.autocompleter.removeItem(previous);

    this.changesSubject.next({ kind: "activity-deleted", id });
  }

  public get(id: ActivityId): Activity | undefined {
    return this.activities.get(id);
  }

  public getAll(): Activity[] {
    return [...this.activities.values()].sort(sortActivitiesAlphabetically);
  }

  /**
   * Find activities that cointain words starting with the provided query
   */
  public searchByPrefix(query: string): Activity[] {
    const prefixes = query.split(" ").filter((prefix) => !!prefix);

    if (prefixes.length === 0) return this.getAll();

    const unsortedResults = this.autocompleter.search(prefixes);

    return [...this.activities.values()]
      .filter((activity) => unsortedResults.has(activity))
      .sort(sortActivitiesAlphabetically);
  }

  public getByTrainable({ trainableId }: { trainableId: TrainableId }): Set<ActivityId> {
    const activityIds = this.activitiesByTrainable.get(trainableId);
    if (activityIds === undefined) {
      return new Set<ActivityId>();
    }
    return activityIds;
  }

  private generateActivityId() {
    let id: Hash = generateId({ prefix: ACTIVITY_PREFIX });

    // Make sure that no IDs are duplicated - rare, but very painful
    while (this.activities.has(id)) {
      id = generateId({ prefix: ACTIVITY_PREFIX });
    }

    return id;
  }

  private addActivityToTrainableIndex({
    trainableId,
    activityId,
  }: {
    trainableId: TrainableId;
    activityId: ActivityId;
  }): void {
    const previous = this.activitiesByTrainable.get(trainableId);
    if (previous === undefined) {
      return;
    }
    const updated = addToSet(previous, activityId);
    this.activitiesByTrainable.set(trainableId, updated);
  }

  private removeActivityFromTrainableIndex({
    trainableId,
    activityId,
  }: {
    trainableId: TrainableId;
    activityId: ActivityId;
  }): void {
    const previous = this.activitiesByTrainable.get(trainableId);
    if (previous === undefined) {
      return;
    }
    const updated = deleteFromSet(previous, activityId);
    this.activitiesByTrainable.set(trainableId, updated);
  }
}

function sortActivitiesAlphabetically(a: Activity, b: Activity): SortAction {
  const name_a = a.name.toLowerCase();
  const name_b = b.name.toLowerCase();
  switch (true) {
    case name_a === name_b:
      return SortAction.PRESERVE_ORDER;
    case name_a < name_b:
      return SortAction.FIRST_A_THEN_B;
    case name_a > name_b:
      return SortAction.FIRST_B_THEN_A;
    default:
      throw unreachable();
  }
}

export type ActivityChange =
  | { kind: "activity-manager-initialized" }
  | { kind: "activity-added"; id: ActivityId }
  | { kind: "activity-updated"; id: ActivityId }
  | { kind: "activity-deleted"; id: ActivityId };

export function setActivityName(activity: Activity, name: ActivityName): Activity {
  return { ...activity, name, lastModified: now() };
}

export function setActivityOtherNames(
  activity: Activity,
  otherNames: ActivityName[]
): Activity {
  return { ...activity, otherNames, lastModified: now() };
}

export function setActivityTrainables(
  activity: Activity,
  trainableIds: TrainableId[]
): Activity {
  return { ...activity, trainableIds, lastModified: now() };
}

export function getIntensityLevelShorthand(intensity: Intensity): string {
  switch (intensity) {
    case Intensity.low:
      return "L";
    case Intensity.medium:
      return "M";
    case Intensity.high:
      return "H";
    default:
      throw unreachable(`unhandled Intensity variant: ${intensity}`);
  }
}

export function getDurationLevelShorthand(duration: Duration): string {
  switch (duration) {
    case Duration.short:
      return "S";
    case Duration.medium:
      return "M";
    case Duration.long:
      return "L";
    default:
      throw unreachable(`unhandled Duration variant: ${duration}`);
  }
}

export function activityToWords(activity: Activity): Set<Word> {
  const activityWords = [activity.name, ...(activity.otherNames || [])]
    .filter((name) => name)
    .map((name) => name.toLowerCase())
    .map((name) => name.split(" "))
    .flat();

  const words = new Set(activityWords);
  return words;
}
