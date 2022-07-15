import { Activity } from "./domain";

export const STORAGE_PREFIX = "fitness";

export const LOAD_ACTIVITIES_FROM_CONFIG = false;

export const ACTIVITIES: Activity[] = [
  { id: 1, name: "walk", otherNames: [] },
  { id: 2, name: "run", otherNames: [] },
  { id: 3, name: "handstand", otherNames: [] },
];
