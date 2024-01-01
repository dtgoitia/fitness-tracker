import { useApp } from "../../..";
import { FilterQuery, TrainableId } from "../../../lib/domain/model";
import SearchBox from "../../HistoryExplorer/SearchBox";
import { Button, Dialog } from "@blueprintjs/core";
import { useState } from "react";
import styled from "styled-components";

interface Props {
  exclude: TrainableId[];
  onSelect: (id: TrainableId) => void;
}

export function TrainableSelector({ exclude, onSelect: select }: Props) {
  const app = useApp();
  const { trainableManager } = app;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<FilterQuery>("");
  const [excludeSet, _] = useState<Set<TrainableId>>(new Set(exclude));

  function clearSearch(): void {
    setFilterQuery("");
  }

  const filteredTrainables = trainableManager
    .searchByPrefix(filterQuery)
    .filter((trainable) => excludeSet.has(trainable.id) === false);

  return (
    <>
      <Container>
        <Button icon="plus" text="Add trainable" onClick={() => setIsOpen(true)} />
      </Container>

      <Dialog
        title="Select a trainable"
        isOpen={isOpen}
        autoFocus={true}
        canOutsideClickClose={true}
        isCloseButtonShown={true}
        canEscapeKeyClose={true}
        transitionDuration={0}
        onClose={() => setIsOpen(false)}
      >
        <div className="bp4-dialog-body">
          <SearchBox
            query={filterQuery}
            onChange={setFilterQuery}
            clearSearch={clearSearch}
            onFocus={() => {}}
          />
          {filteredTrainables.length === 0 ? (
            <div>no trainables available to select...</div>
          ) : (
            filteredTrainables.map((trainable) => (
              <SelectableTrainable
                key={trainable.id}
                onClick={() => select(trainable.id)}
              >
                {trainable.name}
              </SelectableTrainable>
            ))
          )}
        </div>

        <div className="bp4-dialog-footer">Changes are saved automatically</div>
      </Dialog>
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const SelectableTrainable = styled.div`
  padding: 1rem 0.7rem 0rem 0.7rem;
`;
