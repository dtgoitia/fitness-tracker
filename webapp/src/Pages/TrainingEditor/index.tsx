import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { ActivityManager } from "../../domain/activities";
import { unreachable } from "../../domain/devex";
import {
  Activity,
  ActivityId,
  Training,
  TrainingActivity,
  TrainingName,
} from "../../domain/model";
import {
  addActivityToTraining,
  deleteTrainingActivity,
  DRAFT_TRAINING,
  moveTrainingActivityDown,
  moveTrainingActivityUp,
  setTrainingName,
  TrainingAdded,
  TrainingManager,
  trainingsAreDifferent,
  updateTrainingActivity,
} from "../../domain/trainings";
import { notify } from "../../notify";
import Paths from "../../routes";
import BlueprintThemeProvider from "../../style/theme";
import TrainingActivityAdder from "./TrainingActivityAdder";
import TrainingActivityEditor from "./TrainingActivityEditor";
import { Button, Card, Label } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { filter } from "rxjs";
import styled from "styled-components";

interface Props {
  trainingManager: TrainingManager;
  activityManager: ActivityManager;
}

function TrainingEditor({ trainingManager, activityManager }: Props) {
  const { trainingId } = useParams();

  const navigate = useNavigate();

  const [originalTraining, setOriginalTraining] = useState<Training>(DRAFT_TRAINING);
  const [training, setTraining] = useState<Training>(DRAFT_TRAINING);

  const [activities, setActivities] = useState<Activity[]>([]);

  // dirty = form has unsaved changes
  const [formIsDirty, setFormIsDirty] = useState<boolean>(false);

  const inCreationMode = trainingId === DRAFT_TRAINING.id;

  useEffect(() => {
    if (trainingId === undefined || inCreationMode) {
      return;
    }

    const training = trainingManager.get(trainingId);
    if (training === undefined) {
      navigate(Paths.trainings);
      return;
    }

    setOriginalTraining(training);
    setTraining(training);
  }, [trainingManager, inCreationMode, navigate, trainingId]);

  useEffect(() => {
    setActivities(activityManager.getAll() || []);
  }, [activityManager]);

  function handleNameChange(event: any): void {
    const name: TrainingName = event.target.value;
    const updatedTraining = setTrainingName(training, name);
    setTraining(updatedTraining);
    recomputeDirtyStatus(updatedTraining);
  }

  function getActivityById(id: ActivityId): Activity {
    const activity = activityManager.get(id);
    if (activity === undefined) {
      throw unreachable(
        `TrainingEditor.getActivityById::Expected to find Activity ${id} but` +
          ` ActivityManager returned undefined`
      );
    }

    return activity;
  }

  function handleTrainingActivityAdded(trainingActivity: TrainingActivity): void {
    const updatedTraining = addActivityToTraining(training, trainingActivity);
    setTraining(updatedTraining);
    recomputeDirtyStatus(updatedTraining);
  }

  function handleTrainingActivityUpdated(
    trainingActivity: TrainingActivity,
    index: number
  ): void {
    const updatedTraining = updateTrainingActivity(training, trainingActivity, index);
    setTraining(updatedTraining);
    recomputeDirtyStatus(updatedTraining);
  }

  function handleTrainingActivityDeleted(index: number): void {
    const updatedTraining = deleteTrainingActivity(training, index);
    setTraining(updatedTraining);
    recomputeDirtyStatus(updatedTraining);
  }

  /**
   * @param index index of the TrainingActivity to move up
   */
  function handleTrainingActivityMovedUp(index: number): void {
    const updatedTraining = moveTrainingActivityUp(training, index);
    setTraining(updatedTraining);
    recomputeDirtyStatus(updatedTraining);
  }

  /**
   * @param index index of the TrainingActivity to move down
   */
  function handleTrainingActivityMovedDown(index: number): void {
    const updatedTraining = moveTrainingActivityDown(training, index);
    setTraining(updatedTraining);
    recomputeDirtyStatus(updatedTraining);
  }

  function handleSave(): void {
    if (inCreationMode) {
      trainingManager.changes$
        .pipe(filter((change) => change instanceof TrainingAdded))
        .subscribe((added) => {
          navigate(`${Paths.trainings}/${added.id}`);
          notify({
            message: `Training "${training.name}" successfully saved`,
            intent: "success",
          });
        });
      trainingManager.add({ name: training.name, activities: training.activities });
    } else {
      trainingManager.update({ training }).match({
        ok: (x) => {
          const updated = x as Training;
          // Show pop up
          notify({
            message: `Training "${updated.name}" successfully saved`,
            intent: "success",
          });
          setOriginalTraining(updated);
          setAllChangesAreSaved();
        },
        err: (reason) => {
          notify({
            message: `ERROR: ${reason}`,
            intent: "danger",
          });
          console.error(reason);
        },
      });
    }
  }

  function recomputeDirtyStatus(updatedTraining: Training): void {
    trainingsAreDifferent(originalTraining, updatedTraining)
      ? setFormIsDirty(true)
      : setAllChangesAreSaved();
  }

  function setAllChangesAreSaved(): void {
    setFormIsDirty(false);
  }

  function handleDiscardChanges(): void {
    setTraining(originalTraining);
    setAllChangesAreSaved();
  }

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <h2>
          Training ID:&nbsp;&nbsp;&nbsp;<code>{training.id}</code>
        </h2>

        <Label>
          name:
          <input
            type="text"
            className={"bp4-input"}
            value={training.name}
            placeholder="Name"
            onChange={handleNameChange}
          />
        </Label>

        <ActivitiesSection>
          <Card>
            {training.activities.map((activity, index) => (
              <TrainingActivityEditor
                key={`training-activity-${activity.activityId}-${index}`}
                trainingActivity={activity}
                activities={activities}
                getActivityById={getActivityById}
                onChange={(updatedTrainingActivity) =>
                  handleTrainingActivityUpdated(updatedTrainingActivity, index)
                }
                onMoveUp={() => handleTrainingActivityMovedUp(index)}
                onMoveDown={() => handleTrainingActivityMovedDown(index)}
                onDelete={() => handleTrainingActivityDeleted(index)}
              />
            ))}

            <TrainingActivityAdder
              activities={activities}
              getActivityById={getActivityById}
              onSave={handleTrainingActivityAdded}
            />
          </Card>
        </ActivitiesSection>

        <Button
          intent="success"
          text="Save"
          onClick={handleSave}
          disabled={!formIsDirty}
          large
        />

        {formIsDirty && (
          <Button
            intent="none"
            text="Discard changes"
            onClick={handleDiscardChanges}
            large
          />
        )}

        <pre>{JSON.stringify(training, null, 2)}</pre>
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}

export default TrainingEditor;

const ActivitiesSection = styled.div`
  margin-bottom: 1rem;
`;
