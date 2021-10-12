import EventEmitter from 'events';

declare module 'lirc-client' {

  export interface Options {
    /**
     * [config.autoconnect=true]  Automatically connect.
     */
    readonly autoconnect?:boolean; 

    /**
     * [config.host='127.0.0.1']  Host running LIRC.
     */
    readonly host?:string; 

    /**
     * [config.port=8765]  Port of running LIRC daemon.
     */
    readonly port?:number; 

    /**
     * [config.path]  Path to LIRC socket.
     */
    readonly path?:string; 

    /**
     * [config.reconnect=true]  Automatically reconnect.
     */
    readonly reconnect?:boolean; 

    /**
     * [config.reconnect_delay=5000]  Delay when reconnecting.
     */
    readonly reconnect_delay?:number; 
  }

  export default class Lirc extends EventEmitter {
    on(event: 'connect', listener: () => void): this;
    off(event: 'connect', listener: () => void): this;
    once(event: 'connect', listener: () => void): this;

    on(event: 'disconnect', listener: () => void): this;
    off(event: 'disconnect', listener: () => void): this;
    once(event: 'disconnect', listener: () => void): this;

    on(event: 'rawdata', listener: (data: string) => void): this;
    off(event: 'rawdata', listener: (data: string) => void): this;
    once(event: 'rawdata', listener: (data: string) => void): this;

    // 'end' or 'timeout' or err.toString() ...
    on(event: 'error', listener: (error: string) => void): this;
    off(event: 'error', listener: (error: string) => void): this;
    once(event: 'error', listener: (error: string) => void): this;

    /**
     * @constructor
     * @param {object} [config]  Configuration object.
     * @param {boolean} [config.autoconnect=true]  Automatically connect.
     * @param {string} [config.host='127.0.0.1']  Host running LIRC.
     * @param {number} [config.port=8765]  Port of running LIRC daemon.
     * @param {string} [config.path]  Path to LIRC socket.
     * @param {boolean} [config.reconnect=true]  Automatically reconnect.
     * @param {number} [config.reconnect_delay=5000]  Delay when reconnecting.
     */
    constructor(config?: Options);

    /**
     * Send a command.
     *
     * @see available commands http://www.lirc.org/html/lircd.html
     * @param {string} command Command to send.
     * @param {string} [...args] optional parameters.
     * @return {Promise<array<string>>}  Resulting response from LIRC daemon.
     */
    send(command: string, ...args: string[]): Promise<string[]>;

    /**
     * Tell LIRC to emit a button press.
     *
     * @param {string} remote  Remote name.
     * @param {string} button  Button name.
     * @param {number} [repeat]  Number of times to repeat.
     * @return {Promise<array<string>>}  Response from LIRC.
     */
    sendOnce(remote: string, button: string, repeat?: number): Promise<string[]>;

    /**
     * Tell LIRC to start emitting button presses.
     *
     * @param {string} remote  Remote name.
     * @param {string} button  Button name.
     * @return {Promise<array<string>>}  Response from LIRC.
     */
    sendStart(remote: string, button: string): Promise<string[]>;

    /**
     * Tell LIRC to stop emitting a button press.
     *
     * @param {string} remote  Remote name.
     * @param {string} button  Button name.
     * @return {Promise<array<string>>}  Response from LIRC.
     */
    sendStop(remote: string, button: string): Promise<string[]>;

    /**
     * If a remote is supplied, list available buttons for remote, otherwise
     * return list of remotes.
     *
     * @param {string} [remote]  Remote name.
     * @return {Promise<array<string>>}  Response from LIRC.
     */
    list(remote?: string): Promise<string[]>;

    /**
     * Get LIRC version from server.
     *
     * @return {Promise<array<string>>}  Response from LIRC.
     */
    version(): Promise<string[]>;

    /**
     * Connect to a running LIRC daemon.
     *
     * @return {Promise}  Resolves upon connection to server.
     */
    connect(): Promise<void>;
     
    /**
     * Disconnect from LIRC daemon and clean up socket.
     *
     * @return {Promise}  Resolves upon disconnect.
     */
    disconnect(): Promise<void>;
  }
}