import tripsCollection from "../db/trips.db";
import * as geolib from "geolib";
require("dotenv").config();

export default class TripsService {
  public register(username: string, scooterInternalId: number, coordX, coordY) {
    return tripsCollection.create({
      username: username,
      scooterId: scooterInternalId,
      coordinatesArray: [{ longitude: coordX, latitude: coordY }],
      distance: 0,
      status: "ONGOING",
      date: new Date(),
    });
  }

  public completeTrip(username: string, scooterInternalId) {
    return tripsCollection.updateOne(
      {
        scooterId: scooterInternalId,
        username: username,
        status: "ONGOING",
      },
      { status: "COMPLETED", endTime: new Date() }
    );
  }

  public endSession(username: string, scooterInternalId: number) {
    console.log("--- Ride ended! ---");
    return tripsCollection.updateOne(
      {
        scooterId: scooterInternalId,
        username: username,
        status: "ONGOING",
      },
      [
        {
          $addFields: {
            diffTime: {
              $dateDiff: {
                startDate: "$startTime",
                endDate: new Date(),
                unit: "second",
              },
            },
          },
        },
        {
          $set: {
            // status: "COMPLETED",
            totalTime: "$diffTime",
          },
        },
        {
          $unset: "diffTime",
        },
      ]
    );
  }

  public getTripByUsername(username: string) {
    return tripsCollection.findOne({ username: username, status: "ONGOING" });
  }

  public getTrips(start: number, limit: number) {
    return tripsCollection
      .find({}, {}, { skip: start, limit: limit })
      .sort({ status: -1, endTime: -1 });
  }

  public getNoOfTrips() {
    return tripsCollection.find().count();
  }

  public getPrice(distance: number): number {
    const price = Number(process.env.PRICE);
    return Math.floor(distance * price * 100);
  }

  public getHistoryOfUser(username: string, start, length) {
    return tripsCollection
      .find(
        { username: username },
        { totalTime: 1, distance: 1, cost: 1, coordinatesArray: 1 },
        {
          skip: start,
          limit: length,
        }
      )
      .sort({ status: -1 });
  }

  public updateCoordinates(internalId, coordX: number, coordY: number) {
    return tripsCollection.updateOne(
      { scooterId: internalId, status: "ONGOING" },
      {
        $push: {
          coordinatesArray: { latitude: coordY, longitude: coordX },
        },
      }
    );
  }
  public getTripByInternalId(internalId: number) {
    return tripsCollection.findOne({
      scooterId: internalId,
      status: "ONGOING",
    });
  }

  public updateTripsDetails(internalId, username, distance: number) {
    return tripsCollection.updateOne(
      {
        scooterId: internalId,
        username: username,
        status: "ONGOING",
      },
      [
        {
          $addFields: {
            diffTime: {
              $dateDiff: {
                startDate: "$startTime",
                endDate: new Date(),
                unit: "second",
              },
            },
          },
        },
        {
          $set: {
            distance: distance,
            cost: this.getPrice(distance),
            totalTime: "$diffTime",
          },
        },
        {
          $unset: "diffTime",
        },
      ]
    );
  }

  public getOngoingTripDetails(internalId: number, username: string) {
    return tripsCollection.findOne({
      username: username,
      scooterId: internalId,
      status: "ONGOING",
    });
  }

  public updateDistance(internalId: number, distance: number) {
    return tripsCollection.updateOne(
      {
        scooterId: internalId,
        status: "ONGOING",
      },
      { distance: distance }
    );
  }
}
