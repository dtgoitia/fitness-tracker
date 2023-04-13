import {
  ActivityAdded,
  ActivityChange,
  ActivityDeleted,
  ActivityManager,
  ActivityUpdated,
} from "./activities";
import { now } from "./datetimeUtils";
import { unreachable } from "./devex";
import { generateId } from "./hash";
import {
  ActivityId,
  CompletedActivity,
  CompletedActivityId,
  Duration,
  Hash,
  ISODateString,
  Intensity,
  Notes,
} from "./model";
import { SortAction } from "./sort";
import { Observable, Subject } from "rxjs";

export const COMPLETED_ACTIVITY_PREFIX = "cpa";

interface ConstructorArgs {
  activityManager: ActivityManager;
}

interface InitializeArgs {
  completedActivities: CompletedActivity[];
}

interface AddCompletedActivityArgs {
  activityId: ActivityId;
  intensity: Intensity;
  duration: Duration;
  date: Date;
  notes: Notes;
}

interface UpdateCompletedActivityArgs {
  completedActivity: CompletedActivity;
}

interface DeleteCompletedActivityArgs {
  id: CompletedActivityId;
}

interface DeleteUntilDateArgs {
  date: Date;
}

export class CompletedActivityManager {
  public changes$: Observable<CompletedActivityChange>;

  private changesSubject: Subject<CompletedActivityChange>;
  private completedActivities: Map<CompletedActivityId, CompletedActivity>;
  private activityManager: ActivityManager;

  constructor({ activityManager }: ConstructorArgs) {
    this.changesSubject = new Subject<CompletedActivityChange>();
    this.changes$ = this.changesSubject.asObservable();

    this.activityManager = activityManager;

    this.completedActivities = new Map<CompletedActivityId, CompletedActivity>();

    this.activityManager.changes$.subscribe((change) => {
      this.handleActivityChange(change);
    });
  }

  public initialize({ completedActivities }: InitializeArgs): void {
    for (const completedActivity of completedActivities) {
      this.completedActivities.set(completedActivity.id, completedActivity);
    }
  }

  public add({
    activityId,
    intensity,
    duration,
    date,
    notes,
  }: AddCompletedActivityArgs): void {
    if (this.activityManager.get(activityId) === undefined) {
      console.error(
        `CompletedActivityManager.add::No activity found with ID ${activityId}, no` +
          ` CompletedActivity will be created`
      );
      return; // TODO: return a Result.Err
    }

    const id = this.generateCompletedActivityId();
    const completedActivity: CompletedActivity = {
      id,
      activityId,
      intensity,
      duration,
      date,
      notes,
      lastModified: now(),
    };
    this.completedActivities.set(id, completedActivity);
    this.changesSubject.next(new CompletedActivityAdded(id));
  }

  public update({ completedActivity }: UpdateCompletedActivityArgs): void {
    // console.debug(
    //   `CompletedActivityManager.update::completedActivity:`,
    //   completedActivity
    // );
    const { id } = completedActivity;
    if (this.completedActivities.has(id) === false) {
      // console.debug(
      //   `CompletedActivityManager.update::No activity found with ID ${id}, nothing` +
      //     ` will be updated`
      // );
      return;
    }

    this.completedActivities.set(id, completedActivity);

    this.changesSubject.next(new CompletedActivityUpdated(id));
  }

  public delete({ id }: DeleteCompletedActivityArgs): void {
    if (this.completedActivities.has(id) === false) {
      // console.debug(
      //   `CompletedActivityManager.delete::No activity found with ID ${id},` +
      //     ` nothing will be deleted`
      // );
      return;
    }

    this.completedActivities.delete(id);
    this.changesSubject.next(new CompletedActivityDeleted(id));
  }

  /**
   * Delete every completed activity on or before the specified date.
   * Calculation are done using locale date.
   */
  public deleteUntil({ date }: DeleteUntilDateArgs): void {
    // Find the latest millisecond withing the provided date, to discard anything on or
    // before that instant
    const edgeDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    );

    const toDelete: CompletedActivityId[] = [];
    for (const activity of this.completedActivities.values()) {
      if (activity.date <= edgeDate) toDelete.push(activity.id);
    }

    console.debug(
      `CompletedActivityManager.deleteUntil::${toDelete.length} completed activities` +
        ` will be deleted out of ${this.completedActivities.size}`
    );

    for (const activityId of toDelete) {
      this.completedActivities.delete(activityId);
    }

