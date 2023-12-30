export function todo(args: { message?: string } | undefined = undefined): never {
  throw args && args.message
    ? new Error(`TODO: ${args.message}`)
    : new Error("TODO: not implemented yet :)");
}

export const unreachable = (errorMessage?: string): Error =>
  errorMessage
    ? new Error(`This code path should have never been executed: ${errorMessage}`)
    : new Error(`This code path should have never been executed`);
