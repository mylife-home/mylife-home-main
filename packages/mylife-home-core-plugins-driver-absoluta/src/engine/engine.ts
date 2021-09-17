import { logger } from 'mylife-home-common';
import { ZoneUpdate } from './types';
import { Store } from './store';
import { Connection, ConnectionSettings } from './connection';
import { parse } from './parser';

const log = logger.createLogger('mylife:home:core:plugins:driver-absoluta:engine');

export class Engine {
  private readonly connection: Connection;
  private lastSeq: number = null;
  private interval: NodeJS.Timeout;

  constructor(private readonly store: Store, settings: ConnectionSettings) {
    this.connection = new Connection(settings);

    this.connection.on('connected', this.onConnected);
    this.connection.on('disconnected', this.onDisconnected);
    this.connection.on('updated', this.onUpdated);
  }

  close() {
    this.connection.off('connected', this.onConnected);
    this.connection.off('disconnected', this.onDisconnected);
    this.connection.off('updated', this.onUpdated);

    this.connection.close();

    clearInterval(this.interval);
    this.interval = null;    

    this.store.setOnline(false);
  }

  private readonly onConnected = async () => {
    this.refresh();

    this.store.setOnline(true);
  }

  private readonly onDisconnected = () => {
    clearInterval(this.interval);
    this.interval = null;

    this.store.setOnline(false);
  }

  private readonly onUpdated = () => {
    this.refresh();
  }

  private readonly onInterval = () => {
    this.refresh();
  }

  private fetch() {
    if(this.lastSeq === null) {
      const since = new Date();
      since.setDate(since.getDate() - 3);
  
      return this.connection.fetch({ since });
    } else  {
      return this.connection.fetch(`${this.lastSeq}:*`);
    }
  }

  private async refresh() {
    clearInterval(this.interval);
    this.interval = null;

    try {
      const updates = new BatchUpdates();

      for await (const msg of this.fetch()) {
        this.lastSeq = Math.max(this.lastSeq, msg.seq);

        for(const update of parse(msg)) {
          updates.add(update);
        }
      }

      updates.publish(this.store);
    } catch(err) {
      log.error(err, 'Error on refresh');
    }

    this.interval = setInterval(this.onInterval, 60000);
  }
}

class BatchUpdates {
  private readonly updates = new Map<string, ZoneUpdate>();

  add(update: ZoneUpdate) {
    let existing = this.updates.get(update.zone);
    if (this.isNewer(existing, update)) {
      this.updates.set(update.zone, update);
    }
  }

  private isNewer(existing: ZoneUpdate, update: ZoneUpdate) {
    if (!existing) {
      return true;
    }

    if (existing.date < update.date) {
      return true;
    }

    if (existing.date > update.date) {
      return false;
    }

    // Dates are equals, let's consider higher seq is the latest
    return existing.msgseq < update.msgseq;
  }

  publish(store: Store) {
    for (const update of this.updates.values()) {
      store.setActive(update.zone, update.active);
    }
  }
}