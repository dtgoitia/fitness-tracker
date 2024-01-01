import { useApp } from "../..";
import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { SearchBox } from "../../components/SearchBox";
import { Activity, ActivityName, FilterQuery } from "../../lib/domain/model";
import Paths from "../../routes";
import BlueprintThemeProvider from "../../style/theme";
import AddActivity from "../HistoryExplorer/AddActivity";
import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

function ActivityExplorer() {
  const app = useApp();
  const activityManager = app.activityManager;

  const [filterQuery, setFilterQuery] = useState<FilterQuery>("");

  function clearSearch(): void {
    setFilterQuery("");
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
          onChange={setFilterQuery}
          clearSearch={clearSearch}
          onFocus={() => {}}
        />
        {activityManager.searchByPrefix(filterQuery).map((activity) => (
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
