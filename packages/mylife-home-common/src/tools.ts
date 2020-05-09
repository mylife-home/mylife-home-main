export function fireAsync(target: () => Promise<void>): void {
  target().catch((err) => console.error(err)); // TODO: logging
}

export async function sleep(delay: number) {
  await new Promise(resolve => setTimeout(resolve, delay));
}