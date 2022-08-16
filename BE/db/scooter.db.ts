import mongoose, { Schema } from "mongoose";

const pointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  { _id: false }
);

const scooterSchema = new Schema({
  number: {
    type: Number,
    unique: true,
    required: [true, "Email is required"],
  },
  battery: {
    type: Number,
    required: [true, "Battery field is required"],
    min: [0, "Battery percentage must be positive"],
    max: [100, "Maximum percentage is 100"],
  },
  locked: {
    type: Boolean,
    default: true,
  },
  booked: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  internalId: {
    type: Number,
    unique: true,
    required: [true, "InternalId is required"],
  },
  location: {
    type: pointSchema,
    index: "2dsphere",
    required: [true, "Location is required"],
  },

  unlockCode: {
    type: Number,
    min: 1000,
    max: 9999,
    required: true,
  },
  status: {
    type: String,
    default: "ACTIVE",
  },
  addedDate: {
    type: Date,
    default: new Date(),
  },
  dummy: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("scooter", scooterSchema);
