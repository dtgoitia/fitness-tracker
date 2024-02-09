import { useApp } from "../../..";
import { CompletedActivitiesCalendar } from "../../../components/CompletedActivitiesCalendar";
import { ScreenBottomNavBar } from "../../../components/ScreenBottomNavBar";
import {
  setActivityName,
  setActivityOtherNames,
  addTrainableToActivity,
  removeTrainableFromActivity,
  diffActivity,
  setActivityNotes,
} from "../../../lib/domain/activities";
import {
  Activity,
  ActivityName,
  ActivityNotes,
  TrainableId,
} from "../../../lib/domain/model";
import { notify } from "../../../notify";
import { ActivityTrainableEditor } from "./ActivityTrainableEditor";
import { CompletedActivities } from "./CompletedActivities";
import { Button, EditableText, Label } from "@blueprintjs/core";
import { useState } from "react";
import styled from "styled-components";

interface Props {
  activity: Activity;
}

export function ActivityEditor({ activity: originalActivity }: Props) {
  const app = useApp();

  const [activity, setActivity] = useState<Activity>(originalActivity);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const unsavedChanges = diffActivity({
    before: originalActivity,
    after: activity,
  }).hasChanges;

  function handleNameChange(event: any): void {
    const name: ActivityName = event.target.value;
    setActivity(setActivityName(activity, name));
  }

  function handleOtherNamesChange(event: any): void {
    const raw: string = event.target.value;
    const otherNames: ActivityName[] = raw.split(",").filter((x) => !!x);
    setActivity(setActivityOtherNames(activity, otherNames));
  }

  function handleNotesChange(notes: ActivityNotes): void {
    setActivity(setActivityNotes(activity, notes));
  }

  function handleAddTrainable({ id }: { id: TrainableId }): void {
    setActivity(addTrainableToActivity(activity, id));
  }

  function handleRemoveTrainable({ id: toRemove }: { id: TrainableId }): void {
    setActivity(removeTrainableFromActivity(activity, toRemove));
  }

  function handleSave(): void {
    app.activityManager.update({ activity }).match({
      ok: () => {
        // Show pop up
        notify({
          message: `Activity "${activity.name}" successfully saved`,
          intent: "success",
        });
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

  function handleToggleEditMode(): void {
    if (isEditing) {
      if (unsavedChanges) {
        handleSave();
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }

  return (
    <>
      <p>
        activity ID:&nbsp;&nbsp;&nbsp;<code>{activity.id}</code>
      </p>

      <Label>
        name:
        <input
          type="text"
          className={"bp4-input"}
          value={activity.name}
          placeholder="Name"
          onChange={handleNameChange}
          disabled={isEditing === false}
        />
      </Label>

      <Label>
        other names:
        <input
          type="text"
          className={"bp4-input"}
          value={activity.otherNames.join(",")}
          placeholder={isEditing ? "Other names" : "(empty)"}
          onChange={handleOtherNamesChange}
          disabled={isEditing === false}
        />
      </Label>

      <NotesContainer>
        <label>Observations:</label>
        <Notes
          placeholder="add observations here..."
          value={activity.notes}
          multiline={true}
          minLines={3}
          onChange={handleNotesChange}
          disabled={isEditing === false}
        />
      </NotesContainer>

      <ActivityTrainableEditor
        isEditing={isEditing}
        activity={activity}
        onAdd={handleAddTrainable}
        onRemove={handleRemoveTrainable}
      />

      <CompletedActivitiesCalendar activityIds={new Set([activity.id])} />

      <CompletedActivities activity={activity} />

      <ScreenBottomNavBar>
        <EditButtonContainer>
          <Button
            intent={unsavedChanges ? "success" : "none"}
            onClick={handleToggleEditMode}
            large
            icon={isEditing ? (unsavedChanges ? "floppy-disk" : "cross") : "edit"}
          />
        </EditButtonContainer>
      </ScreenBottomNavBar>
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

const EditButtonContainer = styled.div`
  padding: 1rem;
`;
