import { EventEmitter } from 'events';

export type State = { readonly [name: string]: string; };
export type Components = { readonly [id: string]: State; };
export type Networks = { readonly [key: string]: Components; };

export interface IrcComponent {
  readonly networkKey: string;
  readonly id: string;
  readonly state: { [name: string]: string; };
}

export class Registry extends EventEmitter {
  private _networks: Networks;

  executeAction(networkKey: string, componentId: string, actionName: string, args: string[]) {
    this.emit('execute-action', networkKey, componentId, actionName, args);
  }

  createNetwork(networkKey: string) {
    this.change({ ...this.networks, [networkKey]: {} });
  }

  deleteNetwork(networkKey: string) {
    const { [networkKey]: removed, ...newNetworks } = this.networks;
    this.change(newNetworks);
  }

  setComponent(networkKey: string, componentId: string, state: { [name: string]: string; }) {
    const newNetwork = { ... this.networks[networkKey], [componentId]: state };
    this.change({ ...this.networks, [networkKey]: newNetwork });
  }

  deleteComponent(networkKey: string, componentId: string) {
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
    return this.networks[networkKey][componentId];
  }

  findComponents(networkKey: string) {
    return this.networks[networkKey];
  }
}

export const registry = new Registry();