/**
 * TODO: this probably can be reused by other pages, consider moving it to a more
 * general place when that moment arrives
 */
import { Training } from "../../../domain/model";
import { MenuItem } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Suggest2 } from "@blueprintjs/select";

const NO_SELECTED_TRAINING = null;

interface Props {
  selectedTraining?: Training;
  trainings: Training[];
  onSelect: (training: Training) => void;
}
function TrainingSelector({ selectedTraining, trainings, onSelect }: Props) {
  return (
    <div>
      <Suggest2<Training>
        selectedItem={selectedTraining || NO_SELECTED_TRAINING}
        items={trainings}
        itemPredicate={trainingFilterer}
        itemRenderer={trainingRenderer}
        inputValueRenderer={(training: Training) => training.name}
        noResults={
          <MenuItem disabled={true} text="No results." roleStructure="listoption" />
        }
        fill={true}
        onItemSelect={onSelect}
      />
    </div>
  );
}

export default TrainingSelector;

const trainingRenderer: ItemRenderer<Training> = (
  training,
  { handleClick, handleFocus, modifiers, query }
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={training.id}
      label={training.id}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure="listoption"
      text={training.name}
    />
  );
};

const trainingFilterer: ItemPredicate<Training> = (
  query,
  activity,
  _index,
  exactMatch
) => {
  const { name } = activity;
  const normalizedTitle = name.toLowerCase();
  const normalizedContent = normalizedTitle;
  const normalizedQuery = query.toLowerCase();

  if (exactMatch) {
    return normalizedTitle === normalizedQuery;
  } else {
    return normalizedContent.indexOf(normalizedQuery) >= 0;
  }
};
