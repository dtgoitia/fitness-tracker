import { ACTIVITY_PREFIX } from "./activities";
import { COMPLETED_ACTIVITY_PREFIX, groupByDay } from "./completedActivities";
import { now } from "./datetimeUtils";
import { generateId } from "./hash";
import { CompletedActivity, Duration, Intensity } from "./model";

// TODO: this probably needs to go to a more accessible module
function buildCompletedActivity({ date }: { date?: Date }): CompletedActivity {
  return {
    id: generateId({ prefix: COMPLETED_ACTIVITY_PREFIX }),
    activityId: generateId({ prefix: ACTIVITY_PREFIX }),
    date: date !== undefined ? date : now(),
    duration: Duration.short,
    intensity: Intensity.low,
    notes: "test notes",
  };
}

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
