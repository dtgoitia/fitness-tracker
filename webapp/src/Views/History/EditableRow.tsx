import { Activity, CompletedActivity } from "../../domain";
import { Button } from "@blueprintjs/core";
import styled from "styled-components";

const Col1 = styled.div`
  order: 1;
  flex-basis: 1rem;
  flex-shrink: 0;
  flex-grow: 0;
`;
const Col2 = styled.div`
  order: 2;
  flex-basis: 3rem;
  flex-shrink: 0;
  margin-left: 0.3rem;
`;
const Col3 = styled.div`
  order: 3;
  flex-grow: 1;
  flex-shrink: 0;
`;
const Col4 = styled.div`
  order: 4;
  flex-basis: 4rem;
  flex-shrink: 0;
`;
const Col5 = styled.div`
  order: 5;
  flex-basis: 4rem;
  flex-shrink: 0;
`;
const Col6 = styled.div`
  order: 6;
  flex-basis: 7rem;
  flex-shrink: 0;
`;
const Col7 = styled.div`
  order: 7;
  flex-basis: 1rem;
  flex-shrink: 0;
  flex-grow: 0;
`;

const Container = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  margin-bottom: 0.2rem;
`;

interface RowProps {
  activity: Activity;
  completedActivity: CompletedActivity;
  onDelete: () => void;
}
function EditableRow({ activity, completedActivity, onDelete }: RowProps) {
  return (
    <Container>
      <Col1>
        <Button
          icon="edit"
          minimal={true}
          onClick={() => alert("NOT IMPLEMENTED YET")}
        />
      </Col1>
      <Col2>{completedActivity.date.toISOString()}</Col2>
      <Col3>{activity.name}</Col3>
      <Col4>{completedActivity.intensity}</Col4>
      <Col5>{completedActivity.duration}</Col5>
      <Col6>{completedActivity.notes}</Col6>
      <Col7>
        <Button icon="trash" minimal={true} onClick={onDelete} />
      </Col7>
    </Container>
  );
}

export default EditableRow;
