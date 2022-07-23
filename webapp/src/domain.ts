import { buildTrie, findWords, TrieNode, Word } from "./autocomplete";
import { ACTIVITIES, LOAD_ACTIVITIES_FROM_CONFIG } from "./config";
import storage from "./localStorage";

export type ISODatetimeString = string; // "2022-07-19T07:11:00+01:00"
export type ISODateString = string; // "2022-07-19"
export type ActivityId = number;
export type CompletedActivityId = number;
export type ActivityName = string;
export interface Activity {
  id: ActivityId;
  name: ActivityName;
  otherNames: ActivityName[];
}
export enum Intensity {
  low = "low",
  medium = "medium",
  high = "high",
}
export enum Duration {
  short = "short",
  medium = "medium",
  long = "long",
}
export type Notes = string;
export interface CompletedActivity {
  id: CompletedActivityId;
  activityId: ActivityId;
  intensity: Intensity;
  duration: Duration;
  date: Date;
  notes: Notes;
}
export type FilterQuery = string;

function now(): Date {
  return new Date();
}
function msThisYear(): number {
  // Number of milliseconds ellapsed since last new year;
  const _now = now();
  const newYear = new Date(_now.getFullYear(), 1, 1);
  const ellapsedMs = _now.getTime() - newYear.getTime();
  return ellapsedMs;
}
function generateRandomId(): number {
  // if causes problem, then install `uuid` NPM package
  const saltSize = 100;
  const time = msThisYear() * saltSize;
  const salt = Math.floor(Math.random() * saltSize); // to avoid collisions
  return time + salt;
}

export function getActivitiesFromStorage(): Activity[] {
  if (LOAD_ACTIVITIES_FROM_CONFIG) {
    return ACTIVITIES;
  }
  if (!storage.activities.exists()) {
    return [];
  }

  const activities = storage.activities.read();
  if (!activities) {
    return [];
  }

  return activities as Activity[];
}

interface StoredCompletedActivity extends Omit<CompletedActivity, "date"> {
  date: ISODatetimeString;
}

export function getHistoryFromStorage(): CompletedActivity[] {
  if (!storage.history.exists()) {
    return [];
  }

  const rawHistory = storage.history.read();
  if (!rawHistory) {
    return [];
  }

  const history: CompletedActivity[] = (
    rawHistory as StoredCompletedActivity[]
  ).map((raw) => {
    const completedActivity: CompletedActivity = {
      id: raw.id,
      activityId: raw.activityId,
      intensity: raw.intensity,
      duration: raw.duration,
      date: new Date(raw.date),
      notes: raw.notes,
    };
    return completedActivity;
  });

  return history;
}

export function addActivity(
  activity: Activity[],
  name: ActivityName,
  otherNames: ActivityName[]
): Activity[] {
  const newActivity: Activity = {
    id: activity.length + 1, // 1-index based
    name: name,
    otherNames: otherNames,
  };

  // Use case: if an item has been removed from the middle of the `items` list, adding
  // an item with id=items.length+1 means that the last item and the new item will have
  // the same ID. To avoid this, update the IDs when an item is added:
  return [...activity, newActivity].map((activity, i) => ({
    ...activity,
    id: i + 1,
  }));
}

export function removeActivity(
  activities: Activity[],
  id: ActivityId
): Activity[] {
  return (
    activities
      .filter((activity) => activity.id !== id)
      // Use case: if an item has been removed from the middle of the `items` list, adding
      // an item with id=items.length+1 means that the last item and the new item will
      // have the same ID. To avoid this, update the IDs when an item is removed
      .map((activity, i) => ({ ...activity, id: i + 1 }))
  );
}

export function filterInventory(
  activity: Activity[],
  query: FilterQuery
): Activity[] {
  if (query === "") return activity;
  const completer = new ItemAutocompleter(activity);

  const prefixes = query.split(" ").filter((prefix) => !!prefix);
  if (!prefixes) return activity;

  const unsortedResults = completer.search(prefixes);

  return activity.filter((activity) => unsortedResults.has(activity));
}

interface WordsToItemMap {
  [w: Word]: Activity[];
}
export class ItemAutocompleter {
  private trie: TrieNode;
  private wordToItems: WordsToItemMap;
  constructor(private readonly items: Activity[]) {
    const [words, map] = this.activitiesToWords(items);
    this.trie = buildTrie(words);
    this.wordToItems = map;
  }

