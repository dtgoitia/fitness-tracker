import { setsAreEqual } from "../setOperations";
import { buildActivity, buildCompletedActivity } from "../test/helpers";
import { ActivityManager } from "./activities";
import {
  CompletedActivityManager,
  getLastOccurrences,
  groupByDay,
  groupChronologicalItemsByWeek,
  groupRetrochronologicalItemsByWeek,
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
    expect(completedActivityManager.getAll({ order: "chronological" })).toEqual([ca_b]);
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

    const remaining = new Set(
      completedActivityManager.getAll({ order: "reverse-chronological" })
    );
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

describe(`${groupChronologicalItemsByWeek.name}`, () => {
  const _d = (s: string): Date => new Date(Date.parse(s));

  it("groups when there are no completed activities", () => {
    const items: CompletedActivity[] = [];
    const result = groupChronologicalItemsByWeek({ items, fillGaps: false });
    expect(result).toEqual([]);
  });

  it("groups when there is only one completed activity", () => {
    const ca = buildCompletedActivity({ date: _d("2024-06-02") });
    const history: CompletedActivity[] = [ca];
    const result = groupChronologicalItemsByWeek({ items: history, fillGaps: false });
    expect(result).toEqual([["2024-05-27", [ca]]]);
  });

  it("groups across multiple weeks", () => {
    const ca1 = buildCompletedActivity({ date: _d("2024-06-02") });
    const ca2 = buildCompletedActivity({ date: _d("2024-06-03") });
    const ca3 = buildCompletedActivity({ date: _d("2024-06-04") });
    const ca4 = buildCompletedActivity({ date: _d("2024-06-10") });
    const ca5 = buildCompletedActivity({ date: _d("2024-06-12") });

    const history: CompletedActivity[] = [ca1, ca2, ca3, ca4, ca5];

    const result = groupChronologicalItemsByWeek({ items: history, fillGaps: false });
    expect(result).toEqual([
      ["2024-05-27", [ca1]],
      ["2024-06-03", [ca2, ca3]],
      ["2024-06-10", [ca4, ca5]],
    ]);
  });

  it("group by filling the gaps if requested", () => {
    const ca1 = buildCompletedActivity({ date: _d("2024-06-02") });
    const ca2 = buildCompletedActivity({ date: _d("2024-06-28") });
    const history: CompletedActivity[] = [ca1, ca2];

    const gapsNotFilled = groupChronologicalItemsByWeek({
      items: history,
      fillGaps: false,
    });
    expect(gapsNotFilled).toEqual([
      ["2024-05-27", [ca1]],
      ["2024-06-24", [ca2]],
    ]);

    const gapsFilled = groupChronologicalItemsByWeek({ items: history, fillGaps: true });
    expect(gapsFilled).toEqual([
      ["2024-05-27", [ca1]],
      ["2024-06-03", []],
      ["2024-06-10", []],
      ["2024-06-17", []],
      ["2024-06-24", [ca2]],
    ]);
  });
});

describe(`${groupRetrochronologicalItemsByWeek.name}`, () => {
  const _d = (s: string): Date => new Date(Date.parse(s));

  it("groups when there are no completed activities", () => {
    const items: CompletedActivity[] = [];
    const result = groupRetrochronologicalItemsByWeek({ items, fillGaps: false });
    expect(result).toEqual([]);
  });

  it("groups when there is only one completed activity", () => {
    const ca = buildCompletedActivity({ date: _d("2024-06-02") });
    const history: CompletedActivity[] = [ca];
    const result = groupRetrochronologicalItemsByWeek({
      items: history,
      fillGaps: false,
    });
    expect(result).toEqual([["2024-05-27", [ca]]]);
  });

  it("groups across multiple weeks", () => {
    const ca1 = buildCompletedActivity({ date: _d("2024-06-02") });
    const ca2 = buildCompletedActivity({ date: _d("2024-06-03") });
    const ca3 = buildCompletedActivity({ date: _d("2024-06-04") });
    const ca4 = buildCompletedActivity({ date: _d("2024-06-10") });
    const ca5 = buildCompletedActivity({ date: _d("2024-06-12") });

    const history: CompletedActivity[] = [ca5, ca4, ca3, ca2, ca1];

    const result = groupRetrochronologicalItemsByWeek({
      items: history,
      fillGaps: false,
    });
    expect(result).toEqual([
      ["2024-06-10", [ca5, ca4]],
      ["2024-06-03", [ca3, ca2]],
      ["2024-05-27", [ca1]],
    ]);
  });

  it("group by filling the gaps if requested", () => {
    const ca1 = buildCompletedActivity({ date: _d("2024-06-02") });
    const ca2 = buildCompletedActivity({ date: _d("2024-06-28") });
    const history: CompletedActivity[] = [ca2, ca1];

    const gapsNotFilled = groupRetrochronologicalItemsByWeek({
      items: history,
      fillGaps: false,
    });
    expect(gapsNotFilled).toEqual([
      ["2024-06-24", [ca2]],
      ["2024-05-27", [ca1]],
    ]);

    const gapsFilled = groupRetrochronologicalItemsByWeek({
      items: history,
      fillGaps: true,
    });
    expect(gapsFilled).toEqual([
      ["2024-06-24", [ca2]],
      ["2024-06-17", []],
      ["2024-06-10", []],
      ["2024-06-03", []],
      ["2024-05-27", [ca1]],
    ]);
  });
});
