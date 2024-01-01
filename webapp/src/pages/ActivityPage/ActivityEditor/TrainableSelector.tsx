import { useApp } from "../../..";
import {
  ActivityId,
  FilterQuery,
  Trainable,
  TrainableId,
} from "../../../lib/domain/model";
import SearchBox from "../../HistoryExplorer/SearchBox";
import { Button, Dialog } from "@blueprintjs/core";
import { useState } from "react";
import styled from "styled-components";

interface Props {
  activityName: ActivityId;
  selected: TrainableId[];
  onSelect: (id: TrainableId) => void;
}

export function TrainableSelector({
  activityName,
  selected: selectedIds,
  onSelect: select,
}: Props) {
  const app = useApp();
  const { trainableManager } = app;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<FilterQuery>("");

  const unselectable = new Set<TrainableId>(selectedIds);

  function clearSearch(): void {
    setFilterQuery("");
  }

  const selected = selectedIds.map((id) => trainableManager.get(id) as Trainable);
  const selectable = trainableManager
    .searchByPrefix(filterQuery)
    .filter((trainable) => unselectable.has(trainable.id) === false);

  return (
    <>
      <Container>
        <Button icon="plus" text="Add trainable" onClick={() => setIsOpen(true)} />
      </Container>

      <Dialog
        title={`Select trainables related to "${activityName}"`}
        isOpen={isOpen}
        autoFocus={true}
        canOutsideClickClose={true}
        isCloseButtonShown={true}
        canEscapeKeyClose={true}
        transitionDuration={0}
        onClose={() => setIsOpen(false)}
      >
        <div className="bp4-dialog-body">
          {selectable.length === 0 ? (
            selected.length === 0 ? (
              <div>no trainables available to select...</div>
            ) : (
              <div style={{ display: "flex", justifyContent: "center" }}>
                all trainables already selected
              </div>
            )
          ) : (
            <>
              {selected.length > 0 && (
                <>
                  <div style={{ paddingBottom: "1rem" }}>Already selected:</div>
                  <ul id="selected-trainables">
                    {selected.map(({ id, name }) => (
                      <SelectedTrainable key={id}>{name}</SelectedTrainable>
                    ))}
                  </ul>
                </>
              )}
              <SearchBox
                query={filterQuery}
                onChange={setFilterQuery}
                clearSearch={clearSearch}
                onFocus={() => {}}
              />
              <ul id="selectable-trainables">
                {selectable.map(({ id, name }) => (
                  <SelectableTrainable key={id} onClick={() => select(id)}>
                    {name}
                  </SelectableTrainable>
                ))}
              </ul>
            </>
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

const SelectedTrainable = styled.li`
  padding: 0rem 0.7rem 1rem 0.7rem;
`;

const SelectableTrainable = styled.li`
  padding: 1rem 0.7rem 0rem 0.7rem;
`;
