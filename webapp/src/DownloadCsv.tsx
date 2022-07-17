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
    const activity = activityIndex.get(completedActivity.id) as Activity;

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

interface DownloadCsvProps {
  activities: Activity[];
  history: CompletedActivity[];
}
function DownloadCsv({ activities, history }: DownloadCsvProps) {
  function createAndDownloadBlob(): void {
    const blob = buildCsv(activities, history);
    const fileUrl = URL.createObjectURL(blob);
    const w = window.open(fileUrl, "_blank");
    w && w.focus();
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
