export interface Scooter {
  number: number;
  battery: number;
  locked: boolean;
  booked: boolean;
  lastSeen: Date;
  internalId: number;
  location: [number, number];
  status: string;
}
