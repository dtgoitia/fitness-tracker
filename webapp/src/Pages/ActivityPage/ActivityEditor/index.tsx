import { useApp } from "../../..";
import { setActivityName, setActivityOtherNames } from "../../../lib/activities";
import { Activity, ActivityName } from "../../../lib/model";
import { notify } from "../../../notify";
import { CompletedActivityCalendar } from "./CompletedActivityCalendar";
import { Button, Label } from "@blueprintjs/core";
import { useState } from "react";
import { useParams } from "react-router-dom";

interface Props {
  activity: Activity;
}

export function ActivityEditor({ activity: originalActivity }: Props) {
  const app = useApp();

  const { activityId } = useParams();

  const [activity, setActivity] = useState<Activity>(originalActivity);

  function handleNameChange(event: any): void {
    const name: ActivityName = event.target.value;
    setActivity(setActivityName(activity, name));
  }

  function handleOtherNamesChange(event: any): void {
    const otherNames: ActivityName[] = event.target.value.split(",");
    setActivity(setActivityOtherNames(activity, otherNames));
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

      {activityId && <CompletedActivityCalendar activityId={activityId} />}

      <pre>{JSON.stringify(activity, null, 2)}</pre>
    </>
  );
}
