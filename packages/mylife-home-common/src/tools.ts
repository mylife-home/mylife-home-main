export function fireAsync(target: () => Promise<void>): void {
  target().catch((err) => console.error(err)); // TODO: logging
}
