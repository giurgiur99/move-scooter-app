import { Customer } from "../models/customer";

declare global {
  namespace Express {
    interface Request {
      customer: Customer;
      path: string;
    }
  }
}
