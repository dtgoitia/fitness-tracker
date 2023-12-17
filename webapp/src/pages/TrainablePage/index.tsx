import { useApp } from "../..";
import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { Trainable, TrainableId } from "../../lib/domain/model";
import Paths from "../../routes";
import BlueprintThemeProvider from "../../style/theme";
import { TrainableEditor } from "./TrainableEditor";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function TrainablePage() {
  const app = useApp();
  // The app router should prevent you from having an undefined URL
  // parameter here
  const { trainableId: maybeTrainableId } = useParams();
  const trainableId = maybeTrainableId as TrainableId;

  const navigate = useNavigate();

  const [trainable, setTrainable] = useState<Trainable | undefined>();
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  useEffect(() => {
    function _render(): void {
      const trainable = app.trainableManager.get(trainableId);
      setTrainable(trainable);
    }

    const subscription = app.trainableManager.changes$.subscribe((change) => {
      if (change.kind === "trainable-manager-initialized") {
        setDataLoaded(true);
      }
      _render();
    });

    _render();

    return () => {
      subscription.unsubscribe();
    };
  }, [app, trainableId, trainable, navigate]);

  if (trainable === undefined) {
    if (dataLoaded) {
      navigate(Paths.trainables);
    }

    return (
      <BlueprintThemeProvider>
        <CenteredPage>
          <NavBar />
          Loading task data...
        </CenteredPage>
      </BlueprintThemeProvider>
    );
  }

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <TrainableEditor trainable={trainable} />
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}
