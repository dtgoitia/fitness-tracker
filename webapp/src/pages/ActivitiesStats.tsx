import { useApp } from "..";
import CenteredPage from "../components/CenteredPage";
import NavBar from "../components/NavBar";
import { Seconds, formatTimedelta, isoDateFormatter, now } from "../lib/datetimeUtils";
import { getLastOccurrences } from "../lib/domain/completedActivities";
import { ActivityId, ActivityName, CompletedActivity } from "../lib/domain/model";
import Paths from "../routes";
import BlueprintThemeProvider from "../style/theme";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

interface HydratedCompletedActivity extends CompletedActivity {
  activityName: ActivityName;
  sinceCompleted: Seconds;
}

export function ActivitiesStatsPage() {
  const app = useApp();
  const activityManager = app.activityManager;
  const completedActivityManager = app.completedActivityManager;

  const [history, setHistory] = useState<CompletedActivity[]>([]);

  const _now = now();

  const computeTimedelta = (completed: CompletedActivity): Seconds =>
    (_now.getTime() - completed.date.getTime()) / 1000;

  useEffect(() => {
    completedActivityManager.changes$.subscribe((_) => {
      const history = completedActivityManager.getAll();
      setHistory(history);
    });

    const history = completedActivityManager.getAll();
    setHistory(history);
  }, [activityManager, completedActivityManager]);

  function getActivityName(id: ActivityId): ActivityName {
    return activityManager.get(id)?.name || `Activity ${id} not found`;
  }

  function hydrate(completed: CompletedActivity): HydratedCompletedActivity {
    return {
      ...completed,
      sinceCompleted: computeTimedelta(completed),
      activityName: getActivityName(completed.activityId),
    };
  }

  const lastOcurrences = getLastOccurrences(history).map(hydrate);

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <h3>Last completed activities</h3>
        <div>
          {lastOcurrences.length > 0 ? (
            <ul>
              {lastOcurrences.map((completedActivity, i) => (
                <LastOcurrence completed={completedActivity} key={i} />
              ))}
            </ul>
          ) : null}
        </div>
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}

const OrderedListContainer = styled.ol`
  display: flex;
  column-gap: 1rem;
  justify-content: space-between;

  margin-bottom: 0.2rem;
`;

const SinceCompleted = styled.div``;
const Name = styled.div``;
const CompletionDate = styled.div``;

function LastOcurrence({ completed }: { completed: HydratedCompletedActivity }) {
  const delta = formatTimedelta(completed.sinceCompleted);
  const days = delta.split(" ").slice(0, 2).join(" ");
  return (
    <OrderedListContainer>
      <SinceCompleted>{days}</SinceCompleted>
      <Name>
        <Link to={`${Paths.activities}/${completed.activityId}`}>
          {completed.activityName}
        </Link>
      </Name>
      <CompletionDate>{isoDateFormatter(completed.date)}</CompletionDate>
    </OrderedListContainer>
  );
}
