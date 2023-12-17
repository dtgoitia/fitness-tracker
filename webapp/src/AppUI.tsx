import { useApp } from ".";
import ActivityExplorer from "./pages/ActivityExplorer";
import { ActivityPage } from "./pages/ActivityPage";
import { CompletedActivityPage } from "./pages/CompletedActivityPage";
import HistoryPage from "./pages/HistoryExplorer";
import PageNotFound from "./pages/PageNotFound";
import { RecordActivityPage } from "./pages/RecordActivity";
import ShortcutsPage from "./pages/ShortcutsEditor";
import StatsPage from "./pages/Stats";
import { TrainableExplorer } from "./pages/TrainableExplorer";
import { TrainablePage } from "./pages/TrainablePage";
import TrainingEditor from "./pages/TrainingEditor";
import TrainingExplorer from "./pages/TrainingExplorer";
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
      <Route path={Paths.trainables} element={<TrainableExplorer />} />
      <Route path={Paths.trainableEditor} element={<TrainablePage />} />
      <Route path={Paths.trainings} element={<TrainingExplorer />} />
      <Route path={Paths.trainingEditor} element={<TrainingEditor />} />
      <Route path={Paths.shortcuts} element={<ShortcutsPage />} />
      <Route path={Paths.stats} element={<StatsPage />} />
      <Route path={Paths.notFound} element={<PageNotFound />} />
    </Routes>
  );
}
