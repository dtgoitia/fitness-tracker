import { ActivityManager } from "../../domain/activities";
import { ActivityId, Shortcut } from "../../domain/model";
import { ShortcutManager } from "../../domain/shortcuts";
import { Button } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  gap: 1rem;
`;

interface Props {
  activityManager: ActivityManager;
  shortcutManager: ShortcutManager;
  onAddCompletedActivity: (id: ActivityId) => void;
}

export function Shortcuts({
  activityManager,
  shortcutManager,
  onAddCompletedActivity: add,
}: Props) {
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
