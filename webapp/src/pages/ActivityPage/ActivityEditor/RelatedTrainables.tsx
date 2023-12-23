import { useApp } from "../../..";
import { Trainable, TrainableId } from "../../../lib/domain/model";
import { Button } from "@blueprintjs/core";
import styled from "styled-components";

interface Props {
  trainables: TrainableId[];
  onDelete: ({ id }: { id: TrainableId }) => void;
}

export function RelatedTrainables({ trainables: trainableIds, onDelete: remove }: Props) {
  const { trainableManager } = useApp();

  const trainables = trainableIds
    .map((id) => trainableManager.get(id))
    .filter((maybe) => maybe !== undefined) as Trainable[];

  if (trainables.length === 0) {
    return <Container>no related trainables found</Container>;
  }

  return (
    <Container>
      {trainables.map(({ id, name }, i) => (
        <RelatedTrainable key={`trainable-${id}-${i}`}>
          <Button icon="trash" minimal={true} onClick={() => remove({ id })} />
          <Description>{name}</Description>
        </RelatedTrainable>
      ))}
    </Container>
  );
}

const Container = styled.div`
  border: 1px solid black;
`;

const RelatedTrainable = styled.div`
  display: flex;
  align-item: center;
  flex-flow: row wrap;
  gap: 0.5rem;

  padding: 0.3rem 0;
`;

const Description = styled.div`
  flex-shrink: 0;
  flex-grow: 1;
`;
