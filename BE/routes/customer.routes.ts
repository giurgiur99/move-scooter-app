import { Router } from "express";
import CustomerController from "../controllers/customer.controller";
import { adminAuth } from "../middlewares/adminAuth.middleware";
import { auth } from "../middlewares/auth.middleware";

import { upload } from "../services/resources.services";

const customerController = new CustomerController();
const customerRouter = Router();

customerRouter.post("/register", customerController.register);
customerRouter.post("/login", customerController.login);
customerRouter.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome  " + req.customer.username + " 🙌 ");
});
customerRouter.post("/logout", auth, customerController.logout);
customerRouter.post("/reset", auth, customerController.resetPassword);
customerRouter.post(
  "/license",
  auth,
  upload.single("license"),
  customerController.uploadDrivingLicense
);
customerRouter.get("/license", customerController.getDrivingLicense);
customerRouter.get("/data", auth, customerController.getCustomerData);
customerRouter.post("/suspend", customerController.suspendCustomer);
customerRouter.post("/unsuspend", customerController.unsuspendCustomer);
customerRouter.get("/history", auth, customerController.history);

//add "auth" middleware for security

export default customerRouter;
