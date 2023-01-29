import "./App.css";
import ActivityEditor from "./Pages/ActivityEditor";
import ActivityExplorer from "./Pages/ActivityExplorer";
import HistoryPage from "./Pages/HistoryExplorer";
import PageNotFound from "./Pages/PageNotFound";
import TrainingEditor from "./Pages/TrainingEditor";
import TrainingExplorer from "./Pages/TrainingExplorer";
import { initialize } from "./domain/initialize";
import Paths from "./routes";
import { Route, Routes } from "react-router-dom";

function App() {
  const { activityManager, completedActivityManager, trainingManager } = initialize();

  return (
    <Routes>
      <Route
        path={Paths.root}
        element={
          <HistoryPage
            activityManager={activityManager}
            completedActivityManager={completedActivityManager}
            trainingManager={trainingManager}
          />
        }
      />
      <Route
        path={Paths.activities}
        element={<ActivityExplorer activityManager={activityManager} />}
      />
      <Route
        path={Paths.activityEditor}
        element={<ActivityEditor activityManager={activityManager} />}
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
      <Route path={Paths.notFound} element={<PageNotFound />} />
    </Routes>
  );
}

export default App;
