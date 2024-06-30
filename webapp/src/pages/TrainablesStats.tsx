import { useApp } from "..";
import CenteredPage from "../components/CenteredPage";
import NavBar from "../components/NavBar";
import { Seconds, formatTimedelta, isoDateFormatter, now } from "../lib/datetimeUtils";
import { CompletedTrainable } from "../lib/domain/model";
import Paths from "../routes";
import BlueprintThemeProvider from "../style/theme";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { merge } from "rxjs";
import styled from "styled-components";

interface HydratedCompletedTrainable extends CompletedTrainable {
  sinceCompleted: Seconds;
}

export function TrainablesStatsPage() {
  const app = useApp();

  const [lastTrainables, setTrainableHistory] = useState<CompletedTrainable[]>([]);

  const _now = now();

  const computeTimedelta = (completed: CompletedTrainable): Seconds =>
    (_now.getTime() - completed.date.getTime()) / 1000;

  function _render(): void {
    setTrainableHistory(app.getTrainableStats());
  }

  useEffect(() => {
    const subscription = merge(
      app.completedActivityManager.changes$,
      app.activityManager.changes$,
      app.trainableManager.changes$
    ).subscribe(() => {
      _render();
    });

    _render();

    return () => {
      subscription.unsubscribe();
    };
  }, [app]);

  function hydrate(completed: CompletedTrainable): HydratedCompletedTrainable {
    return {
      ...completed,
      sinceCompleted: computeTimedelta(completed),
    };
  }

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <h3>Last completed trainables</h3>
        <div>
          {lastTrainables.length === 0 ? (
            <p>none found</p>
          ) : (
            <ul>
              {lastTrainables.map((completed, i) => (
                <LastOcurrence completed={hydrate(completed)} key={i} />
              ))}
            </ul>
          )}
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

function LastOcurrence({ completed }: { completed: HydratedCompletedTrainable }) {
  const delta = formatTimedelta(completed.sinceCompleted);
  const days = delta.split(" ").slice(0, 2).join(" ");
  return (
    <OrderedListContainer>
      <SinceCompleted>{days}</SinceCompleted>
      <Name>
        <Link to={Paths.trainableEditor.replace(":trainableId", completed.trainableId)}>
          {completed.trainableName}
        </Link>
      </Name>
      <CompletionDate>{isoDateFormatter(completed.date)}</CompletionDate>
    </OrderedListContainer>
  );
}
