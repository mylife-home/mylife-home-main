declare function getInfoSync(filename?: string): Result;
declare function getInfo(filename?: string): Promise<Result>;

export interface Result {
  cpus: { [name: string]: number | string }[];
  hardware: string;
  revision: Revision;
  serial: string;
  model: string;
}

export interface Revision {
  type: string;
  memory: string; // '256MB' | '512MB' | '1GB' | '2GB' | '4GB' | '8GB';
  processor: string; // 'BCM2835' | 'BCM2836' | 'BCM2837' | 'BCM2711';
  revision: number;
  manufacturer: string; // 'Egoman' | 'Embest' | 'Qisda' | 'Sony Japan' | 'Sony UK' | 'Stadium';
  overvoltage?: boolean;
  otp?: { program: boolean; read: boolean };
  warranty?: boolean;
  code?: string;
}

/*
pirev

ReferenceError: No revision code found

{
  cpus: [
    {
      processor: 0,
      bogomips: 38.4,
      features: 'fp asimd evtstrm crc32 cpuid',
      cpu_implementer: 65,
      cpu_architecture: 8,
      cpu_variant: 0,
      cpu_part: 3331,
      cpu_revision: 4
    },
    {
      processor: 1,
      bogomips: 38.4,
      features: 'fp asimd evtstrm crc32 cpuid',
      cpu_implementer: 65,
      cpu_architecture: 8,
      cpu_variant: 0,
      cpu_part: 3331,
      cpu_revision: 4
    },
    {
      processor: 2,
      bogomips: 38.4,
      features: 'fp asimd evtstrm crc32 cpuid',
      cpu_implementer: 65,
      cpu_architecture: 8,
      cpu_variant: 0,
      cpu_part: 3331,
      cpu_revision: 4
    },
    {
      processor: 3,
      bogomips: 38.4,
      features: 'fp asimd evtstrm crc32 cpuid',
      cpu_implementer: 65,
      cpu_architecture: 8,
      cpu_variant: 0,
      cpu_part: 3331,
      cpu_revision: 4
    }
  ],
  hardware: 'BCM2835',
  revision: {
    type: '3B',
    memory: '1GB',
    processor: 'BCM2837',
    revision: 1.2,
    manufacturer: 'Sony UK',
    overvoltage: true,
    otp: { program: true, read: true },
    warranty: true,
    code: 'a02082'
  },
  serial: '00000000957219d5',
  model: 'Raspberry Pi 3 Model B Rev 1.2'
}
*/