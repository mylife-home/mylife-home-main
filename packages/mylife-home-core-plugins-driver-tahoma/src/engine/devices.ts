import { Device, Message } from './device';

export class MP1 extends Device {
  constructor(host: string) {
    super(host, 0x4EB5);
  }

  async checkState() {
    return await this.state(false, null, null);
  }

  async setState(outputId: number, value: boolean) {
    return await this.state(true, outputId, value);
  }

  private createMessage(change: boolean, outputId: number, value: boolean): Message {
    const payload = Buffer.alloc(16);
    const mask    = change && 0x01 << (outputId - 1);

    payload[0x00] = change ? 0x0d : 0x0a;
    payload[0x02] = 0xa5;
    payload[0x03] = 0xa5;
    payload[0x04] = 0x5a;
    payload[0x05] = 0x5a;
    payload[0x06] = change ? (0xb2 + (value ? (mask << 1) : mask)): 0xae;
    payload[0x07] = 0xc0;
    payload[0x08] = change ? 0x02 : 0x01;
    if(change) {
      payload[0x0a] = 0x03;
      payload[0x0d] = mask;
      payload[0x0e] = value ? mask : 0;
    }

    return {
      command: 0x6a,
      payload
    };
  }

  private parseMessage(message: Message) {
    const { payload } = message;
    const s1 = !!(payload[0x0e] & 0x01);
    const s2 = !!(payload[0x0e] & 0x02);
    const s3 = !!(payload[0x0e] & 0x04);
    const s4 = !!(payload[0x0e] & 0x08);
    return [ s1, s2, s3, s4 ];

  }

  private async state(change: boolean, outputId: number, value: boolean) {
    const inputMessage = this.createMessage(change, outputId, value);
    const outputMessage = await this.query(inputMessage);
    const state = this.parseMessage(outputMessage);

    this.emit('state', state);
    return state;
  }
}

export class SP3 extends Device {
  constructor(host: string) {
    super(host, 0x753E);
  }

  async checkState() {
    return await this.state(false, null);
  }

  async setState(value: boolean) {
    return await this.state(true, value);
  }


  private createMessage(change: boolean, value: boolean): Message {

    const payload = Buffer.alloc(16);

    payload[0x00] = change ? 0x02 : 0x01;
    if(change) {
      payload[0x04] = value ? 1 : 0;
    }

    return {
      command: 0x6a,
      payload
    };
  }

  private parseMessage(message: Message) {
    const { payload } = message;
    return !!payload[0x04];
  }

  private async state(change: boolean, value: boolean) {
    const inputMessage = this.createMessage(change, value);
    const outputMessage = await this.query(inputMessage);
    const state = this.parseMessage(outputMessage);

    this.emit('state', state);
    return state;
  }
}
