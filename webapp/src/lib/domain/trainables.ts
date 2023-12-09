import { now } from "../datetimeUtils";
import { unreachable } from "../devex";
import { generateId } from "../hash";
import { SortAction } from "../sort";
import { Err, Ok, Result } from "../success";
import { Hash, Trainable, TrainableId, TrainableName } from "./model";
import { Observable, Subject } from "rxjs";

export const IMPROVABLE_PREFIX = "imp";

interface InitializeArgs {
  trainables: Trainable[];
}

interface AddTrainableArgs {
  name: TrainableName;
}

interface UpdateTrainableArgs {
  trainable: Trainable;
}

interface DeleteteTrainableArgs {
  id: TrainableId;
}

export class TrainableManager {
  public changes$: Observable<TrainableChange>;

  private changesSubject: Subject<TrainableChange>;
  private trainables: Map<TrainableId, Trainable>;

  constructor() {
    this.changesSubject = new Subject<TrainableChange>();
    this.changes$ = this.changesSubject.asObservable();

    this.trainables = new Map<TrainableId, Trainable>();
  }

  public initialize({ trainables }: InitializeArgs): void {
    for (const trainable of trainables) {
      this.trainables.set(trainable.id, trainable);
    }

    this.changesSubject.next({ kind: "trainable-manager-initialized" });
  }

  public add({ name }: AddTrainableArgs): void {
    const id = this.generateTrainableId();
    const trainable: Trainable = {
      id,
      name,
      lastModified: now(),
    };
    this.trainables.set(id, trainable);
    this.changesSubject.next({ kind: "trainable-added", id });
  }

  public update({ trainable }: UpdateTrainableArgs): Result {
    const { id } = trainable;
    if (this.trainables.has(id) === false) {
      return Err(
        `TrainableManager.update::No trainable found with ID ${id}, nothing will be updated`
      );
    }

    this.trainables.set(id, trainable);

    this.changesSubject.next({ kind: "trainable-updated", id });
    return Ok(undefined);
  }

  public delete({ id }: DeleteteTrainableArgs): void {
    if (this.trainables.has(id) === false) {
      console.debug(
        `TrainableManager.delete::No trainable found with ID ${id}, nothing will be deleted`
      );
      return;
    }

    this.trainables.delete(id);
    this.changesSubject.next({ kind: "trainable-deleted", id });
  }

  public get(id: TrainableId): Trainable | undefined {
    return this.trainables.get(id);
  }

  public getAll(): Trainable[] {
    return [...this.trainables.values()].sort(sortTrainablesAlphabetically);
  }

  private generateTrainableId() {
    let id: Hash = generateId({ prefix: IMPROVABLE_PREFIX });

    // Make sure that no IDs are duplicated - rare, but very painful
    while (this.trainables.has(id)) {
      id = generateId({ prefix: IMPROVABLE_PREFIX });
    }

    return id;
  }
}

export type TrainableChange =
  | { kind: "trainable-manager-initialized" }
  | { kind: "trainable-added"; id: TrainableId }
  | { kind: "trainable-updated"; id: TrainableId }
  | { kind: "trainable-deleted"; id: TrainableId };

function sortTrainablesAlphabetically(a: Trainable, b: Trainable): SortAction {
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
