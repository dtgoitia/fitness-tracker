import { unreachable } from "./domain/devex";

export function findVersionHash(): string {
  const headElements = document.getElementsByTagName("head")[0].children;
  let scriptElements = [];
  for (const headElement of headElements) {
    if (headElement.tagName === "SCRIPT") {
      scriptElements.push(headElement);
    }
  }

  if (scriptElements.length !== 1) {
    throw unreachable();
  }

  const scriptElement = scriptElements[0] as HTMLScriptElement;
  const hash = scriptElement.src.split(".").slice(-2)[0];
  return hash;
}
