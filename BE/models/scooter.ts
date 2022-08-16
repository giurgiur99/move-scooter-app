export interface Scooter {
  number: number;
  battery?: number;
  locked?: boolean;
  booked?: boolean;
  lastSeen?: Date;
  internalId: number;
  unlockCode: number;
  coordX: number;
  coordY: number;
  status: string;
  addedDate: Date;
  dummy: Boolean;
}
