// https://github.com/vinsidious/circularbuffer/blob/master/src/CircularBuffer.ts
export class CircularBuffer<T> {
  private readonly buffer: T[] = [];

  constructor(public readonly capacity: number) {
  }

  push(item: T) {
    if (this.buffer.length === this.capacity) {
      this.buffer.shift();
    }

    this.buffer.push(item);
  }

  toArray() {
    return [...this.buffer];
  }

  clear() {
    this.buffer.splice(0, this.buffer.length);
  }

  get size() {
    return this.buffer.length;
  }
}
