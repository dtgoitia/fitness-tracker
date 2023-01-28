import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { Training, TrainingId } from "../../domain/model";
import { DRAFT_TRAINING, TrainingManager } from "../../domain/trainings";
import Paths from "../../routes";
import BlueprintThemeProvider from "../../style/theme";
import { Button, Switch } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const CREATE_TRAINING_PATH = `${Paths.trainings}/${DRAFT_TRAINING.id}`;

interface Props {
  trainingManager: TrainingManager;
}
function TrainingExplorer({ trainingManager }: Props) {
  // This path has a known special ID that will only be used to create Trainings
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isEditModeOn, setIsEditModeOn] = useState<boolean>(false);
  const [selection, setSelected] = useState<Set<TrainingId>>(new Set([]));

  useEffect(() => {
    const subscription = trainingManager.changes$.subscribe((_) => {
      setTrainings(trainingManager.getAll());
    });
    setTrainings(trainingManager.getAll());
    return () => {
      subscription.unsubscribe();
    };
  }, [trainingManager]);

  function toggleEditMode(): void {
    setIsEditModeOn(!isEditModeOn);
  }

  function unselectAll(): void {
    setSelected(new Set<TrainingId>([]));
  }

  function select(id: TrainingId): Set<TrainingId> {
    // the point here is that you want to avoid mutating the existing set
    return new Set([...selection, id]);
  }

  function unselect(id: TrainingId): Set<TrainingId> {
    // the point here is that you want to avoid mutating the existing set
    return new Set([...selection].filter((selectedId) => selectedId !== id));
  }

  function handleToggleSelect(id: TrainingId): void {
    const newSelection = selection.has(id) ? unselect(id) : select(id);
    setSelected(newSelection);
  }

  function handleDeleteSelected(): void {
    for (const trainingId of selection) {
      trainingManager.delete({ id: trainingId });
    }
    unselectAll();
  }

  if (isEditModeOn && trainings.length === 0) {
    setIsEditModeOn(false);
  }

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <h1>Training explorer</h1>
        <Switch
          label={"edit mode"}
          checked={isEditModeOn}
          onClick={toggleEditMode}
          disabled={trainings.length === 0}
          readOnly
        />

        {isEditModeOn && selection.size > 0 && (
          <Button
            intent="success"
            text={`Delete ${selection.size} trainings`}
            icon="trash"
            onClick={() => handleDeleteSelected()}
            large
          />
        )}

        {trainings.map((training) => {
          if (isEditModeOn) {
            return (
              <DeletableTrainingItem onClick={() => handleToggleSelect(training.id)}>
                <Checkbox>
                  <input type="checkbox" checked={selection.has(training.id)} />
                </Checkbox>
                <div>{training.name}</div>
              </DeletableTrainingItem>
            );
          } else {
            const path = `${Paths.trainings}/${training.id}`;
            return (
              <TrainingItem>
                <Link to={path}>{training.name}</Link>
              </TrainingItem>
            );
          }
        })}

        {trainings.length === 0 && <p>There no trainings :)</p>}

        <Link to={CREATE_TRAINING_PATH}>
          <Button intent="success" text="Create training" large />
        </Link>
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}

export default TrainingExplorer;

const TrainingItem = styled.div`
  margin: 1rem 0;
`;

const DeletableTrainingItem = styled(TrainingItem)`
  display: flex;
`;
const Checkbox = styled.div`
  margin: 0 1rem;
`;
