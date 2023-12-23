import { useApp } from "../../..";
import {
  setActivityName,
  setActivityOtherNames,
  addTrainableToActivity,
  removeTrainableFromActivity,
} from "../../../lib/domain/activities";
import { Activity, ActivityName, TrainableId } from "../../../lib/domain/model";
import { notify } from "../../../notify";
import { ActivityTrainableEditor } from "./ActivityTrainableEditor";
import { CompletedActivityCalendar } from "./CompletedActivityCalendar";
import { Button, Label } from "@blueprintjs/core";
import { useState } from "react";

interface Props {
  activity: Activity;
}

export function ActivityEditor({ activity: originalActivity }: Props) {
  const app = useApp();

  const [activity, setActivity] = useState<Activity>(originalActivity);

  function handleNameChange(event: any): void {
    const name: ActivityName = event.target.value;
    setActivity(setActivityName(activity, name));
  }

  function handleOtherNamesChange(event: any): void {
    const otherNames: ActivityName[] = event.target.value.split(",");
    setActivity(setActivityOtherNames(activity, otherNames));
  }

  function handleAddTrainable({ id }: { id: TrainableId }): void {
    setActivity(addTrainableToActivity(activity, id));
  }

  function handleRemoveTrainable({ id: toRemove }: { id: TrainableId }): void {
    setActivity(removeTrainableFromActivity(activity, toRemove));
  }

  function handleSave(): void {
    app.activityManager.update({ activity }).match({
      ok: () => {
        // Show pop up
        notify({
          message: `Activity "${activity.name}" successfully saved`,
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

  return (
    <>
      <p>
        activity ID:&nbsp;&nbsp;&nbsp;<code>{activity.id}</code>
      </p>

      <Label>
        name:
        <input
          type="text"
          className={"bp4-input"}
          value={activity.name}
          placeholder="Name"
          onChange={handleNameChange}
        />
      </Label>

      <Label>
        other names:
        <input
          type="text"
          className={"bp4-input"}
          value={activity.otherNames.join(",")}
          placeholder="Other names"
          onChange={handleOtherNamesChange}
        />
      </Label>

      <Button intent="success" text="Save" onClick={handleSave} />

      <ActivityTrainableEditor
        activity={activity}
        onAdd={handleAddTrainable}
        onRemove={handleRemoveTrainable}
      />

      {activity && <CompletedActivityCalendar activityId={activity.id} />}

      <pre>{JSON.stringify(activity, null, 2)}</pre>
    </>
  );
}
