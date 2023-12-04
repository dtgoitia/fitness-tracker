import { ButtonRibbon } from "../../components/ButtonRibbon";
import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import {
  ActivityManager,
  getDurationLevelShorthand,
  getIntensityLevelShorthand,
} from "../../domain/activities";
import {
  CompletedActivityDeleted,
  CompletedActivityManager,
  CompletedActivityUpdated,
} from "../../domain/completedActivities";
import {
  setCompletedActivityDate,
  setCompletedActivityDuration,
  setCompletedActivityIntensity,
  setCompletedActivityNotes,
} from "../../domain/completedActivities";
import {
  Activity,
  CompletedActivity as CActivity,
  CompletedActivityId as CActivityId,
  Duration,
  Intensity,
} from "../../domain/model";
import Paths from "../../routes";
import BlueprintThemeProvider from "../../style/theme";
import { formatTime } from "../HistoryExplorer/History/datetime";
import { Button, Dialog, EditableText } from "@blueprintjs/core";
import { TimePrecision, DatePicker } from "@blueprintjs/datetime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

interface Props {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
}

export function CompletedActivityEditor({
  activityManager,
  completedActivityManager,
}: Props) {
  const { completedActivityId: cActivityId } = useParams();
  const navigate = useNavigate();

  const [cActivity, setCActivity] = useState<CActivity | undefined>();
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [activity, setActivity] = useState<Activity | undefined>();

  function _rerender(): void {
    if (cActivityId === undefined) {
      navigate(Paths.notFound);
      return;
    }

    const completed = completedActivityManager.get(cActivityId);
    setCActivity(completed);
  }

  useEffect(() => {
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
  }, [completedActivityManager, cActivityId, navigate]);

  if (cActivity === undefined) {
    navigate(Paths.root);
    return null;
  }

  const time: string = formatTime(cActivity.date);

  function handleDateInputChange(date: Date): void {
    completedActivityManager.update({
      completedActivity: setCompletedActivityDate(cActivity as CActivity, date),
    });
  }

  function handleIntensityChange(intensity: Intensity): void {
    completedActivityManager.update({
      completedActivity: setCompletedActivityIntensity(cActivity as CActivity, intensity),
    });
  }

  function handleDurationChange(duration: Duration): void {
    completedActivityManager.update({
      completedActivity: setCompletedActivityDuration(cActivity as CActivity, duration),
    });
  }

  function handleNotesChange(notes: string): void {
    completedActivityManager.update({
      completedActivity: setCompletedActivityNotes(cActivity as CActivity, notes),
    });
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
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <p>
          ID:&nbsp;&nbsp;&nbsp;<code>{cActivityId}</code>
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
            text={time}
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
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}

const selectWidth = 0.9;
const editWidth = 5;

const EditTime = styled.div`
  flex-basis: ${editWidth}rem;
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
