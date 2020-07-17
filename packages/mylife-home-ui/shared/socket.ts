export interface SocketMessage {
  type: string;
  data: any;
}

export const PING_INTERVAL = 30000;
export const PING_TIMEOUT = 5000;