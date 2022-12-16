export function todo(errorMessage?: string) {
  throw errorMessage
    ? new Error(`TODO: ${errorMessage}`)
    : new Error("TODO: not implemented yet :)");
}

export const unreachable = (errorMessage?: string): Error =>
  errorMessage
    ? new Error(`This code path should have never been executed: ${errorMessage}`)
    : new Error(`This code path should have never been executed`);
