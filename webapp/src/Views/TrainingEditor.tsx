import { EMPTY_STRING } from "../constants";
import { ActivityManager } from "../domain/activities";
import { todo } from "../domain/devex";
import { Training, TrainingActivity, TrainingName } from "../domain/model";
import { TrainingManager } from "../domain/trainings";
import ErrorMessage from "./ErrorMessage";
import { Button } from "@blueprintjs/core";
import { useState } from "react";

const NO_FAILURE = EMPTY_STRING;

interface Props {
  training: Training; // TODO: is it easier to pass the ID only?
  trainingManager: TrainingManager;
  activityManager: ActivityManager;
}

export default function TrainingEditor({
  training,
  trainingManager,
  activityManager,
}: Props) {
  const [name, setName] = useState<string>(training.name);
  const [trainingActivities, setTrainingActivities] = useState<TrainingActivity[]>(
    training.trainingActivities
  );
  const [failureReason, setFailureReason] = useState<string>(NO_FAILURE);

  // const canSubmit = name !== EMPTY_STRING;
  const canSubmit = true;

  function handleSubmit(event: any): void {
    event.preventDefault();

    if (!name || name === EMPTY_STRING) {
      console.warn(
        `AddTrainingForm.handleSubmit::Training name must be different to undefined,` +
          ` null, or an emptry string to create a new Training`
      );
      return;
    }

    trainingManager.update({ training }).match({
      Ok: () => {
        setFailureReason(NO_FAILURE);
        setName(EMPTY_STRING);
        setTrainingActivities([]);
      },
      Error: (reason) => {
        setFailureReason(reason);
      },
    });
  }

  function handleNameChange(event: any): void {
    setName(event.target.value);
  }

  function handleTrainingActivitiesChange(): void {}

  return (
    <form onSubmit={canSubmit ? handleSubmit : () => {}}>
      <p>Add a training:</p>
      <input
        type="text"
        className="bp4-input"
        value={name}
        placeholder="training name, e.g.: Leg rehab"
        onChange={handleNameChange}
      />
      <Button disabled={!canSubmit} intent="success" text="Add" type="submit" />
      {failureReason && (
        <ErrorMessage header="Failed to update Training" description={failureReason} />
      )}
    </form>
  );
}
