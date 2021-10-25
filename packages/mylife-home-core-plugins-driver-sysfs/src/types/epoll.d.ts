declare module 'epoll' {
  export type EventType = number;

  export class Epoll {
    static EPOLLIN: EventType;
    static EPOLLOUT: EventType;
    static EPOLLRDHUP: EventType;
    static EPOLLPRI: EventType;
    static EPOLLERR: EventType;
    static EPOLLHUP: EventType;
    static EPOLLET: EventType;
    static EPOLLONESHOT: EventType;

    /**
     * The callback is called when epoll events occur
     * @param callback
     */
    constructor(callback: (err: Error, fd: number, events: EventType) => void);

    /**
     * Register file descriptor fd for the event types specified by events.
     * @param fd
     * @param events
     */
    add(fd: number, events: EventType): void;

    /**
     * Deregister file descriptor fd.
     * @param fd
     */
    remove(fd: number): void;

    /**
     * Change the event types associated with file descriptor fd to those specified by events.
     * @param fd
     * @param events
     */
    modify(fd: number, events: EventType): void;

    /**
     * Deregisters all file descriptors and free resources.
     */
    close(): void;
  }
}
