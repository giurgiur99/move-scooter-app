import { NextFunction, Request, Response } from "express";
import AdministratorService from "../services/administrator.services";
const jwt = require("jsonwebtoken");
import CustomerService from "../services/customer.services";
import SessionService from "../services/session.service";

const administratorService = new AdministratorService();
const sessionService = new SessionService();

export const adminAuth = async (
  req: Request & { administrator: any },
  res: Response,
  next: NextFunction
) => {
  let token = "";
  try {
    token = req.headers.authorization.split(" ")[1];
  } catch (err) {
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

  const decoded = jwt.decode(token);
  if (decoded === undefined || decoded.email === undefined) {
    return res.sendStatus(401);
  }

  const administrator = administratorService.findByEmail(decoded.email);
  if (administrator === undefined) {
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

  req.administrator = administrator;
  return next();
};
