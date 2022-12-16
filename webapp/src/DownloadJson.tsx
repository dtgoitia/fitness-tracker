import { ActivityManager } from "./domain/activities";
import { CompletedActivityManager } from "./domain/completedActivities";
import { now } from "./domain/datetimeUtils";
import { Button } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  padding: 1rem 0;
`;

interface Props {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
}

export function DownloadJson({ activityManager, completedActivityManager }: Props) {
  const [shareApiIsAvailable, setShareApiIsAvailable] = useState<boolean>(false);

  useEffect(() => {
    setShareApiIsAvailable(isShareApiAvailable());
  }, []);

  const date = now();
  const fileName = generateFilename({ date });

  function download(): void {
    const blob = generateBlob({ activityManager, completedActivityManager, date });
    downloadFile(blob, fileName);
  }

  function share(): void {
    if (shareApiIsAvailable === false) {
      alert("Your device is not compatible with the Web Share API, sorry :)");
      return;
    }

    const blob = generateBlob({ activityManager, completedActivityManager, date });
    shareFile(blob, fileName);
  }

  return (
    <Container>
      <Button intent="success" text="Download JSON" onClick={() => download()} />
      <Button
        intent="success"
        text="Share JSON"
        onClick={() => share()}
        disabled={shareApiIsAvailable === false}
      />
    </Container>
  );
}

interface GenerateBlobArgs {
  activityManager: ActivityManager;
  completedActivityManager: CompletedActivityManager;
  date: Date;
}
function generateBlob({
  activityManager,
  completedActivityManager,
  date,
}: GenerateBlobArgs): Blob {
  const data = {
    date: date.toISOString(),
    activities: activityManager.getAll(),
    completedActivities: completedActivityManager.getAll(),
  };

  const formattedJson = JSON.stringify(data, null, 2);
  const blob = new Blob([formattedJson], { type: "application/json" });

  return blob;
}

function generateFilename({ date }: { date: Date }): string {
  const formattedDate = date
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace("T", "-")
    .slice(0, 15);
  return `fitness-tracker__backup_${formattedDate}.json`;
}

function isShareApiAvailable(): boolean {
  const isAvailable = navigator.share !== undefined;
  return isAvailable;
}

function downloadFile(blob: Blob, filename: string): void {
  const fileUrl = URL.createObjectURL(blob);
  const xhr = new XMLHttpRequest();
  xhr.open("GET", fileUrl, true);
  xhr.responseType = "blob";
  xhr.onload = function (e) {
    if (this.status === 200) {
      const responseWithDesiredBlob = this.response;
      const anchor = document.createElement("a");
      anchor.href = window.URL.createObjectURL(responseWithDesiredBlob);
      anchor.download = filename;
      anchor.click();
    } else {
      const error = [
        `Status 200 expected but got ${this.status} instead. No idea what happened`,
        `here:\n`,
        `\n`,
        `blob=${blob.text()}\n`,
        `\n`,
        `filename=${filename}\n`,
        `\n`,
        `fileUrl=${fileUrl}\n`,
        `\n`,
      ].join("");
      throw new Error(error);
    }
  };
  xhr.send();
}

function shareFile(blob: Blob, fileName: string): void {
  const file = new File([blob], fileName, { type: "application/json" });

  const dataToShare: ShareData = {
    title: "fitness-tracker CSV",
    files: [file],
  };

  const canShare = navigator.canShare(dataToShare);
  if (!canShare) {
    alert("You cannot share the JSON for some reason, sorry :)");
    return;
  }

  navigator
    .share(dataToShare)
    .then(() => console.log("all good"))
    .catch((error) => {
      alert(error);
    });
}
