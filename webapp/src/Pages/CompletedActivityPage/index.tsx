import { useApp } from "../..";
import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import {
  CompletedActivity as CActivity,
  CompletedActivityId as CActivityId,
} from "../../lib/model";
import BlueprintThemeProvider from "../../style/theme";
import { CompletedActivityEditor } from "./CompletedActivityEditor";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function CompletedActivityPage() {
  const app = useApp();

  // The app router should prevent you from having an undefined URL
  // parameter here
  const { completedActivityId } = useParams();
  const cActivityId = completedActivityId as CActivityId;

  const navigate = useNavigate();

  const [cActivity, setCActivity] = useState<CActivity | undefined>();

  useEffect(() => {
    function _rerender(): void {
      const completed = app.completedActivityManager.get(cActivityId);
      setCActivity(completed);
    }
    const subscription = app.completedActivityManager.changes$.subscribe((_) => {
      _rerender();
    });

    _rerender();

    return () => {
      subscription.unsubscribe();
    };
  }, [app, cActivityId, navigate]);

  if (cActivity === undefined) {
    return (
      <BlueprintThemeProvider>
        <CenteredPage>
          <NavBar />
          Loading completed task data...
        </CenteredPage>
      </BlueprintThemeProvider>
    );
  }

  function handleCompletedActivityUpdate(completedActivity: CActivity): void {
    app.completedActivityManager.update({ completedActivity });
  }

  function handleCompletedActivityDelete(id: CActivityId): void {
    app.completedActivityManager.delete({ id });
  }

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <CompletedActivityEditor
          completedActivity={cActivity}
          onUpdate={handleCompletedActivityUpdate}
          onDelete={handleCompletedActivityDelete}
        />
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}
