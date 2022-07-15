import { Activity, CompletedActivity, indexActivities } from "../domain";
import styled from "styled-components";

function formatDate(date: Date): string {
  const isoUtc = date.toISOString();
  const noMilliseconds = isoUtc.split(".")[0];
  const [day, time] = noMilliseconds.split("T");
  const timeNoSeconds = time.slice(0, 5);
  return `${day} ${timeNoSeconds}`;
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: 7.5rem auto 4rem 4rem 7rem;
`;
const Col1 = styled.div`
  grid-column-start: 1 / span 1;
  justify-self: left;
`;
const Col2 = styled.div`
  grid-column-start: 2 / span 1;
  justify-self: left;
`;
const Col3 = styled.div`
  grid-column-start: 3 / span 1;
  justify-self: center;
`;
const Col4 = styled.div`
  grid-column-start: 4 / span 1;
  justify-self: center;
`;
const Col5 = styled.div`
  grid-column-start: 5 / span 1;
  justify-self: left;
`;

interface HistoryViewProps {
  activities: Activity[];
  history: CompletedActivity[];
}
function HistoryView({ history, activities }: HistoryViewProps) {
  const activityIndex = indexActivities(activities);

  const gridItems: JSX.Element[] = [];
  history.forEach((completedActivity, i) => {
    const activity = activityIndex.get(completedActivity.id) as Activity;
    const date = formatDate(completedActivity.date);
    gridItems.push(<Col1 key={`${i}-1`}>{date}</Col1>);
    gridItems.push(<Col2 key={`${i}-2`}>{activity.name}</Col2>);
    gridItems.push(<Col3 key={`${i}-3`}>{completedActivity.intensity}</Col3>);
    gridItems.push(<Col4 key={`${i}-4`}>{completedActivity.duration}</Col4>);
    gridItems.push(
      <Col5 key={`${i}-5`}>{completedActivity.notes || `...`}</Col5>
    );
  });

  return (
    <div>
      <h1>HistoryView</h1>
      <Grid>{gridItems}</Grid>
    </div>
  );
}

export default HistoryView;
