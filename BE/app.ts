const dotenv = require("dotenv");
dotenv.config();
import express from "express";
import * as bodyParser from "body-parser";
import mongoose from "mongoose";
import appRoute from "./routes/index";
import errorMiddleware from "./middlewares/errorMiddleware";
import TCPConnection from "./services/TCPConnection.services";
var cors = require("cors");

export class App {
  public app: express.Application;
  public port: number;

  appRoutes = appRoute;

  constructor(port) {
    this.app = express();
    this.port = port;
    TCPConnection;

    this.initializeMiddlewares();
    this.initializeRouters(this.appRoutes);
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    //this.app.use(errorHandler);
  }

  private initializeRouters(router) {
    this.app.use("/", router);
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on port ${this.port}`);
    });
  }

  public connectToTheDatabase() {
    console.log("Connecting to DB", process.env.DBURL);

    mongoose.connect(process.env.DBURL);
  }
}
