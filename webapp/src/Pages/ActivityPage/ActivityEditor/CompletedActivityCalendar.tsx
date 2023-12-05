import { useApp } from "../../..";
import { Calendar } from "../../../components/Calendar";
import { CalendarDay } from "../../../components/Calendar/model";
import { nextDay, toDay, today } from "../../../lib/datetimeUtils";
import { ActivityId, CompletedActivity } from "../../../lib/model";
import { useEffect, useState } from "react";

interface Props {
  activityId: ActivityId;
}

export function CompletedActivityCalendar({ activityId }: Props) {
  const app = useApp();
  const completedActivityManager = app.completedActivityManager;

  const [completed, setCompleted] = useState<CompletedActivity[]>([]);

  useEffect(() => {
    const subscription = completedActivityManager.changes$.subscribe(() => {
      const all = completedActivityManager
        .getAll()
        .filter((completed) => completed.activityId === activityId);
      all.reverse();
      setCompleted(all);
    });

    const all = completedActivityManager
      .getAll()
      .filter((completed) => completed.activityId === activityId);
    all.reverse();
    setCompleted(all);

    return () => subscription.unsubscribe();
  }, [activityId, completedActivityManager]);

  if (completed.length === 0) {
    return <div>No data for this activity</div>;
  }

  const data = generateCalendarData(completed);

  return <Calendar data={data} />;
}

function generateCalendarData(completed: CompletedActivity[]): CalendarDay[] {
  const _today = today().getTime();
  const highlightedDates = getDatesWhereActivityWasCompleted(completed);

  const first = completed[0];
  const firstDate = toDay(first.date);
  const data: CalendarDay[] = [
    {
      date: firstDate,
      isHighlighted: true,
    },
  ];

  let last: Date = firstDate;

  while (last.getTime() < _today) {
    const next = nextDay(last);
    const isHighlighted = highlightedDates.has(next.getTime());
    data.push({ date: next, isHighlighted });
    last = next;
  }

  return data;
}

type Time = number;

function getDatesWhereActivityWasCompleted(
  completedActivities: CompletedActivity[]
): Set<Time> {
  const result: Set<Time> = new Set();

  for (const completed of completedActivities) {
    result.add(toDay(completed.date).getTime());
  }

  return result;
}
