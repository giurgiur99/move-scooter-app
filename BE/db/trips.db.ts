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

const coordinatesSchema = new Schema({
  latitude: Number,
  longitude: Number,
});

const tripsSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
  },
  scooterId: {
    type: Number,
    required: [true, "Scooter id is required"],
  },
  coordinatesArray: [coordinatesSchema],
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  totalTime: {
    type: Number,
    default: 0,
  },
  distance: {
    type: Number,
    default: 0,
  },
  cost: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["ONGOING", "COMPLETED"],
  },
});

export default mongoose.model("trips", tripsSchema);
