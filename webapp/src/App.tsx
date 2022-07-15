import AddActivity from "./AddActivity";
import AddCompletedActivity from "./AddCompletedActivity";
import "./App.css";
import DownloadCsv from "./DownloadCsv";
import SearchBox from "./SearchBox";
import HistoryView from "./Views/History";
import InventoryView from "./Views/Inventory";
import {
  addActivity,
  filterInventory,
  FilterQuery,
  getActivitiesFromStorage,
  ActivityId,
  ActivityName,
  removeActivity,
  getHistoryFromStorage,
  Duration,
  Intensity,
  addCompletedActivity,
  isActivityUsedInHistory,
} from "./domain";
import storage from "./localStorage";
import BlueprintThemeProvider from "./style/theme";
import { useState } from "react";
import styled from "styled-components";

const Centered = styled.div`
  margin: 0 auto;
  padding: 0 1rem;
  max-width: 800px;
`;

function App() {
  const [activities, setActivities] = useState(getActivitiesFromStorage());
  const [selected, setSelected] = useState<ActivityId | undefined>(undefined);
  const [history, setHistory] = useState(getHistoryFromStorage());
  const [filterQuery, setFilterQuery] = useState<FilterQuery>("");
  storage.activities.set(activities);

  const itemsInInventory = activities;

  const handleAddNewActivity = (
    name: ActivityName,
    otherNames: ActivityName[]
  ) => {
    console.log(`Adding a new activity: ${name}`);
    setActivities(addActivity(activities, name, otherNames));
  };

  const handleRemoveActivity = (id: ActivityId) => {
    console.log(`Removing activity (ID: ${id})`);
    if (isActivityUsedInHistory(id, history)) {
      alert(`This activity is used in the history, cannot be removed!`);
      return;
    }
    setActivities(removeActivity(activities, id));
  };

  const handleNewCompleteActity = (
    id: ActivityId,
    intensity: Intensity,
    duration: Duration,
    notes: string | undefined
  ) => {
    console.log(`Adding a new completed activity: id=${id}`);
    const updatedHistory = addCompletedActivity(
      history,
      id,
      intensity,
      duration,
      notes
    );
    setHistory(updatedHistory);
    storage.history.set(updatedHistory);
    setSelected(undefined);
  };

  const handleSelectActivity = (id: ActivityId) => {
    setSelected(id);
  };

  return (
    <BlueprintThemeProvider>
      <Centered>
        <SearchBox query={filterQuery} onChange={setFilterQuery} />
        <InventoryView
          activities={filterInventory(itemsInInventory, filterQuery)}
          removeActivity={handleRemoveActivity}
          selectActivity={handleSelectActivity}
        />
        <AddCompletedActivity
          activities={activities}
          selectedActivityId={selected}
          add={handleNewCompleteActity}
        />
        <HistoryView history={history} activities={activities} />
        <AddActivity add={handleAddNewActivity} />
        <DownloadCsv activities={activities} history={history} />
      </Centered>
    </BlueprintThemeProvider>
  );
}

export default App;
