import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { ActivityManager } from "../../domain/activities";
import { CompletedActivityManager } from "../../domain/completedActivities";
import { isoDateFormatter } from "../../domain/datetimeUtils";
import { ActivityName, CompletedActivity, CompletedActivityId } from "../../domain/model";
import { TrainingManager } from "../../domain/trainings";
import { findVersionHash } from "../../findVersion";
import BlueprintThemeProvider from "../../style/theme";
import AddActivity from "./AddActivity";
import AddCompletedActivity from "./AddCompletedActivity";
import AddCompletedActivityFromTraining from "./AddCompletedActivityFromTraining";
import { DownloadJson } from "./DownloadJson";
import HistoryView from "./History";
import ReloadPage from "./ReloadPage";
import { useEffect, useState } from "react";

interface Props {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
  trainingManager: TrainingManager;
}

function HistoryPage({
  activityManager,
  completedActivityManager,
  trainingManager,
}: Props) {
  const [history, setHistory] = useState<CompletedActivity[]>([]);

  useEffect(() => {
    completedActivityManager.changes$.subscribe((_) => {
      const history = completedActivityManager.getAll();
      setHistory(history);
    });

    const history = completedActivityManager.getAll();
    setHistory(history);
  }, [activityManager, completedActivityManager]);

  const handleAddNewActivity = (name: ActivityName, otherNames: ActivityName[]) => {
    console.log(`App.handleAddNewActivity::Adding a new activity: ${name}`);
    activityManager.add({ name, otherNames });
  };

  function handleCompletedActivityUpdate(updated: CompletedActivity): void {
    completedActivityManager.update({ completedActivity: updated });
  }

  function handleCompletedActivityDeletion(id: CompletedActivityId): void {
    completedActivityManager.delete({ id });
  }

  function handleCompletedActivityDuplication(ids: Set<CompletedActivityId>): void {
    completedActivityManager.duplicate({ ids });
  }

  function handleDeletionUntilDate(date: Date): void {
    completedActivityManager.deleteUntil({ date });
  }

  function handlePurge(): void {
    const earliestPresetvedDate = completedActivityManager.purge();
    alert(`Deleted everything before ${isoDateFormatter(earliestPresetvedDate)}`);
  }

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <AddCompletedActivityFromTraining
          trainingManager={trainingManager}
          activityManager={activityManager}
          completedActivityManager={completedActivityManager}
        />
        <AddCompletedActivity
          activityManager={activityManager}
          completedActivityManager={completedActivityManager}
        />
        <HistoryView
          history={history}
          activityManager={activityManager}
          updateCompletedActivity={handleCompletedActivityUpdate}
          deleteCompletedActivity={handleCompletedActivityDeletion}
          duplicateCompletedActivities={handleCompletedActivityDuplication}
          deleteUntilDate={handleDeletionUntilDate}
          purge={handlePurge}
        />
        <AddActivity add={handleAddNewActivity} />
        <DownloadJson
          activityManager={activityManager}
          completedActivityManager={completedActivityManager}
          trainingManager={trainingManager}
        />
        <ReloadPage />
        <p>{findVersionHash()}</p>
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}

export default HistoryPage;
