import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { ActivityManager } from "../../domain/activities";
import { Activity } from "../../domain/model";
import Paths from "../../routes";
import BlueprintThemeProvider from "../../style/theme";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

interface Props {
  activityManager: ActivityManager;
}
function ActivityExplorer({ activityManager }: Props) {
  const [activites, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const subscription = activityManager.changes$.subscribe((_) => {
      setActivities(activityManager.getAll());
    });
    setActivities(activityManager.getAll());
    return () => {
      subscription.unsubscribe();
    };
  }, [activityManager]);

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <div>ActivitiesPage</div>
        {activites.map((activity) => (
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
