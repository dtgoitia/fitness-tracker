import { useApp } from "..";
import { Training } from "../lib/domain/model";
import { useUrlParam } from "../navigation";

export function useTrainingInUrlParams(): [
  Training | undefined,
  (training: Training | undefined) => void
] {
  const app = useApp();
  const [trainingId, setTrainingId] = useUrlParam({
    key: "trainingId",
  });

  const training = trainingId ? app.trainingManager.get(trainingId) : undefined;

  const setter = (updated: Training | undefined): void => {
    if (updated === undefined) {
      setTrainingId(undefined);
    } else {
      setTrainingId(updated.id);
    }
  };

  return [training, setter];
}
