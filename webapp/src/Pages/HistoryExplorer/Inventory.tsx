import { Activity, ActivityId } from "../../domain/model";
import { Collapse } from "@blueprintjs/core";
import { Button } from "@blueprintjs/core";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

const OrderedList = styled.ol`
  padding: 0 0.5rem;
`;

const Clickable = styled.div`
  flex-grow: 1;
  column-gap: 1rem;
  justify-content: flex-start;

  display: flex;
  flex-flow: row wrap;
`;

const GrayedOut = styled.div`
  flex-shrink: 1;
  flex-grow: 1;
  align-self: center;

  opacity: 0.3;
`;

const GrayedOutCodeAtEnd = styled.pre`
  align-self: center;
  flex-shrink: 0;
  flex-grow: 0;

  opacity: 0.5;
  font-size: 0.65rem;
`;

interface SelectableItempProps {
  item: Activity;
  onClick: (id: ActivityId) => void;
  onDelete: (id: ActivityId) => void;
}
function SelectableItem({ item, onClick, onDelete }: SelectableItempProps) {
  const otherNames = item.otherNames ? item.otherNames.join(", ") : "";
  return (
    <Container>
      <Clickable onClick={() => onClick(item.id)} className="bp4-button bp4-minimal">
        {item.name}
        <GrayedOut>{otherNames}</GrayedOut>
      </Clickable>
      <GrayedOutCodeAtEnd>{item.id}</GrayedOutCodeAtEnd>
      <Button
        onClick={() => onDelete(item.id)}
        className="bp4-button bp4-minimal"
        icon="trash"
      />
    </Container>
  );
}
interface InventoryViewProps {
  activities: Activity[];
  selectActivity: (id: ActivityId) => void;
  removeActivity: (id: ActivityId) => void;
  collapse: boolean;
}
function InventoryView({
  activities,
  selectActivity,
  removeActivity,
  collapse,
}: InventoryViewProps) {
  const isOpen = !collapse;
  return (
    <Collapse isOpen={isOpen}>
      <OrderedList>
        {activities.map((activity) => {
          return (
            <SelectableItem
              key={`item-${activity.id}`}
              item={activity}
              onClick={selectActivity}
              onDelete={removeActivity}
            />
          );
        })}
      </OrderedList>
    </Collapse>
  );
}

export default InventoryView;
