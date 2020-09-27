declare function getInfoSync(): Result;
declare function getInfo(): Promise<Result>;

export interface Result {
  revision: Revision;
}

export interface Revision {
  type: '2B';
  memory: '256MB' | '512MB' | '1GB' | '2GB' | '4GB' | '8GB';
  processor: 'BCM2835' | 'BCM2836' | 'BCM2837' | 'BCM2711';
  revision: 1.1;
  manufacturer: 'Egoman' | 'Embest' | 'Qisda' | 'Sony Japan' | 'Sony UK' | 'Stadium';

  overvoltage?: boolean;
  otp?: { program: boolean; read: boolean };
  warranty?: boolean;
  code?: string;
}

/*
pirev

ReferenceError: No revision code found

  revision: {
    type: '2B',
    memory: '1GB',
    processor: 'BCM2836',
    revision: 1.1,
    manufacturer: 'Embest',
    overvoltage: true,
    otp: { program: true, read: true },
    warranty: true,
    code: 'a21041'
  }
*/