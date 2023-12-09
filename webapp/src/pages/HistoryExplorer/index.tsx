import { useApp } from "../..";
import { BundleVersion } from "../../components/BundleVersion";
import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { isoDateFormatter } from "../../lib/datetimeUtils";
import {
  ActivityName,
  CompletedActivity,
  CompletedActivityId,
} from "../../lib/domain/model";
import BlueprintThemeProvider from "../../style/theme";
import AddActivity from "./AddActivity";
import AddCompletedActivity from "./AddCompletedActivity";
import AddCompletedActivityFromTraining from "./AddCompletedActivityFromTraining";
import { DownloadJson } from "./DownloadJson";
import { HistoryView } from "./History";
import ReloadPage from "./ReloadPage";
import { useEffect, useState } from "react";

function HistoryPage() {
  const app = useApp();

  const [history, setHistory] = useState<CompletedActivity[]>([]);

  useEffect(() => {
    app.completedActivityManager.changes$.subscribe((_) => {
      const history = app.completedActivityManager.getAll();
      setHistory(history);
    });

    const history = app.completedActivityManager.getAll();
    setHistory(history);
  }, [app]);

  const handleAddNewActivity = (name: ActivityName, otherNames: ActivityName[]) => {
    console.log(`App.handleAddNewActivity::Adding a new activity: ${name}`);
    app.activityManager.add({ name, otherNames });
  };

  function handleCompletedActivityUpdate(updated: CompletedActivity): void {
    app.completedActivityManager.update({ completedActivity: updated });
  }

  function handleCompletedActivityDeletion(id: CompletedActivityId): void {
    app.completedActivityManager.delete({ id });
  }

  function handleCompletedActivityDuplication(ids: Set<CompletedActivityId>): void {
    app.completedActivityManager.duplicate({ ids });
  }

  function handleDeletionUntilDate(date: Date): void {
    app.completedActivityManager.deleteUntil({ date });
  }

  function handlePurge(): void {
    const earliestPresetvedDate = app.completedActivityManager.purge();
    alert(`Deleted everything before ${isoDateFormatter(earliestPresetvedDate)}`);
  }

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <AddCompletedActivityFromTraining />
        <AddCompletedActivity />
        <HistoryView
          history={history}
          updateCompletedActivity={handleCompletedActivityUpdate}
          deleteCompletedActivity={handleCompletedActivityDeletion}
          duplicateCompletedActivities={handleCompletedActivityDuplication}
          deleteUntilDate={handleDeletionUntilDate}
          purge={handlePurge}
        />
        <AddActivity add={handleAddNewActivity} />
        <DownloadJson />
        <ReloadPage />
        <BundleVersion />
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}

export default HistoryPage;