    this.changesSubject.next(new CompletedActivitiesDeleted(new Set(toDelete)));
  }

  public purge(): Date {
    type DateAsInt = number;
    const m = new Map<ActivityId, DateAsInt>();

    for (const completed of this.completedActivities.values()) {
      const { activityId, date } = completed;
      const t = date.getTime();
      m.set(
        activityId,
        // find latest date where the activity was completed
        Math.max(m.get(activityId) || t, t)
      );
    }

    // Find the earliest date among all activities
    const earliest = new Date(Math.min(...m.values()));

    const beforeEarliest = new Date(earliest.getTime());
    beforeEarliest.setDate(earliest.getDate() - 1);

    this.deleteUntil({ date: beforeEarliest });

    return earliest;
  }

  public get(id: CompletedActivityId): CompletedActivity | undefined {
    return this.completedActivities.get(id);
  }

  public getAll(): CompletedActivity[] {
    return [...this.completedActivities.values()].sort(sortCompletedActivitiesByDate);
  }

  public isActivityUsedInHistory({ activityId }: { activityId: ActivityId }): boolean {
    for (const completedActivity of this.completedActivities.values()) {
      if (completedActivity.activityId === activityId) {
        return true;
      }
    }
    return false;
  }

  public duplicate({ ids }: { ids: Set<CompletedActivityId> }): void {
    for (const id of ids.values()) {
      const original = this.completedActivities.get(id);
      if (original === undefined) {
        continue;
      }

      this.add({ ...original, date: now() });
    }
  }

  public getLastActivityNotes({ activityId }: { activityId: ActivityId }): Notes {
    let latestDate: Date = new Date(2000, 0, 0);
    let latestNote: Notes = "";

    for (const completedActivity of this.completedActivities.values()) {
      if (
        completedActivity.activityId === activityId &&
        completedActivity.date > latestDate
      ) {
        const { date, notes } = completedActivity;
        latestDate = date;
        latestNote = notes;
      }
    }

    return latestNote;
  }

  private generateCompletedActivityId(): Hash {
    let id: Hash = generateId({ prefix: COMPLETED_ACTIVITY_PREFIX });
    // Make sure that no IDs are duplicated - rare, but very painful
    while (this.completedActivities.has(id)) {
      id = generateId({ prefix: COMPLETED_ACTIVITY_PREFIX });
    }

    return id;
  }

  private handleActivityChange(change: ActivityChange): void {
    // console.debug(`CompletedActivityManager.handleActivityChange:`, change);
    switch (true) {
      case change instanceof ActivityAdded:
        return;
      case change instanceof ActivityUpdated:
        return;
      case change instanceof ActivityDeleted:
        return;
      default:
        throw unreachable(`unsupported change type: ${change}`);
    }
  }
}

function sortCompletedActivitiesByDate(
  a: CompletedActivity,
  b: CompletedActivity
): SortAction {
  // Sort from newest to oldest
  const date_a = a.date.getTime();
  const date_b = b.date.getTime();
  switch (true) {
    case date_a === date_b:
      return SortAction.PRESERVE_ORDER;
    case date_a > date_b:
      return SortAction.FIRST_A_THEN_B;
    case date_a < date_b:
      return SortAction.FIRST_B_THEN_A;
    default:
      throw unreachable();
  }
}

function getDay(date: Date): ISODateString {
  return date.toISOString().slice(0, 10);
}

type DatedActivities = [ISODateString, CompletedActivity[]];

export function groupByDay(history: CompletedActivity[]): DatedActivities[] {
  let dayCursor: ISODateString = getDay(history[0].date);

  let groupedActivities: CompletedActivity[] = [];
  const result: DatedActivities[] = [];

  history.forEach((activity, i) => {
    const day = getDay(activity.date);
    if (day === dayCursor) {
      groupedActivities.push(activity);
    } else {
      result.push([dayCursor, [...groupedActivities]]);
      groupedActivities = [activity];
      dayCursor = day;
    }
  });

  if (groupedActivities.length > 0) {
    result.push([dayCursor, [...groupedActivities]]);
  }

  return result;
}

export class CompletedActivityAdded {
  constructor(public readonly id: CompletedActivityId) {}
}

export class CompletedActivityUpdated {
  constructor(public readonly id: CompletedActivityId) {}
}

export class CompletedActivityDeleted {
  constructor(public readonly id: CompletedActivityId) {}
}

export class CompletedActivitiesDeleted {
  constructor(public readonly ids: Set<CompletedActivityId>) {}
}

export type CompletedActivityChange =
  | CompletedActivityAdded
  | CompletedActivityUpdated
  | CompletedActivityDeleted
  | CompletedActivitiesDeleted;

export function setCompletedActivityDate(
  completedActivity: CompletedActivity,
  date: Date
): CompletedActivity {
  return { ...completedActivity, date, lastModified: now() };
}

export function setCompletedActivityIntensity(
  completedActivity: CompletedActivity,
  intensity: Intensity
): CompletedActivity {
  return { ...completedActivity, intensity, lastModified: now() };
}

export function setCompletedActivityDuration(
  completedActivity: CompletedActivity,
  duration: Duration
): CompletedActivity {
  return { ...completedActivity, duration, lastModified: now() };
}

export function setCompletedActivityNotes(
  completedActivity: CompletedActivity,
  notes: Notes
): CompletedActivity {
  return { ...completedActivity, notes, lastModified: now() };
}
