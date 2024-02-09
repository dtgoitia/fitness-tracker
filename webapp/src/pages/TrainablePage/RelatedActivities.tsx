import { useApp } from "../..";
import { Activity, ActivityId } from "../../lib/domain/model";
import Paths from "../../routes";
import { Link } from "react-router-dom";
import styled from "styled-components";

export function RelatedActivities({ activityIds }: { activityIds: Set<ActivityId> }) {
  const app = useApp();
  const activities = [...activityIds]
    .map((activityId) => app.activityManager.get(activityId))
    .filter((maybe) => maybe !== undefined) as Activity[];
  return (
    <div>
      <div>related activities:</div>
      {activities.map(({ id, name }) => (
        <RelatedActivity key={`related-activity-${id}`}>
          <span>-</span>
          <Link to={Paths.activityEditor.replace(":activityId", id)}>{name}</Link>
        </RelatedActivity>
      ))}
    </div>
  );
}

const RelatedActivity = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  gap: 0.5rem;

  padding-top: 0.4rem;
  padding-left: 1rem;
`;
