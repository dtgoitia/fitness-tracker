import { ACTIVITY_PREFIX } from "./activities";
import { generateId } from "./hash";
import { Activity, ActivityName } from "./model";
import { ItemAutocompleter } from "./search";

// TODO: this probably needs to go to a more accessible module
function buildActivity({ name }: { name: ActivityName }): Activity {
  return {
    id: generateId({ prefix: ACTIVITY_PREFIX }),
    name,
    otherNames: [],
  };
}

describe("Find items", () => {
  const coder = buildActivity({ name: "Coder" });
  const code = buildActivity({ name: "Code" });
  const cocoa = buildActivity({ name: "Cocoa" });
  const banana = buildActivity({ name: "Banana" });

  const items: Activity[] = [coder, code, cocoa, banana];

  const completer = new ItemAutocompleter(items);

  it("by prefix", () => {
    const matched = completer.search(["co"]);
    expect(matched).toEqual(new Set([coder, code, cocoa]));
  });

  it("ignores case", () => {
    const uppercaseMatch = completer.search(["CO"]);
    expect(uppercaseMatch).toEqual(new Set([coder, code, cocoa]));

    const lowercaseMatch = completer.search(["co"]);
    expect(lowercaseMatch).toEqual(new Set([coder, code, cocoa]));
  });

  it("match the start of any word in the item", () => {
    const bigCocoa: Activity = buildActivity({ name: "Big cocoa" });
    const items: Activity[] = [coder, bigCocoa, banana];

    const completer = new ItemAutocompleter(items);

    const matched = completer.search(["co"]);
    expect(matched).toEqual(new Set([coder, bigCocoa]));
  });

  it("match multiple prefixes", () => {
    // let the UI split by space and pass each chunk to the autocompleter
    const prefixes: string[] = ["cod", "ban"];

    const matched = completer.search(prefixes);
    expect(matched).toEqual(new Set([coder, code, banana]));
  });
});
