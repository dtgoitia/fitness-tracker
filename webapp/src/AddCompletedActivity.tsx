import { EMPTY_STRING, NO_CLASS } from "./constants";
import { ActivityManager } from "./domain/activities";
import { ActivityId } from "./domain/model";
import { Duration, Intensity, Notes } from "./domain/model";
import { Button } from "@blueprintjs/core";
import { useState } from "react";
import styled from "styled-components";

const NO_NOTES = EMPTY_STRING;

const ButtonsLabel = styled.label`
  padding-right: 1rem;
`;
const ButtonRibbon = styled.div`
  margin: 1rem 0;
`;

interface AddCompletedActivityProps {
  activityManager: ActivityManager;
  selectedActivityId: ActivityId | undefined;
  add: (id: ActivityId, intensity: Intensity, duration: Duration, notes: Notes) => void;
}
function AddCompletedActivity({
  activityManager,
  selectedActivityId,
  add,
}: AddCompletedActivityProps) {
  const [intensity, setIntensity] = useState<Intensity | undefined>();
  const [duration, setDuration] = useState<Duration | undefined>();
  const [notes, setNotes] = useState<string>(NO_NOTES);

  function handleSubmit(event: any) {
    event.preventDefault();
    if (selectedActivityId === undefined) return;
    if (!intensity || !duration) {
      console.debug(
        `Both intensity and duration are required to add a completed activity`
      );
      return;
    }
    add(selectedActivityId, intensity as Intensity, duration as Duration, notes);
    setIntensity(undefined);
    setDuration(undefined);
    setNotes(NO_NOTES);
  }

  function handleNotesChange(event: any) {
    setNotes(event.target.value);
  }

  const intensityButtons = Object.keys(Intensity).map((key) => {
    const buttonIntensity = key as Intensity;
    const classNameIfSelected =
      buttonIntensity === intensity ? "bp4-intent-success" : NO_CLASS;
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

  const durationButtons = Object.keys(Duration).map((key) => {
    const buttonDuration = key as Duration;
    const classNameIfSelected =
      buttonDuration === duration ? "bp4-intent-success" : NO_CLASS;
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
    selectedActivityId !== undefined && intensity !== undefined && duration !== undefined;

  let selectedActivity = undefined;
  if (selectedActivityId) {
    selectedActivity = activityManager.get(selectedActivityId);
  }

  return (
    <form onSubmit={canSubmit ? handleSubmit : () => {}}>
      <p>Add a new completed activity:</p>
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
  );
}
export default AddCompletedActivity;
