/*
inspired from :
 - https://github.com/smka/broadlinkjs-sm/blob/master/index.js
 - https://blog.ipsumdomus.com/broadlink-smart-home-devices-complete-protocol-hack-bc0b4b397af1

WARNING : node-arp crashes node process (unhandled on('error') on cp.spawn('arp', ...) result) if it cannot run arp. Be sure it exists and is accessible.
*/

import EventEmitter from 'events';
import crypto from 'crypto';
import arp from 'node-arp';
import dns from 'dns';
import { logger } from 'mylife-home-common';
import { Connection } from './connection';

const log = logger.createLogger('mylife:home:core:plugins:driver-broadlink:engine:device');

const DEFAULT_KEY = Buffer.from([0x09, 0x76, 0x28, 0x34, 0x3f, 0xe9, 0x9e, 0x23, 0x76, 0x5c, 0x15, 0x13, 0xac, 0xcf, 0x8b, 0x02]);
const IV = Buffer.from([0x56, 0x2e, 0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58]);
const CID = Buffer.from([0xa5, 0xaa, 0x55, 0x5a, 0xa5, 0xaa, 0x55, 0x0]);

export interface Message {
  command?: number;
  payload: Buffer;
}

export declare interface Device extends EventEmitter {
  on(event: 'onlineChanged', listener: (online: boolean) => void): this;
  off(event: 'onlineChanged', listener: (online: boolean) => void): this;
  once(event: 'onlineChanged', listener: (online: boolean) => void): this;
}

export class Device extends EventEmitter {
  private closed = false;
  private _online: boolean;
  private socket: Connection;

  private address: string;
  private mac: string;
  private reconnectTimer: NodeJS.Timeout;

  private key: Buffer;
  private deviceId: number;
  private sendCounter: number;

  constructor(private readonly host: string, private readonly type: number) {
    super();

    this.reset();
  }

  reset() {
    this.address = null;
    this.mac = null;
    this.reconnectTimer = null;

    this.key = DEFAULT_KEY;
    this.deviceId = null;
    this.sendCounter = 0;

    this.setOnline(false);
  }

  async connect() {
    try {
      const addresses = await new Promise<string[]>((resolve, reject) => dns.resolve4(this.host, (err, addresses) => err ? reject(err) : resolve(addresses)));
      this.address = addresses[0];
      this.mac = await getMac(this.address);

      log.debug(`Connecting (host='${this.host}', address=${this.address}, mac=${this.mac})`);

      this.socket = new Connection();
      this.socket.on('error', this.onError);

      await this.socket.open(this.address);
      // this.socket.hello();
      await this.auth();

    } catch (err) {
      this.onError(err);
      return;
    }
  }

  close() {
    this.closed = true;
    this.disconnect();
  }

  private setOnline(value: boolean) {
    if (this._online === value) {
      return;
    }

    this._online = value;
    this.emit('onlineChanged', this.online);
  }

  public get online() {
    return this._online;
  }

  private disconnect() {
    if (this.socket) {
      this.socket.off('error', this.onError);
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reset();
  }

  private readonly onError = (err: Error) => {
    log.error(err, 'Device error');

    this.disconnect();

    if (this.closed) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  };

  private createPacket(message: Message) {
    if (!this.mac) {
      throw new Error('Not set up for now (unknown mac address');
    }

    if (!message.payload) {
      message.payload = Buffer.alloc(0);
    }

    let packet = Buffer.alloc(0x38); // total custom header length
    packet.writeUInt8(0x5a, 0); // Version:0, Reset:Yes, CID:0x2,Packet #1, Multipath:Yes
    CID.copy(packet, 1);
    // tag:0x0, tag #:0x0, padding: 0
    packet.writeUInt16LE(this.type, 0x24); // 0x24 : Device ID
    packet.writeUInt8(message.command, 0x26); // 0x26 : Command
    packet.writeUInt16LE(this.sendCounter++ & 0xFFFF, 0x28); // 0x28 : Send Counter

    const m = this.mac.split(':').reverse();
    let offset = 0x2a; // 0x2a  : MAC
    for (var i = 0; i < m.length; ++i) {
      packet.writeUInt8(parseInt(m[i], 16), offset++);
    }

    if (this.deviceId) {
      packet.writeUInt32LE(this.deviceId, 0x30); // 0x30  : Device ID
    }

    if (message.payload.length > 0) {
      packet.writeUInt16LE(checksum(message.payload), 52); // 0x34  : Header Checksum
    }

    const cipher = crypto.createCipheriv('aes-128-cbc', this.key, IV);
    cipher.setAutoPadding(false);
    message.payload = Buffer.concat([cipher.update(message.payload), cipher.final()]);

    packet = Buffer.concat([packet, message.payload]);
    packet.writeUInt16LE(checksum(packet), 0x20); // 0x20   : Full checksum
    return packet;
  }

  private parsePacket(packet: Buffer): Message {
    const id = packet.readUInt16LE(0x28);
    const cs = packet.readUInt16LE(0x20);
    packet.writeUInt16LE(0, 0x20);
    if (cs !== checksum(packet)) {
      throw new Error(`Bad checksum (#${id})`);
    }

    const errCode = packet.readInt16LE(0x22); // 0x22 : Error
    if (errCode !== 0) {
      throw new Error(`Error status in response: ${errCode} (#${id})`);
    }

    let payload = Buffer.alloc(packet.length - 0x38); // 0x38 : Encrypted payload
    packet.copy(payload, 0, 56, packet.length);

    var decipher = crypto.createDecipheriv('aes-128-cbc', this.key, IV);
    decipher.setAutoPadding(false);
    payload = Buffer.concat([decipher.update(payload), decipher.final()]);

    return { payload };
  }

  protected async query(message: Message) {
    const request = this.createPacket(message);
    const response = await this.socket.query(request);
    return this.parsePacket(response.packet);
  }


  private async auth() {

    let query: Message;
    {
      const payload = Buffer.alloc(0x50);
      const key = crypto.randomBytes(16); // this.key;
      key.copy(payload, 0x4); //  0x4 : Shared key (16 bytes)
      //payload.writeUInt8(0x1, 0x1e); // 0x1e : 0x1
      payload.writeUInt8(0x1, 0x2d); // 0x2d : 0x1
      payload.write('mylife-home', 0x30, 'ascii'); // 0x30 : Device name

      query = { command: 0x65, payload };
    }

    const response = await this.query(query);

    {
      const { payload } = response;
      const key = Buffer.alloc(16);
      payload.copy(key, 0, 0x4, 20); // 0x4 : key in payload
      this.key = key;
      this.deviceId = payload.readInt32LE(0x0); // 0x0 : device id in payload
    }

    log.debug(`Authenticated (deviceId=${this.deviceId}, key=${this.key.toString('hex')})`);
    this.setOnline(true);
  }
}

function checksum(buffer: Buffer) {
  return ((0xbeaf + buffer.reduce((p, c) => (p + c))) & 0xffff);
}

async function getMac(ipaddress: string) {
  return await new Promise<string>((resolve, reject) => {
    arp.getMAC(ipaddress, (error, output) => {
      if (error) {
        // cf. node-arp sources...
        if (typeof (output) === 'number') {
          output = `arp process exited with code ${output}`;
        }

        reject(new Error(output));
      } else {
        resolve(output as string);
      }
    });
  });
}