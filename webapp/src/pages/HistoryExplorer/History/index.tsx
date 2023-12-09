import { useApp } from "../../..";
import { groupByDay } from "../../../lib/domain/completedActivities";
import {
  Activity,
  CompletedActivity,
  CompletedActivityId,
} from "../../../lib/domain/model";
import Row from "./Row";
import { Dialog } from "@blueprintjs/core";
import { Button, Switch } from "@blueprintjs/core";
import { DatePicker } from "@blueprintjs/datetime";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";
import { useState } from "react";
import styled from "styled-components";

const DayHeader = styled.div`
  font-size: 1rem;
  border-bottom: 1px rgba(255, 255, 255, 0.3) solid;
  margin-top: 0.8rem;
  margin-bottom: 0.3rem;
  padding-bottom: 0.3rem;
`;

const Container = styled.div`
  padding: 1rem 0;
`;

const HeaderButtons = styled.div`
  display: flex;
  flex-flow: column no-wrap;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  column-gap: 2rem;
`;

interface HistoryViewProps {
  history: CompletedActivity[];
  updateCompletedActivity: (updated: CompletedActivity) => void;
  deleteCompletedActivity: (id: CompletedActivityId) => void;
  duplicateCompletedActivities: (ids: Set<CompletedActivityId>) => void;
  deleteUntilDate: (date: Date) => void;
  purge: () => void;
}

export function HistoryView({
  history,
  duplicateCompletedActivities,
  deleteUntilDate,
  purge,
}: HistoryViewProps) {
  const app = useApp();
  const activityManager = app.activityManager;

  const [isEditModeOn, setIsEditModeOn] = useState<boolean>(false);
  const [selection, setSelected] = useState<Set<CompletedActivityId>>(new Set([]));
  const [showDeletionDatePicker, setShowDeletionDatePicker] = useState<boolean>(false);
  const [deletionDate, setDeletionDate] = useState<Date | undefined>();

  if (history.length === 0) {
    // Problem: if the edit mode is ON and all the transactions are deleted, the switch
    // will is not visible to exit the edit mode, and when a new completed activity is
    // added, it can be mistakenly deleted.
    //
    // Solution: if the history is empty, just switch off the edit mode.
    if (isEditModeOn) setIsEditModeOn(false);

    return <Container>{`History is empty :)`}</Container>;
  }

  const activitiesByDay = groupByDay(history);

  function toggleEditMode(): void {
    setIsEditModeOn(!isEditModeOn);
  }

  function unselectAll(): void {
    setSelected(new Set<CompletedActivityId>([]));
  }

  function select(id: CompletedActivityId): Set<CompletedActivityId> {
    // recreate the set to avoid mutations
    return new Set([...selection, id]);
  }

  function unselect(id: CompletedActivityId): Set<CompletedActivityId> {
    // recreate the set to avoid mutations
    return new Set([...selection].filter((selectedId) => selectedId !== id));
  }

  function handleToggleSelect(id: CompletedActivityId): void {
    const newSelection = selection.has(id) ? unselect(id) : select(id);
    setSelected(newSelection);
  }

  function handleDuplicate(): void {
    duplicateCompletedActivities(selection);
    unselectAll();
  }

  function handleClickOnDeleteUntilDateButton(): void {
    if (deletionDate === undefined) {
      setShowDeletionDatePicker(true);
      return;
    }

    deleteUntilDate(deletionDate);
    setDeletionDate(undefined);
  }

  return (
    <Container>
      <Dialog
        title="Select a date"
        isOpen={showDeletionDatePicker}
        autoFocus={true}
        canOutsideClickClose={true}
        isCloseButtonShown={true}
        canEscapeKeyClose={true}
        transitionDuration={0}
        onClose={() => setShowDeletionDatePicker(false)}
      >
        <div className="bp4-dialog-body">
          <DatePicker
            value={deletionDate}
            defaultValue={new Date()}
            shortcuts={true}
            highlightCurrentDay={true}
            onChange={(date) => setDeletionDate(date)}
          />
        </div>
        <div className="bp4-dialog-footer">Changes are saved automatically</div>
      </Dialog>

      <Switch
        label={"edit mode"}
        checked={isEditModeOn}
        onClick={toggleEditMode}
        readOnly
      />

      {isEditModeOn ? (
        <HeaderButtons>
          <Button
            icon="duplicate"
            text="duplicate"
            minimal={true}
            onClick={handleDuplicate}
          />
          <Button
            text="Purge"
            icon="warning-sign"
            intent="danger"
            large
            onClick={purge}
          />
          <Button
            text={
              deletionDate
                ? `Delete until ${deletionDate.toISOString().slice(0, 10)}`
                : "Delete until..."
            }
            icon={deletionDate ? "warning-sign" : undefined}
            intent={deletionDate ? "danger" : undefined}
            large
            onClick={handleClickOnDeleteUntilDateButton}
          />
        </HeaderButtons>
      ) : null}

      {activitiesByDay.map(([day, dayActivities]) => {
        return (
          <div key={day}>
            <DayHeader>{day}</DayHeader>
            {dayActivities.map((completedActivity) => {
              const { id, activityId } = completedActivity;
              const activity = activityManager.get(activityId) as Activity;
              if (activity === undefined) {
                const errorMessage =
                  `CompletedActivity ${id} points an Activity ${activityId} that does` +
                  ` not exist`;
                return <div key={id}>{errorMessage}</div>;
              }

              if (isEditModeOn) {
                return (
                  <SelectableRowContainer key={id}>
                    <CheckboxContainer>
                      <input
                        type="checkbox"
                        checked={selection.has(id)}
                        onChange={() => handleToggleSelect(id)}
                      />
                    </CheckboxContainer>
                    <RowContainer>
                      <Row
                        key={id}
                        activity={activity}
                        completedActivity={completedActivity}
                      />
                    </RowContainer>
                  </SelectableRowContainer>
                );
              }

              return (
                <NormalRowContainer key={id}>
                  <Row activity={activity} completedActivity={completedActivity} />
                </NormalRowContainer>
              );
            })}
          </div>
        );
      })}
    </Container>
  );
}

const NormalRowContainer = styled.div`
  margin: 1rem 0;
`;

const SelectableRowContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const CheckboxContainer = styled.div`
  order: 0;
  align-self: flex-start;
`;

const RowContainer = styled.div`
  order: 1;
  align-self: center;
  width: 100%;
`;
