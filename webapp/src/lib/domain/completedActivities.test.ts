import { setsAreEqual } from "../setOperations";
import { buildActivity, buildCompletedActivity } from "../test/helpers";
import { ActivityManager } from "./activities";
import {
  CompletedActivityManager,
  getLastOccurrences,
  groupByDay,
} from "./completedActivities";
import { CompletedActivity } from "./model";
import { describe, expect, it } from "vitest";

describe(`CompletedActivity`, () => {
  it("group by day", () => {
    const a: CompletedActivity = buildCompletedActivity({
      date: new Date("2022-07-18T17:54:29.730Z"),
    });

    const b: CompletedActivity = buildCompletedActivity({
      date: new Date("2022-07-19T17:54:33.787Z"),
    });

    const history = [a, b];

    const result = groupByDay(history);
    expect(result).toEqual([
      ["2022-07-18", [a]],
      ["2022-07-19", [b]],
    ]);
  });
});

describe(`CompletedActivityManager`, () => {
  it(`keeps the latest completed activity when there is only one activity`, () => {
    // Given there are 2 completed activities for the same activity
    const activityManager = new ActivityManager();
    const completedActivityManager = new CompletedActivityManager({ activityManager });

    const activity = buildActivity({ id: "act_aaaaaa" });
    activityManager.initialize({ activities: [activity], allTrainableIds: new Set() });

    const ca_a = buildCompletedActivity({
      activityId: activity.id,
      date: new Date(2022, 10, 1),
    });
    const ca_b = buildCompletedActivity({
      activityId: activity.id,
      date: new Date(2022, 10, 2),
    });

    completedActivityManager.initialize({ completedActivities: [ca_a, ca_b] });

    // when is purged
    const preservedDate = completedActivityManager.purge();

    // then only latest activity remains
    expect(completedActivityManager.getAll()).toEqual([ca_b]);
    // and the preserved date is the same as the latest completed activity
    expect(preservedDate).toEqual(ca_b.date);
  });

  it(`keeps the earliest of all latest completed activities`, () => {
    // Given there are completed activities for the different activities
    const activityManager = new ActivityManager();
    const completedActivityManager = new CompletedActivityManager({ activityManager });

    const activityA = buildActivity({ id: "act_aaaaaa" });
    const activityB = buildActivity({ id: "act_bbbbbb" });
    activityManager.initialize({
      activities: [activityA, activityB],
      allTrainableIds: new Set(),
    });

    const completedA1 = buildCompletedActivity({
      activityId: activityA.id,
      date: new Date(2022, 10, 1),
    });
    const completedA2 = buildCompletedActivity({
      activityId: activityA.id,
      date: new Date(2022, 10, 4),
    });
    const completedA3 = buildCompletedActivity({
      activityId: activityA.id,
      date: new Date(2022, 10, 5),
    });

    const completedB1 = buildCompletedActivity({
      activityId: activityB.id,
      date: new Date(2022, 10, 2),
    });
    const completedB2 = buildCompletedActivity({
      activityId: activityB.id,
      date: new Date(2022, 10, 3),
    });

    completedActivityManager.initialize({
      completedActivities: [
        completedA1,
        completedA2,
        completedA3,
        completedB1,
        completedB2,
      ],
    });

    // when is purged
    const preservedDate = completedActivityManager.purge();

    // then
    expect(preservedDate).toEqual(completedB2.date);

    const remaining = new Set(completedActivityManager.getAll());
    const expected = new Set([completedA2, completedA3, completedB2]);
    expect(setsAreEqual(remaining, expected)).toBe(true);
  });
});

describe(`${getLastOccurrences.name}`, () => {
  it("drop all completed activities but the latest occurrence of each completed activity", () => {
    const activityA = buildActivity({ id: "act_aaaaaa" });
    const activityB = buildActivity({ id: "act_bbbbbb" });

    const completedA1 = buildCompletedActivity({
      activityId: activityA.id,
      date: new Date(2022, 10, 1),
    });
    const completedA2 = buildCompletedActivity({
      activityId: activityA.id,
      date: new Date(2022, 10, 4),
    });
    const completedA3 = buildCompletedActivity({
      activityId: activityA.id,
      date: new Date(2022, 10, 5),
    });

    const completedB1 = buildCompletedActivity({
      activityId: activityB.id,
      date: new Date(2022, 10, 2),
    });
    const completedB2 = buildCompletedActivity({
      activityId: activityB.id,
      date: new Date(2022, 10, 3),
    });

    // Assumption: history is sorted from newest to oldest
    const history = [completedA3, completedA2, completedA1, completedB2, completedB1];

    const last = getLastOccurrences(history);

    expect(last).toEqual([completedA3, completedB2]);
  });
});
