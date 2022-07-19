import {
  Activity,
  CompletedActivity,
  CompletedActivityId,
  deleteHistoryActivity,
  indexActivities,
  ISODateString,
  updateHistory,
} from "../../domain";
import EditableRow from "./EditableRow";
import Row from "./Row";
import { Switch } from "@blueprintjs/core";
import { useState } from "react";
import styled from "styled-components";

type DatedActivities = [ISODateString, CompletedActivity[]];

function getDay(date: Date): ISODateString {
  return date.toISOString().slice(0, 10);
}

function groupByDay(history: CompletedActivity[]): DatedActivities[] {
  let dayCursor: ISODateString = getDay(history[0].date);

  let groupedActivities: CompletedActivity[] = [];
  const result: DatedActivities[] = [];

  history.forEach((activity) => {
    const day = getDay(activity.date);
    if (day === dayCursor) {
      groupedActivities.push(activity);
    } else {
      result.push([dayCursor, [...groupedActivities]]);
      groupedActivities = [];
      dayCursor = day;
    }
  });

  if (groupedActivities.length > 0) {
    result.push([dayCursor, [...groupedActivities]]);
  }

  return result;
}

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
