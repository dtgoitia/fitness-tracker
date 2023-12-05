/**
 * TODO: this probably can be reused by other pages, consider moving it to a more
 * general place when that moment arrives
 */
import { Activity } from "../../lib/model";
import { MenuItem } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Suggest2 } from "@blueprintjs/select";

const NO_SELECTED_ACTIVITY = null;

interface Props {
  selectedActivity?: Activity;
  activities: Activity[];
  onSelect: (activity: Activity) => void;
}
function ActivitySelector({ selectedActivity, activities, onSelect }: Props) {
  return (
    <div>
      <Suggest2<Activity>
        selectedItem={selectedActivity || NO_SELECTED_ACTIVITY}
        items={activities}
        itemPredicate={activityFilterer}
        itemRenderer={activityRenderer}
        inputValueRenderer={(activity: Activity) => activity.name}
        noResults={
          <MenuItem disabled={true} text="No results." roleStructure="listoption" />
        }
        fill={true}
        onItemSelect={onSelect}
      />
    </div>
  );
}

export default ActivitySelector;

const activityRenderer: ItemRenderer<Activity> = (
  activity,
  { handleClick, handleFocus, modifiers }
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={activity.id}
      label={activity.id}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure="listoption"
      text={activity.name}
    />
  );
};

const activityFilterer: ItemPredicate<Activity> = (
  query,
  activity,
  _index,
  exactMatch
) => {
  const { name, otherNames } = activity;
  const normalizedTitle = name.toLowerCase();
  const normalizedContent = [name, ...otherNames].join(" ").toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (exactMatch) {
    return normalizedTitle === normalizedQuery;
  } else {
    return normalizedContent.indexOf(normalizedQuery) >= 0;
  }
};
