// function formatDate(date: Date): string {
//   const isoUtc = date.toISOString();
//   const noMilliseconds = isoUtc.split(".")[0];
//   const [day, time] = noMilliseconds.split("T");
//   const timeNoSeconds = time.slice(0, 5);
//   return `${day} ${timeNoSeconds}`;
// }
export function formatTime(date: Date): string {
  const isoUtc = date.toISOString();
  const noMilliseconds = isoUtc.split(".")[0];
  const [, time] = noMilliseconds.split("T");
  const timeNoSeconds = time.slice(0, 5);
  return `${timeNoSeconds}`;
}
