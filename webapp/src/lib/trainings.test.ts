import { ActivityId, Duration, Intensity, Training, TrainingActivity } from "./model";
import { moveTrainingActivityDown, moveTrainingActivityUp } from "./trainings";
import { beforeEach, describe, expect, it } from "vitest";

function buildTraining({ activities }: { activities: TrainingActivity[] }): Training {
  return {
    id: "test-training-id",
    name: "test-training-name",
    lastModified: new Date(2000, 1, 1),
    activities,
  };
}

function buildTrainingActivity({
  activityId,
}: {
  activityId: ActivityId;
}): TrainingActivity {
  return { activityId, duration: Duration.medium, intensity: Intensity.medium };
}

describe("Trainings", () => {
  describe("move training up", () => {
    const a = buildTrainingActivity({ activityId: "a" });
    const b = buildTrainingActivity({ activityId: "b" });
    const c = buildTrainingActivity({ activityId: "c" });

    let training: Training;

    beforeEach(() => {
      training = buildTraining({ activities: [a, b, c] });
    });

    it(`does nothing if the target activity is already the first one`, () => {
      expect(training.activities).toEqual([a, b, c]);

      const updated = moveTrainingActivityUp(training, 0);

      expect(updated).toEqual(training);
    });

    it(`does moves activity up`, () => {
      expect(training.activities).toEqual([a, b, c]);

      const updated = moveTrainingActivityUp(training, 1);

      expect(updated.activities).toEqual([b, a, c]);
      expect(updated.lastModified).not.toEqual(training.lastModified);
    });

    it(`errors if the target activity is out of range`, () => {
      expect(() => moveTrainingActivityUp(training, 3)).toThrow(Error);
    });
  });

  describe("move training down", () => {
    const a = buildTrainingActivity({ activityId: "a" });
    const b = buildTrainingActivity({ activityId: "b" });
    const c = buildTrainingActivity({ activityId: "c" });

    let training: Training;
    let lastActivityIndex: number;

    beforeEach(() => {
      training = buildTraining({ activities: [a, b, c] });
      lastActivityIndex = training.activities.length - 1;
    });

    it(`does nothing if the target activity is already the last one`, () => {
      expect(training.activities).toEqual([a, b, c]);

      const updated = moveTrainingActivityDown(training, lastActivityIndex);

      expect(updated).toEqual(training);
    });

    it(`does moves activity down`, () => {
      expect(training.activities).toEqual([a, b, c]);

      const updated = moveTrainingActivityDown(training, 1);

      expect(updated.activities).toEqual([a, c, b]);
      expect(updated.lastModified).not.toEqual(training.lastModified);
    });

    it(`errors if the target activity is out of range`, () => {
      expect(() => moveTrainingActivityDown(training, 3)).toThrow(Error);
    });
  });
});
