import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  token: String,
  userId: String,
  data: Date,
  status: ["IN_PROGRESS", "ACTIVE", "INACTIVE"],
});

let SessionDB;
try {
  SessionDB = mongoose.model("session");
} catch {
  SessionDB = mongoose.model("session", sessionSchema);
}
module.exports = SessionDB;
