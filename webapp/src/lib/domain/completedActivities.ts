import {
  MILLISECONDS_PER_DAY,
  Milliseconds,
  datesAreEqual,
  formatTimedelta,
  nDaysAfter,
  nDaysBefore,
  now,
  toIsoDateString,
  weekStart,
} from "../datetimeUtils";
import { unreachable } from "../devex";
import { generateId } from "../hash";
import { SortAction } from "../sort";
import { ActivityManager } from "./activities";
import {
  ActivityId,
  CompletedActivity,
  CompletedActivityId,
  CompletedActivityNotes,
  Duration,
  Hash,
  ISODateString,
  Intensity,
} from "./model";
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
  notes: CompletedActivityNotes;
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
  }

  public initialize({ completedActivities }: InitializeArgs): void {
    for (const completedActivity of completedActivities) {
      this.completedActivities.set(completedActivity.id, completedActivity);
    }

    this.changesSubject.next({ kind: "completed-activity-manager-initialized" });
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
    const { id } = completedActivity;
    if (this.completedActivities.has(id) === false) {
      return;
    }

    this.completedActivities.set(id, completedActivity);

    this.changesSubject.next(new CompletedActivityUpdated(id));
  }

  public delete({ id }: DeleteCompletedActivityArgs): void {
    if (this.completedActivities.has(id) === false) {
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

  public getAll({
    order,
  }: {
    order: "chronological" | "reverse-chronological";
  }): CompletedActivity[] {
    const history = [...this.completedActivities.values()].sort(
      sortCompletedActivitiesByDate
    );
    switch (order) {
      case "chronological":
        return history;
      case "reverse-chronological":
        return history.reverse();
      default:
        throw unreachable(`unsupported order: ${order}`);
    }
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

  /**
   * Returns the most recent `CompletedActivityNotes` for a given `Activity`.
   */
  public getLastActivityNotes({
    activityId,
  }: {
    activityId: ActivityId;
  }): CompletedActivityNotes {
    let latestDate: Date = new Date(2000, 0, 0);
    let latestNote: CompletedActivityNotes = "";

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

  /**
   * Returns the most recent `n` different `CompletedActivityNotes` for a given
   * `Activity`.
   */
  public getLastActivitiesNotes({
    activityId,
    n,
  }: {
    activityId: ActivityId;
    n: number;
  }): CompletedActivityNotes[] {
    const tracker = new Set<CompletedActivityNotes>();
    const result: CompletedActivityNotes[] = [];

    const sorted = this.getAll({ order: "reverse-chronological" });
    for (const completedActivity of sorted) {
      if (completedActivity.activityId !== activityId) {
        continue;
      }

      const { notes } = completedActivity;
      if (tracker.has(notes)) {
        continue;
      }

      tracker.add(notes);
      result.push(notes);

      if (result.length === n) {
        break;
      }
    }

    return result;
  }

  private generateCompletedActivityId(): Hash {
    let id: Hash = generateId({ prefix: COMPLETED_ACTIVITY_PREFIX });
    // Make sure that no IDs are duplicated - rare, but very painful
    while (this.completedActivities.has(id)) {
      id = generateId({ prefix: COMPLETED_ACTIVITY_PREFIX });
    }

    return id;
  }
}

/**
 * Sort `CompletedActivity`s chronologically using their `.date` property.
 */
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
      return SortAction.FIRST_B_THEN_A;
    case date_a < date_b:
      return SortAction.FIRST_A_THEN_B;
    default:
      throw unreachable();
  }
}

type DatedActivities = [ISODateString, CompletedActivity[]];

export function groupByDay(history: CompletedActivity[]): DatedActivities[] {
  let dayCursor = toIsoDateString(history[0].date);

  let groupedActivities: CompletedActivity[] = [];
  const result: DatedActivities[] = [];

  history.forEach((activity) => {
    const day = toIsoDateString(activity.date);
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

type WeekStartDate = ISODateString;
export type ItemsPerWeek<T> = [WeekStartDate, T[]];

type HasDate = { date: Date };

/**
 * Group items weekly using their `.date` property as a reference. `items` must
 * be chronologically sorted.
 */
export function groupChronologicalItemsByWeek<T extends HasDate>({
  items,
  fillGaps,
}: {
  items: T[];
  fillGaps: boolean;
}): ItemsPerWeek<T>[] {
  type WeekStart = ISODateString;

  if (items.length === 0) {
    return [];
  }

  const earliestDay = items[0].date;
  let weekCursor: WeekStart = toIsoDateString(weekStart(earliestDay));

  // Group items by week
  let weekItems: T[] = [];
  const result: ItemsPerWeek<T>[] = [];

  const MILLISECONDS_PER_WEEK = MILLISECONDS_PER_DAY * 7;
  let previousItemDate: Date | undefined = undefined;
  let previousWeekStart: Date | undefined = undefined;
  for (const item of items) {
    // validation: items must be in chronological order
    if (previousItemDate) {
      if (item.date.getTime() < previousItemDate.getTime()) {
        throw Error(
          `items are not sorted chronologically, current item.date =` +
            ` ${item.date.toISOString()} and previous item.date = ` +
            ` ${previousItemDate.toISOString()}`
        );
      }
    }

    const week = weekStart(item.date);

    const weekIsoDate = toIsoDateString(week);
    const stillSameWeek = weekIsoDate === weekCursor;
    if (stillSameWeek) {
      weekItems.push(item);
    } else {
      result.push([weekCursor, [...weekItems]]);

      // detect gaps in week series and fill them up if needed
      if (fillGaps && previousWeekStart) {
        const delta: Milliseconds =
          weekStart(item.date).getTime() - previousWeekStart.getTime();

        if (MILLISECONDS_PER_WEEK < delta) {
          // an empty week must be added to the result
          let next = previousWeekStart;
          while (true) {
            next = nDaysAfter({ date: next, days: 7 });
            if (datesAreEqual(next, week)) {
              break;
            }
            result.push([toIsoDateString(next), []]);
          }
        }
      }

      weekCursor = weekIsoDate;
      weekItems = [item];
    }

    previousItemDate = item.date;
    previousWeekStart = week;
  }

  if (weekItems.length > 0) {
    result.push([weekCursor, [...weekItems]]);
  }

  return result;
}

/**
 * Group items weekly using their `.date` property as a reference. `items` must
 * be in reverse chronological order.
 */
export function groupRetrochronologicalItemsByWeek<T extends HasDate>({
  items,
  fillGaps,
}: {
  items: T[];
  fillGaps: boolean;
}): ItemsPerWeek<T>[] {
  type WeekStart = ISODateString;

  if (items.length === 0) {
    return [];
  }

  const earliestDay = items[0].date;
  let weekCursor: WeekStart = toIsoDateString(weekStart(earliestDay));

  // Group items by week
  let weekItems: T[] = [];
  const result: ItemsPerWeek<T>[] = [];

  const MILLISECONDS_PER_WEEK = MILLISECONDS_PER_DAY * 7;
  let previousItemDate: Date | undefined = undefined;
  let previousWeekStart: Date | undefined = undefined;
  for (const item of items) {
    // validation: items must be in chronological order
    if (previousItemDate) {
      if (previousItemDate.getTime() < item.date.getTime()) {
        throw Error(
          `items are not sorted chronologically, current item.date =` +
            ` ${item.date.toISOString()} and previous item.date = ` +
            ` ${previousItemDate.toISOString()}`
        );
      }
    }

    const week = weekStart(item.date);

    const weekIsoDate = toIsoDateString(week);
    const stillSameWeek = weekIsoDate === weekCursor;
    if (stillSameWeek) {
      weekItems.push(item);
    } else {
      result.push([weekCursor, [...weekItems]]);

      // detect gaps in week series and fill them up if needed
      if (fillGaps && previousWeekStart) {
        const delta: Milliseconds =
          previousWeekStart.getTime() - weekStart(item.date).getTime();

        if (MILLISECONDS_PER_WEEK < delta) {
          // an empty week must be added to the result
          let next = previousWeekStart;
          while (true) {
            next = nDaysBefore({ date: next, days: 7 });
            if (datesAreEqual(next, week)) {
              break;
            }
            result.push([toIsoDateString(next), []]);
          }
        }
      }

      weekCursor = weekIsoDate;
      weekItems = [item];
    }

    previousItemDate = item.date;
    previousWeekStart = week;
  }

  if (weekItems.length > 0) {
    result.push([weekCursor, [...weekItems]]);
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
  | { kind: "completed-activity-manager-initialized" }
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
  notes: CompletedActivityNotes
): CompletedActivity {
  return { ...completedActivity, notes, lastModified: now() };
}

export function setCompletedActivityEllapsedInNotes(
  completedActivity: CompletedActivity
): CompletedActivity {
  const deltaInMs = now().getTime() - completedActivity.date.getTime();
  const formattedTimedelta = formatTimedelta(deltaInMs / 1000)
    .replace(`m`, `'`)
    .replace(`s`, `"`);

  const notes =
    completedActivity.notes === ""
      ? formattedTimedelta
      : `${formattedTimedelta}\n${completedActivity.notes}`;

  return { ...completedActivity, notes, lastModified: now() };
}

/**
 * Drop all completed activities but the latest occurrence of each completed activity,
 * and return them sorted reverse chronological order
 */
export function getLastOccurrences(history: CompletedActivity[]): CompletedActivity[] {
  const seen = new Set<ActivityId>();

  const lastOcurrences: CompletedActivity[] = [];

  // Assumption: history is sorted from newest to oldest
  for (const completed of history) {
    const { activityId } = completed;
    if (seen.has(activityId)) continue;

    lastOcurrences.push(completed);
    seen.add(activityId);
  }

  return lastOcurrences;
}

interface CompletedActivityDiffArgs {
  readonly updatedActivityId?: ActivityId;
  readonly updatedIntensity?: Intensity;
  readonly updatedDuration?: Duration;
  readonly updatedDate?: Date;
  readonly updatedNotes?: CompletedActivityNotes;
}

class CompletedActivityDiff {
  public readonly hasChanges: boolean;

  public readonly updatedActivityId?: ActivityId;
  public readonly updatedIntensity?: Intensity;
  public readonly updatedDuration?: Duration;
  public readonly updatedDate?: Date;
  public readonly updatedNotes?: CompletedActivityNotes;

  constructor({
    updatedActivityId,
    updatedIntensity,
    updatedDuration,
    updatedDate,
    updatedNotes,
  }: CompletedActivityDiffArgs) {
    this.updatedActivityId = updatedActivityId;
    this.updatedIntensity = updatedIntensity;
    this.updatedDuration = updatedDuration;
    this.updatedDate = updatedDate;
    this.updatedNotes = updatedNotes;

    this.hasChanges =
      this.updatedActivityId !== undefined ||
      this.updatedIntensity !== undefined ||
      this.updatedDuration !== undefined ||
      this.updatedDate !== undefined ||
      this.updatedNotes !== undefined;
  }
}

/**
 * Returns the CompletedActivity properties that got updated
 */
export function diffCompletedActivity({
  before,
  after,
}: {
  before: CompletedActivity;
  after: CompletedActivity;
}): CompletedActivityDiff {
  if (before.id !== after.id) {
    throw unreachable(
      `activities must have the same ID to be compared, but provided activities have: ${before.id} & ${after.id}`
    );
  }

  let updatedActivityId: ActivityId | undefined;
  let updatedIntensity: Intensity | undefined;
  let updatedDuration: Duration | undefined;
  let updatedDate: Date | undefined;
  let updatedNotes: CompletedActivityNotes | undefined;

  if (before.activityId !== after.activityId) {
    updatedActivityId = after.activityId;
  }

  if (before.intensity !== after.intensity) {
    updatedIntensity = after.intensity;
  }

  if (before.duration !== after.duration) {
    updatedDuration = after.duration;
  }

  if (!datesAreEqual(before.date, after.date)) {
    updatedDate = after.date;
  }

  if (before.notes !== after.notes) {
    updatedNotes = after.notes;
  }

  return new CompletedActivityDiff({
    updatedActivityId,
    updatedIntensity,
    updatedDuration,
    updatedDate,
    updatedNotes,
  });
}
