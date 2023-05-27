import { divmod } from "./math";

const SECONDS_PER_DAY = 60 * 60 * 24;
const SECONDS_PER_HOUR = 60 * 60;
const SECONDS_PER_MINUTE = 60;

type UTCSeconds = number; // Seconds ellapsed since 1970-01-01 00:00:00 (+00:00)
export type Seconds = number; // duration in seconds - generic, nothing to do with epoch

export function now(): Date {
  return new Date(new Date().setMilliseconds(0));
}

export function today(): Date {
  const _now = now();
  return new Date(_now.getFullYear(), _now.getMonth(), _now.getDate());
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