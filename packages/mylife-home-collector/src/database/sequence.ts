export class Sequence {
  // We consider date of creation + increment will keep right ordering.

  private counter: bigint;

  constructor() {
    const beginTime = Math.floor(new Date().valueOf() / 1000);
    this.counter = BigInt(beginTime) * (2n ** 32n); // move it to higher part
  }

  next() {
    return ++this.counter;
  }
}