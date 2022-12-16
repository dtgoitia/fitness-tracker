import {
  ActivityAdded,
  ActivityChange,
  ActivityDeleted,
  ActivityManager,
  ActivityMigrated,
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
  Intensity,
  ISODateString,
  Notes,
} from "./model";
import { SortAction } from "./sort";
import { Observable, Subject } from "rxjs";

const COMPLETED_ACTIVITY_PREFIX = "cpa";

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

interface DeleteteCompletedActivityArgs {
  id: CompletedActivityId;
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

  /* Temporary code to run migration */
  public migrate(): void {
    function isOld(id: CompletedActivityId): boolean {
      switch (typeof id) {
        case "number":
          return true;
        case "string":
          return false;
        default:
          throw unreachable(`expected a string or a number, but got ${typeof id}: ${id}`);
      }
    }

    for (const entry of this.completedActivities.entries()) {
      const [completedActivityId, completedActivity] = entry;

      const needsMigration = isOld(completedActivityId);
      if (needsMigration === false) {
        continue;
      }

      let migratedId: Hash = this.generateCompletedActivityId();
      const migratedCompletedActivity = { ...completedActivity, id: migratedId };

      this.completedActivities.delete(completedActivityId);
      this.completedActivities.set(migratedId, migratedCompletedActivity);
      this.changesSubject.next(
        new CompletedActivityMigrated(completedActivityId, migratedId)
      );
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

  public delete({ id }: DeleteteCompletedActivityArgs): void {
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
      case change instanceof ActivityMigrated:
        this.handleActivityMigrated(change as ActivityMigrated);
        return;
      default:
        throw unreachable(`unsupported change type: ${change}`);
    }
  }

  /* Temporary event for migration */
  private handleActivityMigrated(change: ActivityMigrated): void {
    // console.debug(`CompletedActivityManager.handleActivityMigrated::change`, change);
    for (const oldCompletedActivity of this.completedActivities.values()) {
      if (oldCompletedActivity.activityId !== change.oldId) {
        continue;
      }

      const completedActivity: CompletedActivity = {
        ...oldCompletedActivity,
        activityId: change.migratedId,
      };

      this.update({ completedActivity });
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

export class CompletedActivityMigrated {
  constructor(
    public readonly oldId: CompletedActivityId,
    public readonly migratedId: CompletedActivityId
  ) {}
}

export type CompletedActivityChange =
  | CompletedActivityAdded
  | CompletedActivityUpdated
  | CompletedActivityDeleted
  | CompletedActivityMigrated;
