import { Activity, TrainableId } from "../../../lib/domain/model";
import { RelatedTrainables } from "./RelatedTrainables";
import { TrainableSelector } from "./TrainableSelector";

interface Props {
  activity: Activity;
  onAdd: ({ id }: { id: TrainableId }) => void;
  onRemove: ({ id }: { id: TrainableId }) => void;
  isEditing: boolean;
}

export function ActivityTrainableEditor({
  activity,
  onAdd: handleAddTrainable,
  onRemove: handleRemoveTrainable,
  isEditing,
}: Props) {
  return (
    <>
      <RelatedTrainables
        trainables={activity.trainableIds}
        onDelete={handleRemoveTrainable}
        isEditing={isEditing}
      />

      {isEditing && (
        <TrainableSelector
          onSelect={(id) => handleAddTrainable({ id })}
          exclude={activity.trainableIds}
        />
      )}
    </>
  );
}
