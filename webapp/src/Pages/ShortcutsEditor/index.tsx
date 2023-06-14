import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { ActivityManager } from "../../domain/activities";
import { Shortcut } from "../../domain/model";
import { ShortcutManager } from "../../domain/shortcuts";
import BlueprintThemeProvider from "../../style/theme";
import AddShortcut from "./AddShortcut";
import { DeletableShortcut } from "./DeletableShortcut";
import { useEffect, useState } from "react";
import { filter } from "rxjs";

interface Props {
  shortcutManager: ShortcutManager;
  activityManager: ActivityManager;
}

function ShortcutsPage({ activityManager, shortcutManager }: Props) {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);

  useEffect(() => {
    const shortcutsSubscription = shortcutManager.change$
      .pipe(filter((change) => change.kind === "ShortcutsChanged"))
      .subscribe(() => {
        setShortcuts(shortcutManager.getAll());
      });

    setShortcuts(shortcutManager.getAll());

    return () => {
      shortcutsSubscription.unsubscribe();
    };
  }, [shortcutManager, activityManager]);

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <h3>Shortcuts</h3>
        <ul>
          {shortcuts.map((shortcut) => (
            <DeletableShortcut
              key={shortcut}
              shortcut={shortcut}
              shortcutManager={shortcutManager}
              activityManager={activityManager}
            />
          ))}
        </ul>
        <AddShortcut
          activityManager={activityManager}
          shortcutManager={shortcutManager}
        />
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}

export default ShortcutsPage;
