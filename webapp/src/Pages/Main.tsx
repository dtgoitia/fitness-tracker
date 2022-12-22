import AddActivity from "../AddActivity";
import AddCompletedActivity from "../AddCompletedActivity";
import "../App.css";
import CenteredPage from "../CenteredPage";
import { DownloadJson } from "../DownloadJson";
import ReloadPage from "../ReloadPage";
import SearchBox from "../SearchBox";
import HistoryView from "../Views/History";
import InventoryView from "../Views/Inventory";
import { EMPTY_STRING } from "../constants";
import { ActivityManager } from "../domain/activities";
import { CompletedActivityManager } from "../domain/completedActivities";
import { now } from "../domain/datetimeUtils";
import {
  ActivityId,
  ActivityName,
  Activity,
  CompletedActivity,
  Duration,
  Intensity,
  Notes,
  FilterQuery,
  CompletedActivityId,
} from "../domain/model";
import { filterInventory } from "../domain/search";
import { TrainingManager } from "../domain/trainings";
import { findVersionHash } from "../findVersion";
import Paths from "../routes";
import BlueprintThemeProvider from "../style/theme";
import { Button } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const NO_QUERY = EMPTY_STRING;

interface Props {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
  trainingManager: TrainingManager;
}

function MainPage({ activityManager, completedActivityManager, trainingManager }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selected, setSelected] = useState<ActivityId | undefined>(undefined);
  const [history, setHistory] = useState<CompletedActivity[]>([]);
  const [userIsSearching, setUserIsSearching] = useState(false);
  const [filterQuery, setFilterQuery] = useState<FilterQuery>(NO_QUERY);

  const itemsInInventory = activities;

  useEffect(() => {
    activityManager.changes$.subscribe((_) => {
      const sortedActivities = activityManager.getAll();
      setActivities(sortedActivities);
    });

    completedActivityManager.changes$.subscribe((_) => {
      const history = completedActivityManager.getAll();
      setHistory(history);
    });

    const sortedActivities = activityManager.getAll();
    setActivities(sortedActivities);
    const history = completedActivityManager.getAll();
    setHistory(history);
  }, [activityManager, completedActivityManager]);

  const handleAddNewActivity = (name: ActivityName, otherNames: ActivityName[]) => {
    console.log(`App.handleAddNewActivity::Adding a new activity: ${name}`);
    activityManager.add({ name, otherNames });
  };

  const handleRemoveActivity = (id: ActivityId) => {
    console.log(`App.handleRemoveActivity::Removing activity (ID: ${id})`);
    if (completedActivityManager.isActivityUsedInHistory({ activityId: id })) {
      alert(`This activity is used in the history, cannot be removed!`);
      return;
    }

    if (trainingManager.isActivityUsedInTrainings({ activityId: id })) {
      alert(`This activity is used in Trainings, cannot be removed!`);
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

  const clearSearch = () => {
    setFilterQuery(NO_QUERY);
    setUserIsSearching(false);
  };

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <Link to={Paths.trainings}>
          <Button large icon="arrow-right">
            Go to Trainings
          </Button>
        </Link>

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
        <HistoryView
          history={history}
          activityManager={activityManager}
          updateCompletedActivity={handleCompletedActivityUpdate}
          deleteCompletedActivity={handleCompletedActivityDeletion}
          duplicateCompletedActivity={handleCompletedActivityDuplication}
        />
        <AddActivity add={handleAddNewActivity} />
        <DownloadJson
          activityManager={activityManager}
          completedActivityManager={completedActivityManager}
        />
        <ReloadPage />
        <p>{findVersionHash()}</p>
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}

export default MainPage;
