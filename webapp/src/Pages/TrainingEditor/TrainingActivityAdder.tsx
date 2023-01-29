import {
  Activity,
  ActivityId,
  Duration,
  Intensity,
  TrainingActivity,
} from "../../domain/model";
import {
  DRAFT_TRAINING_ACTIVITY,
  setTrainingActivityDuration,
  setTrainingActivityIntensity,
} from "../../domain/trainings";
import ActivitySelector from "./ActivitySelector";
import DurationSelector from "./DurationSelector";
import IntensitySelector from "./IntensitySelector";
import { Button, Collapse } from "@blueprintjs/core";
import { useState } from "react";
import styled from "styled-components";

interface Props {
  activities: Activity[];
  getActivityById: (id: ActivityId) => Activity;
  onSave: (trainingActivity: TrainingActivity) => void;
}
function TrainingActivityAdder({ activities, getActivityById, onSave }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [trainingActivity, setTrainingActivity] = useState<TrainingActivity>(
    DRAFT_TRAINING_ACTIVITY
  );
  const selectedActivity: Activity | undefined =
    trainingActivity.activityId === DRAFT_TRAINING_ACTIVITY.activityId
      ? undefined
      : getActivityById(trainingActivity.activityId);

  function handleTrainingActivitySelection(activity: Activity): void {
    setTrainingActivity({ ...trainingActivity, activityId: activity.id });
  }

  function handleIntensityChange(intensity: Intensity): void {
    setTrainingActivity(setTrainingActivityIntensity(trainingActivity, intensity));
  }

  function handleDurationChange(duration: Duration): void {
    setTrainingActivity(setTrainingActivityDuration(trainingActivity, duration));
  }

  function handleSave(): void {
    onSave(trainingActivity);
    setTrainingActivity(DRAFT_TRAINING_ACTIVITY);
  }

  return (
    <Container>
      {isOpen === false && (
        <Button
          icon="add"
          intent="none"
          text="Add activity"
          onClick={() => setIsOpen(true)}
          fill
        />
      )}
      <Collapse isOpen={isOpen}>
        <InnerContainer>
          <ActivitySelector
            selectedActivity={selectedActivity}
            activities={activities}
            onSelect={handleTrainingActivitySelection}
          />

          <Row>
            <IntensitySelector
              selectedIntensity={trainingActivity.intensity}
              onSelect={handleIntensityChange}
            />

            <DurationSelector
              selectedDuration={trainingActivity.duration}
              onSelect={handleDurationChange}
            />
          </Row>

          <Footer>
            <Button intent="success" text="Add activity" onClick={handleSave} />
            <Button
              intent="none"
              text="Close without saving"
              onClick={() => setIsOpen(false)}
            />
          </Footer>
        </InnerContainer>
      </Collapse>
    </Container>
  );
}

export default TrainingActivityAdder;

const Container = styled.div`
  margin-top: 2rem;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
  /* margin-top: 1rem; */
`;

const Row = styled.div`
  display: flex;
  row-gap: 1rem;
  column-gap: 1rem;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
`;
