import { useApp } from "../../..";
import { useTrainingInUrlParams } from "../../../hooks/useTrainingInUrlParams";
import { now } from "../../../lib/datetimeUtils";
import { Training, TrainingActivity } from "../../../lib/domain/model";
import SelectableTrainingActivity from "./SelectableTrainingActivity";
import TrainingSelector from "./TrainingSelector";
import { Button, Card, Collapse } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import styled from "styled-components";

function AddCompletedActivityFromTraining() {
  const { activityManager, completedActivityManager, trainingManager } = useApp();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [trainingInUrl, setTrainingInUrl] = useTrainingInUrlParams();
  const [training, setTraining] = useState<Training | undefined>(trainingInUrl);
  const [trainings, setTrainings] = useState<Training[]>([]);

  useEffect(() => {
    const subscription = trainingManager.changes$.subscribe(() => {
      setTrainings(trainingManager.getAll());
    });
    setTrainings(trainingManager.getAll());
    return () => {
      subscription.unsubscribe();
    };
  }, [trainingManager]);

  useEffect(() => {
    if (trainingInUrl !== undefined) {
      setIsOpen(true);
    }
    setTraining(trainingInUrl);
  }, [trainingInUrl]);

  function handleTrainingSelection(training: Training | undefined): void {
    setTraining(training);
    setTrainingInUrl(training);
  }

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

  function handleClose(): void {
    setIsOpen(false);
    handleTrainingSelection(undefined);
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
            onSelect={handleTrainingSelection}
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

          <Button intent="none" text="Close" onClick={handleClose} />
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
