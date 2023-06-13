import { ActivityManager } from "../../domain/activities";
import { CompletedActivityManager } from "../../domain/completedActivities";
import { now } from "../../domain/datetimeUtils";
import { Activity, ActivityId, FilterQuery } from "../../domain/model";
import { Duration, Intensity } from "../../domain/model";
import { filterInventory } from "../../domain/search";
import InventoryView from "./Inventory";
import SearchBox from "./SearchBox";
import { Button, Collapse, Intent } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import styled from "styled-components";

const ButtonsLabel = styled.label`
  padding-right: 1rem;
`;
const ButtonRibbon = styled.div`
  margin: 1rem 0;
`;
const Container = styled.div`
  margin: 1rem 0;
`;

interface AddCompletedActivityProps {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
}
function AddCompletedActivity({
  activityManager,
  completedActivityManager,
}: AddCompletedActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selected, setSelected] = useState<ActivityId | undefined>(undefined);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [intensity, setIntensity] = useState<Intensity | undefined>();
  const [duration, setDuration] = useState<Duration | undefined>();
  const [notes, setNotes] = useState<string>("");

  const [userIsSearching, setUserIsSearching] = useState(false);
  const [filterQuery, setFilterQuery] = useState<FilterQuery>("");

  useEffect(() => {
    activityManager.changes$.subscribe((_) => {
      const sortedActivities = activityManager.getAll();
      setActivities(sortedActivities);
    });

    const sortedActivities = activityManager.getAll();
    setActivities(sortedActivities);
  }, [activityManager]);

  function handleSubmit(event: any) {
    event.preventDefault();
    if (selected === undefined) return;
    if (!intensity || !duration) {
      console.debug(
        `Both intensity and duration are required to add a completed activity`
      );
      return;
    }

    completedActivityManager.add({
      activityId: selected,
      intensity,
      duration,
      notes,
      date: now(),
    });

    // Reset UI
    setSelected(undefined);
    setIntensity(undefined);
    setDuration(undefined);
    setNotes("");
  }

  function handleNotesChange(event: any) {
    setNotes(event.target.value);
  }

  function handleSelectActivity(id: ActivityId): void {
    setSelected(id);
  }

  function handleRemoveActivity(id: ActivityId): void {
    console.log(`App.handleRemoveActivity::Removing activity (ID: ${id})`);
    if (completedActivityManager.isActivityUsedInHistory({ activityId: id })) {
      alert(`This activity is used in the history, cannot be removed!`);
      return;
    }

    activityManager.delete({ id });
  }

  function clearSearch(): void {
    setUserIsSearching(false);
    setFilterQuery("");
  }

  const intensityButtons =
    isOpen &&
    Object.keys(Intensity).map((key) => {
      const buttonIntensity = key as Intensity;
      const classNameIfSelected =
        buttonIntensity === intensity ? "bp4-intent-success" : "";
      return (
        <button
          key={key}
          type="button"
          className={`bp4-button bp4-large ${classNameIfSelected}`}
          onClick={() => setIntensity(buttonIntensity)}
        >
          {buttonIntensity}
        </button>
      );
    });

  const durationButtons =
    isOpen &&
    Object.keys(Duration).map((key) => {
      const buttonDuration = key as Duration;
      const classNameIfSelected = buttonDuration === duration ? "bp4-intent-success" : "";
      return (
        <button
          key={key}
          type="button"
          className={`bp4-button bp4-large ${classNameIfSelected}`}
          onClick={() => setDuration(buttonDuration)}
        >
          {buttonDuration}
        </button>
      );
    });

  const canSubmit =
    selected !== undefined && intensity !== undefined && duration !== undefined;

  let selectedActivity = undefined;
  if (selected) {
    selectedActivity = activityManager.get(selected);
  }

  return (
    <Container>
      <Button
        large
        intent={Intent.NONE}
        text={isOpen ? "Close" : "Record activity"}
        icon={isOpen ? "collapse-all" : "menu-open"}
        onClick={() => setIsOpen(!isOpen)}
      />

      <Collapse isOpen={isOpen}>
        <SearchBox
          query={filterQuery}
          onChange={setFilterQuery}
          clearSearch={clearSearch}
          onFocus={() => setUserIsSearching(true)}
        />
        <InventoryView
          activities={filterInventory(activities, filterQuery)}
          removeActivity={handleRemoveActivity}
          selectActivity={handleSelectActivity}
          collapse={!userIsSearching}
        />

        <form onSubmit={canSubmit ? handleSubmit : () => {}}>
          <div>{selectedActivity?.name}</div>

          <ButtonRibbon>
            <ButtonsLabel>intensity</ButtonsLabel>
            <div className="bp4-button-group .modifier">{intensityButtons}</div>
          </ButtonRibbon>

          <ButtonRibbon>
            <ButtonsLabel>duration</ButtonsLabel>
            <div className="bp4-button-group .modifier">{durationButtons}</div>
          </ButtonRibbon>

          <input
            id="form-group-input"
            type="text"
            className="bp4-input"
            value={notes}
            placeholder="add observations here..."
            onChange={handleNotesChange}
          />

          <Button disabled={!canSubmit} intent="success" text="Add" type="submit" />
        </form>
      </Collapse>
    </Container>
  );
}
export default AddCompletedActivity;
