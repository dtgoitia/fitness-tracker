import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { ActivityManager } from "../../domain/activities";
import {
  CompletedActivityDeleted,
  CompletedActivityManager,
  CompletedActivityUpdated,
} from "../../domain/completedActivities";
import {
  CompletedActivity as CActivity,
  CompletedActivityId as CActivityId,
} from "../../domain/model";
import Paths from "../../routes";
import BlueprintThemeProvider from "../../style/theme";
import { CompletedActivityEditor } from "./CompletedActivityEditor";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Props {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
}

export function CompletedActivityPage({
  activityManager,
  completedActivityManager,
}: Props) {
  const { completedActivityId } = useParams();
  const cActivityId = completedActivityId as CActivityId;

  const navigate = useNavigate();

  const [cActivity, setCActivity] = useState<CActivity | undefined>();

  useEffect(() => {
    function _rerender(): void {
      const completed = completedActivityManager.get(cActivityId);
      setCActivity(completed);
    }
    const subscription = completedActivityManager.changes$.subscribe((change) => {
      if (
        change instanceof CompletedActivityUpdated ||
        change instanceof CompletedActivityDeleted
      ) {
        _rerender();
      }
    });

    _rerender();

    return () => {
      subscription.unsubscribe();
    };
  }, [completedActivityManager, cActivityId, navigate]);

  if (cActivity === undefined) {
    navigate(Paths.root);
    return null;
  }

  function handleCompletedActivityUpdate(completedActivity: CActivity): void {
    completedActivityManager.update({ completedActivity });
  }

  function handleCompletedActivityDelete(id: CActivityId): void {
    completedActivityManager.delete({ id });
  }

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <CompletedActivityEditor
          completedActivity={cActivity}
          onUpdate={handleCompletedActivityUpdate}
          onDelete={handleCompletedActivityDelete}
          activityManager={activityManager}
          completedActivityManager={completedActivityManager}
        />
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}
