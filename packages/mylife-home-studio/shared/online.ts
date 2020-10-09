// TODO: same that common/tools/intance-info
export interface InstanceInfo {
  type: string;
  hardware: string;

  versions: {
    [component: string]: string;
  };

  systemBootTime: number;
  instanceBootTime: number;
  hostname: string;
  capabilities: string[];
}

export interface UpdateData {
  operation: 'set' | 'clear';
  instanceName: string;
  data?: InstanceInfo;
}