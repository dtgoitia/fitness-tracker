import "./App.css";
import MainPage from "./Pages/Main";
import PageNotFound from "./Pages/PageNotFound";
import TrainingsPage from "./Pages/Trainings";
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
          <MainPage
            activityManager={activityManager}
            completedActivityManager={completedActivityManager}
            trainingManager={trainingManager}
          />
        }
      />

      <Route
        path={Paths.trainings}
        element={
          <TrainingsPage
            activityManager={activityManager}
            trainingManager={trainingManager}
          />
        }
      />

      <Route path={Paths.notFound} element={<PageNotFound />} />
    </Routes>
  );
}

export default App;
