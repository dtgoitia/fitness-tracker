import { ActivityManager } from "../../domain/activities";
import { ActivityName, Shortcut } from "../../domain/model";
import { ShortcutManager } from "../../domain/shortcuts";
import { Button } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div``;
const Name = styled.div``;
const DeleteButton = styled(Button)``;

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
  });

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
