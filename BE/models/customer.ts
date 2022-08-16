export interface Customer {
  email: string;
  username: string;
  password: string;
  token?: string;
  drivingLicense: string;
  linkDrivingLicense: string;
  joinedDate?: Date;
  numberOfTrips?: number;
  status?: string;
}
