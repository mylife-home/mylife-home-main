export function readBool(raw: string): boolean {
  return raw === 'on';
}

export function writeBool(value: boolean): string {
  return value ? 'on' : 'off';
}
