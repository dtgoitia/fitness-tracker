export function findVersionHash(): string {
  const headElements = document.getElementsByTagName("head")[0].children;
  const scriptElements: Element[] = [];
  for (const headElement of headElements) {
    if (headElement.tagName === "SCRIPT") {
      scriptElements.push(headElement);
    }
  }

  if (scriptElements.length !== 1) {
    return "no version found";
  }

  const scriptElement = scriptElements[0] as HTMLScriptElement;
  const hash = scriptElement.src.split(".").slice(-2)[0];
  return hash;
}
