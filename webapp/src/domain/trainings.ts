import { ActivityManager } from "./activities";
import { unreachable } from "./devex";
import { generateId } from "./hash";
import { ActivityId, Hash, Training, TrainingId } from "./model";
import { SortAction } from "./sort";
import { Observable, Subject } from "rxjs";
import { makeTaggedUnion, MemberType, none } from "safety-match";

const TRAINING_PREFIX = "tra";

interface ConstructorArgs {
  activityManager: ActivityManager;
}

interface InitializeArgs {
  trainings: Training[];
}

type AddTrainingArgs = Omit<Training, "id">;

const AllActivitiesExist = makeTaggedUnion({
  Yes: none,
  No: (missingIds: ActivityId[]) => missingIds,
});
type AllActivitiesExistResult = MemberType<typeof AllActivitiesExist>;

interface UpdateTrainingArgs {
  training: Training;
}

const TrainingUpdateResult = makeTaggedUnion({
  Ok: none,
  Error: (reason: string) => reason,
});
type TrainingUpdateResultType = MemberType<typeof TrainingUpdateResult>;

interface DeleteTrainingArgs {
  id: TrainingId;
}

export class TrainingManager {
  public changes$: Observable<TrainingChange>;

  private changesSubject: Subject<TrainingChange>;
  private activityManager: ActivityManager;
  private trainings: Map<TrainingId, Training>;

  constructor({ activityManager }: ConstructorArgs) {
    this.changesSubject = new Subject<TrainingChange>();
    this.changes$ = this.changesSubject.asObservable();

    this.activityManager = activityManager;

    this.trainings = new Map<TrainingId, Training>();
  }

  public initialize({ trainings }: InitializeArgs): void {
    for (const training of trainings) {
      this.trainings.set(training.id, training);
    }
  }

  public add({ name, trainingActivities }: AddTrainingArgs): void {
    const activityIds = trainingActivities.map((ta) => ta.activityId);
    this.doAllActivitiesExist(activityIds).match({
      Yes: () => console.log(`TrainingManager.add::all Activities exist`),
      No: (missingActivityIds) => {
        throw unreachable(
          `TrainingManager.add::cannot add Training because these Activities IDs` +
            ` were referenced in Trainings but were not found in ActivityManager:` +
            ` ${missingActivityIds.join(", ")}`
        );
      },
    });

    const id = this.generateTrainingId();
    const training: Training = { id, name, trainingActivities };
    this.trainings.set(id, training);
    this.changesSubject.next(new TrainingAdded(id));
  }

  public update({ training }: UpdateTrainingArgs): TrainingUpdateResultType {
    const activityIds = training.trainingActivities.map((ta) => ta.activityId);
    if (training.name === "") {
      return TrainingUpdateResult.Error(
        `TrainingManager.update::Name must not be an empty string`
      );
    }

    let failReason = this.doAllActivitiesExist(activityIds).match({
      Yes: () => console.log(`TrainingManager.update::all Activities exist`),
      No: (missingActivityIds) => {
        return (
          `TrainingManager.update::cannot add Training because these Activities IDs` +
          ` were referenced in Trainings but were not found in ActivityManager:` +
          ` ${missingActivityIds.join(", ")}`
        );
      },
    });

    if (failReason) return TrainingUpdateResult.Error(failReason);

    const { id } = training;
    this.trainings.set(id, training);
    this.changesSubject.next(new TrainingUpdated(id));

    return TrainingUpdateResult.Ok;
  }

  public delete({ id }: DeleteTrainingArgs): void {
    if (this.trainings.has(id) === false) {
      console.debug(
        `TrainingManager.delete::No training found with ID ${id}, nothing will be deleted`
      );
      return;
    }

    this.trainings.delete(id);
    this.changesSubject.next(new TrainingDeleted(id));
  }

  public getAll(): Training[] {
    return [...this.trainings.values()].sort(sortTrainingAlphabetically);
  }

  public isActivityUsedInTrainings({ activityId }: { activityId: ActivityId }): boolean {
    // Optimization: consider indexing/caching currently used Activity ID if it's slow
    for (const training of this.trainings.values()) {
      for (const activity of training.trainingActivities) {
        if (activity.activityId === activityId) {
          return true;
        }
      }
    }
    return false;
  }

  private generateTrainingId(): TrainingId {
    let id: Hash = generateId({ prefix: TRAINING_PREFIX });

    // Make sure that no IDs are duplicated - rare, but very painful
    while (this.trainings.has(id)) {
      id = generateId({ prefix: TRAINING_PREFIX });
    }

    return id;
  }

  private doAllActivitiesExist(activityIds: ActivityId[]): AllActivitiesExistResult {
    const checked = new Set<ActivityId>();
    const missingActivityIds: ActivityId[] = [];

    for (const id of activityIds) {
      checked.add(id);
      if (this.activityManager.get(id) === undefined) {
        missingActivityIds.push(id);
      }
    }

    if (missingActivityIds.length > 0) {
      AllActivitiesExist.No(missingActivityIds);
    }

    return AllActivitiesExist.Yes;
  }
}

function sortTrainingAlphabetically(a: Training, b: Training): SortAction {
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
