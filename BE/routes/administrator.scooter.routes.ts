import { Router } from "express";
import ScooterController from "../controllers/scooter.controller";
import { adminAuth } from "../middlewares/adminAuth.middleware";

const scooterController: ScooterController = new ScooterController();
const scooterAdminRouter = Router();

scooterAdminRouter.post("/register", adminAuth, scooterController.register);
scooterAdminRouter.post("/suspend", scooterController.suspend);
scooterAdminRouter.post("/unsuspend", scooterController.unsuspend);
scooterAdminRouter.get("/trips", adminAuth, scooterController.trips);
scooterAdminRouter.get("/trips/count", adminAuth, scooterController.noOfTrips);

export default scooterAdminRouter;
