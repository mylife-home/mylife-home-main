import os from 'os';
import * as irc from 'irc';
import { tools, logger } from 'mylife-home-common';
import { registry } from './registry';

const log = logger.createLogger('mylife:home:core:plugins:irc:engine:irc-client');

interface IrcComponent {
  readonly id: string;
  readonly state: { [name: string]: string; };
}

export class IrcClient {
  private readonly channel: string;
  private readonly irc: irc.Client;

  constructor(private readonly networkKey: string, server: string, channel: string) {
    const nick = `irc-bridge-${os.hostname()}-${process.pid}`;
    this.channel = channel[0] === '#' ? channel : '#' + channel;
    this.irc = new irc.Client(server, nick, { autoRejoin: true, channels: [this.channel] });

    this.setupIrcEvents();

    registry.createNetwork(this.networkKey);
    registry.on('execute-action', this.onExecuteAction);
  }

  close() {
    registry.off('execute-action', this.onExecuteAction);
    registry.deleteNetwork(this.networkKey);

    this.irc.removeAllListeners();
    tools.fireAsync(() => new Promise(resolve => this.irc.disconnect('Closing', resolve)));
  }

  private readonly onExecuteAction = (networkKey: string, componentId: string, actionName: string, argument: string) => {
    if (networkKey === this.networkKey) {
      this.irc.say(this.channel, `${componentId} ${actionName} ${argument}`);
    }
  };

  private setupIrcEvents() {
    this.irc.on('names', this.createChannelFilter(this.createNickListFormatter(this.reset)));
    this.irc.on('join', this.createChannelFilter(this.add));
    this.irc.on('nick', this.change);
    this.irc.on('part', this.createChannelFilter(this.remove));
    this.irc.on('kick', this.createChannelFilter(this.remove));
    this.irc.on('kill', this.remove);
    this.irc.on('quit', this.remove);

    this.irc.on('error', message => log.error(`IRC error: ${JSON.stringify(message)}`));
    this.irc.on('netError', error => log.error(error, 'Network error'));
  }

  private createNickListFormatter(target: (nicks: string[]) => void) {
    return (listWithModes: { [nick: string]: string; }) => {
      target(Object.keys(listWithModes));
    };
  }

  private createChannelFilter(target: (...args: any) => void) {
    return (channel: string, ...args: any) => {
      if (channel === this.channel) {
        target(...args);
      }
    };
  }

  private readonly reset = (nicks: string[]) => {
    const components = nicks.map(parseNick);
    const ids = new Set(components.map(component => component.id));

    for (const componentId of Object.keys(registry.findComponents(this.networkKey))) {
      if (!ids.has(componentId)) {
        registry.deleteComponent(this.networkKey, componentId);
      }
    }

    for (const component of components) {
      registry.setComponent(this.networkKey, component.id, component.state);
    }
  };

  private readonly add = (nick: string) => {
    const component = parseNick(nick);
    registry.setComponent(this.networkKey, component.id, component.state);
  };

  private readonly change = (beforeNick: string, afterNick: string) => {
    const before = parseNick(beforeNick);
    const after = parseNick(afterNick);

    if (before.id !== after.id) {
      // if complete nick change, let's consider the old is gone and a new one came
      registry.deleteComponent(this.networkKey, before.id);
    }

    registry.setComponent(this.networkKey, after.id, after.state);
  };

  private readonly remove = (nick: string) => {
    const component = parseNick(nick);
    registry.deleteComponent(this.networkKey, component.id);
  };
}

function parseNick(nick: string): IrcComponent {
  const [id, ...parts] = nick.split('|');
  const state: { [name: string]: string; } = {};

  for (const part of parts) {
    const [name, value] = part.split('`');
    state[name] = value;
  }

  return { id, state };
}