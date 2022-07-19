import {
  Activity,
  CompletedActivity,
  Duration,
  groupByDay,
  Intensity,
  ItemAutocompleter,
} from "./domain";

describe("Find items", () => {
  const defaultArgs = { shop: "Lidl", toBuy: true, otherNames: [] };

  const coder: Activity = { id: 1, name: "Coder", ...defaultArgs };
  const code: Activity = { id: 2, name: "Code", ...defaultArgs };
  const cocoa: Activity = { id: 3, name: "Cocoa", ...defaultArgs };
  const banana: Activity = { id: 4, name: "Banana", ...defaultArgs };

  const items: Activity[] = [coder, code, cocoa, banana];

  const completer = new ItemAutocompleter(items);

  test("by prefix", () => {
    const matched = completer.search(["co"]);
    expect(matched).toEqual(new Set([coder, code, cocoa]));
  });

  test("ignores case", () => {
    const uppercaseMatch = completer.search(["CO"]);
    expect(uppercaseMatch).toEqual(new Set([coder, code, cocoa]));

    const lowercaseMatch = completer.search(["co"]);
    expect(lowercaseMatch).toEqual(new Set([coder, code, cocoa]));
  });

  test("match the start of any word in the item", () => {
    const bigCocoa: Activity = { id: 5, name: "Big cocoa", ...defaultArgs };
    const items: Activity[] = [coder, bigCocoa, banana];

    const completer = new ItemAutocompleter(items);

    const matched = completer.search(["co"]);
    expect(matched).toEqual(new Set([coder, bigCocoa]));
  });

  test("match multiple prefixes", () => {
    // let the UI split by space and pass each chunk to the autocompleter
    const prefixes: string[] = ["cod", "ban"];

    const matched = completer.search(prefixes);
    expect(matched).toEqual(new Set([coder, code, banana]));
  });
});

test("group completed activities by day", () => {
  const a: CompletedActivity = {
    id: 1658253269730,
    activityId: 1,
    intensity: Intensity.medium,
    duration: Duration.short,
    date: new Date("2022-07-18T17:54:29.730Z"),
    notes: "",
  };

  const b: CompletedActivity = {
    id: 1658253273787,
    activityId: 1,
    intensity: Intensity.medium,
    duration: Duration.medium,
    date: new Date("2022-07-19T17:54:33.787Z"),
    notes: "",
  };

  const history = [a, b];

  const result = groupByDay(history);
  expect(result).toEqual([
    ["2022-07-18", [a]],
    ["2022-07-19", [b]],
  ]);
});
