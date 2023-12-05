export function divmod(n: number, divisor: number): [number, number] {
  const remainder = n % divisor;
  const modulo = (n - remainder) / divisor;
  return [modulo, remainder];
}
