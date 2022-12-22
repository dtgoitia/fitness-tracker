import { unreachable } from "./devex";
import { generateId } from "./hash";
import { Activity, ActivityId, ActivityName, Hash } from "./model";
import { SortAction } from "./sort";
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

  constructor() {
    this.changesSubject = new Subject<ActivityChange>();
    this.changes$ = this.changesSubject.asObservable();

    this.activities = new Map<ActivityId, Activity>();
  }

  public initialize({ activities }: InitializeArgs): void {
    for (const activity of activities) {
      this.activities.set(activity.id, activity);
    }
  }

  public add({ name, otherNames }: AddActivityArgs): void {
    const id = this.generateActivityId();
    const activity: Activity = {
      id,
      name,
      otherNames,
    };
    this.activities.set(id, activity);
    this.changesSubject.next(new ActivityAdded(id));
  }

  public update({ activity }: UpdateActivityArgs): void {
    const { id } = activity;
    if (this.activities.has(id) === false) {
      console.debug(
        `ActivityManager.update::No activity found with ID ${id}, nothing will be updated`
      );
      return;
    }

    this.activities.set(id, activity);

    this.changesSubject.next(new ActivityUpdated(id));
  }

  public delete({ id }: DeleteteActivityArgs): void {
    if (this.activities.has(id) === false) {
      console.debug(
        `ActivityManager.delete::No activity found with ID ${id}, nothing will be deleted`
      );
      return;
    }

    this.activities.delete(id);
    this.changesSubject.next(new ActivityDeleted(id));
  }

  public get(id: ActivityId): Activity | undefined {
    return this.activities.get(id);
  }

  public getAll(): Activity[] {
    return [...this.activities.values()].sort(sortActivitiesAlphabetically);
  }

  private generateActivityId() {
    let id: Hash = generateId({ prefix: ACTIVITY_PREFIX });

    // Make sure that no IDs are duplicated - rare, but very painful
    while (this.activities.has(id)) {
      id = generateId({ prefix: ACTIVITY_PREFIX });
    }

    return id;
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

export class ActivityAdded {
  constructor(public readonly id: ActivityId) {}
}

export class ActivityUpdated {
  constructor(public readonly id: ActivityId) {}
}

export class ActivityDeleted {
  constructor(public readonly id: ActivityId) {}
}

export type ActivityChange = ActivityAdded | ActivityUpdated | ActivityDeleted;
