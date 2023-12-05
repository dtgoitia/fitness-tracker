import { customAlphabet } from "nanoid";

export const generateHash = customAlphabet("abcdefghijklmnopqrstuvwxyz", 10);

export function generateId({ prefix }: { prefix: string }): string {
  const hash = generateHash();
  return `${prefix}_${hash}`;
}
