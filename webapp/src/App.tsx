import AddActivity from "./AddActivity";
import AddCompletedActivity from "./AddCompletedActivity";
import "./App.css";
import { DownloadJson } from "./DownloadJson";
import ReloadPage from "./ReloadPage";
import SearchBox from "./SearchBox";
import HistoryView from "./Views/History";
import InventoryView from "./Views/Inventory";
import { ActivityManager } from "./domain/activities";
import { CompletedActivityManager } from "./domain/completedActivities";
import { now } from "./domain/datetimeUtils";
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
} from "./domain/model";
import { filterInventory } from "./domain/search";
import { findVersionHash } from "./findVersion";
import BlueprintThemeProvider from "./style/theme";
import { useEffect, useState } from "react";
import styled from "styled-components";

const Centered = styled.div`
  margin: 0 auto;
  padding: 0 1rem;
  max-width: 800px;
`;

interface Props {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
}

function App({ activityManager, completedActivityManager }: Props) {
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
    setFilterQuery("");
    setUserIsSearching(false);
  };

  return (
    <BlueprintThemeProvider>
      <Centered>
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
      </Centered>
    </BlueprintThemeProvider>
  );
}

export default App;
