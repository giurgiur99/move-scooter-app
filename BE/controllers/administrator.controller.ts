import { NextFunction, Request, Response } from "express";
import { Administrator } from "../models/admin";
import AdministratorService from "../services/administrator.services";
import CustomerService from "../services/customer.services";
import SessionService from "../services/session.service";
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
export default class AdministratorController {
  administratorService: AdministratorService = new AdministratorService();
  customerService: CustomerService = new CustomerService();
  sessionService: SessionService = new SessionService();

  register = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    let registeredAdministrator;
    const administrator: Administrator = {
      email: email,
      password: password,
    };
    try {
      const salt = await bcrypt.genSalt(10);
      administrator.password = await bcrypt.hash(administrator.password, salt); // hashing the password
    } catch (err) {
      return res.sendStatus(500).json({
        message: "Server issue, please try again later",
      });
    }
    const token = jwt.sign(administrator, process.env.JWTSECRET);
    try {
      registeredAdministrator = await this.administratorService.register(
        administrator
      );
    } catch (err) {
      console.log(err);
      return res
        .status(403)
        .json({ message: "Administrator already registered" });
    }
    try {
      const id = registeredAdministrator._id;
      this.sessionService.register(token, id); // registering the new session in our db
      return res.status(200).json({
        administrator: administrator,
        sessionToken: `${[token]}`,
      });
    } catch (err) {
      return res.status(403).json({
        message: "New session was not registered",
      });
    }
  };

  login = async (req: Request, res: Response) => {
    const administrator = await this.administratorService.findByEmail(
      req.body.email
    );
    console.log(administrator);
    if (administrator) {
      const validPassword = await bcrypt.compare(
        req.body.password,
        administrator.password
      );
      if (validPassword) {
        const token = jwt.sign(administrator.toJSON(), process.env.JWTSECRET);
        this.sessionService.register(token, administrator._id);
        return res.status(200).json({ customer: administrator, token: token });
      } else {
        return res.status(400).json({ message: "Invalid" });
      }
    } else {
      return res.status(400).json({ message: "Invalid" });
    }
  };

  customers = async (req: Request, res: Response, next: NextFunction) => {
    const { start, length } = req.query;
    try {
      const customers = await this.customerService.getCustomers(start, length);
      return res.status(200).json(customers);
    } catch (err) {
      next(err);
    }
  };

  noOfCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const noOfCustomers = await this.customerService.getNoOfCustomers();
      return res.status(200).json(noOfCustomers);
    } catch (err) {
      next(err);
    }
  };
}
