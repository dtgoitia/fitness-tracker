import { useApp } from "../..";
import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { SearchBox } from "../../components/SearchBox";
import { Activity, ActivityName, FilterQuery } from "../../lib/domain/model";
import { NO_URL_PARAM_VALUE, useUrlParam } from "../../navigation";
import Paths from "../../routes";
import BlueprintThemeProvider from "../../style/theme";
import AddActivity from "../HistoryExplorer/AddActivity";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const NO_FILTER_QUERY = "";

function ActivityExplorer() {
  const app = useApp();
  const activityManager = app.activityManager;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [filterInUrl, setUrlParam] = useUrlParam({ key: "search" });
  const [filterQuery, setFilterQuery] = useState<FilterQuery>(
    filterInUrl || NO_FILTER_QUERY
  );

  function _render(): void {
    setActivities(activityManager.searchByPrefix(filterQuery));
  }

  useEffect(() => {
    const subscription = activityManager.changes$.subscribe((_) => _render());
    _render();

    return () => {
      subscription.unsubscribe();
    };
  }, [activityManager, filterQuery]);

  function handleFilterChange(updated: FilterQuery): void {
    if (updated === filterQuery) {
      return;
    }
    setFilterQuery(updated);
    setUrlParam(updated === NO_FILTER_QUERY ? NO_URL_PARAM_VALUE : updated);
  }

  function clearSearch(): void {
    handleFilterChange("");
  }

  function handleAddNewActivity(name: ActivityName, otherNames: ActivityName[]): void {
    console.log(`ActivityExplorer.handleAddNewActivity::Adding a new activity: ${name}`);
    activityManager.add({ name, otherNames });
  }

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <h1>Activity explorer</h1>

        <AddActivity add={handleAddNewActivity} />

        <hr />

        <SearchBox
          query={filterQuery}
          onChange={handleFilterChange}
          clearSearch={clearSearch}
          onFocus={() => {}}
        />
        {activities.map((activity) => (
          <OpenActivityEditor key={activity.id} activity={activity} />
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
