import { Intent, Position, Toaster } from "@blueprintjs/core";

export function notify({ message, intent }: { message: string; intent: Intent }): void {
  Toaster.create({
    className: "recipe-toaster",
    position: Position.BOTTOM,
  }).show({ message, intent });
}
