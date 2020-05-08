import { components, bus } from 'mylife-home-common';

/**
 * Register on registry events to publish all local components on bus
 */
export class BusPublisher {
  constructor(registry: components.Registry, transport: bus.Transport ) {
  }

  close() {

  }
}