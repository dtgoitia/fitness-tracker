import { useApp } from "../../..";
import { isoDateFormatter as toISODate } from "../../../lib/datetimeUtils";
import {
  ItemsPerWeek,
  groupRetrochronologicalItemsByWeek,
} from "../../../lib/domain/completedActivities";
import { Activity, CompletedActivity } from "../../../lib/domain/model";
import { formatTime } from "../../HistoryExplorer/History/datetime";
import { Button } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import styled from "styled-components";

interface Props {
  activity: Activity;
}

type CActivitiesPerWeek = ItemsPerWeek<CompletedActivity>;

export function CompletedActivities({ activity }: Props) {
  const app = useApp();
  const completedActivityManager = app.completedActivityManager;

  const [completed, setCompleted] = useState<CompletedActivity[]>([]);
  const [groupedByWeek, setGroupedByWeek] = useState<CActivitiesPerWeek[]>([]);
  const [displayedAmount, setDisplayedAmount] = useState<number>(10);

  function refreshState(allCompleted: CompletedActivity[]): void {
    setCompleted(allCompleted);
    if (allCompleted.length === 0) {
      setGroupedByWeek([]);
      return;
    }

    setGroupedByWeek(
      groupRetrochronologicalItemsByWeek({ items: allCompleted, fillGaps: true })
    );
  }

  useEffect(() => {
    const subscription = completedActivityManager.changes$.subscribe(() => {
      const all = completedActivityManager
        .getAll({ order: "reverse-chronological" })
        .filter((completed) => completed.activityId === activity.id);
      refreshState(all);
    });

    const all = completedActivityManager
      .getAll({ order: "reverse-chronological" })
      .filter((completed) => completed.activityId === activity.id);
    refreshState(all);

    return () => subscription.unsubscribe();
  }, [activity.id, completedActivityManager]);

  if (completed.length === 0) {
    return <div>No data for this activity</div>;
  }

  const paginated = groupedByWeek.slice(0, displayedAmount);

  const canShowMore = displayedAmount < groupedByWeek.length;

  return (
    <PaddedContainer>
      <ol>
        {paginated.map(([weekStartDate, completedInDay]) => (
          <li key={weekStartDate}>
            <ol>
              {completedInDay.map((completedActivity) => (
                <Row key={completedActivity.id} completedActivity={completedActivity} />
              ))}
            </ol>
            <WeekHeader>{weekStartDate}</WeekHeader>
          </li>
        ))}
      </ol>
      {canShowMore && (
        <ShowMoreButtonContainer>
          <Button
            intent="none"
            text="show 10 weeks more"
            onClick={() => setDisplayedAmount(displayedAmount + 10)}
            large
          />
        </ShowMoreButtonContainer>
      )}
    </PaddedContainer>
  );
}

const PaddedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  padding-top: 1rem;
  padding-bottom: 4rem;
`;

const ShowMoreButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const WeekHeader = styled.div`
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.5);
  border-bottom: 1px rgba(255, 255, 255, 0.3) solid;
  margin-top: 0.3rem;
  margin-bottom: 1.8rem;
  padding-bottom: 0.3rem;
`;

const Col1 = styled.div`
  order: 1;
  flex-basis: 5rem;
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

const RowContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  margin-bottom: 0.2rem;
`;

interface RowProps {
  completedActivity: CompletedActivity;
}
function Row({ completedActivity }: RowProps) {
  const date = toISODate(completedActivity.date);
  const time = formatTime(completedActivity.date);
  return (
    <RowContainer>
      <Col1>{date}</Col1>
      <Col2>{time}</Col2>
      <Col3>{completedActivity.intensity}</Col3>
      <Col4>{completedActivity.duration}</Col4>
      <Col5>{completedActivity.notes}</Col5>
    </RowContainer>
  );
}
