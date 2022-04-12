export function validateId(id: string) {
  if (id.includes(':')) {
    throw new Error(`Id '${id}' contains forbidden character ':'`);
  }
}