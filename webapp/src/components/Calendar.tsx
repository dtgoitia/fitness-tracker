import { ActivityManager } from "../domain/activities";
import { CompletedActivityManager } from "../domain/completedActivities";
import { today } from "../domain/datetimeUtils";
import { ActivityId } from "../domain/model";
import styled from "styled-components";

const TODAY = today();

function dayBefore(date: Date): Date {
  return new Date(date.getTime() - 24 * 3600 * 1000);
}

function getMockedDates(start: Date): Date[] {
  const dates: Date[] = [start];

  let last: Date = start;

  for (let i = 0; i < 90; i++) {
    const next = dayBefore(last);
    dates.push(next);
    last = next;
  }

  dates.reverse();

  return dates;
}

const DATES: Date[] = getMockedDates(TODAY);

interface Props {
  activityId: ActivityId;
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
}

export function Calendar({
  activityId,
  activityManager,
  completedActivityManager,
}: Props) {
  const daySize = 30;
  const dates = DATES;

  const weeks = groupDatesPerWeeks(dates);

  return (
    <Container>
      <h1>Calendar</h1>
      <SVGContainer>
        <svg width={weeks.length * daySize} height={daySize * 7}>
          {weeks.map((week, i) => (
            <CalendarColumn key={i} column={i} week={week} daySize={daySize} />
          ))}
        </svg>
      </SVGContainer>
    </Container>
  );
}

const Container = styled.div``;

const SVGContainer = styled.div`
  overflow-y: scroll;
  /* border: 1px solid gray; */
  user-select: none;
`;

function CalendarColumn({
  column,
  week,
  daySize,
}: {
  column: number;
  week: (Date | undefined)[];
  daySize: number;
}) {
  return (
    <g id={`calendar-column-${column}`}>
      {week.map((date, row) =>
        date ? (
          <CalendarDay
            key={row}
            text={`${date.getDate()}`}
            x={daySize * column}
            y={daySize * row}
            daySize={daySize}
          />
        ) : undefined
      )}
    </g>
  );
}

function CalendarDay({
  text,
  x,
  y,
  daySize,
}: {
  text: string;
  x: number;
  y: number;
  daySize: number;
}) {
  return (
    <>
      <rect
        x={x}
        y={y}
        width={daySize}
        height={daySize}
        stroke="white"
        strokeWidth="1"
        fill="black"
        opacity={0.1}
      />
      <text
        x={x + 0.5 * daySize}
        y={y + 0.5 * daySize}
        textAnchor="middle"
        alignmentBaseline="middle"
        fill="white"
        opacity={0.4}
      >
        {text}
      </text>
    </>
  );
}

function getEmptySpacesInFirstWeek(firstDate: Date): undefined[] {
  const weekday = firstDate.getDay();

  switch (weekday) {
    case 1: // Monday
      return [];
    case 2: // Tuesday
      return [undefined];
    case 3: // Wednesday
      return [undefined, undefined];
    case 4: // Thursday
      return [undefined, undefined, undefined];
    case 5: // Friday
      return [undefined, undefined, undefined, undefined];
    case 6: // Saturday
      return [undefined, undefined, undefined, undefined, undefined];
    case 0: // Sunday
      return [undefined, undefined, undefined, undefined, undefined, undefined];
    default:
      throw new Error(`Unexpected weekday: ${weekday}`);
  }
}

function groupDatesPerWeeks(dates: Date[]): Array<Array<Date | undefined>> {
  const result: Array<Array<Date | undefined>> = [];

  const firstDate = dates[0];
  const startSpaces = getEmptySpacesInFirstWeek(firstDate);

  let week: Array<Date | undefined> = [...startSpaces];

  dates.forEach((date) => {
    if (week.length === 7) {
      result.push([...week]);
      week = [];
    }
    week.push(date);
  });

  while (week.length < 7) {
    week.push(undefined);
  }
  result.push([...week]);

  return result;
}
