export interface Message {
  seq: number;
  debugId: string;
  body: {
    type: string;
    content: string;
  };
}

export interface ZoneUpdate {
  zone: string;
  active: boolean;
  date: Date;
}