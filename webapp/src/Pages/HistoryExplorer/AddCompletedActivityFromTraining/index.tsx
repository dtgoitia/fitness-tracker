import { useApp } from "../../..";
import { now } from "../../../lib/datetimeUtils";
import { Training, TrainingActivity } from "../../../lib/model";
import SelectableTrainingActivity from "./SelectableTrainingActivity";
import TrainingSelector from "./TrainingSelector";
import { Button, Card, Collapse } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import styled from "styled-components";

function AddCompletedActivityFromTraining() {
  const app = useApp();
  const activityManager = app.activityManager;
  const completedActivityManager = app.completedActivityManager;
  const trainingManager = app.trainingManager;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [training, setTraining] = useState<Training | undefined>();
  const [trainings, setTrainings] = useState<Training[]>([]);

  useEffect(() => {
    setTrainings(trainingManager.getAll());
  }, [trainingManager]);

  function handleTrainingActivitySelected(trainingActivity: TrainingActivity): void {
    const { activityId, intensity, duration } = trainingActivity;
    const latestNotes = completedActivityManager.getLastActivityNotes({ activityId });

    completedActivityManager.add({
      activityId,
      intensity,
      duration,
      notes: latestNotes,
      date: now(),
    });
  }

  return (
    <Container>
      {isOpen === false && (
        <Button
          icon="add"
          intent="none"
          text="Pick from training"
          onClick={() => setIsOpen(true)}
          fill
          large
        />
      )}
      <Collapse isOpen={isOpen}>
        <Card>
          <p>Choose a training:</p>
          <TrainingSelector
            selectedTraining={training}
            trainings={trainings}
            onSelect={setTraining}
          />

          {training && (
            <SelectableTrainingActivityList>
              {training.activities.map((trainingActivity, i) => {
                const activity = activityManager.get(trainingActivity.activityId);
                if (activity === undefined) {
                  return (
                    <pre>Activity {trainingActivity.activityId} does not exist :S</pre>
                  );
                }
                return (
                  <SelectableTrainingActivity
                    key={`selectable-training-activity-${i}`}
                    name={activity.name}
                    onClick={() => handleTrainingActivitySelected(trainingActivity)}
                  />
                );
              })}
            </SelectableTrainingActivityList>
          )}

          <Button intent="none" text="Close" onClick={() => setIsOpen(false)} />
        </Card>
      </Collapse>
    </Container>
  );
}

export default AddCompletedActivityFromTraining;

const Container = styled.div`
  margin: 1rem 0;
`;

const SelectableTrainingActivityList = styled.ol`
  margin-bottom: 1rem;
`;
