import { Session } from "../models/session";

const sessionCollection = require("../db/session.db");
const customerCollection = require("../db/customer.db");

export default class SessionService {
  objectId = customerCollection.objectId;
  public register(token: string, userId: any) {
    sessionCollection.create({
      token: token,
      userId: userId,
      status: ["IN_PROGRESS"],

      date: new Date(),
    });
    console.log("--- Session added! ---");
  }

  public removeSession(token: string) {
    console.log("--- Session deleted! ---");
    return sessionCollection.deleteOne({ token: token });
  }

  public removeSessionByUserId(userId) {
    console.log("--- Session deleted! ---");
    return sessionCollection.deleteMany({ userId: userId });
  }

  public findSession(sessionId: string) {
    return sessionCollection.findOne({ _id: sessionId });
  }

  public getTokenByUserId(userId: string) {
    return sessionCollection.findOne({ userId: userId });
  }

  public getSessionByToken(token: string) {
    return sessionCollection.findOne({ token: token });
  }
}
