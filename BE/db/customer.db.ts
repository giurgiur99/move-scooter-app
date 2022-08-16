import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

const customerSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
  },
  username: {
    type: String,
    unique: true,
    required: [true, "Username is required"],
  },
  password: String,
  drivingLicense: {
    type: String,
    default: "",
  },
  linkDrivingLicense: {
    type: String,
    default: "",
  },
  numberOfTrips: {
    type: Number,
    default: 0,
  },
  joinedDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "IN_PROGRESS",
  },
});

let CustomerDB;
try {
  CustomerDB = mongoose.model("customer");
} catch {
  CustomerDB = mongoose.model("customer", customerSchema);
}
module.exports = CustomerDB;
