import { CoordinatesArray } from 'src/app/modules/dashboard/trip-table/coordinates.interface';

export interface Trip {
  username: string;
  scooterId: string;
  startPoint: [number, number];
  coordinatesArray: CoordinatesArray[];
  totalTime: number;
  cost: number;
  status: string;
  startTime: Date;
  endTime: Date;
}
