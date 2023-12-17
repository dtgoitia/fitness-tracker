import { useApp } from "../..";
import { Trainable, TrainableName, TrainableNotes } from "../../lib/domain/model";
import {
  setTrainableName,
  setTrainableNotes,
  trainableAreDifferent,
} from "../../lib/domain/trainables";
import { notify } from "../../notify";
import { Button, EditableText, Label } from "@blueprintjs/core";
import { useState } from "react";
import styled from "styled-components";

interface Props {
  trainable: Trainable;
}

export function TrainableEditor({ trainable: originalTrainable }: Props) {
  const app = useApp();

  const [trainable, setTrainable] = useState<Trainable>(originalTrainable);

  // dirty = form has unsaved changes
  const [formIsDirty, setFormIsDirty] = useState<boolean>(false);

  function handleNameChange(event: any): void {
    const name: TrainableName = event.target.value;
    const updatedTrainable = setTrainableName(trainable, name);
    setTrainable(updatedTrainable);
    recomputeDirtyStatus(updatedTrainable);
  }

  function handleNotesChange(notes: TrainableNotes): void {
    const updatedTrainable = setTrainableNotes(trainable, notes);
    setTrainable(updatedTrainable);
    recomputeDirtyStatus(updatedTrainable);
  }

  function handleSave(): void {
    app.trainableManager.update({ trainable: trainable }).match({
      ok: () => {
        // Show pop up
        notify({
          message: `Trainable "${trainable.name}" successfully saved`,
          intent: "success",
        });
        setAllChangesAreSaved();
      },
      err: (reason) => {
        notify({
          message: `ERROR: ${reason}`,
          intent: "danger",
        });
        console.error(reason);
      },
    });
  }

  function recomputeDirtyStatus(updated: Trainable): void {
    trainableAreDifferent(originalTrainable, updated)
      ? setFormIsDirty(true)
      : setAllChangesAreSaved();
  }

  function setAllChangesAreSaved(): void {
    setFormIsDirty(false);
  }

  function handleDiscardChanges(): void {
    setTrainable(originalTrainable);
    setAllChangesAreSaved();
  }

  return (
    <>
      <p>
        trainable ID:&nbsp;&nbsp;&nbsp;<code>{trainable.id}</code>
      </p>

      <Label>
        name:
        <input
          type="text"
          className="bp4-input"
          value={trainable.name}
          placeholder="Name"
          onChange={handleNameChange}
        />
      </Label>

      <NotesContainer>
        <label>Observations:</label>
        <Notes
          placeholder="add observations here..."
          value={trainable.notes}
          multiline={true}
          minLines={3}
          onChange={handleNotesChange}
        />
      </NotesContainer>

      <Button intent="success" text="Save" onClick={handleSave} disabled={!formIsDirty} />

      {formIsDirty && (
        <Button
          intent="none"
          text="Discard changes"
          onClick={handleDiscardChanges}
          large
        />
      )}

      <pre>{JSON.stringify(trainable, null, 2)}</pre>
    </>
  );
}

const NotesContainer = styled.div`
  margin: 1rem 0;
`;

const Notes = styled(EditableText)`
  font-size: 0.9rem;
  max-width: 100%;
  border: 1px dashed gray;
`;
