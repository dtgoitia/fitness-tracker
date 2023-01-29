import {
  Activity,
  ActivityId,
  Duration,
  Intensity,
  TrainingActivity,
} from "../../domain/model";
import {
  setTrainingActivityActivity,
  setTrainingActivityDuration,
  setTrainingActivityIntensity,
} from "../../domain/trainings";
import ActivitySelector from "./ActivitySelector";
import DurationSelector from "./DurationSelector";
import IntensitySelector from "./IntensitySelector";
import { Button } from "@blueprintjs/core";
import styled from "styled-components";

interface Props {
  trainingActivity: TrainingActivity;
  activities: Activity[];
  getActivityById: (id: ActivityId) => Activity;
  onChange: (trainingActivity: TrainingActivity) => void;
  onDelete: () => void;
}
function TrainingActivityEditor({
  trainingActivity,
  activities,
  getActivityById,
  onChange,
  onDelete,
}: Props) {
  const selectedActivity: Activity = getActivityById(trainingActivity.activityId);

  function handleTrainingActivitySelection(activity: Activity): void {
    onChange(setTrainingActivityActivity(trainingActivity, activity.id));
  }

  function handleIntensityChange(intensity: Intensity): void {
    onChange(setTrainingActivityIntensity(trainingActivity, intensity));
  }

  function handleDurationChange(duration: Duration): void {
    onChange(setTrainingActivityDuration(trainingActivity, duration));
  }

  return (
    <Container>
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

        <Button icon="trash" intent="none" minimal onClick={() => onDelete()} />
      </Row>
    </Container>
  );
}

export default TrainingActivityEditor;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
  margin-bottom: 1rem;
`;

const Row = styled.div`
  display: flex;
  row-gap: 1rem;
  column-gap: 1rem;
  flex-wrap: wrap;
  justify-content: space-between;
`;
