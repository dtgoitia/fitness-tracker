import { SearchBox } from "../../components/SearchBox";
import { ActivityManager } from "../../lib/domain/activities";
import { ActivityId, FilterQuery } from "../../lib/domain/model";
import { ShortcutManager } from "../../lib/domain/shortcuts";
import InventoryView from "../HistoryExplorer/Inventory";
import { Button } from "@blueprintjs/core";
import { ChangeEvent, useState } from "react";
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
  const [selected, setSelected] = useState<ActivityId | undefined>(undefined);

  const [userIsSearching, setUserIsSearching] = useState(false);
  const [filterQuery, setFilterQuery] = useState<FilterQuery>("");

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
        activities={activityManager.searchByPrefix(filterQuery)}
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
