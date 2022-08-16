export interface ScooterInformation {
  battery: number;
  currentMode: string;
  speed: number;
  charging: boolean;
  batteryVoltage1: number;
  batteryVoltage2?: number;
  locked: string;
  signal: number;
}
