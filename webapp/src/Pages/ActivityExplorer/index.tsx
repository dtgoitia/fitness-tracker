import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { ActivityManager } from "../../domain/activities";
import { Activity, FilterQuery } from "../../domain/model";
import { filterInventory } from "../../domain/search";
import Paths from "../../routes";
import BlueprintThemeProvider from "../../style/theme";
import SearchBox from "../HistoryExplorer/SearchBox";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

interface Props {
  activityManager: ActivityManager;
}
function ActivityExplorer({ activityManager }: Props) {
  const [activites, setActivities] = useState<Activity[]>([]);

  const [filterQuery, setFilterQuery] = useState<FilterQuery>("");

  useEffect(() => {
    const subscription = activityManager.changes$.subscribe((_) => {
      setActivities(activityManager.getAll());
    });
    setActivities(activityManager.getAll());
    return () => {
      subscription.unsubscribe();
    };
  }, [activityManager]);

  function clearSearch(): void {
    setFilterQuery("");
  }

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <h1>Activity explorer</h1>
        <SearchBox
          query={filterQuery}
          onChange={setFilterQuery}
          clearSearch={clearSearch}
          onFocus={() => {}}
        />
        {filterInventory(activites, filterQuery).map((activity) => (
          <OpenActivityEditor activity={activity} />
        ))}
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}

export default ActivityExplorer;

const LinkContainer = styled.div`
  margin: 1rem 0;
`;

function OpenActivityEditor({ activity }: { activity: Activity }) {
  const path = `${Paths.activities}/${activity.id}`;

  return (
    <LinkContainer>
      <Link to={path}>{activity.name}</Link>
    </LinkContainer>
  );
}
