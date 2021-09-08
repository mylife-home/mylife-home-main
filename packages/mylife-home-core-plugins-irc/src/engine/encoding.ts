export function readBool(raw: string): boolean {
  return raw === 'on';
}

export function writeBool(value: boolean): string {
  return value ? 'on' : 'off';
}

export function readRange(raw: string): number {
  return parseInt(raw);
}

export function writeRange(value: number): string {
  return value.toString();
}

export function readTemperature(raw: string) {
  if (raw === null) {
    return 0;
  }

  const intValue = readRange(raw);
  return intValue / 10;
}