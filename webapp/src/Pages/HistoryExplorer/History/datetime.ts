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
  const time = date.toLocaleTimeString(); // "00:00:00" (HH:MM:SS)
  const hhmm = time.slice(0, 5);
  return hhmm;
}
