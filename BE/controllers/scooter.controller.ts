import { NextFunction, Request, Response } from "express";
import { Scooter } from "../models/scooter";
import CustomerService from "../services/customer.services";
import ScooterService from "../services/scooter.services";
import TripsService from "../services/trips.services";
import { getDistance, getPathLength } from "geolib";
import Exception from "../models/exceptions/Exception";
import NotFoundError from "../models/exceptions/NotFoundError";
import MissingParam from "../models/exceptions/MissingParamError";
import PaymentService from "../services/payment.servcies";
import TCPConnectionServices from "../services/TCPConnection.services";
const jwt = require("jsonwebtoken");

export default class ScooterController {
  scooterService: ScooterService = new ScooterService();
  customerService: CustomerService = new CustomerService();
  tripsService: TripsService = new TripsService();
  paymentService: PaymentService = new PaymentService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    const { number, battery, internalId, unlockCode, coordX, coordY } =
      req.body;
    let registeredScooter;
    const scooter: Scooter = {
      number: number,
      battery: battery,
      internalId: internalId,
      unlockCode: unlockCode,
      coordX: coordX,
      coordY: coordY,
      status: "ACTIVE",
      addedDate: new Date(),
      dummy: true,
    };
    // console.log(scooter);

    try {
      registeredScooter = await this.scooterService.register(scooter);
      res.status(200).json({
        message: "Scooter was succesfully registered",
      });
    } catch (err) {
      return next(err);
    }
  };

  fetch = async (req: Request, res: Response) => {
    try {
      const scooters = await this.scooterService.fetch();
      const data = JSON.parse(JSON.stringify(scooters));
      return res.status(200).json(data);
    } catch (err) {
      return res.status(403).json({ message: "Resource not found!" });
    }
  };

  findWithinArea = async (req: Request, res: Response, next: NextFunction) => {
    const {
      bottomLeftCoordX,
      bottomLeftCoordY,
      topRightCoordX,
      topRightCoordY,
    } = req.query;
    try {
      const scooters = await this.scooterService.findWithinArea(
        Number(bottomLeftCoordX),
        Number(bottomLeftCoordY),
        Number(topRightCoordX),
        Number(topRightCoordY)
      );
      return res.status(200).json(scooters);
    } catch (err) {
      next(err);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const scooters = await this.scooterService.findAll();
      return res.status(200).json(scooters);
    } catch (err) {
      next(err);
    }
  };
  findNearby = async (
    req: Request<{}, {}, {}, { coordX: number; coordY: number }>,
    res: Response,
    next: NextFunction
  ) => {
    const { coordX, coordY } = req.query;
    try {
      const nearbyScooters = await this.scooterService.findNearby(
        coordX,
        coordY,
        4000
      );
      if (!nearbyScooters) {
        next(new NotFoundError("Nearby scooters"));
      }
      return res.status(200).json(JSON.parse(JSON.stringify(nearbyScooters)));
    } catch (err) {
      return next(new NotFoundError("Resource"));
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;
    const internalId = Number(id);
    try {
      const scooter = await this.scooterService.findByInternalId(internalId);
      if (scooter == null) {
        console.log(scooter);
        next(new NotFoundError("Scooter"));
      }
      return res.status(200).json(scooter);
    } catch (err) {
      //console.log(err);
      next(new MissingParam("id"));
    }
  };

  startRide = async (req: Request, res: Response, next: NextFunction) => {
    const { internalId, coordX, coordY } = req.body;
    let scooter;
    let existingTrip;
    try {
      scooter = await this.scooterService.findNearby(
        coordX,
        coordY,
        80,
        internalId
      );
      existingTrip = await this.tripsService.getTripByInternalId(internalId);

      if (existingTrip) {
        return next(
          new Error("Trip ongoing, you can't start two trips at the same time")
        );
      }
      if (!scooter) {
        return next(
          new Error("No unbooked nearby scooter with this id was found")
        );
      }

      if (scooter.locked === true) {
        return next(
          new Error("Scooter is locked, please unlock it first before riding!")
        );
      }

      const customer = await this.customerService.findByUsername(
        req.customer.username
      );

      if (!customer) {
        return next(new Error("You are already riding another scooter!"));
      }

      if (customer.status === "SUSPENDED") {
        next(new Error("Your account is suspended, you cant start a new ride"));
      }

      if (scooter.dummy === false) {
        const response = await TCPConnectionServices.ping(internalId);
        console.log(response);
        if (!response) {
          return next(new Error("Scooter ping command had no answer!"));
        }
        const gpsFrequency = await TCPConnectionServices.gpsFrequency(5);
        if (gpsFrequency !== "D1") {
          return next(new Error("Scooter gps details failed!"));
        }
      }

      await Promise.all([
        this.scooterService.bookScooter(internalId),
        this.customerService.startRide(req.customer.username),
        this.tripsService.updateCoordinates(internalId, coordX, coordY),
      ]);

      const trip = await this.tripsService.register(
        req.customer.username,
        internalId,
        coordX,
        coordY
      );

      return res.status(200).json({ message: "Ride started", trip: trip });
    } catch (err) {
      next(err);
    }
  };

  endRide = async (req: Request, res: Response, next: NextFunction) => {
    const { internalId, coordX, coordY } = req.body;
    let scooter;
    let trip;
    let coordinatesArray;
    try {
      scooter = await this.scooterService.findByInternalId(internalId);
      trip = await this.tripsService.getTripByInternalId(internalId);
      if (!scooter) {
        return next(new NotFoundError("Scooter"));
      }

      if (!trip) {
        return next(new NotFoundError("Trip"));
      }

      await Promise.all([
        this.tripsService.updateCoordinates(internalId, coordX, coordY),
        this.scooterService.move(internalId, coordX, coordY),
      ]);

      trip = await this.tripsService.getTripByInternalId(internalId);
      if (!trip) {
        return next(new NotFoundError("ONGOING trip"));
      }

      coordinatesArray = JSON.parse(JSON.stringify(trip)).coordinatesArray;
      const distance = getPathLength(coordinatesArray);
      console.log(distance);

      trip = await this.tripsService.getTripByInternalId(internalId);
      await this.tripsService.updateTripsDetails(
        internalId,
        req.customer.username,
        distance
      );
      // const paymentIntent = await this.paymentService.generatePaymentIntent(
      //   trip
      // );
      // if (!paymentIntent) {
      //   next(new Error("You must use the scooter for at least 10meters"));
      // }
      let result: unknown = "Unlocked";
      if (scooter.dummy === false) {
        if (!scooter.locked) {
          await TCPConnectionServices.lockUnlockRequest(internalId, true);
          result = await TCPConnectionServices.stop(internalId);
        }
        if (!result) {
          throw new Error("Scooter not locked, please try again!");
        }
      }
      console.log(distance);
      await Promise.all([
        this.scooterService.unbookScooter(internalId),
        this.scooterService.lockScooter(internalId),
      ]);
      trip = await this.tripsService.getTripByInternalId(internalId);
      await this.tripsService.completeTrip(req.customer.username, internalId);
      await this.customerService.endRide(req.customer.username, "ACTIVE");

      const gpsFrequency = await TCPConnectionServices.gpsFrequency(99);

      if (gpsFrequency !== "D1") {
        return res.status(200).json({
          message: "Ride Ended",
          trip: trip,
          details: "Scooter gps details failed!",
        });
      }

      return res.status(200).json({
        message: "Ride Ended",
        trip: trip,
        deatils: "Scooter coordinates updating every 100 seconds",
      });
    } catch (err) {
      return next(err);
    }
  };

  ping = async (req: Request, res: Response, next: NextFunction) => {
    const { internalId, coordX, coordY } = req.body;
    let scooter: Scooter;
    try {
      scooter = await this.scooterService.findNearby(
        coordX,
        coordY,
        100,
        internalId
      );
      //console.log(scooter);
      if (!scooter) {
        return next(new NotFoundError("Scooter"));
      }
      if (scooter.booked) {
        return next(new Error("Scooter is booked"));
      }

      if (scooter.dummy === false) {
        const response = await TCPConnectionServices.ping(internalId);
        console.log(response);
        if (response !== "V0") {
          return next(new Error("Scooter ping command had no answer!"));
        }
        const ping = await this.scooterService.pingScooter(internalId);
        if (!ping) {
          return next(new NotFoundError("Scooter"));
        }
      }
      console.log(scooter);

      return res.status(200).json({ message: "I'm here, sound started" });
    } catch (err) {
      next(err);
    }
  };

  lock = async (req: Request, res: Response, next: NextFunction) => {
    const { internalId, coordX, coordY } = req.body;
    let scooter;
    try {
      scooter = await this.scooterService.findByInternalId(internalId);

      console.log(scooter);
      if (!scooter) {
        return next(new NotFoundError("Scooter"));
      }
      if (scooter.locked === true) {
        return next(new Error("Scooter already locked"));
      }
      if (scooter.booked === false) {
        return next(new Error("Scooter not booked, you can't lock it"));
      }
      const ongoingTrip = await this.tripsService.getTripByUsername(
        req.customer.username
      );
      if (!ongoingTrip || ongoingTrip.scooterId !== internalId) {
        return next(new NotFoundError("Trip"));
      }
      scooter = await this.scooterService.findNearby(
        coordX,
        coordY,
        internalId
      );
      if (scooter.dummy === false) {
        await TCPConnectionServices.lockUnlockRequest(internalId, true);
        const tcpResponse = await TCPConnectionServices.stop(internalId);
        console.log("Scooter response " + tcpResponse);
        if (tcpResponse === 1) {
          return next(
            new Error("Scooter could not be locked, please try again!")
          );
        }
        if (tcpResponse === 2) {
          return next(new Error("Failure! Internal err, bad key"));
        }
      }
      await this.scooterService.updateOne(internalId, {
        locked: true,
      });

      return res
        .status(200)
        .json({ message: "Scooter successfully locked", scooter: scooter });
    } catch (err) {
      next(err);
    }
  };

  unlock = async (req: Request, res: Response, next: NextFunction) => {
    const { internalId, coordX, coordY, unlockCode, qrCode } = req.body;
    try {
      let scooter;
      if (qrCode === true) {
        scooter = await this.scooterService.findByInternalId(internalId);
      } else {
        scooter = await this.scooterService.findNearby(
          coordX,
          coordY,
          80,
          internalId
        );
      }

      const ongoingTrip = await this.tripsService.getTripByUsername(
        req.customer.username
      );

      if (!scooter) {
        return next(new NotFoundError("Scooter within 80m"));
      }
      if (scooter.locked === false) {
        return next(new Error("Scooter already unlocked"));
      }

      if (scooter.status === "SUSPENDED") {
        return next(new Error("Scooter is SUSPENDED, please try another one"));
      }
      if (
        scooter.unlockCode === unlockCode ||
        (ongoingTrip && ongoingTrip.scooterId === internalId)
      ) {
        scooter = await this.scooterService.findNearby(
          coordX,
          coordY,
          80,
          internalId
        );

        if (scooter.dummy === false) {
          await TCPConnectionServices.lockUnlockRequest(internalId, false);
          const scooterResponse = await TCPConnectionServices.start(internalId);
          console.log("Scooter response " + scooterResponse);
          if (scooterResponse === "1") {
            return next(new Error("Failure! Scooter could not be unlocked"));
          }
          if (scooterResponse === "2") {
            return next(new Error("Failure! Internal err, bad key"));
          }
        }
        await this.scooterService.updateOne(internalId, {
          locked: false,
        });

        return res
          .status(200)
          .json({ message: "Scooter successfully unlocked", scooter: scooter });
      } else {
        return next(new Error("Bad unlock code, please try again!"));
      }
    } catch (err) {
      next(err);
    }
  };

  suspend = async (req: Request, res: Response, next: NextFunction) => {
    const { scooterInternalId } = req.query;
    const internalId = Number(scooterInternalId);

    try {
      let data = await this.scooterService.suspendScooter(internalId);
      if (!data) {
        return next(new NotFoundError("Scooter"));
      }
      data = JSON.parse(JSON.stringify(data));
      if (data.status === "ACTIVE") {
        return res.status(200).json({ message: "Scooter suspended" });
      } else {
        return next(new Exception(403, "Scooter already suspended!"));
      }
    } catch (err) {
      next(err);
    }
  };

  unsuspend = async (req: Request, res: Response, next: NextFunction) => {
    const { scooterInternalId } = req.query;
    const internalId = Number(scooterInternalId);

    try {
      let data = await this.scooterService.unsuspendScooter(internalId);
      if (!data) {
        return next(new NotFoundError("Scooter"));
      }
      data = JSON.parse(JSON.stringify(data));
      if (data.status === "SUSPENDED") {
        return res.status(200).json({ message: "Scooter unsuspended" });
      } else {
        next(new Exception(403, "Scooter already active!"));
      }
    } catch (err) {
      next(new NotFoundError("Scooter"));
    }
  };

  trips = async (req: Request, res: Response, next: NextFunction) => {
    const { start, length } = req.query;
    try {
      let data = await this.tripsService.getTrips(
        Number(start),
        Number(length)
      );
      if (!data) {
        next(new NotFoundError("Trips"));
      }
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };

  noOfTrips = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let data = await this.tripsService.getNoOfTrips();
      if (!data) {
        next(new NotFoundError("Trips"));
      }
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };

  price = async (req: Request, res: Response, next: NextFunction) => {
    const { distance } = req.query;
    try {
      let data = this.tripsService.getPrice(Number(distance));
      if (!data) {
        return next(new NotFoundError("Distance"));
      }
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };

  move = async (req: Request, res: Response, next: NextFunction) => {
    const { internalId, coordX, coordY } = req.body;
    try {
      await this.scooterService.move(internalId, coordX, coordY);
      await this.tripsService.updateCoordinates(internalId, coordX, coordY);

      return res.status(200).json({ message: "Trip data updated!" });
    } catch (err) {
      next(err);
    }
  };

  ongoing = async (req: Request, res: Response, next: NextFunction) => {
    const { internalId } = req.body;
    try {
      let trip = await this.tripsService.getOngoingTripDetails(
        internalId,
        req.customer.username
      );

      if (!trip) {
        return next(new NotFoundError("Trip with this info was"));
      }
      trip = await this.tripsService.getOngoingTripDetails(
        internalId,
        req.customer.username
      );
      const distance = trip.distance;
      const time = trip.totalTime;
      const price = trip.cost;

      return res
        .status(200)
        .json({ time: time, distance: distance, price: price });
    } catch (err) {
      next(err);
    }
  };

  tripByToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let trip = await this.tripsService.getTripByUsername(
        req.customer.username
      );
      if (!trip) {
        return next(new Error("Trip not found"));
      }
      return res.status(200).json({ trip: trip });
    } catch (err) {
      next(err);
    }
  };
}
