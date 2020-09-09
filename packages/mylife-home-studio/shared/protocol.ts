export interface ServerMessage {
  type: 'service-response' | 'notification';
}

export interface ServiceRequest {
  requestId: string;
  service: string;
  payload: any;
}

export interface ServiceResponse extends ServerMessage {
  requestId: string;
  result?: any;
  error?: {
    type: string;
    message: string;
    stack: string;
  };
}

export interface Notification extends ServerMessage {
  notifierType: string;
  notifierId: string;
  data: any;
}
