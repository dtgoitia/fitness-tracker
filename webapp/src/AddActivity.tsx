import { EMPTY_STRING } from "./constants";
import { ActivityName } from "./domain/model";
import { Button } from "@blueprintjs/core";
import { useState } from "react";

interface AddActivityProps {
  add: (name: ActivityName, otherNames: ActivityName[]) => void;
}
function AddActivity({ add }: AddActivityProps) {
  const [name, setName] = useState<string>(EMPTY_STRING);
  const [otherNames, setOtherNames] = useState<string>(EMPTY_STRING);

  function handleNameChange(event: any) {
    setName(event.target.value);
  }

  function handleOtherNamesChange(event: any) {
    setOtherNames(event.target.value);
  }

  function handleSubmit(event: any) {
    event.preventDefault();
    if (!name || name === EMPTY_STRING) {
      console.warn(
        `AddActivity.handleSubmit::Training name must be different to undefined,` +
          ` null, or an emptry string to create a new Training`
      );
      return;
    }
    add(
      name,
      otherNames.split(",").filter((otherName) => otherName)
    );
    setName(EMPTY_STRING);
    setOtherNames(EMPTY_STRING);
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
      <input
        type="text"
        className={"bp4-input"}
        value={otherNames}
        placeholder="Other names"
        onChange={handleOtherNamesChange}
      />
      <Button intent="success" text="Add" type="submit" />
    </form>
  );
}
export default AddActivity;
