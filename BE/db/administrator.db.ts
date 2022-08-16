import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

const administratorSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
  },
  password: String,
});

let AdministratorDB;
try {
  AdministratorDB = mongoose.model("administrator");
} catch {
  AdministratorDB = mongoose.model("administrator", administratorSchema);
}
module.exports = AdministratorDB;
