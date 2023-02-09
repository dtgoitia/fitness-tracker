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
  Duration,
  Hash,
  Intensity,
  Training,
  TrainingActivity,
  TrainingId,
  TrainingName,
} from "./model";
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

export const TRAINING_ACTIVITY_PREFIX = "tra_act";
export const DRAFT_TRAINING_ACTIVITY: TrainingActivity = {
  activityId: `${TRAINING_ACTIVITY_PREFIX}_DRAFT`,
  duration: Duration.medium,
  intensity: Intensity.medium,
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
    return Ok(training);
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

export function setTrainingActivityActivity(
  trainingActivity: TrainingActivity,
  activityId: ActivityId
): TrainingActivity {
  return { ...trainingActivity, activityId };
}

export function setTrainingActivityIntensity(
  trainingActivity: TrainingActivity,
  intensity: Intensity
): TrainingActivity {
  return { ...trainingActivity, intensity };
}

export function setTrainingActivityDuration(
  trainingActivity: TrainingActivity,
  duration: Duration
): TrainingActivity {
  return { ...trainingActivity, duration };
}

export function addActivityToTraining(
  training: Training,
  trainingActivity: TrainingActivity
): Training {
  return {
    ...training,
    activities: [...training.activities, trainingActivity],
    lastModified: now(),
  };
}

export function updateTrainingActivity(
  training: Training,
  trainingActivity: TrainingActivity,
  trainingActivityIndex: number
): Training {
  const updatedActivities: TrainingActivity[] = training.activities.map(
    (originalTrainingActivity, i) => {
      if (i === trainingActivityIndex) return trainingActivity;
      return originalTrainingActivity;
    }
  );

  return { ...training, activities: updatedActivities, lastModified: now() };
}

export function deleteTrainingActivity(training: Training, index: number): Training {
  const updatedActivities = training.activities.filter((_, i) => i !== index);
  return { ...training, activities: updatedActivities, lastModified: now() };
}

/**
 * Shift activity in position `indexToMoveUp` towards the start of the training activity
 * list.
 * @param indexToMoveUp index of the TrainingActivity to move up
 */
export function moveTrainingActivityUp(
  training: Training,
  indexToMoveUp: number
): Training {
  if (indexToMoveUp === 0) {
    console.debug(
      `First training activity cannot be moved higher up, as it is already the first one`
    );
    return training;
  }

  if (indexToMoveUp > training.activities.length - 1) {
    throw new Error(
      `Targetted activity index (${indexToMoveUp}) is out of range, valid range:` +
        ` 0 <= index <= ${training.activities.length - 1}.`
    );
  }

  const activityToMoveUp = training.activities[indexToMoveUp];

  // Find the counterpart that will be swapped
  const indexToMoveDown: number = indexToMoveUp - 1;
  const activityToMoveDown = training.activities[indexToMoveDown];

  const reorderedActivities = training.activities.map((activity, currentIndex) => {
    if (currentIndex === indexToMoveDown) return activityToMoveUp;
    if (currentIndex === indexToMoveUp) return activityToMoveDown;
    return activity;
  });

  return { ...training, activities: reorderedActivities, lastModified: now() };
}

/**
 * Shift activity in position `indexToMoveDown` towards the end of the training
 * activity list.
 * @param indexToMoveDown index of the TrainingActivity to move down
 */
export function moveTrainingActivityDown(
  training: Training,
  indexToMoveDown: number
): Training {
  if (indexToMoveDown === training.activities.length - 1) {
    console.debug(
      `Last training activity cannot be moved further down, as it is already the last one`
    );
    return training;
  }

  if (indexToMoveDown > training.activities.length - 1) {
    throw new Error(
      `Targetted activity index (${indexToMoveDown}) is out of range, valid range:` +
        ` 0 <= index <= ${training.activities.length - 1}.`
    );
  }

  const activityToMoveDown = training.activities[indexToMoveDown];

  // Find the counterpart that will be swapped
  const indexToMoveUp: number = indexToMoveDown + 1;
  const activityToMoveUp = training.activities[indexToMoveUp];

  const reorderedActivities = training.activities.map((activity, currentIndex) => {
    if (currentIndex === indexToMoveUp) return activityToMoveDown;
    if (currentIndex === indexToMoveDown) return activityToMoveUp;
    return activity;
  });

  return { ...training, activities: reorderedActivities, lastModified: now() };
}

export function trainingsAreDifferent(a: Training, b: Training): boolean {
  return trainingsAreEqual(a, b) === false;
}

export function trainingsAreEqual(a: Training, b: Training): boolean {
  if (a.id !== b.id) return false;
  if (a.name !== b.name) return false;
  if (a.activities.length !== b.activities.length) return false;

  for (let index = 0; index < a.activities.length; index++) {
    const trainingActivityA = a.activities[index];
    const trainingActivityB = b.activities[index];
    if (trainingActivitiesAreEqual(trainingActivityA, trainingActivityB)) {
      continue;
    }
    return false;
  }

  return true;
}

function trainingActivitiesAreEqual(a: TrainingActivity, b: TrainingActivity): boolean {
  if (a.activityId !== b.activityId) return false;
  if (a.intensity !== b.intensity) return false;
  if (a.duration !== b.duration) return false;
  return true;
}
