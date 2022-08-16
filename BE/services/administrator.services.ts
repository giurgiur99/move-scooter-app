import { Administrator } from "../models/admin";

const administratorCollection = require("../db/administrator.db");

export default class AdministratorService {
  public register(administrator: Administrator) {
    console.log("--- Administrator added! ---");
    return administratorCollection.create(administrator);
  }

  public findDuplicateEmail(email: string) {
    return administratorCollection.exists({ email: email });
  }

  public findById(id: string) {
    return administratorCollection.findOne({ _id: id });
  }

  public findByEmail(email: string) {
    return administratorCollection.findOne({ email: email });
  }
}
