import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { Training, TrainingName } from "../../domain/model";
import {
  DRAFT_TRAINING,
  setTrainingName,
  TrainingAdded,
  TrainingManager,
} from "../../domain/trainings";
import { notify } from "../../notify";
import Paths from "../../routes";
import BlueprintThemeProvider from "../../style/theme";
import { Button, Label } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { filter } from "rxjs";

interface Props {
  trainingManager: TrainingManager;
}

function TrainingEditor({ trainingManager }: Props) {
  const { trainingId } = useParams();

  const navigate = useNavigate();

  const [training, setTraining] = useState<Training>(DRAFT_TRAINING);

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

    setTraining(training);
  }, [trainingManager, inCreationMode, navigate, trainingId]);

  function handleNameChange(event: any): void {
    const name: TrainingName = event.target.value;
    setTraining(setTrainingName(training, name));
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
        ok: () => {
          // Show pop up
          notify({
            message: `Training "${training.name}" successfully saved`,
            intent: "success",
          });
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

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <h1>Training editor</h1>

        <p>
          training ID:&nbsp;&nbsp;&nbsp;<code>{training.id}</code>
        </p>

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
        <Button intent="success" text="Save" onClick={handleSave} />
        <pre>{JSON.stringify(training, null, 2)}</pre>
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}

export default TrainingEditor;
