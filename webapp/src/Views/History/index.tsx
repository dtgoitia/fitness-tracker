import {
  Activity,
  CompletedActivity,
  CompletedActivityId,
  deleteHistoryActivity,
  duplicateSelection,
  groupByDay,
  indexActivities,
  updateHistory,
} from "../../domain";
import EditableRow from "./EditableRow";
import Row from "./Row";
import { Button, Switch } from "@blueprintjs/core";
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

interface HistoryViewProps {
  activities: Activity[];
  history: CompletedActivity[];
  onHistoryChange: (history: CompletedActivity[]) => void;
}
function HistoryView({
  history,
  activities,
  onHistoryChange,
}: HistoryViewProps) {
  const [isEditModeOn, setIsEditModeOn] = useState<boolean>(false);
  const [selection, setSelected] = useState<Set<CompletedActivityId>>(
    new Set([])
  );

  if (history.length === 0) {
    // Problem: if the edit mode is ON and all the transactions are deleted, the switch
    // will is not visible to exit the edit mode, and when a new completed activity is
    // added, it can be mistakenly deleted.
    //
    // Solution: if the history is empty, just switch off the edit mode.
    if (isEditModeOn) setIsEditModeOn(false);

    return <Container>{`History is empty :)`}</Container>;
  }

  const activityIndex = indexActivities(activities);

  const activitiesByDay = groupByDay(history);

  function deleteRow(id: CompletedActivityId): void {
    const newHistory = deleteHistoryActivity(history, id);
    onHistoryChange(newHistory);
  }

  function updateRow(updated: CompletedActivity): void {
    const newHistory = updateHistory(history, updated);
    onHistoryChange(newHistory);
  }

  function toggleEditMode(): void {
    setIsEditModeOn(!isEditModeOn);
  }

  function unselectAll(): void {
    setSelected(new Set<CompletedActivityId>([]));
  }

  function select(id: CompletedActivityId): Set<CompletedActivityId> {
    return new Set([...selection, id]);
  }

  function unselect(id: CompletedActivityId): Set<CompletedActivityId> {
    return new Set([...selection].filter((selectedId) => selectedId !== id));
  }

  function handleToggleSelect(id: CompletedActivityId): void {
    const newSelection = selection.has(id) ? unselect(id) : select(id);
    setSelected(newSelection);
  }

  function handleDuplicate(): void {
    const newHistory = duplicateSelection(history, selection);
    unselectAll();
    onHistoryChange(newHistory);
  }

  return (
    <Container>
      <Switch
        label={"edit mode"}
        checked={isEditModeOn}
        onClick={toggleEditMode}
        readOnly
      />
      {isEditModeOn ? (
        <Button
          icon="duplicate"
          text="duplicate"
          minimal={true}
          onClick={handleDuplicate}
        />
      ) : null}
      {activitiesByDay.map(([day, dayActivities]) => {
        return (
          <div key={day}>
            <DayHeader>{day}</DayHeader>
            {dayActivities.map((completedActivity) => {
              const activity = activityIndex.get(
                completedActivity.activityId
              ) as Activity;
              const id = completedActivity.id;
              if (isEditModeOn) {
                return (
                  <EditableRow
                    key={id}
                    activity={activity}
                    completedActivity={completedActivity}
                    selected={selection.has(id)}
                    onDelete={() => deleteRow(id)}
                    onChange={updateRow}
                    onToggleSelect={() => handleToggleSelect(id)}
                  />
                );
              }
              return (
                <Row
                  key={id}
                  activity={activity}
                  completedActivity={completedActivity}
                />
              );
            })}
          </div>
        );
      })}
    </Container>
  );
}

export default HistoryView;
