import { Day } from "./Day";
import { DAY_SIZE } from "./constants";
import { groupDatesPerWeeks } from "./lib";
import { CalendarDay } from "./model";
import styled from "styled-components";

interface Props {
  data: CalendarDay[];
}

export function Calendar({ data }: Props) {
  const weeks = groupDatesPerWeeks(data);

  return (
    <Container>
      <svg width={weeks.length * DAY_SIZE} height={DAY_SIZE * 7}>
        {weeks.map((week, column) => {
          return week.map((dayData, row) =>
            dayData ? (
              <Day
                key={`${row}-${column}`}
                text={`${dayData.date.getDate()}`}
                x={DAY_SIZE * column}
                y={DAY_SIZE * row}
                daySize={DAY_SIZE}
                isHighlighted={dayData.isHighlighted}
              />
            ) : undefined
          );
        })}
      </svg>
    </Container>
  );
}

const Container = styled.div`
  margin-top: 1rem;
  overflow-y: scroll;
  user-select: none;
`;
