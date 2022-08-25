import { Activity, ActivityId } from "../domain";
import { Collapse } from "@blueprintjs/core";
import { Button } from "@blueprintjs/core";
import styled from "styled-components";

const GrayedOut = styled.span`
  opacity: 0.3;
`;

interface SelectableItempProps {
  item: Activity;
  onClick: (id: ActivityId) => void;
  onDelete: (id: ActivityId) => void;
}
function SelectableItem({ item, onClick, onDelete }: SelectableItempProps) {
  const otherNames = item.otherNames ? item.otherNames.join(", ") : "";
  return (
    <div>
      <Button
        onClick={() => onDelete(item.id)}
        className="bp4-button bp4-minimal"
        icon="trash"
      />
      <Button
        onClick={() => onClick(item.id)}
        className="bp4-button bp4-minimal"
      >
        <span>
          ({item.id}) {item.name} <GrayedOut>{otherNames}</GrayedOut>
        </span>
      </Button>
    </div>
  );
}
interface InventoryViewProps {
  activities: Activity[];
  selectActivity: (id: ActivityId) => void;
  removeActivity: (id: ActivityId) => void;
  collapse: boolean;
}
function InventoryView({
  activities: items,
  selectActivity,
  removeActivity,
  collapse,
}: InventoryViewProps) {
  const isOpen = !collapse;
  return (
    <div>
      <Collapse isOpen={isOpen}>
        <ol>
          {items.map((item) => {
            return (
              <SelectableItem
                key={`item-${item.id}`}
                item={item}
                onClick={selectActivity}
                onDelete={removeActivity}
              />
            );
          })}
        </ol>
      </Collapse>
    </div>
  );
}

export default InventoryView;
