import { useApp } from ".";
import ActivityExplorer from "./Pages/ActivityExplorer";
import { ActivityPage } from "./Pages/ActivityPage";
import { CompletedActivityPage } from "./Pages/CompletedActivityPage";
import HistoryPage from "./Pages/HistoryExplorer";
import PageNotFound from "./Pages/PageNotFound";
import { RecordActivityPage } from "./Pages/RecordActivity";
import ShortcutsPage from "./Pages/ShortcutsEditor";
import StatsPage from "./Pages/Stats";
import TrainingEditor from "./Pages/TrainingEditor";
import TrainingExplorer from "./Pages/TrainingExplorer";
import Paths from "./routes";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

export function AppUI() {
  const app = useApp();

  useEffect(() => {
    app.initialize();
  }, [app]);

  return (
    <Routes>
      <Route path={Paths.root} element={<RecordActivityPage />} />
      <Route path={Paths.history} element={<HistoryPage />} />
      <Route path={Paths.historyRecord} element={<CompletedActivityPage />} />
      <Route path={Paths.activities} element={<ActivityExplorer />} />
      <Route path={Paths.activityEditor} element={<ActivityPage />} />
      <Route path={Paths.trainings} element={<TrainingExplorer />} />
      <Route path={Paths.trainingEditor} element={<TrainingEditor />} />
      <Route path={Paths.shortcuts} element={<ShortcutsPage />} />
      <Route path={Paths.stats} element={<StatsPage />} />
      <Route path={Paths.notFound} element={<PageNotFound />} />
    </Routes>
  );
}
