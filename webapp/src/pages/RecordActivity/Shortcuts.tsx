import { useApp } from "../..";
import { ActivityId, Shortcut } from "../../lib/domain/model";
import { Button } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  gap: 1rem;
`;

interface Props {
  onAddCompletedActivity: (id: ActivityId) => void;
}

export function Shortcuts({ onAddCompletedActivity: add }: Props) {
  const app = useApp();
  const activityManager = app.activityManager;
  const shortcutManager = app.shortcutManager;

  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);

  useEffect(() => {
    const subscription = shortcutManager.change$.subscribe(() => {
      setShortcuts(shortcutManager.getAll());
    });

    setShortcuts(shortcutManager.getAll());

    return () => {
      subscription.unsubscribe();
    };
  }, [shortcutManager]);

  return (
    <Container>
      {shortcuts.map((activityId) => {
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
