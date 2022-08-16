import { NextFunction, Request, Response } from "express";
import { Customer } from "../models/customer";
import jwt from "jsonwebtoken";
import CustomerService from "../services/customer.services";
import SessionService from "../services/session.service";

const customerService = new CustomerService();
const sessionService = new SessionService();

export const auth = async (
  req: Request & { customer: Customer },
  res: Response,
  next: NextFunction
) => {
  let token = "";
  try {
    token = req.headers.authorization.split(" ")[1];
  } catch (err) {
    console.log("Header not found");
    return res.sendStatus(401);
  }
  let legit;
  try {
    legit = jwt.verify(token, process.env.JWTSECRET);
  } catch (e) {
    return res.sendStatus(401);
  }

  if (legit === false) {
    return res.sendStatus(401);
  }

  const decoded = jwt.decode(token) as any;

  if (decoded == null || decoded.username === undefined) {
    return res.sendStatus(401);
  }
  const customer = await customerService.findByUsername(decoded.username);
  if (customer == null) {
    return res.sendStatus(401);
  }

  try {
    const sessionToken = await sessionService.getSessionByToken(token);
    if (sessionToken === null) {
      return res.sendStatus(401);
    }
  } catch (err) {
    res.status(401).json({
      message: "A problem has occoured, please try again later!",
    });
  }

  req.customer = customer;
  return next();
};
