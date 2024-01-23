import { useApp } from "..";
import { Backup } from "../lib/domain/backup";
import { Button } from "@blueprintjs/core";
import { ChangeEvent, useRef, useState } from "react";
import styled from "styled-components";

export function RestoreData() {
  const app = useApp();
  const [file, setFile] = useState<File>();

  const inputRef = useRef<HTMLInputElement | null>(null);

  function openFilePicker(): void {
    inputRef.current?.click();
  }

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>): void {
    if (!event.target.files) return;
    setFile(event.target.files[0]);
  }

  function handleRestoreRequest(): void {
    if (!file) {
      return;
    }

    file.text().then((text) => {
      let backup: Backup;
      try {
        backup = JSON.parse(text) as Backup;
      } catch (e) {
        alert(`Invalid backup file, error: ${e}`);
        setFile(undefined);
        return;
      }

      setFile(undefined);
      app.restoreData({ backup });

      // HACK: reload so that the App picks up the updated data from the local storage
      window.location.reload();
    });
  }

  return (
    <Container>
      {file === undefined ? (
        <Button intent="none" text="Restore from JSON" onClick={() => openFilePicker()} />
      ) : (
        <Button
          intent="success"
          text="Upload and restore"
          onClick={() => handleRestoreRequest()}
        />
      )}
      <input
        style={{ display: "none" }} // hidden
        type="file"
        ref={inputRef}
        onChange={handleFileSelection}
      />
    </Container>
  );
}

const Container = styled.div`
  padding: 1rem 0;
`;
