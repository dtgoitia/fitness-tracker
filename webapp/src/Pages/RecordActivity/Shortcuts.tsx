import { ActivityManager } from "../../domain/activities";
import { ActivityId } from "../../domain/model";
import { Button } from "@blueprintjs/core";
import styled from "styled-components";

const SHORTCUTS: ActivityId[] = [
  "act_fzkcejmeox", // walk
  "act_whjeogwmmm", // walk barefoot
  "act_xcflizyiat", // cycle
];

const Container = styled.div`
  display: flex;
  gap: 1rem;
`;

interface Props {
  activityManager: ActivityManager;
  onAddCompletedActivity: (id: ActivityId) => void;
}

export function Shortcuts({ activityManager, onAddCompletedActivity: add }: Props) {
  return (
    <Container>
      {SHORTCUTS.map((activityId) => {
        const activity = activityManager.get(activityId);
        if (activity === undefined) {
          return <div key={activityId}>{activityId} not found</div>;
        }
        return (
          <Button key={activityId} large onClick={() => add(activityId)}>
            {activity.name}
          </Button>
        );
      })}
    </Container>
  );
}
