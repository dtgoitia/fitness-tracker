import "./App.css";
import ActivityEditor from "./Pages/ActivityEditor";
import ActivityExplorer from "./Pages/ActivityExplorer";
import Main from "./Pages/Main";
import PageNotFound from "./Pages/PageNotFound";
import { initialize } from "./domain/initialize";
import Paths from "./routes";
import { Route, Routes } from "react-router-dom";

function App() {
  const { activityManager, completedActivityManager } = initialize();

  return (
    <Routes>
      <Route
        path={Paths.root}
        element={
          <Main
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
        element={<ActivityEditor activityManager={activityManager} />}
      />
      <Route path={Paths.notFound} element={<PageNotFound />} />
    </Routes>
  );
}

export default App;
