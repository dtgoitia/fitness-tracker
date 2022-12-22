import { EMPTY_STRING } from "../constants";
import { ActivityManager } from "../domain/activities";
import { todo } from "../domain/devex";
import { Training, TrainingActivity, TrainingName } from "../domain/model";
import { TrainingManager } from "../domain/trainings";
import { Button } from "@blueprintjs/core";
import { useState } from "react";

interface Props {
  activityManager: ActivityManager;
  onCreate: ({ name, trainingActivities }: Omit<Training, "id">) => void;
}

export default function AddTrainingForm({ activityManager, onCreate }: Props) {
  const [name, setName] = useState<string>(EMPTY_STRING);
  const [trainingActivities, setTrainingActivities] = useState<TrainingActivity[]>([]);

  const canSubmit = name !== EMPTY_STRING;

  function handleSubmit(event: any): void {
    event.preventDefault();

    if (!name || name === EMPTY_STRING) {
      console.warn(
        `AddTrainingForm.handleSubmit::Training name must be different to undefined,` +
          ` null, or an emptry string to create a new Training`
      );
      return;
    }

    onCreate({ name, trainingActivities });
    setName(EMPTY_STRING);
    setTrainingActivities([]);
  }

  function handleNameChange(event: any) {
    setName(event.target.value);
  }

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
    </form>
  );
}
