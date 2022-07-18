import {
  Activity,
  CompletedActivity,
  CompletedActivityId,
  indexActivities,
} from "../domain";
import { Button } from "@blueprintjs/core";
import styled from "styled-components";

// function formatDate(date: Date): string {
//   const isoUtc = date.toISOString();
//   const noMilliseconds = isoUtc.split(".")[0];
//   const [day, time] = noMilliseconds.split("T");
//   const timeNoSeconds = time.slice(0, 5);
//   return `${day} ${timeNoSeconds}`;
// }

function formatTime(date: Date): string {
  const isoUtc = date.toISOString();
  const noMilliseconds = isoUtc.split(".")[0];
  const [, time] = noMilliseconds.split("T");
  const timeNoSeconds = time.slice(0, 5);
  return `${timeNoSeconds}`;
}

type ISODateString = string;
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

const Col1 = styled.div`
  order: 1;
  flex-basis: 3rem;
  flex-shrink: 0;
  margin-left: 0.3rem;
`;
const Col2 = styled.div`
  order: 2;
  flex-grow: 1;
  flex-shrink: 0;
`;
const Col3 = styled.div`
  order: 3;
  flex-basis: 4rem;
  flex-shrink: 0;
`;
const Col4 = styled.div`
  order: 4;
  flex-basis: 4rem;
  flex-shrink: 0;
`;
const Col5 = styled.div`
  order: 5;
  flex-basis: 7rem;
  flex-shrink: 0;
`;
const Col6 = styled.div`
  order: 6;
  flex-basis: 1rem;
  flex-shrink: 0;
  flex-grow: 0;
`;

const RowContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  margin-bottom: 0.2rem;
`;

interface RowProps {
  activity: Activity;
  completedActivity: CompletedActivity;
  onDelete: () => void;
}
function Row({ activity, completedActivity, onDelete }: RowProps) {
  const time = formatTime(completedActivity.date);
  return (
    <RowContainer>
      <Col1>{time}</Col1>
      <Col2>{activity.name}</Col2>
      <Col3>{completedActivity.intensity}</Col3>
      <Col4>{completedActivity.duration}</Col4>
      <Col5>{completedActivity.notes}</Col5>
      <Col6>
        <Button icon="trash" minimal={true} onClick={onDelete} />
      </Col6>
    </RowContainer>
  );
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
  updateHistory: (history: CompletedActivity[]) => void;
}
function HistoryView({ history, activities, updateHistory }: HistoryViewProps) {
  if (history.length === 0) {
    return <Container>{`History is empty :)`}</Container>;
  }

  const activityIndex = indexActivities(activities);

  const activitiesByDay = groupByDay(history);

  function deleteRow(id: CompletedActivityId): void {
    const newHistory = history.filter(
      (completedActivity) => completedActivity.id !== id
    );
    updateHistory(newHistory);
  }

  return (
    <Container>
      {activitiesByDay.map(([day, dayActivities], i) => {
        return (
          <div key={i}>
            <DayHeader>{day}</DayHeader>
            {dayActivities.map((completedActivity, j) => {
              const activity = activityIndex.get(
                completedActivity.activityId
              ) as Activity;
              return (
                <Row
                  key={j}
                  activity={activity}
                  completedActivity={completedActivity}
                  onDelete={() => deleteRow(completedActivity.id)}
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
