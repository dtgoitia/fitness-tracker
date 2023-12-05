import { useApp } from "../..";
import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { Activity, ActivityId } from "../../lib/model";
import Paths from "../../routes";
import BlueprintThemeProvider from "../../style/theme";
import { ActivityEditor } from "./ActivityEditor";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function ActivityPage() {
  const app = useApp();

  // The app router should prevent you from having an undefined URL
  // parameter here
  const { activityId: maybeActivityId } = useParams();
  const activityId = maybeActivityId as ActivityId;

  const navigate = useNavigate();

  const [activity, setActivity] = useState<Activity | undefined>();
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  useEffect(() => {
    function _render(): void {
      const activity = app.activityManager.get(activityId);
      setActivity(activity);
    }

    const subscription = app.activityManager.changes$.subscribe((change) => {
      if (change.kind === "activity-manager-initialized") {
        setDataLoaded(true);
      }
      _render();
    });

    _render();

    return () => {
      subscription.unsubscribe();
    };
  }, [app, activityId, activity, navigate]);

  if (activity === undefined) {
    if (dataLoaded) {
      navigate(Paths.activities);
    }

    return (
      <BlueprintThemeProvider>
        <CenteredPage>
          <NavBar />
          Loading task data...
        </CenteredPage>
      </BlueprintThemeProvider>
    );
  }

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <ActivityEditor activity={activity} />
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}
