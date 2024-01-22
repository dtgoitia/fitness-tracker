import { Button } from "@blueprintjs/core";
import { ChangeEvent, useRef, useState } from "react";
import styled from "styled-components";

export function RestoreData() {
  const [file, setFile] = useState<File>();

  const inputRef = useRef<HTMLInputElement | null>(null);

  function openFilePicker(): void {
    inputRef.current?.click();
  }

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>): void {
    if (!event.target.files) return;
    setFile(event.target.files[0]);
  }

  function handleUploadClick(): void {
    if (!file) {
      return;
    }

    file.text().then((text) => {
      let content: string;
      try {
        content = JSON.parse(text);
      } catch (e) {
        alert("Invalid JSON");
        setFile(undefined);
        return;
      }

      setFile(undefined);
      console.log("content:", content);
      alert("TODO: data loaded, now import like when app starts");
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
          onClick={() => handleUploadClick()}
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
