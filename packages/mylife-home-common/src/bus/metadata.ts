import { Client } from './client';
import { TransportOptions } from './transport';

export class Metadata {
  constructor(private readonly client: Client, options: TransportOptions) {
  }

}