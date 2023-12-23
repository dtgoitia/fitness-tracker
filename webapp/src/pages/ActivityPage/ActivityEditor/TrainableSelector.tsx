import { useApp } from "../../..";
import { FilterQuery, Trainable, TrainableId } from "../../../lib/domain/model";
import SearchBox from "../../HistoryExplorer/SearchBox";
import { Button, Dialog } from "@blueprintjs/core";
import { useState } from "react";

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
    <div>
      <Button
        // intent="success"
        icon="plus"
        text="Add trainable"
        onClick={() => setIsOpen(true)}
      />

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
                trainable={trainable}
                onSelect={() => select(trainable.id)}
              />
            ))
          )}
        </div>

        <div className="bp4-dialog-footer">Changes are saved automatically</div>
      </Dialog>
    </div>
  );
}

function SelectableTrainable({
  trainable,
  onSelect: select,
}: {
  trainable: Trainable;
  onSelect: () => void;
}) {
  return <div onClick={() => select()}>{trainable.name}</div>;
}
