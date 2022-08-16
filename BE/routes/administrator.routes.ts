import { Router } from "express";
import AdministratorController from "../controllers/administrator.controller";
import { adminAuth } from "../middlewares/adminAuth.middleware";

const administratorController: AdministratorController =
  new AdministratorController();
const administratorRouter = Router();

administratorRouter.post("/register", administratorController.register);
administratorRouter.post("/login", administratorController.login);
administratorRouter.get(
  "/customers",
  adminAuth,
  administratorController.customers
);
administratorRouter.get(
  "/customers/count",
  adminAuth,
  administratorController.noOfCustomers
);
// });
// administratorRouter.post("/logout", customerController.logout);

export default administratorRouter;
