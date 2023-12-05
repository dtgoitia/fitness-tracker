import { findVersionHash } from "../findVersion";

export function BundleVersion() {
  const result = findVersionHash();

  if (result.success === false) {
    return <p>{result.reason}</p>;
  }

  return (
    <p>
      version:&nbsp;&nbsp;<code>{result.hash}</code>
    </p>
  );
}
