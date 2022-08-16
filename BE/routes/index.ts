import { Router } from "express";
import customerRouter from "./customer.routes";
import administratorRouter from "./administrator.routes";
import scooterRouter from "./scooter.routes";
import scooterAdminRouter from "./administrator.scooter.routes";

const appRoute = Router();
appRoute.use("/customer", customerRouter);
appRoute.use("/administrator", administratorRouter);
appRoute.use("/scooter", scooterRouter);
appRoute.use("/administrator/scooter", scooterAdminRouter);

export default appRoute;
