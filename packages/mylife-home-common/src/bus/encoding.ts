export function readString(buffer: Buffer): string {
  return buffer.toString();
}

export function writeString(value: string): Buffer {
  return Buffer.from(value);
}

export function readBool(buffer: Buffer): boolean {
  const intValue = readUInt8(buffer);
  return !!intValue;
}

export function writeBool(value: boolean): Buffer {
  const intValue = value ? 1 : 0;
  return writeUInt8(intValue);
}

export function readUInt8(buffer: Buffer): number {
  return buffer.readUInt8(0);
}

export function writeUInt8(value: number): Buffer {
  const buffer = Buffer.allocUnsafe(1);
  buffer.writeUInt8(value, 0);
  return buffer;
}

export function readInt8(buffer: Buffer): number {
  return buffer.readInt8(0);
}

export function writeInt8(value: number): Buffer {
  const buffer = Buffer.allocUnsafe(1);
  buffer.writeInt8(value, 0);
  return buffer;
}

export function readUInt32(buffer: Buffer): number {
  return buffer.readUInt32LE(0);
}

export function writeUInt32(value: number): Buffer {
  const buffer = Buffer.allocUnsafe(4);
  buffer.writeUInt32LE(value, 0);
  return buffer;
}

export function readInt32(buffer: Buffer): number {
  return buffer.readInt32LE(0);
}

export function writeInt32(value: number): Buffer {
  const buffer = Buffer.allocUnsafe(4);
  buffer.writeInt32LE(value, 0);
  return buffer;
}

export function readFloat(buffer: Buffer): number {
  return buffer.readFloatLE(0);
}

export function writeFloat(value: number): Buffer {
  const buffer = Buffer.allocUnsafe(4);
  buffer.writeFloatLE(value, 0);
  return buffer;
}

export function readJson(buffer: Buffer): any {
  return JSON.parse(readString(buffer));
}

export function writeJson(value: any): Buffer {
  return writeString(JSON.stringify(value));
}