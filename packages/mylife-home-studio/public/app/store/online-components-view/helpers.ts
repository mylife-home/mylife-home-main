export function buildUid(...items: string[]) {
  return items.join('$');
}