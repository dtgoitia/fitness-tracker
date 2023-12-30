export function listsAreEqual<T>(a: T[] | undefined, b: T[] | undefined): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;

  if (a.length !== b.length) return false;

  for (let index = 0; index < a.length; index++) {
    const element_a = a[index];
    const element_b = b[index];
    if (element_a !== element_b) {
      return false;
    }
  }

  return true;
}
