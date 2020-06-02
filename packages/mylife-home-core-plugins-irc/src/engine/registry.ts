export interface Client {
  readonly key: string;
}

export class Registry {
  constructor() {
  }

  publish(client: Client) {

  }

  unpublish(client: Client) {

  }

  attach(key: string, binder: (client: Client) => void, unbinder: () => void): () => void {

  }

}

export const registry = new Registry();