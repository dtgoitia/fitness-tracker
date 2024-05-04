import { divmod } from "./math";

export type Seconds = number; // duration in seconds - generic, nothing to do with epoch
type Milliseconds = number; // duration in milliseconds - generic, nothing to do with epoch

const SECONDS_PER_DAY: Seconds = 60 * 60 * 24;
const SECONDS_PER_HOUR: Seconds = 60 * 60;
const SECONDS_PER_MINUTE: Seconds = 60;

const MILLISECONDS_PER_DAY: Milliseconds = 24 * 60 * 60 * 1000;

type UTCSeconds = number; // Seconds ellapsed since 1970-01-01 00:00:00 (+00:00)
export type UTCMilliseconds = number; // Milliseconds ellapsed since 1970-01-01 00:00:00 (+00:00)

export function now(): Date {
  return new Date(new Date().setMilliseconds(0));
}

/* Return the provided `Date` with hours, minutes, seconds and milliseconds to zero. */
export function toDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toUTCDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function today(): Date {
  return toDay(now());
}

export function yesterday(): Date {
  const _today = toDay(now()).getTime();
  return new Date(_today - MILLISECONDS_PER_DAY);
}

export function weekStart(datetime: Date): Date {
  const usWeekDay = datetime.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const weekDay = usWeekDay === 0 ? 6 : usWeekDay - 1; // 0=Mon, 1=Tue, ..., 6=Sun
  const date = toDay(datetime);
  const weekStart = new Date(date.getTime() - weekDay * MILLISECONDS_PER_DAY);
  return weekStart;
}

// https://devhints.io/wip/intl-datetime
const LANGUAGE_SIMILAR_TO_ISO8601 = "sv-SE";

export const isoDateTimeFormatter = new Intl.DateTimeFormat(LANGUAGE_SIMILAR_TO_ISO8601, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
}).format;

export const isoDateFormatter = new Intl.DateTimeFormat(LANGUAGE_SIMILAR_TO_ISO8601, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format;

export function formatTimedelta(delta: Seconds): string {
  let remainder = delta;

  const chunks: string[] = [];

  let [days, h, m, s] = [0, 0, 0, 0];

  [days, remainder] = divmod(remainder, SECONDS_PER_DAY);
  if (days > 0) {
    chunks.push(`${days} ${days === 1 ? "day" : "days"}`);
  }

  [h, remainder] = divmod(remainder, SECONDS_PER_HOUR);
  if (h > 0 || chunks.length > 0) {
    chunks.push(`${h}h`);
  }

  [m, remainder] = divmod(remainder, SECONDS_PER_MINUTE);
  if (m > 0 || chunks.length > 0) {
    chunks.push(`${m}m`);
  }

  [s, remainder] = divmod(remainder, 1); // drop ms
  chunks.push(`${s}s`);

  return chunks.join(" ");
}

export function epochSecondsToDate(secs: UTCSeconds): Date {
  return new Date(secs * 1000);
}

export function dateToEpochSeconds(date: Date): UTCSeconds {
  const epochMs = date.getTime();
  return (epochMs - date.getMilliseconds()) / 1000;
}

export function nSecondsAfter(date: Date, n: Seconds): Date {
  return epochSecondsToDate(dateToEpochSeconds(date) + n);
}

export function nextDay(date: Date): Date {
  return new Date(date.getTime() + 24 * 3600 * 1000);
}

export function datesAreEqual(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}
