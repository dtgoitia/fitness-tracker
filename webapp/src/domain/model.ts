export type ISODatetimeString = string; // "2022-07-19 01:02:03"
export type ISODateString = string; // "2022-07-19"
export type Hash = string;
export type ActivityId = Hash;
export type ActivityName = string;
export type CompletedActivityId = string;
export type Notes = string;
export type FilterQuery = string;

export interface Activity {
  id: ActivityId;
  name: ActivityName;
  otherNames: ActivityName[];
  // lastModified: Date;  // usefull to later reconcile data offline
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

export interface CompletedActivity {
  id: CompletedActivityId;
  activityId: ActivityId;
  intensity: Intensity;
  duration: Duration;
  date: Date;
  notes: Notes;
}
