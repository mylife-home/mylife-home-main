import { EventEmitter } from 'events';
import { logger } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:core:plugins:irc:engine:registry');

export type State = { readonly [name: string]: string; };
export type Components = { readonly [id: string]: State; };
export type Networks = { readonly [key: string]: Components; };

export interface IrcComponent {
  readonly networkKey: string;
  readonly id: string;
  readonly state: { [name: string]: string; };
}

export class Registry extends EventEmitter {
  private _networks: Networks = {};

  constructor() {
    super();
    
  }

  executeAction(networkKey: string, componentId: string, actionName: string, args: string[]) {
    log.debug(`execute action on network '${networkKey}' on component '${componentId}' with name '${actionName}' and args '${JSON.stringify(args)}'`);
    this.emit('execute-action', networkKey, componentId, actionName, args);
  }

  createNetwork(networkKey: string) {
    log.debug(`create network '${networkKey}'`);
    this.change({ ...this.networks, [networkKey]: {} });
  }

  deleteNetwork(networkKey: string) {
    log.debug(`delete network '${networkKey}'`);
    const { [networkKey]: removed, ...newNetworks } = this.networks;
    this.change(newNetworks);
  }

  setComponent(networkKey: string, componentId: string, state: { [name: string]: string; }) {
    log.debug(`set component '${componentId}' on network '${networkKey}' with state ${JSON.stringify(state)}`);
    const newNetwork = { ... this.networks[networkKey], [componentId]: state };
    this.change({ ...this.networks, [networkKey]: newNetwork });
  }

  deleteComponent(networkKey: string, componentId: string) {
    log.debug(`delete component '${componentId}' on network '${networkKey}'`);
    const { [componentId]: removed, ...newNetwork } = this.networks[networkKey];
    this.change({ ...this.networks, [networkKey]: newNetwork });
  }

  private change(networks: Networks) {
    this._networks = networks;
    this.emit('change');
  }

  get networks(): Networks {
    return this._networks;
  }

  hasComponent(networkKey: string, componentId: string) {
    return !!this.findState(networkKey, componentId);
  }

  findState(networkKey: string, componentId: string) {
    const network = this.networks[networkKey];
    return network && network[componentId];
  }

  findComponents(networkKey: string) {
    return this.networks[networkKey];
  }
}

export const registry = new Registry();