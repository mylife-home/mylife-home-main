export function makeUniqueId(existingIds: Set<string>, wantedId: string) {
  if (!existingIds.has(wantedId)) {
    return wantedId;
  }

  for (let i=1;; ++i) {
    const candidate = `${wantedId}_${i}`;
    if (!existingIds.has(candidate)) {
      return candidate;
    }
  }
}
