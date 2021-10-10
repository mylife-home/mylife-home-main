// From https://github.com/chamerling/ds18b20/blob/master/lib/ds18b20.js

// Note: to list devices ids:
// cat /sys/bus/w1/devices/w1_bus_master1/w1_master_slaves

import { promises as fs } from 'fs';

const parseData = parseDecimalData;

/**
 * Get the temperature of a given sensor
 * @param sensorId  The sensor ID
 */
export async function temperature(sensorId: string) {
  try {
    const data = await fs.readFile(`/sys/bus/w1/devices/${sensorId}/w1_slave`, 'utf8');
    return parseData(data);
  } catch(e) {
    const err = e as Error;
    err.message = `Cannot read temperature for sensor '${sensorId}': ${err.message}`;
    throw err;
  }
};

function parseDecimalData(data: string) {
  const arr = data.split('\n');

  if (arr[0].indexOf('YES') > -1) {
    const output = data.match(/t=(-?(\d+))/);
    return Math.round(Number(output[1]) / 100) / 10;
  } else if (arr[0].indexOf('NO') > -1) {
    return null;
  }
  throw new Error('Cannot get temperature');
}

function parseHexData(data: string) {
  const arr = data.split(' ');

  if (arr[1].charAt(0) === 'f') {
    const x = parseInt('0xffff' + arr[1].toString() + arr[0].toString(), 16);
    return (-((~x + 1) * 0.0625));
  } else if (arr[1].charAt(0) === '0') {
    return parseInt('0x0000' + arr[1].toString() + arr[0].toString(), 16) * 0.0625;
  }
  throw new Error('Cannot parse data');
}
