import "./App.css";
import ActivityEditor from "./Pages/ActivityEditor";
import ActivityExplorer from "./Pages/ActivityExplorer";
import { CompletedActivityPage } from "./Pages/CompletedActivityPage";
import HistoryPage from "./Pages/HistoryExplorer";
import PageNotFound from "./Pages/PageNotFound";
import { RecordActivityPage } from "./Pages/RecordActivity";
import ShortcutsPage from "./Pages/ShortcutsEditor";
import StatsPage from "./Pages/Stats";
import TrainingEditor from "./Pages/TrainingEditor";
import TrainingExplorer from "./Pages/TrainingExplorer";
import { initialize } from "./domain/initialize";
import Paths from "./routes";
import { Route, Routes } from "react-router-dom";

function App() {
  const { activityManager, completedActivityManager, trainingManager, shortcutManager } =
    initialize();

  return (
    <Routes>
      <Route
        path={Paths.root}
        element={
          <RecordActivityPage
            activityManager={activityManager}
            completedActivityManager={completedActivityManager}
            trainingManager={trainingManager}
            shortcutManager={shortcutManager}
          />
        }
      />
      <Route
        path={Paths.history}
        element={
          <HistoryPage
            activityManager={activityManager}
            completedActivityManager={completedActivityManager}
            trainingManager={trainingManager}
          />
        }
      />
      <Route
        path={Paths.historyRecord}
        element={
          <CompletedActivityPage
            activityManager={activityManager}
            completedActivityManager={completedActivityManager}
          />
        }
      />
      <Route
        path={Paths.activities}
        element={<ActivityExplorer activityManager={activityManager} />}
      />
      <Route
        path={Paths.activityEditor}
        element={
          <ActivityEditor
            activityManager={activityManager}
            completedActivityManager={completedActivityManager}
          />
        }
      />
      <Route
        path={Paths.trainings}
        element={<TrainingExplorer trainingManager={trainingManager} />}
      />
      <Route
        path={Paths.trainingEditor}
        element={
          <TrainingEditor
            trainingManager={trainingManager}
            activityManager={activityManager}
          />
        }
      />
      <Route
        path={Paths.shortcuts}
        element={
          <ShortcutsPage
            activityManager={activityManager}
            shortcutManager={shortcutManager}
          />
        }
      />
      <Route
        path={Paths.stats}
        element={
          <StatsPage
            activityManager={activityManager}
            completedActivityManager={completedActivityManager}
          />
        }
      />
      <Route path={Paths.notFound} element={<PageNotFound />} />
    </Routes>
  );
}

export default App;
