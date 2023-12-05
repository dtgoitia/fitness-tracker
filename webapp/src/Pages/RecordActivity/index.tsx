import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { ActivityManager } from "../../domain/activities";
import { CompletedActivityManager } from "../../domain/completedActivities";
import { isoDateFormatter, now, toDay } from "../../domain/datetimeUtils";
import {
  ActivityId,
  CompletedActivity,
  CompletedActivityId,
  Duration,
  Intensity,
} from "../../domain/model";
import { ShortcutManager } from "../../domain/shortcuts";
import { TrainingManager } from "../../domain/trainings";
import { findVersionHash } from "../../findVersion";
import BlueprintThemeProvider from "../../style/theme";
import AddCompletedActivity from "../HistoryExplorer/AddCompletedActivity";
import AddCompletedActivityFromTraining from "../HistoryExplorer/AddCompletedActivityFromTraining";
import Countdown from "../HistoryExplorer/Countdown";
import { DownloadJson } from "../HistoryExplorer/DownloadJson";
import { HistoryView } from "../HistoryExplorer/History";
import ReloadPage from "../HistoryExplorer/ReloadPage";
import { Shortcuts } from "./Shortcuts";
import { useEffect, useState } from "react";

// How many days worth of data should be shown in the RecordActivity page
// 0 - only today
// 1 - today + yesterday
// 2 - today + yesterday + day before
// ...
const DAY_AMOUNT_TO_SHOW = 2;

interface Props {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
  trainingManager: TrainingManager;
  shortcutManager: ShortcutManager;
}

export function RecordActivityPage({
  activityManager,
  completedActivityManager,
  trainingManager,
  shortcutManager,
}: Props) {
  const [history, setHistory] = useState<CompletedActivity[]>([]);

  useEffect(() => {
    const completedActivitySubscription = completedActivityManager.changes$.subscribe(
      (_) => {
        const history = completedActivityManager.getAll();
        const historySlice = keepLastNDays({ all: history, n: DAY_AMOUNT_TO_SHOW });
        setHistory(historySlice);
      }
    );

    const history = completedActivityManager.getAll();
    const historySlice = keepLastNDays({ all: history, n: DAY_AMOUNT_TO_SHOW });
    setHistory(historySlice);

    return () => {
      completedActivitySubscription.unsubscribe();
    };
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
      `${RecordActivityPage}.${handleAddCompletedActivityFromShortcut}` +
        `::Adding a new completed activity: id=${id}`
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
          shortcutManager={shortcutManager}
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

function keepLastNDays({
  all,
  n,
}: {
  all: CompletedActivity[];
  n: number;
}): CompletedActivity[] {
  const _today = toDay(now()).getTime();

  const oneDay = 24 * 60 * 60 * 1000;

  const t = _today - n * oneDay; // earliest desired timestamp

  return all.filter((completedActivity) => t <= completedActivity.date.getTime());
}
