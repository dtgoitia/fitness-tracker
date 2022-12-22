import CenteredPage from "../CenteredPage";
import AddTrainingForm from "../Views/AddTraining";
import TrainingExplorer from "../Views/TrainingExplorer";
import { ActivityManager } from "../domain/activities";
import { TrainingManager } from "../domain/trainings";
import Paths from "../routes";
import BlueprintThemeProvider from "../style/theme";
import { Button } from "@blueprintjs/core";
import { Link } from "react-router-dom";

interface Props {
  activityManager: ActivityManager;
  trainingManager: TrainingManager;
}

function TrainingsPage({ activityManager, trainingManager }: Props) {
  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <Link to={Paths.root}>
          <Button large icon="arrow-left">
            Back to main page
          </Button>
        </Link>

        <h2>Trainings</h2>

        <TrainingExplorer
          activityManager={activityManager}
          trainingManager={trainingManager}
        />
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}

export default TrainingsPage;
