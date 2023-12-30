import { useApp } from "../../..";
import { Trainable, TrainableId } from "../../../lib/domain/model";
import Paths from "../../../routes";
import { Button } from "@blueprintjs/core";
import { Link } from "react-router-dom";
import styled from "styled-components";

interface Props {
  trainables: TrainableId[];
  onDelete: ({ id }: { id: TrainableId }) => void;
  isEditing: boolean;
}

export function RelatedTrainables({
  trainables: trainableIds,
  onDelete: removeTrainable,
  isEditing,
}: Props) {
  const { trainableManager } = useApp();

  const trainables = trainableIds
    .map((id) => trainableManager.get(id))
    .filter((maybe) => maybe !== undefined) as Trainable[];

  if (trainables.length === 0) {
    return (
      <NoTrainablesFound>
        <i>no related trainables found</i>
      </NoTrainablesFound>
    );
  }

  return (
    <div>
      <div>related trainables:</div>
      <ul style={{ opacity: isEditing ? 1 : 0.7 }}>
        {trainables.map(({ id, name }, i) => (
          <RelatedTrainable key={`trainable-${id}-${i}`}>
            {isEditing ? (
              <>
                <Button
                  icon="trash"
                  minimal={true}
                  onClick={() => removeTrainable({ id })}
                />
                <Description>{name}</Description>
              </>
            ) : (
              <>
                <span>-</span>
                <Link to={Paths.trainableEditor.replace(":trainableId", id)}>{name}</Link>
              </>
            )}
          </RelatedTrainable>
        ))}
      </ul>
    </div>
  );
}

const NoTrainablesFound = styled.div`
  display: flex;
  justify-content: flex-end;

  opacity: 0.7;
  padding: 0 0.5rem 1rem 0;
`;

const RelatedTrainable = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  gap: 0.5rem;

  padding-top: 0.4rem;
  padding-left: 1rem;
`;

const Description = styled.div`
  flex-shrink: 0;
  flex-grow: 1;
`;
