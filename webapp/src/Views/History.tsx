import { Activity, CompletedActivity, indexActivities } from "../domain";
import styled from "styled-components";

function formatDate(date: Date): string {
  const isoUtc = date.toISOString();
  const noMilliseconds = isoUtc.split(".")[0];
  const [day, time] = noMilliseconds.split("T");
  const timeNoSeconds = time.slice(0, 5);
  return `${day} ${timeNoSeconds}`;
}

const Col1 = styled.div`
  order: 1;
  flex-basis: 7.5rem;
  flex-shrink: 0;
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
`;

interface RowProps {
  activity: Activity;
  completedActivity: CompletedActivity;
}
function Row({ activity, completedActivity }: RowProps) {
  const date = formatDate(completedActivity.date);
  return (
    <RowContainer>
      <Col1>{date}</Col1>
      <Col2>{activity.name}</Col2>
      <Col3>{completedActivity.intensity}</Col3>
      <Col4>{completedActivity.duration}</Col4>
      <Col5>{completedActivity.notes}</Col5>
    </RowContainer>
  );
}

interface HistoryViewProps {
  activities: Activity[];
  history: CompletedActivity[];
}
function HistoryView({ history, activities }: HistoryViewProps) {
  const activityIndex = indexActivities(activities);

  return (
    <div>
      <h1>HistoryView</h1>
      <div>
        {history.map((completedActivity, i) => {
          const activity = activityIndex.get(completedActivity.id) as Activity;
          return (
            <Row activity={activity} completedActivity={completedActivity} />
          );
        })}
      </div>
    </div>
  );
}

export default HistoryView;
