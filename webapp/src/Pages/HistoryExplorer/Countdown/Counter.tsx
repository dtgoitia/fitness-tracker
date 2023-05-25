import { Seconds } from "../../../domain/datetimeUtils";
import styled from "styled-components";

const Time = styled.span`
  font-size: 1rem;
  opacity: 0.7;
`;

const TimeLeft = styled.span`
  font-size: 10rem;
`;

const Paused = styled.div``;

const Running = styled.div`
  background-color: #425971;
`;

interface CounterProps {
  time: Seconds;
  left: Seconds;
  onClick: () => void;
  running: boolean;
}

export function Counter({ time, onClick: handleClick, left, running }: CounterProps) {
  const Container = running ? Running : Paused;
  return (
    <Container onClick={handleClick}>
      <TimeLeft>{left}"</TimeLeft> / <Time>{time}"</Time>
    </Container>
  );
}
