import { Scooter } from "../models/scooter";
import scooterCollection from "../db/scooter.db";

export default class ScooterService {
  public register(scooter: Scooter) {
    //console.log("--- Scooter added! ---");
    const scooterDb = {
      number: scooter.number,
      battery: scooter.battery,
      internalId: scooter.internalId,
      unlockCode: scooter.unlockCode,
      location: {
        type: "Point",
        coordinates: [scooter.coordX, scooter.coordY],
      },
    };
    return scooterCollection.create(scooterDb);
  }

  public findById(id: string) {
    return scooterCollection.findOne({ _id: id });
  }

  public findByNumber(number: number) {
    return scooterCollection.findOne({ number: number });
  }
  public findByInternalId(internalId) {
    return scooterCollection.findOne({ internalId: internalId });
  }

  public bookScooter(internalId) {
    return scooterCollection.findOneAndUpdate(
      { internalId: internalId },
      { booked: true }
    );
  }

  public pingScooter(internalId) {
    return scooterCollection.findOne({ internalId: internalId });
  }

  public lockScooter(internalId) {
    return scooterCollection.findOneAndUpdate(
      { internalId: internalId },
      { locked: true }
    );
  }

  public unlockScooter(internalId: number) {
    return scooterCollection.findOneAndUpdate(
      { internalId: internalId },
      { locked: false }
    );
  }

  public unbookScooter(internalId: number) {
    return scooterCollection.updateOne(
      { internalId: internalId },
      { booked: false }
    );
  }

  public suspendScooter(internalId) {
    return scooterCollection.findOneAndUpdate(
      { internalId: internalId },
      { status: "SUSPENDED" }
    );
  }

  public unsuspendScooter(internalId) {
    return scooterCollection.findOneAndUpdate(
      { internalId: internalId },
      { status: "ACTIVE" }
    );
  }

  public fetch() {
    return scooterCollection.find({ booked: false });
  }

  public findNearby(
    coordX,
    coordY,
    distance,
    internalId?: number,
    booked?: Boolean
  ) {
    return scooterCollection.findOne({
      ...(internalId ? { internalId } : {}),
      ...(booked ? { booked } : false),
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [coordX, coordY],
          },
          $maxDistance: distance,
        },
      },
    });
  }

  public findAll() {
    return scooterCollection.find({}, {}, { sort: { addedDate: -1 } });
  }

  public findWithinArea(
    bottomLeftCoordX: number,
    bottomLeftCoordY: number,
    topRightCoordX: number,
    topRightCoordY: number
  ) {
    return scooterCollection.find({
      location: {
        $geoWithin: {
          $box: [
            [bottomLeftCoordX, bottomLeftCoordY],
            [topRightCoordX, topRightCoordY],
          ],
        },
      },
    });
  }

  public move(internalId, coordX, coordY) {
    return scooterCollection.findOneAndUpdate(
      { internalId: internalId },
      {
        location: {
          type: "Point",
          coordinates: [coordX, coordY],
        },
      }
    );
  }

  public updateBattery(internalId: number, newBattery: number) {
    return scooterCollection.findOneAndUpdate(
      { internalId: internalId },
      { battery: newBattery }
    );
  }

  public updateOne(internalId: number, updates: Partial<Scooter>) {
    return scooterCollection.findOneAndUpdate(
      { internalId: internalId },
      updates
    );
  }
}
