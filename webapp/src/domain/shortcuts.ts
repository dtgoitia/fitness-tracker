import { ActivityManager } from "./activities";
import { Shortcut } from "./model";
import { Observable, Subject } from "rxjs";

interface Args {
  activityManager: ActivityManager;
}
export class ShortcutManager {
  public change$: Observable<ShortcutChange>;

  private activityManager: ActivityManager;
  private changeSubject: Subject<ShortcutChange>;
  private shortcuts: Shortcut[];

  constructor({ activityManager }: Args) {
    this.activityManager = activityManager;
    this.changeSubject = new Subject<ShortcutChange>();
    this.change$ = this.changeSubject.asObservable();
    this.change$.subscribe((change) =>
      console.debug(`${ShortcutManager.name}.change$::change:`, change)
    );

    this.shortcuts = [];
  }

  public init({ shortcuts }: { shortcuts: Shortcut[] }): void {
    for (const shortcut of shortcuts) {
      if (this.isValid(shortcut) === false) {
        console.warn(
          `${ShortcutManager.name}.${this.init.name}::Shortcut '${shortcut}' skipped` +
            ` as it does not exist in ${ActivityManager.name}.`
        );
        continue;
      }

      this.shortcuts.push(shortcut);
    }

    this.changeSubject.next({ kind: "ShortcutsManagerInitialized" });
  }

  public add({ shortcut }: { shortcut: Shortcut }): void {
    if (this.isValid(shortcut) === false) {
      console.warn(
        `${ShortcutManager.name}.${this.add.name}::Shortcut '${shortcut}' skipped` +
          ` as it does not exist in ${ActivityManager.name}.`
      );
      return;
    }

    if (this.shortcuts.includes(shortcut)) {
      console.info(
        `${ShortcutManager.name}.${this.add.name}::Shortcut '${shortcut}' won't be` +
          ` added as it already exists`
      );
      return;
    }

    this.shortcuts.push(shortcut);

    this.changeSubject.next({ kind: "ShortcutsChanged" });
  }

  public remove({ shortcut }: { shortcut: Shortcut }): void {
    if (this.isValid(shortcut) === false) {
      console.warn(
        `${ShortcutManager.name}.${this.remove.name}::Shortcut '${shortcut}' skipped` +
          ` as it does not exist in ${ActivityManager.name}.`
      );
      return;
    }

    if (this.shortcuts.includes(shortcut) === false) {
      console.info(
        `${ShortcutManager.name}.${this.add.name}::Shortcut '${shortcut}' won't be` +
          ` deleted as it does not exist`
      );
      return;
    }

    this.shortcuts = this.shortcuts.filter((item) => item !== shortcut);

    this.changeSubject.next({ kind: "ShortcutsChanged" });
  }

  public getAll(): Shortcut[] {
    return [...this.shortcuts];
  }

  private isValid(shortcut: Shortcut): boolean {
    return this.activityManager.get(shortcut) !== undefined;
  }
}

type ShortcutChange =
  | { kind: "ShortcutsManagerInitialized" }
  | { kind: "ShortcutsChanged" };
