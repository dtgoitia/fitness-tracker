export function now(): Date {
  return new Date(new Date().setMilliseconds(0));
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
