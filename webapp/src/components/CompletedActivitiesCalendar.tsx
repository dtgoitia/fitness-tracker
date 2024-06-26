import { useApp } from "..";
import { nextDay, toUTCDay, today } from "../lib/datetimeUtils";
import { ActivityId, CompletedActivity } from "../lib/domain/model";
import { Calendar } from "./Calendar";
import { CalendarDay } from "./Calendar/model";
import { useEffect, useState } from "react";
import styled from "styled-components";

interface Props {
  activityIds: Set<ActivityId>;
}

export function CompletedActivitiesCalendar({ activityIds }: Props) {
  const app = useApp();
  const completedActivityManager = app.completedActivityManager;

  const [completed, setCompleted] = useState<CompletedActivity[]>([]);

  function _render(): void {
    const all = completedActivityManager
      .getAll({ order: "reverse-chronological" })
      .filter((completed) => activityIds.has(completed.activityId));
    all.reverse();
    setCompleted(all);
  }

  useEffect(() => {
    const subscription = completedActivityManager.changes$.subscribe(() => {
      _render();
    });

    _render();

    return () => subscription.unsubscribe();
  }, [activityIds, completedActivityManager]);

  if (completed.length === 0) {
    return <div>No data for this activity</div>;
  }

  const data = generateCalendarData(completed);

  return (
    <Container>
      <div>Completed activities:</div>
      <Calendar data={data} />
    </Container>
  );
}

const Container = styled.div`
  padding-top: 1rem;
`;

function generateCalendarData(completed: CompletedActivity[]): CalendarDay[] {
  const _today = today().getTime();
  const highlightedDates = getDatesWhereActivityWasCompleted(completed);

  const first = completed[0];
  const data: CalendarDay[] = [
    {
      date: first.date,
      isHighlighted: true,
    },
  ];

  let last: Date = toUTCDay(first.date);

  while (last.getTime() < _today) {
    const next = nextDay(last);
    const isHighlighted = highlightedDates.has(next.getTime());
    data.push({ date: next, isHighlighted });
    last = next;
  }

  return data;
}

type DateAsEpoch = number;

function getDatesWhereActivityWasCompleted(
  completedActivities: CompletedActivity[]
): Set<DateAsEpoch> {
  const result: Set<DateAsEpoch> = new Set();

  for (const completed of completedActivities) {
    const date = toUTCDay(completed.date);
    result.add(date.getTime());
  }

  return result;
}
