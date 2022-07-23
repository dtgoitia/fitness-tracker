import { Activity, CompletedActivity } from "../../domain";
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
const Intensity = styled.div`
  flex-basis: 4rem;
  flex-shrink: 0;
  align-self: center;
`;
const Duration = styled.div`
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
const Notes = styled.div`
  align-self: center;
  padding-left: ${selectWidth + editWidth}rem;
  font-size: 0.8rem;
  max-width: 100%;
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
  flex-flow: row nowrap;
  align-items: stretch;
  margin-bottom: 0.2rem;
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

  function onDateInputChange(newDate: Date) {
    const updated: CompletedActivity = { ...completedActivity, date: newDate };
    onChange(updated);
  }
  function onNotesChange(newNotes: string) {
    const updated: CompletedActivity = {
      ...completedActivity,
      notes: newNotes,
    };
    onChange(updated);
  }

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
            onChange={onDateInputChange}
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

        <Intensity>{completedActivity.intensity}</Intensity>
        <Duration>{completedActivity.duration}</Duration>
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
            onChange={onNotesChange}
          />
        </Notes>
      </BottomLine>
    </Container>
  );
}

export default EditableRow;
