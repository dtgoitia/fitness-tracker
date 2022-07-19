import { Activity, CompletedActivity } from "../../domain";
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

const Container = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  margin-bottom: 0.2rem;
`;

interface RowProps {
  activity: Activity;
  completedActivity: CompletedActivity;
}
function Row({ activity, completedActivity }: RowProps) {
  const time = formatTime(completedActivity.date);
  return (
    <Container>
      <Col1>{time}</Col1>
      <Col2>{activity.name}</Col2>
      <Col3>{completedActivity.intensity}</Col3>
      <Col4>{completedActivity.duration}</Col4>
      <Col5>{completedActivity.notes}</Col5>
    </Container>
  );
}

export default Row;
