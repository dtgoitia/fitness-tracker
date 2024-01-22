import { useApp } from "../../..";
import { isoDateFormatter as toISODate } from "../../../lib/datetimeUtils";
import { groupByWeek } from "../../../lib/domain/completedActivities";
import { Activity, CompletedActivity } from "../../../lib/domain/model";
import { formatTime } from "../../HistoryExplorer/History/datetime";
import { useEffect, useState } from "react";
import styled from "styled-components";

interface Props {
  activity: Activity;
}

export function CompletedActivities({ activity }: Props) {
  const app = useApp();
  const completedActivityManager = app.completedActivityManager;

  const [completed, setCompleted] = useState<CompletedActivity[]>([]);

  useEffect(() => {
    const subscription = completedActivityManager.changes$.subscribe(() => {
      const all = completedActivityManager
        .getAll()
        .filter((completed) => completed.activityId === activity.id);
      // all.reverse();
      setCompleted(all);
    });

    const all = completedActivityManager
      .getAll()
      .filter((completed) => completed.activityId === activity.id);
    // all.reverse();
    setCompleted(all);

    return () => subscription.unsubscribe();
  }, [activity.id, completedActivityManager]);

  if (completed.length === 0) {
    return <div>No data for this activity</div>;
  }

  const byWeek = groupByWeek(completed);

  return (
    <Container>
      <ol>
        {byWeek.map(([weekStartDate, completedInDay]) => (
          <li key={weekStartDate}>
            <WeekHeader>{weekStartDate}</WeekHeader>
            <ol>
              {completedInDay.map((completedActivity) => (
                <Row key={completedActivity.id} completedActivity={completedActivity} />
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </Container>
  );
}

const Container = styled.div`
  padding-top: 1rem;
`;

const WeekHeader = styled.div`
  font-size: 1rem;
  border-bottom: 1px rgba(255, 255, 255, 0.3) solid;
  margin-top: 0.8rem;
  margin-bottom: 0.3rem;
  padding-bottom: 0.3rem;
`;

const Col1 = styled.div`
  order: 1;
  flex-basis: 5rem;
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

const RowContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  margin-bottom: 0.2rem;
`;

interface RowProps {
  completedActivity: CompletedActivity;
}
function Row({ completedActivity }: RowProps) {
  const date = toISODate(completedActivity.date);
  const time = formatTime(completedActivity.date);
  return (
    <RowContainer>
      <Col1>{date}</Col1>
      <Col2>{time}</Col2>
      <Col3>{completedActivity.intensity}</Col3>
      <Col4>{completedActivity.duration}</Col4>
      <Col5>{completedActivity.notes}</Col5>
    </RowContainer>
  );
}
