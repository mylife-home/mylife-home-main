declare module 'node-arp' {

  function getMAC(ipaddress: string, cb: (error: boolean, output: string | number) => void): void;
}