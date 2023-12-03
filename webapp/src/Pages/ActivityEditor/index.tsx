import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import {
  ActivityManager,
  ACTIVITY_PREFIX,
  setActivityName,
  setActivityOtherNames,
} from "../../domain/activities";
import { CompletedActivityManager } from "../../domain/completedActivities";
import { now } from "../../domain/datetimeUtils";
import { Activity, ActivityName } from "../../domain/model";
import { notify } from "../../notify";
import Paths from "../../routes";
import BlueprintThemeProvider from "../../style/theme";
import { CompletedActivityCalendar } from "./CompletedActivityCalendar";
import { Button, Label } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const DRAFT_ACTIVITY: Activity = {
  id: `${ACTIVITY_PREFIX}_DRAFT`,
  name: "",
  otherNames: [],
  lastModified: now(),
};

interface Props {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
}

function ActivityEditor({ activityManager, completedActivityManager }: Props) {
  const { activityId } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState<Activity>(DRAFT_ACTIVITY);

  useEffect(() => {
    if (activityId === undefined) {
      return;
    }

    const activity = activityManager.get(activityId);
    if (activity === undefined) {
      navigate(Paths.activities);
      return;
    }

    setActivity(activity);
  }, [activityManager, activityId, navigate]);

  function handleNameChange(event: any): void {
    const name: ActivityName = event.target.value;
    setActivity(setActivityName(activity, name));
  }

  function handleOtherNamesChange(event: any): void {
    const otherNames: ActivityName[] = event.target.value.split(",");
    setActivity(setActivityOtherNames(activity, otherNames));
  }

  function handleSave(): void {
    activityManager.update({ activity }).match({
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
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
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
        {activityId && (
          <CompletedActivityCalendar
            activityId={activityId}
            completedActivityManager={completedActivityManager}
          />
        )}
        <pre>{JSON.stringify(activity, null, 2)}</pre>
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}

export default ActivityEditor;
