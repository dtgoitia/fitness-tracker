import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { Training } from "../../domain/model";
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

  if (trainings.length === 0) {
    if (isEditModeOn) setIsEditModeOn(false);

    return (
      <BlueprintThemeProvider>
        <CenteredPage>
          <NavBar />
          <h1>Training explorer</h1>
          <p>There no trainings :)</p>
        </CenteredPage>
      </BlueprintThemeProvider>
    );
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
          readOnly
        />

        {trainings.map((training) => (
          <OpenTrainingEditor training={training} />
        ))}

        <Link to={CREATE_TRAINING_PATH}>
          <Button intent="success" text="Create training" />
        </Link>
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}

export default TrainingExplorer;

const LinkContainer = styled.div`
  margin: 1rem 0;
`;

function OpenTrainingEditor({ training }: { training: Training }) {
  const path = `${Paths.trainings}/${training.id}`;

  return (
    <LinkContainer>
      <Link to={path}>{training.name}</Link>
    </LinkContainer>
  );
}
