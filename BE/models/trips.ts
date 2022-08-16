interface coordiantes {
  latitude: number;
  coordinates: number;
}
export interface Trip {
  username: string;
  scooterId: string;
  coordinatesArray: coordiantes[];
  totalTime: number;
  status: string;
  distance: number;
  cost: number;
  startTime: Date;
  endTime: Date;
}
