import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { ActivityManager } from "../../domain/activities";
import { CompletedActivityManager } from "../../domain/completedActivities";
import { Activity, CompletedActivity, CompletedActivityId } from "../../domain/model";
import Paths from "../../routes";
import BlueprintThemeProvider from "../../style/theme";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Props {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
}

export function CompletedActivityEditor({
  activityManager,
  completedActivityManager,
}: Props) {
  const { completedActivityId } = useParams();
  const navigate = useNavigate();

  const [completedActivity, setCompletedActivity] = useState<
    CompletedActivity | undefined
  >();
  const [activity, setActivity] = useState<Activity | undefined>();

  useEffect(() => {
    if (completedActivityId === undefined) {
      navigate(Paths.notFound);
      return;
    }

    const completedActivity = completedActivityManager.get(completedActivityId);
    if (completedActivity === undefined) {
      navigate(Paths.root);
      return;
    }

    setCompletedActivity(completedActivity);
  }, [completedActivityManager, completedActivityId, navigate]);

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <p>
          ID:&nbsp;&nbsp;&nbsp;<code>{completedActivityId}</code>
        </p>

        <pre>{JSON.stringify(completedActivity, null, 2)}</pre>
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}
