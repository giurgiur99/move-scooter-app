export interface Session {
  token: string;
  userId: string;
  data: Date;
  status: ["IN_PROGRESS" | "ACTIVE" | "INACTIVE"];
}
