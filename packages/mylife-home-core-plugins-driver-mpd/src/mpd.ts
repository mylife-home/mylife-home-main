import { components } from 'mylife-home-core';
import { logger, tools } from 'mylife-home-common';
import { ConnectOptions, MpdClient, parseKeyValueMessage } from './engine/client';

const log = logger.createLogger('mylife:home:core:plugins:driver-mpd:mpd');

import m = components.metadata;

interface Configuration {
  readonly host: string;
  readonly port: number;
}

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'host', type: m.ConfigType.STRING })
@m.config({ name: 'port', type: m.ConfigType.INTEGER })
export class MPD {
  private readonly options: ConnectOptions;
  private readonly logInfo: string;
  private client: MpdClient;
  private setupDelay: NodeJS.Timeout;

  constructor(config: Configuration) {
    this.options = config;
    this.logInfo = `${this.options.host}:${this.options.port}`;

    this.setup();
  }

  destroy() {
    this.destroyClient();
    this.destroySetupDelay();
  }

  @m.state
  online: boolean = false;

  @m.state
  playing: boolean = false;

  @m.state({ type: new m.Range(0, 100) })
  volume: number = 0;

  @m.action
  toggle(arg: boolean) {
    if (!this.online || !arg) {
      return;
    }

    if (this.playing) {
      this.pause(true);
    } else {
      this.play(true);
    }
  }

  @m.action
  play(arg: boolean) {
    if (!this.online || !arg) {
      return;
    }

    this.sendAndRefresh('play', []);
  }

  @m.action
  pause(arg: boolean) {
    if (!this.online || !arg) {
      return;
    }

    this.sendAndRefresh('pause', ['1']);
  }

  @m.action
  next(arg: boolean) {
    if (!this.online || !arg) {
      return;
    }

    this.sendAndRefresh('next', []);
  }

  @m.action
  prev(arg: boolean) {
    if (!this.online || !arg) {
      return;
    }
    
    this.sendAndRefresh('previous', []);
  }

  @m.action({ type: new m.Range(-1, 100) })
  setVolume(arg: number) {
    if (!this.online || arg === -1) {
      return;
    }

    this.sendAndRefresh('setvol', [`${arg}`]);
  }

  private destroyClient() {
    if (this.client) {
      this.client.close();
      this.client.removeAllListeners();
      this.client = null;
    }
  }

  private destroySetupDelay() {
    if (this.setupDelay) {
      clearTimeout(this.setupDelay);
      this.setupDelay = null;
    }
  }

  private setup() {
    this.online = false;
    this.playing = false;
    this.volume = 0;

    this.client = new MpdClient(this.options);

    this.client.on('connect', () => { log.info(`(${this.logInfo}) connect`); });
    this.client.on('close', () => { log.info(`(${this.logInfo}) disconnected`); });

    this.client.on('ready', () => {
      log.info(`(${this.logInfo}) ready`);
      this.refresh();
    });

    this.client.on('error', (err) => {
      log.error(err, `(${this.logInfo}) error`);
      this.destroyClient();
      this.delayedSetup();
    });

    this.client.on('system', (name: string) => {
      switch (name) {
        case 'player':
        case 'mixer':
          this.refresh();
          break;
      }
    });
  }

  private delayedSetup() {
    this.destroySetupDelay();

    this.setupDelay = setTimeout(() => {
      this.destroySetupDelay();
      this.setup();
    }, 5000);
  }

  private refresh() {
    this.client.sendCommand('status', [], (err, msg) => {
      if (err) {
        log.error(err, `(${this.logInfo}) error`);
        this.destroyClient();
        this.setup();
        return;
      }

      const data = parseKeyValueMessage(msg);

      this.online = true;
      this.playing = data.state === 'play';
      // Note: VolumeIO does not provide volume control on MPD clients for now
      this.volume = data.volume ? parseInt(data.volume) : 0;
    });
  };

  private sendAndRefresh(cmd: string, args: string[]) {
    log.info(`(${this.logInfo}) sending command '${JSON.stringify({ cmd, args })}'`);
    this.client.sendCommand(cmd, args, (err) => {
      if (err) {
        log.error(err, `(${this.logInfo}) error while sending command '${JSON.stringify({ cmd, args })}'`);
      }
      this.refresh();
    });
  }
}
