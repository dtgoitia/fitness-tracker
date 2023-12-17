import { Autocompleter, Word } from "../autocomplete";
import { now } from "../datetimeUtils";
import { unreachable } from "../devex";
import { generateId } from "../hash";
import { SortAction } from "../sort";
import { Err, Ok, Result } from "../success";
import { Hash, Trainable, TrainableId, TrainableName, TrainableNotes } from "./model";
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
  private autocompleter: Autocompleter<Trainable>;

  constructor() {
    this.autocompleter = new Autocompleter<Trainable>({
      itemToWordMapper: trainableToWords,
    });

    this.changesSubject = new Subject<TrainableChange>();
    this.changes$ = this.changesSubject.asObservable();

    this.trainables = new Map<TrainableId, Trainable>();
  }

  public initialize({ trainables }: InitializeArgs): void {
    for (const trainable of trainables) {
      this.trainables.set(trainable.id, trainable);
    }

    this.autocompleter.initialize({ items: trainables });

    this.changesSubject.next({ kind: "trainable-manager-initialized" });
  }

  public add({ name }: AddTrainableArgs): void {
    const id = this.generateTrainableId();
    const trainable: Trainable = {
      id,
      name,
      lastModified: now(),
      notes: "",
    };
    this.trainables.set(id, trainable);
    this.autocompleter.addItem(trainable);
    this.changesSubject.next({ kind: "trainable-added", id });
  }

  public update({ trainable }: UpdateTrainableArgs): Result {
    const { id } = trainable;

    const previous = this.trainables.get(id);
    if (previous === undefined) {
      return Err(
        `TrainableManager.update::No trainable found with ID ${id}, nothing will be updated`
      );
    }

    this.trainables.set(id, trainable);

    this.autocompleter.removeItem(previous);
    this.autocompleter.addItem(trainable);

    this.changesSubject.next({ kind: "trainable-updated", id });
    return Ok(undefined);
  }

  public delete({ id }: DeleteteTrainableArgs): void {
    const previous = this.trainables.get(id);
    if (previous === undefined) {
      console.debug(
        `TrainableManager.delete::No trainable found with ID ${id}, nothing will be deleted`
      );
      return;
    }

    this.trainables.delete(id);

    this.autocompleter.removeItem(previous);

    this.changesSubject.next({ kind: "trainable-deleted", id });
  }

  public get(id: TrainableId): Trainable | undefined {
    return this.trainables.get(id);
  }

  public getAll(): Trainable[] {
    return [...this.trainables.values()].sort(sortTrainablesAlphabetically);
  }

  /**
   * Find trainables that cointain words starting with the provided query
   */
  public searchByPrefix(query: string): Trainable[] {
    const prefixes = query.split(" ").filter((prefix) => !!prefix);

    if (prefixes.length === 0) return this.getAll();

    const unsortedResults = this.autocompleter.search(prefixes);

    return [...this.trainables.values()]
      .filter((trainable) => unsortedResults.has(trainable))
      .sort(sortTrainablesAlphabetically);
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

function trainableToWords(trainable: Trainable): Set<Word> {
  const trainableWords = [trainable.name]
    .filter((name) => name)
    .map((name) => name.toLowerCase())
    .map((name) => name.split(" "))
    .flat();

  const words = new Set(trainableWords);
  return words;
}

export function setTrainableName(trainable: Trainable, name: TrainableName): Trainable {
  return { ...trainable, name, lastModified: now() };
}

export function setTrainableNotes(
  trainable: Trainable,
  notes: TrainableNotes
): Trainable {
  return { ...trainable, notes, lastModified: now() };
}

export function trainableAreDifferent(a: Trainable, b: Trainable): boolean {
  return trainablesAreEqual(a, b) === false;
}

export function trainablesAreEqual(a: Trainable, b: Trainable): boolean {
  if (a.id !== b.id) return false;
  if (a.name !== b.name) return false;
  if (a.notes !== b.notes) return false;

  return true;
}
