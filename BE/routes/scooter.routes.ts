import { Router } from "express";
import ScooterController from "../controllers/scooter.controller";
import { adminAuth } from "../middlewares/adminAuth.middleware";
import { auth } from "../middlewares/auth.middleware";

const scooterController: ScooterController = new ScooterController();
const scooterRouter = Router();

scooterRouter.get("", scooterController.fetch);
scooterRouter.get("/area", scooterController.findWithinArea);
scooterRouter.get("/all", scooterController.findAll);
scooterRouter.get("/nearby", scooterController.findNearby);
scooterRouter.get("/device", scooterController.findById);
scooterRouter.post("/start", auth, scooterController.startRide);
scooterRouter.post("/end", auth, scooterController.endRide);
scooterRouter.post("/ping", auth, scooterController.ping);
scooterRouter.post("/lock", auth, scooterController.lock);
scooterRouter.post("/unlock", auth, scooterController.unlock);
scooterRouter.get("/trips/ongoing", auth, scooterController.tripByToken);
scooterRouter.post("/move", auth, scooterController.move);
scooterRouter.post("/ongoing", auth, scooterController.ongoing);
// });
// administratorRouter.post("/logout", customerController.logout);

export default scooterRouter;
