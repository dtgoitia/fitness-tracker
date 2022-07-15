import {
  Activity,
  ActivityId,
  Duration,
  findActivityById,
  Intensity,
  Notes,
} from "./domain";
import { Button } from "@blueprintjs/core";
import { useState } from "react";

interface AddCompletedActivityProps {
  activities: Activity[];
  selectedActivityId: ActivityId | undefined;
  add: (
    id: ActivityId,
    intensity: Intensity,
    duration: Duration,
    notes: Notes
  ) => void;
}
function AddCompletedActivity({
  activities,
  selectedActivityId,
  add,
}: AddCompletedActivityProps) {
  const [intensity, setIntensity] = useState<Intensity | undefined>();
  const [duration, setDuration] = useState<Duration | undefined>();
  const [notes, setNotes] = useState<Notes>(undefined);

  function handleSubmit(event: any) {
    event.preventDefault();
    if (!selectedActivityId) return;
    if (!intensity || !duration) {
      console.debug(
        `Both intensity and duration are required to add a completed activity`
      );
      return;
    }
    add(
      selectedActivityId,
      intensity as Intensity,
      duration as Duration,
      notes
    );
    setIntensity(undefined);
    setDuration(undefined);
    setNotes(undefined);
  }

  function handleNotesChange(event: any) {
    const inputValue = event.target.value;
    if (inputValue === "") {
      setNotes(undefined);
      return;
    }
    setNotes(event.target.value);
  }

  const intensityButtons = Object.keys(Intensity).map((key) => {
    const buttonIntensity = key as Intensity;
    const classNameIfSelected =
      buttonIntensity === intensity ? "bp4-intent-success" : "";
    return (
      <button
        type="button"
        className={`bp4-button ${classNameIfSelected}`}
        onClick={() => setIntensity(buttonIntensity)}
      >
        {buttonIntensity}
      </button>
    );
  });

  const durationButtons = Object.keys(Duration).map((key) => {
    const buttonDuration = key as Duration;
    const classNameIfSelected =
      buttonDuration === duration ? "bp4-intent-success" : "";
    return (
      <button
        type="button"
        className={`bp4-button ${classNameIfSelected}`}
        onClick={() => setDuration(buttonDuration)}
      >
        {buttonDuration}
      </button>
    );
  });

  const canSubmit =
    selectedActivityId !== undefined &&
    intensity !== undefined &&
    duration !== undefined;

  let selectedActivity = undefined;
  if (selectedActivityId) {
    selectedActivity = findActivityById(activities, selectedActivityId);
  }

  return (
    <form onSubmit={canSubmit ? handleSubmit : () => {}}>
      <p>Add a new completed activity:</p>
      <div>{selectedActivity?.name}</div>
      <div>
        Intensity
        <div className="bp4-button-group .modifier">{intensityButtons}</div>
      </div>
      <div>
        Duration
        <div className="bp4-button-group .modifier">{durationButtons}</div>
      </div>
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
