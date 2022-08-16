import EventEmitter from "events";
import { Socket } from "net";
import { lockUnlockResponse } from "../models/tcpResponse/scooter.lockUnlockReq";
import { TCPConnectionUtil } from "../utils/TCPConnection.utils";
import ScooterService from "./scooter.services";
import TripsService from "./trips.services";
import { getPathLength } from "geolib";
require("dotenv").config();

class TCPConnection {
  client = new Socket();
  tcpConnectionUtil: TCPConnectionUtil = new TCPConnectionUtil();
  scooterService: ScooterService = new ScooterService();
  tripService: TripsService = new TripsService();
  internalId: number = 4352;
  lockUnlockResponse: lockUnlockResponse;
  eventEmitter = new EventEmitter();

  constructor() {
    console.log("***");
    this.client.on("connect", () => console.log("I'm in"));
    this.client.on("close", () => console.log("I'm out"));
    this.client.on("error", (error) => console.error(error));
    this.client.on("data", (data) => this.handleData(data));
    this.client.connect(
      Number(process.env.SCOOTER_SERVER_PORT),
      process.env.SCOOTER_SERVER
    );
    // setTimeout(() => {
    //   this.client.write("*SCOS,OM,867584033774352,S6#");
    // }, 2000);
    // setTimeout(() => {
    //   this.client.write("*SCOS,OM,867584033774352,D1,10#");
    // }, 3000);
  }

  private async handleData(data: Buffer) {
    const instruction = data.toString();
    const command = data.toString().slice(25, 27);
    console.log(command);
    if (command !== "D0") console.log(instruction);
    switch (command) {
      case "S6": {
        const scooterInformation =
          this.tcpConnectionUtil.scooterInformationDecode(instruction);
        console.log("Scooter info : ");
        console.log(scooterInformation);
        break;
      }
      case "H0": {
        const heartbeat = this.tcpConnectionUtil.heartbeatDecode(instruction);
        console.log(heartbeat);
        await this.scooterService.updateOne(this.internalId, {
          battery: heartbeat.battery,
          locked: heartbeat.locked,
        });
        break;
      }

      case "D0": {
        const position = this.tcpConnectionUtil.positionDecode(instruction);
        if (position) {
          this.eventEmitter.emit("DO", position);
          await this.scooterService.move(
            this.internalId,
            position.lng,
            position.lat
          );

          const trip = await this.tripService.getTripByInternalId(
            this.internalId
          );
          if (trip) {
            await this.tripService.updateCoordinates(
              this.internalId,
              position.lng,
              position.lat
            );
            const coordinatesArray = JSON.parse(
              JSON.stringify(trip)
            ).coordinatesArray;
            const distance = getPathLength(coordinatesArray);
            await this.tripService.updateDistance(this.internalId, distance);
          }
        }
        break;
      }
      case "R0": {
        this.lockUnlockResponse =
          this.tcpConnectionUtil.lockUnlockRequestDecode(instruction);
        this.eventEmitter.emit("R0", this.lockUnlockResponse);

        console.log(this.lockUnlockResponse);
        break;
      }
      case "L0": {
        console.log("unlock comm");
        await this.scooterService.updateOne(this.internalId, {
          locked: false,
        });
        const response = data.toString().slice(28, 29);
        this.eventEmitter.emit("L0", response);
        break;
      }
      case "L1": {
        console.log("lock comm");
        await this.scooterService.updateOne(this.internalId, {
          locked: true,
        });
        const response = data.toString().slice(28, 29);
        this.eventEmitter.emit("L1", response);
        break;
      }
      case "V0": {
        this.eventEmitter.emit("V0", "V0");
        console.log("beeping");
        break;
      }
      case "D1": {
        this.eventEmitter.emit("D1", "D1");
        break;
      }

      // console.log(data);
      // console.log(data.toString());
    }
  }

  async ping(internalId: number) {
    if (internalId === this.internalId) {
      this.client.write("*SCOS,OM,867584033774352,V0,2#");
    }
    const result = await this.waitForResponse("V0");
    return result;
  }

  async lockUnlockRequest(internalId: number, lock: Boolean) {
    if (internalId === this.internalId) {
      console.log("Lock/Unlock req. sent!");
      this.client.write(
        "*SCOS,OM,867584033774352,R0," +
          String(Number(lock)) +
          ",20,1234," +
          String(Math.floor(Date.now() / 1000)) +
          "#"
      );
      const result = await this.waitForResponse("R0");
      return result;
    }
  }

  onEvent(eventName: string) {
    return new Promise((resolve, reject) => {
      this.eventEmitter.once(eventName, (lockUnlockResponse) => {
        resolve(lockUnlockResponse);
      });
    });
  }

  onTimeout() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Err timeout!"));
      }, 20000);
    });
  }

  waitForResponse(eventName: string) {
    return Promise.race([this.onEvent(eventName), this.onTimeout()]);
  }

  async start(internalId: number) {
    if (internalId === this.internalId && this.lockUnlockResponse) {
      const msg =
        "*SCOS,OM,867584033774352,L0," +
        this.lockUnlockResponse.key +
        "," +
        this.lockUnlockResponse.userId +
        "," +
        String(Math.floor(Date.now() / 1000)) +
        "#";
      this.client.write(msg);

      const result = await this.waitForResponse("L0");
      return result;
    }
  }

  async stop(internalId: number) {
    if (internalId === this.internalId && this.lockUnlockResponse) {
      const msg =
        "*SCOS,OM,867584033774352,L1," + this.lockUnlockResponse.key + ",#";
      this.client.write(msg);
      const result = await this.waitForResponse("L1");
      console.log(result);
      return result;
    }
  }

  async gpsFrequency(seconds: number) {
    this.client.write("*SCOS,OM,867584033774352,D1," + String(seconds) + "#");
    const result = await this.waitForResponse("D1");
    return result;
  }
}

export default new TCPConnection();
