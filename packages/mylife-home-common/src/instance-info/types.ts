export interface InstanceInfo {
  /**
   * 'ui' | 'studio' | 'core' | 'driver? (for arduino/esp/...)'
   */
  type: string;

  /**
   * 'rpi-<version>?' | 'arduino-<type?>' | 'esp8266'
   */
  hardware: string;

  /**
   * --- rpi
   * os: linux-xxx
   * node: 24.5
   * mylife-home-core: 1.0.0
   * mylife-home-common: 1.0.0
   * --- esp/arduino
   * program: 1.21.4
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
