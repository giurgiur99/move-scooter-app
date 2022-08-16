export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MarkerOptions {
  position: Coordinates;
  icon: any;
  animation?: any;
  internalId: number;
}
