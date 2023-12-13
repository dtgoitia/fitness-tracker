export function setsAreEqual<T>(a: Set<T> | undefined, b: Set<T> | undefined): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;

  if (a.size !== b.size) return false;

  for (const element_a of a) {
    if (b.has(element_a) === false) {
      return false;
    }
  }

  return true;
}

/**
 * Compute the set union between `a` and `b`, or in layman words, add `a` and
 * `b` together
 * @param a set A
 * @param b set B
 * @returns reference resulting union
 */
export function union<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set<T>([...a, ...b]);
}

/**
 * Add item to a set without mutating the original set
 */
export function addToSet<T>(set: Set<T>, item: T): Set<T> {
  return new Set<T>([...set, item]);
}

/**
 * Delete item from a set without mutating the original set
 */
export function deleteFromSet<T>(set: Set<T>, item: T): Set<T> {
  const result = new Set<T>([...set]);
  result.delete(item);
  return result;
}

/**
 * Identify which items are in `a` but not in `b` and in `b` but not in `a`.
 * @param a set A
 * @param b set B
 */
export function assessSetOverlap<T>({ a, b }: { a: Set<T>; b: Set<T> }): {
  inAButNotInB: Set<T>;
  inBButNotInA: Set<T>;
} {
  const in_a_not_b = new Set<T>();
  const in_b_not_a = new Set([...b]);

  for (const element_a of a) {
    if (b.has(element_a)) {
      in_b_not_a.delete(element_a);
    } else {
      in_a_not_b.add(element_a);
    }
  }

  // return in_a_not_b;
  return { inAButNotInB: in_a_not_b, inBButNotInA: in_b_not_a };
}
