import { Epoll, EventType } from 'epoll';
import { logger } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:core:plugins:driver-sysfs:engine:poll');

const callbacks = new Map<number, () => void>();
let native: Epoll;

export function register(fd: number, callback: () => void) {
  if (!native) {
    native = new Epoll(epollCallback);
  }

  callbacks.set(fd, callback);
  native.add(fd, Epoll.EPOLLPRI);
}

export function unregister(fd: number) {
  callbacks.delete(fd);
  native.remove(fd);

  if (callbacks.size === 0) {
    native.close();
    native = null;
  }
}

function epollCallback(err: Error, fd: number, events: EventType) {
  if (err) {
    log.error(err, 'Got error from epoll');
    return;
  }

  const callback = callbacks.get(fd);
  if (!callback) {
    log.error(`Got poll for FD '${fd}', which has no associated callback.`);
    return;
  }

  callback();
}
