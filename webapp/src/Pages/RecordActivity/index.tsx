import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { ActivityManager } from "../../domain/activities";
import { CompletedActivityManager } from "../../domain/completedActivities";
import { isoDateFormatter, now, today } from "../../domain/datetimeUtils";
import {
  Activity,
  ActivityId,
  CompletedActivity,
  CompletedActivityId,
  Duration,
  FilterQuery,
  Intensity,
  Notes,
} from "../../domain/model";
import { filterInventory } from "../../domain/search";
import { TrainingManager } from "../../domain/trainings";
import { findVersionHash } from "../../findVersion";
import BlueprintThemeProvider from "../../style/theme";
import AddCompletedActivity from "../HistoryExplorer/AddCompletedActivity";
import AddCompletedActivityFromTraining from "../HistoryExplorer/AddCompletedActivityFromTraining";
import Countdown from "../HistoryExplorer/Countdown";
import { DownloadJson } from "../HistoryExplorer/DownloadJson";
import HistoryView from "../HistoryExplorer/History";
import InventoryView from "../HistoryExplorer/Inventory";
import ReloadPage from "../HistoryExplorer/ReloadPage";
import SearchBox from "../HistoryExplorer/SearchBox";
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selected, setSelected] = useState<ActivityId | undefined>(undefined);
  const [history, setHistory] = useState<CompletedActivity[]>([]);
  const [userIsSearching, setUserIsSearching] = useState(false);
  const [filterQuery, setFilterQuery] = useState<FilterQuery>("");

  const itemsInInventory = activities;

  useEffect(() => {
    activityManager.changes$.subscribe((_) => {
      const sortedActivities = activityManager.getAll();
      setActivities(sortedActivities);
    });

    completedActivityManager.changes$.subscribe((_) => {
      const history = completedActivityManager.getAll();
      const todayOrLater = keepTodayOrAfter(history);
      setHistory(todayOrLater);
    });

    const sortedActivities = activityManager.getAll();
    setActivities(sortedActivities);
    const history = completedActivityManager.getAll();
    const todayOrLater = keepTodayOrAfter(history);
    setHistory(todayOrLater);
  }, [activityManager, completedActivityManager]);

  const handleRemoveActivity = (id: ActivityId) => {
    console.log(`App.handleRemoveActivity::Removing activity (ID: ${id})`);
    if (completedActivityManager.isActivityUsedInHistory({ activityId: id })) {
      alert(`This activity is used in the history, cannot be removed!`);
      return;
    }

    activityManager.delete({ id });
  };

  const handleNewCompleteActity = (
    id: ActivityId,
    intensity: Intensity,
    duration: Duration,
    notes: Notes
  ): void => {
    console.log(`App.handleNewCompleteActity::Adding a new completed activity: id=${id}`);
    completedActivityManager.add({
      activityId: id,
      intensity,
      duration,
      notes,
      date: now(),
    });
    setSelected(undefined);
  };

  const handleSelectActivity = (id: ActivityId) => {
    setSelected(id);
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

  const clearSearch = () => {
    setFilterQuery("");
    setUserIsSearching(false);
  };

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <AddCompletedActivityFromTraining
          trainingManager={trainingManager}
          activityManager={activityManager}
          completedActivityManager={completedActivityManager}
        />
        <SearchBox
          query={filterQuery}
          onChange={setFilterQuery}
          clearSearch={clearSearch}
          onFocus={() => setUserIsSearching(true)}
        />
        <InventoryView
          activities={filterInventory(itemsInInventory, filterQuery)}
          removeActivity={handleRemoveActivity}
          selectActivity={handleSelectActivity}
          collapse={!userIsSearching}
        />
        <AddCompletedActivity
          activityManager={activityManager}
          selectedActivityId={selected}
          add={handleNewCompleteActity}
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
