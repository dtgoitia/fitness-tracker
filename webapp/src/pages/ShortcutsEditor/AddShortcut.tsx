import { ActivityManager } from "../../lib/domain/activities";
import { Activity, ActivityId, FilterQuery } from "../../lib/domain/model";
import { ShortcutManager } from "../../lib/domain/shortcuts";
import { filterInventory } from "../../lib/search";
import InventoryView from "../HistoryExplorer/Inventory";
import SearchBox from "../HistoryExplorer/SearchBox";
import { Button } from "@blueprintjs/core";
import { ChangeEvent, useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  margin: 1rem 0;
`;

const SelectedActivity = styled.div`
  margin: 1rem 0;
`;

interface Props {
  activityManager: ActivityManager;
  shortcutManager: ShortcutManager;
}
function AddCompletedActivity({ activityManager, shortcutManager }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selected, setSelected] = useState<ActivityId | undefined>(undefined);

  const [userIsSearching, setUserIsSearching] = useState(false);
  const [filterQuery, setFilterQuery] = useState<FilterQuery>("");

  useEffect(() => {
    const activitiesSubscription = activityManager.changes$.subscribe((_) => {
      const sortedActivities = activityManager.getAll();
      setActivities(sortedActivities);
    });

    const sortedActivities = activityManager.getAll();
    setActivities(sortedActivities);

    return () => {
      activitiesSubscription.unsubscribe();
    };
  }, [activityManager]);

  function handleSubmit(event: ChangeEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selected === undefined) return;

    shortcutManager.add({ shortcut: selected });

    // Reset UI
    setSelected(undefined);
  }

  function handleSelectActivity(id: ActivityId): void {
    setSelected(id);
    clearSearch();
  }

  function clearSearch(): void {
    setUserIsSearching(false);
    setFilterQuery("");
  }

  const canSubmit = selected !== undefined;

  let selectedActivity = undefined;
  if (selected) {
    selectedActivity = activityManager.get(selected);
  }

  return (
    <Container>
      <SearchBox
        query={filterQuery}
        onChange={setFilterQuery}
        clearSearch={clearSearch}
        onFocus={() => setUserIsSearching(true)}
      />
      <InventoryView
        activities={filterInventory(activities, filterQuery)}
        removeActivity={() => {
          alert("removal is disabled from here");
        }}
        selectActivity={handleSelectActivity}
        collapse={!userIsSearching}
      />

      <form onSubmit={canSubmit ? handleSubmit : () => {}}>
        {selectedActivity && (
          <SelectedActivity>
            Selected activity: <b>{selectedActivity.name}</b>
          </SelectedActivity>
        )}

        <Button disabled={!canSubmit} intent="success" text="Add" type="submit" />
      </form>
    </Container>
  );
}
export default AddCompletedActivity;
