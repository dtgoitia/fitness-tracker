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
import { Hash, Training, TrainingId, TrainingName } from "./model";
import { SortAction } from "./sort";
import { Err, Ok, Result } from "./success";
import { Observable, Subject } from "rxjs";

export const TRAINING_PREFIX = "tra";
export const DRAFT_TRAINING: Training = {
  id: `${TRAINING_PREFIX}_DRAFT`,
  name: "",
  activities: [],
  lastModified: now(),
};

interface ConstructorArgs {
  activityManager: ActivityManager;
}

interface InitializeArgs {
  trainings: Training[];
}

type AddTrainingArgs = Omit<Training, "id" | "lastModified">;

interface UpdateTrainingArgs {
  training: Training;
}

interface DeleteteTrainingArgs {
  id: TrainingId;
}

export class TrainingManager {
  public changes$: Observable<TrainingChange>;

  private changesSubject: Subject<TrainingChange>;
  private trainings: Map<TrainingId, Training>;
  private activityManager: ActivityManager;

  constructor({ activityManager }: ConstructorArgs) {
    this.changesSubject = new Subject<TrainingChange>();
    this.changes$ = this.changesSubject.asObservable();

    this.activityManager = activityManager;

    this.trainings = new Map<TrainingId, Training>();

    this.activityManager.changes$.subscribe((change) => {
      this.handleActivityChange(change);
    });
  }

  public initialize({ trainings: completedActivities }: InitializeArgs): void {
    for (const training of completedActivities) {
      this.trainings.set(training.id, training);
    }
  }

  public add({ name, activities }: AddTrainingArgs): void {
    // TODO: do this for every activity in training
    for (const activity of activities) {
      const { activityId } = activity;
      if (this.activityManager.get(activityId) === undefined) {
        console.error(
          `TrainingManager.add::No activity found with ID ${activityId}, no` +
            ` Training will be created`
        );
        return; // TODO: return a Result.Err
      }
    }

    const id = this.generateTrainingId();
    const training: Training = {
      id,
      name,
      activities,
      lastModified: now(),
    };
    this.trainings.set(id, training);
    this.changesSubject.next(new TrainingAdded(id));
  }

  public update({ training }: UpdateTrainingArgs): Result {
    // console.debug(
    //   `TrainingManager.update::training:`,
    //   training
    // );
    const { id } = training;
    if (this.trainings.has(id) === false) {
      return Err(
        `TrainingManager.update::No activity found with ID ${id}, nothing` +
          ` will be updated`
      );
    }

    this.trainings.set(id, training);

    this.changesSubject.next(new TrainingUpdated(id));
    return Ok(undefined);
  }

  public delete({ id }: DeleteteTrainingArgs): void {
    if (this.trainings.has(id) === false) {
      // console.debug(
      //   `TrainingManager.delete::No activity found with ID ${id},` +
      //     ` nothing will be deleted`
      // );
      return;
    }

    this.trainings.delete(id);
    this.changesSubject.next(new TrainingDeleted(id));
  }

  public get(id: TrainingId): Training | undefined {
    return this.trainings.get(id);
  }

  public getAll(): Training[] {
    return [...this.trainings.values()].sort(sortTrainingsByName);
  }

  private generateTrainingId(): Hash {
    let id: Hash = generateId({ prefix: TRAINING_PREFIX });
    // Make sure that no IDs are duplicated - rare, but very painful
    while (this.trainings.has(id)) {
      id = generateId({ prefix: TRAINING_PREFIX });
    }

    return id;
  }

  private handleActivityChange(change: ActivityChange): void {
    // console.debug(`TrainingManager.handleActivityChange:`, change);
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

function sortTrainingsByName(a: Training, b: Training): SortAction {
  // Sort from newest to oldest
  const name_a = a.name;
  const name_b = b.name;
  switch (true) {
    case name_a === name_b:
      return SortAction.PRESERVE_ORDER;
    case name_a > name_b:
      return SortAction.FIRST_A_THEN_B;
    case name_a < name_b:
      return SortAction.FIRST_B_THEN_A;
    default:
      throw unreachable();
  }
}

export class TrainingAdded {
  constructor(public readonly id: TrainingId) {}
}

export class TrainingUpdated {
  constructor(public readonly id: TrainingId) {}
}

export class TrainingDeleted {
  constructor(public readonly id: TrainingId) {}
}

export type TrainingChange = TrainingAdded | TrainingUpdated | TrainingDeleted;

export function setTrainingName(training: Training, name: TrainingName): Training {
  return { ...training, name, lastModified: now() };
}