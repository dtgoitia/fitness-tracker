import { useApp } from "../..";
import { SearchBox } from "../../components/SearchBox";
import { now } from "../../lib/datetimeUtils";
import { ActivityId, CompletedActivityNotes, FilterQuery } from "../../lib/domain/model";
import { Duration, Intensity } from "../../lib/domain/model";
import InventoryView from "./Inventory";
import { Button, Collapse, Intent } from "@blueprintjs/core";
import { useState } from "react";
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

function AddCompletedActivity() {
  const app = useApp();
  const activityManager = app.activityManager;
  const completedActivityManager = app.completedActivityManager;

  const [selected, setSelected] = useState<ActivityId | undefined>(undefined);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [intensity, setIntensity] = useState<Intensity | undefined>();
  const [duration, setDuration] = useState<Duration | undefined>();
  const [notes, setNotes] = useState<string>("");

  const [userIsSearching, setUserIsSearching] = useState(false);
  const [filterQuery, setFilterQuery] = useState<FilterQuery>("");

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
    const result = app.deleteActivity({ id });
    switch (result.kind) {
      case "activity-not-found":
        return;
      case "activity-successfully-deleted":
        return;
      case "activity-found-but-was-not-deleted":
        return alert(`This activity is used in the history, cannot be removed!`);
    }
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
          activities={activityManager.searchByPrefix(filterQuery)}
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

          {selected && (
            <SelectableNotes>
              {completedActivityManager
                .getLastActivitiesNotes({
                  activityId: selected,
                  n: 4,
                })
                .map((note, i) => (
                  <SelectableNote
                    key={i}
                    note={note}
                    isSelected={note === notes}
                    onSelect={() => setNotes(note)}
                  ></SelectableNote>
                ))}
            </SelectableNotes>
          )}

          <Button disabled={!canSubmit} intent="success" text="Add" type="submit" />
        </form>
      </Collapse>
    </Container>
  );
}
export default AddCompletedActivity;

const SelectableNotes = styled.ol`
  padding-top: 1rem;
  padding-bottom: 1rem;
  padding-left: 1rem;

  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NoteContainer = styled.li`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.8rem;
`;

const Note = styled.div``;

function SelectableNote({
  note,
  onSelect: select,
  isSelected,
}: {
  note: CompletedActivityNotes;
  isSelected: boolean;
  onSelect: (note: CompletedActivityNotes) => void;
}) {
  return (
    <NoteContainer>
      <Button
        icon={isSelected ? "tick" : "plus"}
        large
        intent={isSelected ? "success" : "none"}
        onClick={() => select(note)}
      />
      <Note>{note}</Note>
    </NoteContainer>
  );
}
