import { formatTimedelta, weekStart } from "./datetimeUtils";
import { describe, expect, it } from "vitest";

describe("format timedelta", () => {
  it(`s`, () => {
    expect(formatTimedelta(1)).toEqual("1s");
  });

  it(`ss`, () => {
    expect(formatTimedelta(12)).toEqual("12s");
  });

  it(`m s`, () => {
    expect(formatTimedelta(62)).toEqual("1m 2s");
  });

  it(`m ss`, () => {
    expect(formatTimedelta(72)).toEqual("1m 12s");
  });

  it(`mm s`, () => {
    expect(formatTimedelta(602)).toEqual("10m 2s");
  });

  it(`mm ss`, () => {
    expect(formatTimedelta(612)).toEqual("10m 12s");
  });

  it(`h mm ss`, () => {
    expect(formatTimedelta(4212)).toEqual("1h 10m 12s");
  });

  it(`hh mm ss`, () => {
    expect(formatTimedelta(7812)).toEqual("2h 10m 12s");
  });

  it(`day h m ss`, () => {
    const oneDay = 1 * (60 * 60 * 24);
    const seconds = 12;
    const delta = oneDay + seconds;
    expect(formatTimedelta(delta)).toEqual("1 day 0h 0m 12s");
  });

  it(`days h m ss`, () => {
    const oneDay = 2 * (60 * 60 * 24);
    const seconds = 12;
    const delta = oneDay + seconds;
    expect(formatTimedelta(delta)).toEqual("2 days 0h 0m 12s");
  });
});

describe(`${weekStart.name}`, () => {
  const _d = (s: string): Date => new Date(Date.parse(s));

  it("Mon", () => {
    expect(weekStart(_d("2024-06-24"))).toEqual(_d("2024-06-24"));
  });
  it("Tue", () => {
    expect(weekStart(_d("2024-06-25"))).toEqual(_d("2024-06-24"));
  });
  it("Wed", () => {
    expect(weekStart(_d("2024-06-26"))).toEqual(_d("2024-06-24"));
  });
  it("Thu", () => {
    expect(weekStart(_d("2024-06-27"))).toEqual(_d("2024-06-24"));
  });
  it("Fri", () => {
    expect(weekStart(_d("2024-06-28"))).toEqual(_d("2024-06-24"));
  });
  it("Sat", () => {
    expect(weekStart(_d("2024-06-29"))).toEqual(_d("2024-06-24"));
  });
  it("Sun", () => {
    expect(weekStart(_d("2024-06-30"))).toEqual(_d("2024-06-24"));
  });
  it("across months", () => {
    expect(weekStart(_d("2024-06-02"))).toEqual(_d("2024-05-27"));
  });
  it("across years", () => {
    expect(weekStart(_d("2022-01-02"))).toEqual(_d("2021-12-27"));
  });
});
