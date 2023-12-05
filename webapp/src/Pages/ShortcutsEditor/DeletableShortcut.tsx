import { ActivityManager } from "../../lib/activities";
import { ActivityName, Shortcut } from "../../lib/model";
import { ShortcutManager } from "../../lib/shortcuts";
import { Button } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  margin: 1rem;

  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.7rem;
`;

const Name = styled.div`
  order: 0;
  flex-basis: auto;
`;

const DeleteButton = styled(Button)`
  order: 1;
  flex-basis: 0;
`;

interface Props {
  shortcut: Shortcut;
  shortcutManager: ShortcutManager;
  activityManager: ActivityManager;
}

export function DeletableShortcut({ shortcut, shortcutManager, activityManager }: Props) {
  const [name, setName] = useState<ActivityName | undefined>();

  useEffect(() => {
    const subscription = activityManager.changes$.subscribe(() => {
      setName(activityManager.get(shortcut)?.name);
    });

    setName(activityManager.get(shortcut)?.name);

    return () => {
      subscription.unsubscribe();
    };
  }, [shortcut, activityManager]);

  if (name === undefined) {
    return (
      <Container>
        No Activity has ID <code>{shortcut}</code>
      </Container>
    );
  }

  return (
    <Container>
      <Name>{name}</Name>
      <DeleteButton icon="trash" onClick={() => shortcutManager.remove({ shortcut })} />
    </Container>
  );
}
