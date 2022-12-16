export function now(): Date {
  return new Date(new Date().setMilliseconds(0));
}
