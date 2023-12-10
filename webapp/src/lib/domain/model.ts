export type ISODatetimeString = string; // "2022-07-19 01:02:03"
export type ISODateString = string; // "2022-07-19"
export type Hash = string;
export type ActivityId = Hash;
export type ActivityName = string;
export type CompletedActivityId = string;
export type Notes = string;
export type FilterQuery = string;
export type Shortcut = ActivityId;
export type ExternalReference = string; // URLs to videos, images, etc.

export interface Activity {
  readonly id: ActivityId;
  readonly name: ActivityName;
  readonly otherNames: ActivityName[];
  readonly lastModified: Date; // usefull to later reconcile data offline
  readonly trainableIds: TrainableId[];
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
  readonly id: CompletedActivityId;
  readonly activityId: ActivityId;
  readonly intensity: Intensity;
  readonly duration: Duration;
  readonly date: Date;
  readonly notes: Notes;
  readonly lastModified: Date; // usefull to later reconcile data offline
}

export type TrainingId = string;
export type TrainingName = string;

export interface TrainingActivity {
  readonly activityId: ActivityId;
  readonly intensity: Intensity;
  readonly duration: Duration;
}

export interface Training {
  readonly id: TrainingId;
  readonly name: TrainingName;
  readonly activities: TrainingActivity[];
  readonly lastModified: Date; // usefull to later reconcile data offline
}

export type TrainableId = string;
export type TrainableName = string;

export interface Trainable {
  readonly id: TrainableId;
  readonly name: TrainableName;
  readonly lastModified: Date; // usefull to later reconcile data offline
}
