import { NextFunction, Request, Response } from "express";
import { Customer } from "../models/customer";
import { Trip } from "../models/trips";
import CustomerService from "../services/customer.services";
import ResourceService from "../services/resources.services";
import SessionService from "../services/session.service";
import TripsService from "../services/trips.services";
import NotFoundError from "../models/exceptions/NotFoundError";
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

export default class CustomerController {
  customerService: CustomerService = new CustomerService();
  sessionService: SessionService = new SessionService();
  resourceService: ResourceService = new ResourceService();
  tripsService: TripsService = new TripsService();

  register = async (
    req: Request<
      {},
      {},
      Pick<Customer, "email" | "username" | "password" | "drivingLicense">,
      {}
    >,
    res: Response,
    next: NextFunction
  ) => {
    const { email, username, password } = req.body;
    let registeredCustomer;
    const customer = {
      email: email,
      username: username,
      password: password,
      drivingLicense: "",
      linkDrivingLicense: "",
      numberOfTrips: 0,
      status: "IN_PROGRESS",
    };
    try {
      const salt = await bcrypt.genSalt(10);
      customer.password = await bcrypt.hash(customer.password, salt); // hashing the password
    } catch (err) {
      return res.sendStatus(500).json({
        message: "Server issue, please try again later",
      });
    }
    const token = jwt.sign(customer, process.env.JWTSECRET);
    try {
      registeredCustomer = await this.customerService.register(customer);
    } catch (err) {
      return res.status(403).json({ message: "User already registered" });
    }
    try {
      const id = registeredCustomer._id;
      this.sessionService.register(token, id); // registering the new session in our db
      return res.status(200).json({
        customer: customer,
        token: `${[token]}`,
      });
    } catch (err) {
      return res.status(403).json({
        message: "New session was not registered",
      });
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    let customer;
    try {
      customer = await this.customerService.findByEmail(req.body.email);
      console.log(customer);
    } catch (err) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }
    if (!customer) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    if (customer && customer.status == "SUSPENDED") {
      return res.status(400).json({ message: "Suspended acccount" });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      customer.password
    );
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }
    const token = jwt.sign(customer.toJSON(), process.env.JWTSECRET);
    this.sessionService.register(token, customer._id);
    return res.status(200).json({ customer: customer, token: token });
  };

  logout = async (req: Request, res: Response) => {
    try {
      const customer = await this.customerService.setStatusInactive(
        req.customer.username
      );
    } catch (err) {
      return res.status(404).json({
        messagee: "User was not found",
      });
    }
    try {
      const token = req.headers.authorization.split(" ")[1];
      await this.sessionService.removeSession(token);
      return res.status(200).json({ session: token, status: "removed" });
    } catch (err) {
      return res.sendStatus(404).json({
        message: "Invalid",
      });
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    let newPassword;
    let customer;
    try {
      customer = await this.customerService.findByUsername(
        req.customer.username
      );
      console.log(customer, req.customer.username);
    } catch (err) {
      return res.sendStatus(404).json({
        status: "User was not found",
      });
    }
    try {
      const salt = await bcrypt.genSalt(10);
      newPassword = await bcrypt.hash(req.body.newPassword, salt); // hashing the password
    } catch (err) {
      return res.sendStatus(500).json({
        message: "Server issue, please try again later",
      });
    }
    if (customer) {
      const validPassword = await bcrypt.compare(
        req.body.oldPassword,
        customer.password
      );
      if (validPassword) {
        const data = await this.customerService.updatePassword(
          customer.username,
          newPassword
        );
        return res.status(200).json({ message: "Password has been updated!" });
      } else {
        return res.status(403).json({
          message: "Bad credentials, please enter your password again",
        });
      }
    }
  };

  uploadDrivingLicense = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let url;
    let link;
    try {
      const date = new Date().toISOString().slice(0, 10);
      let path =
        "Driving_license/" +
        req.customer.username +
        "/" +
        req.customer.username +
        "-" +
        date +
        ".png";
      try {
        url = await this.resourceService.getFileUrl(path);
        const cust = await this.customerService.setDrivingLicensePath(
          req.customer.username,
          path,
          url
        );
      } catch (err) {
        return res.status(404).json({ message: "Customer was not found" });
      }

      return res
        .status(200)
        .json({ message: "File uploaded", path: path, url: url });
    } catch (err) {
      return res.status(500).json({
        message: "Error in uploading file",
      });
    }
  };

  getDrivingLicense = async (
    req: Request<{}, {}, {}, { path: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const path = req.query.path;

    try {
      const url = this.resourceService.getFileUrl(path);
      return res.status(200).json({ message: "File retrived", path: url });
    } catch (err) {
      return res.status(500).json({
        message: "Error in retriving file",
      });
    }
  };

  suspendCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.body;
    let customer;

    try {
      customer = await this.customerService.findByUsername(username);
      if (!customer) {
        return next(new NotFoundError("Customer"));
      }
      await this.customerService.suspendCustomer(username);
    } catch (err) {
      next(err);
    }

    try {
      await this.customerService.endRide(username, "SUSPENDED");
      const userId = customer._id;
      console.log(userId);
      console.log(await this.sessionService.removeSessionByUserId(userId));
      if (customer.status === "SUSPENDED") {
        return next(new Error("Customer already suspended"));
      }
      return res.status(200).json({ message: "User suspended" });
    } catch (err) {
      next(err);
    }
  };

  unsuspendCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { username } = req.body;
    let customer: Customer;
    try {
      const customer = await this.customerService.findByUsername(username);
      if (!customer) {
        return next(new NotFoundError("Customer"));
      }
      await this.customerService.unsuspendCustomer(username);
      if (customer.status === "ACTIVE") {
        return next(new Error("Customer already ACTIVE"));
      } else {
        return res.status(200).json({ message: "User was unsuspended" });
      }
    } catch (err) {
      next(err);
    }
  };

  getCustomerData = async (req: Request, res: Response, next: NextFunction) => {
    let customer: Customer;
    try {
      customer = await this.customerService.findByEmail(req.customer.email);
      if (!customer) {
        next(new NotFoundError("Custoemr"));
      }
      return res.status(200).json({ customer: customer });
    } catch (err) {
      return res.status(500).json({
        message: "Error in retriving customer",
      });
    }
  };

  history = async (req: Request, res: Response, next: NextFunction) => {
    let trips;
    const { start, length } = req.query;
    try {
      trips = await this.tripsService.getHistoryOfUser(
        req.customer.username,
        start,
        length
      );
    } catch (err) {
      next(err);
    }
    res.status(200).send({ trips: trips });
  };
}
