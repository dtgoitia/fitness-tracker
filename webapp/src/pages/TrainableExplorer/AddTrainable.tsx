import { TrainableName } from "../../lib/domain/model";
import { Button } from "@blueprintjs/core";
import { useState } from "react";

interface Props {
  add: (name: TrainableName) => void;
}

export function AddTrainable({ add }: Props) {
  const [name, setName] = useState<string>("");

  function handleNameChange(event: any) {
    setName(event.target.value);
  }

  function handleSubmit(event: any) {
    event.preventDefault();
    if (!name || name === "") return;
    add(name);
    setName("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>Add a new item:</p>
      <input
        type="text"
        className={"bp4-input"}
        value={name}
        placeholder="Name"
        onChange={handleNameChange}
      />
      <Button intent="success" text="Add" type="submit" />
    </form>
  );
}
