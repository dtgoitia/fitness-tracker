import { ButtonRibbon } from "../../../components/ButtonRibbon";
import {
  ActivityManager,
  getDurationLevelShorthand,
  getIntensityLevelShorthand,
} from "../../../domain/activities";
import {
  CompletedActivityDeleted,
  CompletedActivityManager,
  CompletedActivityUpdated,
} from "../../../domain/completedActivities";
import {
  setCompletedActivityDate,
  setCompletedActivityDuration,
  setCompletedActivityIntensity,
  setCompletedActivityNotes,
} from "../../../domain/completedActivities";
import {
  Activity,
  CompletedActivity as CActivity,
  CompletedActivityId as CActivityId,
  Duration,
  Intensity,
} from "../../../domain/model";
import Paths from "../../../routes";
import { formatTime } from "../../HistoryExplorer/History/datetime";
import { Button, Dialog, EditableText } from "@blueprintjs/core";
import { TimePrecision, DatePicker } from "@blueprintjs/datetime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

interface Props {
  completedActivity: CActivity;
  onUpdate: (completedActivity: CActivity) => void;
  onDelete: (completedActivityId: CActivityId) => void;
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
}

export function CompletedActivityEditor({
  completedActivity: cActivity,
  onUpdate: handleUpdate,
  onDelete: handleDelete,
  activityManager,
  completedActivityManager,
}: Props) {
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [activity, setActivity] = useState<Activity | undefined>();

  useEffect(() => {
    function _rerender(): void {
      const activity = activityManager.get(cActivity.activityId);
      setActivity(activity);
    }

    const subscription = completedActivityManager.changes$.subscribe((change) => {
      if (
        change instanceof CompletedActivityUpdated ||
        change instanceof CompletedActivityDeleted
      ) {
        _rerender();
      }
    });

    _rerender();

    return () => {
      subscription.unsubscribe();
    };
  }, [activityManager, completedActivityManager, cActivity]);

  function handleDateInputChange(date: Date): void {
    handleUpdate(setCompletedActivityDate(cActivity as CActivity, date));
  }

  function handleIntensityChange(intensity: Intensity): void {
    handleUpdate(setCompletedActivityIntensity(cActivity as CActivity, intensity));
  }

  function handleDurationChange(duration: Duration): void {
    handleUpdate(setCompletedActivityDuration(cActivity as CActivity, duration));
  }

  function handleNotesChange(notes: string): void {
    handleUpdate(setCompletedActivityNotes(cActivity as CActivity, notes));
  }

  const intensityButtons = Object.keys(Intensity).map((key) => {
    const buttonIntensity = key as Intensity;
    const selected = buttonIntensity === cActivity.intensity;
    return {
      key,
      label: getIntensityLevelShorthand(buttonIntensity),
      selected,
      onClick: () => handleIntensityChange(buttonIntensity),
    };
  });

  const durationButtons = Object.keys(Duration).map((key) => {
    const buttonDuration = key as Duration;
    const selected = buttonDuration === cActivity.duration;
    return {
      key,
      label: getDurationLevelShorthand(buttonDuration),
      selected,
      onClick: () => handleDurationChange(buttonDuration),
    };
  });

  return (
    <>
      <p>
        ID:&nbsp;&nbsp;&nbsp;<code>{cActivity.id}</code>
      </p>

      <p>
        activity:&nbsp;&nbsp;
        {activity ? (
          <Link to={Paths.activityEditor.replace(":activityId", activity.id)}>
            {activity.name}
          </Link>
        ) : (
          `no Activity found with ID=${cActivity.activityId}`
        )}
      </p>

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
            value={cActivity.date}
            defaultValue={cActivity.date}
            timePrecision={TimePrecision.MINUTE}
            shortcuts={true}
            highlightCurrentDay={true}
            timePickerProps={{ showArrowButtons: true }}
            onChange={handleDateInputChange}
          />
        </div>
        <div className="bp4-dialog-footer">Changes are saved automatically</div>
      </Dialog>

      <EditTime>
        <Button
          icon="edit"
          text={formatTime(cActivity.date)}
          minimal={true}
          onClick={() => setShowDatePicker(!showDatePicker)}
        />
      </EditTime>

      <ButtonRibbon label="intensity" buttons={intensityButtons}></ButtonRibbon>
      <ButtonRibbon label="duration" buttons={durationButtons}></ButtonRibbon>

      <NotesContainer>
        <label>Observations:</label>
        <Notes
          placeholder="add observations here..."
          value={cActivity.notes}
          multiline={true}
          minLines={3}
          onChange={handleNotesChange}
        />
      </NotesContainer>

      <pre>{JSON.stringify(cActivity, null, 2)}</pre>

      <Delete>
        <Button
          icon="trash"
          text="delete"
          onClick={() => handleDelete(cActivity.id)}
          intent="danger"
        />
      </Delete>
    </>
  );
}

const EditTime = styled.div`
  flex-basis: 0.9rem;
  flex-shrink: 0;
  flex-grow: 0;
  align-self: center;
`;

const NotesContainer = styled.div`
  margin: 1rem 0;
`;

const Notes = styled(EditableText)`
  font-size: 0.9rem;
  max-width: 100%;
  border: 1px dashed gray;
`;

const Delete = styled.div`
  flex-basis: 1rem;
  flex-shrink: 0;
  flex-grow: 0;
  align-self: center;
`;
