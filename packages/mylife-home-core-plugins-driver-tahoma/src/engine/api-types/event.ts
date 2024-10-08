import { Entry } from './device';
import { Action } from './execution';

export interface Event {
  readonly timestamp: number;
  readonly name: 'DeviceStateChangedEvent' | 'GatewaySynchronizationEndedEvent' | 'GatewaySynchronizationStartedEvent' | 'RefreshAllDevicesStatesCompletedEvent' | 'DeviceUnavailableEvent' | 'ExecutionRegisteredEvent' | 'ExecutionStateChangedEvent' | 'CommandExecutionStateChangedEvent';
}

export interface DeviceStateChangedEvent extends Event {
  readonly name: 'DeviceStateChangedEvent';
  readonly setupOID: string;
  readonly deviceURL: string;
  readonly deviceStates: Entry[];
}

export interface GatewaySynchronizationEvent extends Event {
  readonly name: 'GatewaySynchronizationEndedEvent' | 'GatewaySynchronizationStartedEvent';
  readonly gatewayId: string;
}

export interface RefreshAllDevicesStatesCompletedEvent extends Event {
  readonly name: 'RefreshAllDevicesStatesCompletedEvent';
  readonly gatewayId: string;
  readonly protocolType: number;
}

// DeviceUnavailableEvent ??

export interface ExecutionRegisteredEvent extends Event {
  readonly name: 'ExecutionRegisteredEvent';
  readonly setupOID: string;
  readonly execId: string;
  readonly type: number;
  readonly subType: number;
  readonly source: string;
  readonly owner: string;
  readonly label?: string;
  readonly metadata?: string;
  readonly actions: Action[];
}

export interface ExecutionStateChangedEvent extends Event {
  readonly name: 'ExecutionStateChangedEvent';
  readonly setupOID: string;
  readonly execId: string;
  readonly newState: EventState;
  readonly ownerKey: string;
  readonly type: number;
  readonly subType: number;
  readonly oldState: EventState;
  readonly timeToNextState: number;
}

export interface CommandExecutionStateChangedEvent extends Event {
  readonly name: 'CommandExecutionStateChangedEvent';
  readonly setupOID: string;
  readonly deviceURL: string;
  readonly execId: string;
  readonly newState: EventState;
  readonly failureType: string; // CMDCANCELLED, others?
  readonly failureTypeCode: number; // cancelled = 106
  readonly rank: number; // 0
}

export enum EventState {
  initialized = 'INITIALIZED',
  notTransmistted = 'NOT_TRANSMITTED',
  transmistted = 'TRANSMITTED',
  inProgress = 'IN_PROGRESS',
  completed = 'COMPLETED',
  failed = 'FAILED'
}
