import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { ActivityManager } from "../../domain/activities";
import { CompletedActivityManager } from "../../domain/completedActivities";
import { isoDateFormatter, now, today } from "../../domain/datetimeUtils";
import {
  ActivityId,
  CompletedActivity,
  CompletedActivityId,
  Duration,
  Intensity,
} from "../../domain/model";
import { TrainingManager } from "../../domain/trainings";
import { findVersionHash } from "../../findVersion";
import BlueprintThemeProvider from "../../style/theme";
import AddCompletedActivity from "../HistoryExplorer/AddCompletedActivity";
import AddCompletedActivityFromTraining from "../HistoryExplorer/AddCompletedActivityFromTraining";
import Countdown from "../HistoryExplorer/Countdown";
import { DownloadJson } from "../HistoryExplorer/DownloadJson";
import HistoryView from "../HistoryExplorer/History";
import ReloadPage from "../HistoryExplorer/ReloadPage";
import { Shortcuts } from "./Shortcuts";
import { useEffect, useState } from "react";

interface Props {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
  trainingManager: TrainingManager;
}

export function RecordActivityPage({
  activityManager,
  completedActivityManager,
  trainingManager,
}: Props) {
  const [history, setHistory] = useState<CompletedActivity[]>([]);

  useEffect(() => {
    completedActivityManager.changes$.subscribe((_) => {
      const history = completedActivityManager.getAll();
      const todayOrLater = keepTodayOrAfter(history);
      setHistory(todayOrLater);
    });

    const history = completedActivityManager.getAll();
    const todayOrLater = keepTodayOrAfter(history);
    setHistory(todayOrLater);
  }, [activityManager, completedActivityManager]);

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

  function handleAddCompletedActivityFromShortcut(id: ActivityId): void {
    console.log(
      `App.handleAddCompletedActivityFromShortcut::Adding a new completed activity: id=${id}`
    );

    completedActivityManager.add({
      activityId: id,
      intensity: Intensity.medium,
      duration: Duration.medium,
      notes: "",
      date: now(),
    });
  }

  function handlePurge(): void {
    const earliestPresetvedDate = completedActivityManager.purge();
    alert(`Deleted everything before ${isoDateFormatter(earliestPresetvedDate)}`);
  }

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <Shortcuts
          activityManager={activityManager}
          onAddCompletedActivity={handleAddCompletedActivityFromShortcut}
        />
        <AddCompletedActivityFromTraining
          trainingManager={trainingManager}
          activityManager={activityManager}
          completedActivityManager={completedActivityManager}
        />
        <AddCompletedActivity
          activityManager={activityManager}
          completedActivityManager={completedActivityManager}
        />
        <Countdown />
        <HistoryView
          history={history}
          activityManager={activityManager}
          updateCompletedActivity={handleCompletedActivityUpdate}
          deleteCompletedActivity={handleCompletedActivityDeletion}
          duplicateCompletedActivities={handleCompletedActivityDuplication}
          deleteUntilDate={handleDeletionUntilDate}
          purge={handlePurge}
        />
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

function keepTodayOrAfter(all: CompletedActivity[]): CompletedActivity[] {
  const t = today().getTime();
  function isTodayOrAfter(date: Date): boolean {
    return t < date.getTime();
  }
  return all.filter((record) => isTodayOrAfter(record.date));
}
