export interface Heartbeat {
  locked: boolean;
  iotVoltage: number;
  signal: number;
  battery: number;
  charging: boolean;
}
