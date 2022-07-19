import {
  Activity,
  CompletedActivity,
  CompletedActivityId,
  deleteHistoryActivity,
  groupByDay,
  indexActivities,
  updateHistory,
} from "../../domain";
import EditableRow from "./EditableRow";
import Row from "./Row";
import { Switch } from "@blueprintjs/core";
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

  if (history.length === 0) {
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

  return (
    <Container>
      <Switch
        label={"edit mode"}
        checked={isEditModeOn}
        onClick={toggleEditMode}
        readOnly
      />
      {activitiesByDay.map(([day, dayActivities], i) => {
        return (
          <div key={i}>
            <DayHeader>{day}</DayHeader>
            {dayActivities.map((completedActivity, j) => {
              const activity = activityIndex.get(
                completedActivity.activityId
              ) as Activity;
              if (isEditModeOn) {
                return (
                  <EditableRow
                    key={j}
                    activity={activity}
                    completedActivity={completedActivity}
                    onDelete={() => deleteRow(completedActivity.id)}
                    onChange={updateRow}
                  />
                );
              }
              return (
                <Row
                  key={j}
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
