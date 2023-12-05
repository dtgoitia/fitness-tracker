import { ActivityName } from "../../../lib/model";
import { Button } from "@blueprintjs/core";
import styled from "styled-components";

interface Props {
  name: ActivityName;
  onClick: () => void;
}
function SelectableTrainingActivity({ name, onClick }: Props) {
  return (
    <Container onClick={onClick}>
      <Button text={name} minimal />
    </Container>
  );
}

export default SelectableTrainingActivity;

const Container = styled.li`
  margin: 0.5rem 0;
`;