  public search(prefixes: string[]): Set<Activity> {
    const results: Set<Activity> = new Set();

    prefixes
      .map((prefix) => this.searchSinglePrefix(prefix))
      .map((items) => [...items])
      .flat()
      .forEach((item) => results.add(item));

    return results;
  }

  private searchSinglePrefix(prefix: string): Set<Activity> {
    const words = findWords(this.trie, prefix.toLowerCase());
    const items = this.getItemsFromWords(words);
    return items;
  }

  private activitiesToWords(activities: Activity[]): [Word[], WordsToItemMap] {
    const words: Set<Word> = new Set();
    const map: WordsToItemMap = {};

    for (const activity of activities) {
      const activityWords = this.getWordsFromActivity(activity);

      for (const word of activityWords) {
        words.add(word);

        if (!map[word]) {
          map[word] = [activity];
        } else {
          map[word].push(activity);
        }
      }
    }

    const wordList: Word[] = [...words];

    return [wordList, map];
  }

  private getWordsFromActivity(activity: Activity): Set<Word> {
    const activityWords = [activity.name, ...(activity.otherNames || [])]
      .filter((name) => name)
      .map((name) => name.toLowerCase())
      .map((name) => name.split(" "))
      .flat();

    const words = new Set(activityWords);
    return words;
  }

  private getItemsFromWords(words: Set<string>): Set<Activity> {
    const activities: Set<Activity> = new Set();

    for (const word of words) {
      const wordItems = this.wordToItems[word];
      wordItems.forEach((word) => activities.add(word));
    }

    return activities;
  }
}

enum SortAction {
  FIRST_A_THEN_B = -1,
  PRESERVE_ORDER = 0,
  FIRST_B_THEN_A = 1,
}

export function sortHistory(history: CompletedActivity[]): CompletedActivity[] {
  // Sort from newest to oldest
  return history.sort(function (a: CompletedActivity, b: CompletedActivity) {
    const date_a = a.date.getTime();
    const date_b = b.date.getTime();
    if (date_a === date_b) return SortAction.PRESERVE_ORDER;
    if (date_a > date_b) return SortAction.FIRST_A_THEN_B;
    if (date_a < date_b) return SortAction.FIRST_B_THEN_A;
    throw new Error("Unexpected scenario reached :S");
  });
}

export function addCompletedActivity(
  history: CompletedActivity[],
  id: ActivityId,
  intensity: Intensity,
  duration: Duration,
  notes: Notes
): CompletedActivity[] {
  const now = new Date();
  const uniqueId: CompletedActivityId = generateRandomId();
  const newCompletedActivity: CompletedActivity = {
    id: uniqueId,
    activityId: id,
    intensity,
    duration,
    date: now,
    notes,
  };

  const updatedHistory = sortHistory([newCompletedActivity, ...history]);
  return updatedHistory;
}

export function findActivityById(
  activities: Activity[],
  id: ActivityId
): Activity | undefined {
  const matches = activities.filter((activity) => activity.id === id);
  if (matches.length === 0) {
    return undefined;
  }

  // Assumption: activity IDs are unique
  const activity = matches[0];

  return activity;
}

export function findActivityIdByName(
  activities: Activity[],
  name: ActivityName
): ActivityId | undefined {
  const matches = activities.filter((activity) => activity.name === name);
  if (matches.length === 0) {
    return undefined;
  }

  // Assumption: activity names are unique
  const activity = matches[0];

  return activity.id;
}

export function isActivityUsedInHistory(
  activityId: ActivityId,
  history: CompletedActivity[]
): boolean {
  for (const activity of history) {
    if (activity.id === activityId) {
      return true;
    }
  }

  return false;
}

export function indexActivities(
  activities: Activity[]
): Map<ActivityId, Activity> {
  const map = new Map<ActivityId, Activity>();
  activities.forEach((activity) => {
    map.set(activity.id, activity);
  });
  return map;
}

export function updateHistory(
  history: CompletedActivity[],
  updated: CompletedActivity
): CompletedActivity[] {
  const newHistory = history.map((existing) => {
    return existing.id === updated.id ? updated : existing;
  });
  return newHistory;
}

export function deleteHistoryActivity(
  history: CompletedActivity[],
  id: CompletedActivityId
): CompletedActivity[] {
  const newHistory = history.filter(
    (completedActivity) => completedActivity.id !== id
  );
  return newHistory;
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
