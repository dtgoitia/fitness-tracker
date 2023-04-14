import { Seconds } from "../../../domain/datetimeUtils";
import styled from "styled-components";

const Time = styled.span`
  font-size: 1rem;
  opacity: 0.7;
`;

const TimeLeft = styled.span`
  font-size: 4rem;
`;

interface CounterProps {
  time: Seconds;
  left: Seconds;
  onClick: () => void;
}

export function Counter({ time, onClick: handleClick, left }: CounterProps) {
  return (
    <div onClick={handleClick}>
      <TimeLeft>{left}"</TimeLeft> / <Time>{time}"</Time>
    </div>
  );
}
