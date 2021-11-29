export interface InstanceInfo {
  /**
   * 'ui' | 'studio' | 'core' | 'driver? (for arduino/esp/...)'
   */
  type: string;

  /**
   * main: Raspberry ... | nodemcu | x64
   * others are details like ram, cpu, ...
   */
  hardware: { [name: string]: string };
  /**
   * --- rpi
   * os: linux-xxx
   * node: 24.5
   * mylife-home-core: 1.0.0
   * mylife-home-common: 1.0.0
   * --- esp/arduino
   * mylife: 1.21.4
   */
  versions: {
    [component: string]: string;
  };

  systemUptime: number;
  instanceUptime: number;
  hostname: string;
  capabilities: string[];

  wifi?: {
    rssi: number;
  }
}
