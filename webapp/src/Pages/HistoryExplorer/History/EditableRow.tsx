import {
  getDurationLevelShorthand,
  getIntensityLevelShorthand,
} from "../../../domain/activities";
import {
  setCompletedActivityDate,
  setCompletedActivityDuration,
  setCompletedActivityIntensity,
  setCompletedActivityNotes,
} from "../../../domain/completedActivities";
import { isoDateFormatter } from "../../../domain/datetimeUtils";
import { Activity, CompletedActivity, Duration, Intensity } from "../../../domain/model";
import { formatTime } from "./datetime";
import { Button, Dialog, EditableText } from "@blueprintjs/core";
import { TimePrecision, DatePicker } from "@blueprintjs/datetime";
import { useState } from "react";
import styled from "styled-components";

const selectWidth = 0.9;
const editWidth = 5;
const SelectRow = styled.div`
  flex-basis: ${selectWidth}rem;
  flex-shrink: 0;
  flex-grow: 0;
  align-self: center;
  justify-content: center;
`;
const EditTime = styled.div`
  flex-basis: ${editWidth}rem;
  flex-shrink: 0;
  flex-grow: 0;
  align-self: center;
`;
const ActivityName = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
  align-self: center;
`;
const IntensityValue = styled.div`
  flex-basis: 4rem;
  flex-shrink: 0;
  align-self: center;
`;
const DurationValue = styled.div`
  flex-basis: 4rem;
  flex-shrink: 0;
  align-self: center;
`;
const DeleteActivity = styled.div`
  flex-basis: 1rem;
  flex-shrink: 0;
  flex-grow: 0;
  align-self: center;
`;

const ButtonRibbon = styled.div`
  display: flex;
  margin: 0 0.5rem;
`;

const Notes = styled.div`
  font-size: 0.8rem;
  max-width: 100%;
`;

const LastModified = styled.div`
  font-size: 0.8rem;
  max-width: 100%;
  opacity: 0.6;
`;

const Container = styled.div`
  margin-bottom: 0.2rem;
`;

const TopLine = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  margin-bottom: 0.2rem;
`;

const BottomLine = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  margin-bottom: 0.2rem;
  padding-left: ${selectWidth + editWidth}rem;
`;

interface RowProps {
  activity: Activity;
  completedActivity: CompletedActivity;
  selected: boolean;
  onDelete: () => void;
  onChange: (updated: CompletedActivity) => void;
  onToggleSelect: () => void;
}
function EditableRow({
  activity,
  completedActivity,
  selected,
  onDelete,
  onChange,
  onToggleSelect,
}: RowProps) {
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const time: string = formatTime(completedActivity.date);

  function handleDateInputChange(date: Date): void {
    onChange(setCompletedActivityDate(completedActivity, date));
  }

  function handleIntensityChange(intensity: Intensity): void {
    onChange(setCompletedActivityIntensity(completedActivity, intensity));
  }

  function handleDurationChange(duration: Duration): void {
    onChange(setCompletedActivityDuration(completedActivity, duration));
  }

  function handleNotesChange(notes: string): void {
    onChange(setCompletedActivityNotes(completedActivity, notes));
  }

  const intensityButtons = Object.keys(Intensity).map((key) => {
    const buttonIntensity = key as Intensity;
    const classNameIfSelected =
      buttonIntensity === completedActivity.intensity ? "bp4-intent-success" : "";
    return (
      <button
        key={key}
        type="button"
        className={`bp4-button bp4 ${classNameIfSelected}`}
        onClick={() => handleIntensityChange(buttonIntensity)}
      >
        {getIntensityLevelShorthand(buttonIntensity)}
      </button>
    );
  });

  const durationButtons = Object.keys(Duration).map((key) => {
    const buttonDuration = key as Duration;
    const classNameIfSelected =
      buttonDuration === completedActivity.duration ? "bp4-intent-success" : "";
    return (
      <button
        key={key}
        type="button"
        className={`bp4-button bp4 ${classNameIfSelected}`}
        onClick={() => handleDurationChange(buttonDuration)}
      >
        {getDurationLevelShorthand(buttonDuration)}
      </button>
    );
  });

  return (
    <Container>
      <Dialog
        title="Select a new date and time"
        isOpen={showDatePicker}
        autoFocus={true}
        canOutsideClickClose={true}
        isCloseButtonShown={true}
        canEscapeKeyClose={true}
        transitionDuration={0}
        onClose={() => setShowDatePicker(false)}
      >
        <div className="bp4-dialog-body">
          <DatePicker
            value={completedActivity.date}
            defaultValue={completedActivity.date}
            timePrecision={TimePrecision.MINUTE}
            shortcuts={true}
            highlightCurrentDay={true}
            timePickerProps={{ showArrowButtons: true }}
            onChange={handleDateInputChange}
          />
        </div>
        <div className="bp4-dialog-footer">Changes are saved automatically</div>
      </Dialog>

      <TopLine>
        <SelectRow>
          <input type="checkbox" checked={selected} onChange={onToggleSelect} />
        </SelectRow>
        <EditTime>
          <Button
            icon="edit"
            text={time}
            minimal={true}
            onClick={() => setShowDatePicker(!showDatePicker)}
          />
        </EditTime>
        <ActivityName>{activity.name}</ActivityName>

        <IntensityValue>
          <ButtonRibbon className="bp4-button-group .modifier">
            {intensityButtons}
          </ButtonRibbon>
        </IntensityValue>

        <DurationValue>
          <ButtonRibbon className="bp4-button-group .modifier">
            {durationButtons}
          </ButtonRibbon>
        </DurationValue>

        <DeleteActivity>
          <Button icon="trash" minimal={true} onClick={onDelete} />
        </DeleteActivity>
      </TopLine>

      <BottomLine>
        <Notes>
          <EditableText
            multiline={false}
            placeholder={`observations...`}
            value={completedActivity.notes}
            onChange={handleNotesChange}
          />
        </Notes>
        <LastModified>{isoDateFormatter(completedActivity.lastModified)}</LastModified>
      </BottomLine>
    </Container>
  );
}

export default EditableRow;
