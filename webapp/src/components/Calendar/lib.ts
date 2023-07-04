import { CalendarDay } from "./model";

export function getEmptySpacesInFirstWeek(firstDate: Date): undefined[] {
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

export function groupDatesPerWeeks(dates: CalendarDay[]): (CalendarDay | undefined)[][] {
  const weeks: (CalendarDay | undefined)[][] = [];

  const firstDate = dates[0].date;
  const startSpaces = getEmptySpacesInFirstWeek(firstDate);

  let week: (CalendarDay | undefined)[] = [...startSpaces];

  dates.forEach((date) => {
    if (week.length === 7) {
      weeks.push([...week]);
      week = [];
    }

    week.push(date);
  });

  // Add last spaces to fill up the last week
  while (week.length < 7) {
    week.push(undefined);
  }
  weeks.push([...week]);

  return weeks;
}
