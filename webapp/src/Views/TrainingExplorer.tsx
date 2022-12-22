import { ActivityManager } from "../domain/activities";
import { Training, TrainingId } from "../domain/model";
import { TrainingManager } from "../domain/trainings";
import AddTrainingForm from "./AddTraining";
import TrainingEditor from "./TrainingEditor";
import { Button } from "@blueprintjs/core";
import { useEffect, useState } from "react";

interface Props {
  activityManager: ActivityManager;
  trainingManager: TrainingManager;
}

export default function TrainingExplorer({ activityManager, trainingManager }: Props) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [trainingUnderEdition, setTrainingUnderEdition] = useState<
    TrainingId | undefined
  >(undefined);

  useEffect(() => {
    trainingManager.changes$.subscribe((_) => {
      setTrainings(trainingManager.getAll());
    });

    setTrainings(trainingManager.getAll());
  }, []);

  function handleTrainingCreation({
    name,
    trainingActivities,
  }: Omit<Training, "id">): void {
    trainingManager.add({ name, trainingActivities });
  }

  function handleTrainingUpdate(updatedTraining: Training): void {
    trainingManager.update({ training: updatedTraining });
  }

  function handleTrainingDeletion(id: TrainingId): void {
    trainingManager.delete({ id });
  }

  return (
    <div>
      <h3>TrainingExplorer</h3>
      {trainings.length === 0 ? (
        <p>You have no trainings yet, fancy creating one?</p>
      ) : (
        trainings.map((training) => {
          if (training.id === trainingUnderEdition) {
            return (
              <TrainingEditor
                key={training.id}
                training={training}
                trainingManager={trainingManager}
                activityManager={activityManager}
              />
            );
          } else {
            return (
              <TrainingPreview
                key={training.id}
                training={training}
                onSelection={setTrainingUnderEdition}
                onDelete={handleTrainingDeletion}
              />
            );
          }
        })
      )}

      <AddTrainingForm
        activityManager={activityManager}
        onCreate={handleTrainingCreation}
      />
    </div>
  );
}

interface TrainingPreviewProps {
  training: Training;
  onSelection: (id: TrainingId) => void;
  onDelete: (id: TrainingId) => void;
}

function TrainingPreview({ training, onSelection, onDelete }: TrainingPreviewProps) {
  return (
    <li>
      <span onClick={() => onSelection(training.id)}>{training.name}</span>
      <Button
        onClick={() => onDelete(training.id)}
        className="bp4-button bp4-minimal"
        icon="trash"
      />
    </li>
  );
}
