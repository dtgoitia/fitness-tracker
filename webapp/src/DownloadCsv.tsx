import { Activity, CompletedActivity, indexActivities } from "./domain";
import { Button } from "@blueprintjs/core";
import styled from "styled-components";

function formatDate(date: Date): string {
  const isoUtc = date.toISOString();
  const noMilliseconds = isoUtc.split(".")[0];
  const [day] = noMilliseconds.split("T");
  return day;
}

function buildCsv(activities: Activity[], history: CompletedActivity[]): Blob {
  const activityIndex = indexActivities(activities);

  const headers = ["date", "activity", "intensity", "duration"];

  function activityToRow(completedActivity: CompletedActivity): string {
    const activityId = completedActivity.activityId;
    const activity = activityIndex.get(activityId) as Activity;
    if (activity === undefined) {
      // TODO: push these errors to a central service
      throw new Error(`Could not find any activity with ID=${activityId}`);
    }

    const columns: (string | number)[] = [
      formatDate(completedActivity.date),
      activity.name,
      completedActivity.intensity,
      completedActivity.duration,
    ];
    const row = columns.join(",");
    return row;
  }
  const rows = history.map(activityToRow);

  const csvLines = [headers, ...rows];

  const csvString: string = csvLines.join("\n");

  const csv = new Blob([csvString], { type: "text/csv" });
  return csv;
}

const Container = styled.div`
  padding: 1rem 0;
`;

function downloadCsv(blob: Blob, filename: string): void {
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

interface DownloadCsvProps {
  activities: Activity[];
  history: CompletedActivity[];
}
function DownloadCsv({ activities, history }: DownloadCsvProps) {
  function createAndDownloadBlob(): void {
    const blob = buildCsv(activities, history);
    downloadCsv(blob, "fitness-tracker__activities.csv");
  }

  return (
    <Container>
      <Button
        intent="success"
        text="Download CSV"
        onClick={() => createAndDownloadBlob()}
      />
    </Container>
  );
}

export default DownloadCsv;
