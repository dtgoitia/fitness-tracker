import { useApp } from "../..";
import { BundleVersion } from "../../components/BundleVersion";
import CenteredPage from "../../components/CenteredPage";
import { ExportData } from "../../components/ExportData";
import NavBar from "../../components/NavBar";
import { RestoreData } from "../../components/RestoreData";
import { isoDateFormatter, now, toDay } from "../../lib/datetimeUtils";
import {
  ActivityId,
  CompletedActivity,
  CompletedActivityId,
  Duration,
  Intensity,
} from "../../lib/domain/model";
import BlueprintThemeProvider from "../../style/theme";
import AddCompletedActivity from "../HistoryExplorer/AddCompletedActivity";
import AddCompletedActivityFromTraining from "../HistoryExplorer/AddCompletedActivityFromTraining";
import Countdown from "../HistoryExplorer/Countdown";
import { HistoryView } from "../HistoryExplorer/History";
import ReloadPage from "../HistoryExplorer/ReloadPage";
import { Shortcuts } from "./Shortcuts";
import { useEffect, useState } from "react";

// How many days worth of data should be shown in the RecordActivity page
// 0 - only today
// 1 - today + yesterday
// 2 - today + yesterday + day before
// ...
const DAY_AMOUNT_TO_SHOW = 7;

export function RecordActivityPage() {
  const app = useApp();

  const [history, setHistory] = useState<CompletedActivity[]>([]);

  useEffect(() => {
    const completedActivitySubscription = app.completedActivityManager.changes$.subscribe(
      (_) => {
        const history = app.completedActivityManager.getAll({
          order: "reverse-chronological",
        });
        const historySlice = keepLastNDays({ all: history, n: DAY_AMOUNT_TO_SHOW });
        setHistory(historySlice);
      }
    );

    const history = app.completedActivityManager.getAll({
      order: "reverse-chronological",
    });
    const historySlice = keepLastNDays({ all: history, n: DAY_AMOUNT_TO_SHOW });
    setHistory(historySlice);

    return () => {
      completedActivitySubscription.unsubscribe();
    };
  }, [app]);

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

  function handleAddCompletedActivityFromShortcut(id: ActivityId): void {
    console.log(
      `${RecordActivityPage}.${handleAddCompletedActivityFromShortcut}` +
        `::Adding a new completed activity: id=${id}`
    );

    app.completedActivityManager.add({
      activityId: id,
      intensity: Intensity.medium,
      duration: Duration.medium,
      notes: "",
      date: now(),
    });
  }

  function handlePurge(): void {
    const earliestPresetvedDate = app.completedActivityManager.purge();
    alert(`Deleted everything before ${isoDateFormatter(earliestPresetvedDate)}`);
  }

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <Shortcuts onAddCompletedActivity={handleAddCompletedActivityFromShortcut} />
        <AddCompletedActivityFromTraining />
        <AddCompletedActivity />
        <Countdown />
        <HistoryView
          history={history}
          updateCompletedActivity={handleCompletedActivityUpdate}
          deleteCompletedActivity={handleCompletedActivityDeletion}
          duplicateCompletedActivities={handleCompletedActivityDuplication}
          deleteUntilDate={handleDeletionUntilDate}
          purge={handlePurge}
        />
        <ExportData />
        <RestoreData />
        <ReloadPage />
        <BundleVersion />
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
