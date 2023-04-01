// function formatDate(date: Date): string {
//   const isoUtc = date.toISOString();
//   const noMilliseconds = isoUtc.split(".")[0];
//   const [day, time] = noMilliseconds.split("T");
//   const timeNoSeconds = time.slice(0, 5);
//   return `${day} ${timeNoSeconds}`;
// }

/**
 * Return the time (not date) as HH:MM format, in the locale.
 */
export function formatTime(date: Date): string {
  const hhmmss = date.toLocaleTimeString(undefined, {
    hourCycle: "h24",
    hour: "2-digit",
    minute: "2-digit",
  });
  const hhmm = hhmmss.slice(0, 5);
  return hhmm;
}
