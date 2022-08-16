import { Heartbeat } from "../models/tcpResponse/scooter.heartbeat";
import { ScooterInformation } from "../models/tcpResponse/scooter.information";
import { ScooterPosition } from "../models/tcpResponse/scooter.position";
import { sexagesimalToDecimal } from "geolib";
import { lockUnlockResponse } from "../models/tcpResponse/scooter.lockUnlockReq";

export class TCPConnectionUtil {
  public scooterInformationDecode(instruction: string): ScooterInformation {
    const data = instruction.slice(28, instruction.length - 2);
    const params = data.split(",");
    const scooterInformation: ScooterInformation = {
      battery: Number(params[0]),
      currentMode: params[1],
      speed: Number(params[2]),
      charging: Boolean(params[3]),
      batteryVoltage1: Number(params[4]),
      batteryVoltage2: Number(params[5]),
      locked: params[6],
      signal: Number(params[7]),
    };
    return scooterInformation;
  }

  public heartbeatDecode(instruction: string): Heartbeat {
    const data = instruction.slice(28, instruction.length - 2);
    const params = data.split(",");
    console.log(params[0], params[1], params[2]);
    const heartbeat: Heartbeat = {
      locked: params[0] === "0" ? false : true,
      iotVoltage: Number(params[1]),
      signal: Number(params[2]),
      battery: Number(params[3]),
      charging: params[4] === "0" ? false : true,
    };
    return heartbeat;
  }

  public positionDecode(instruction: string): ScooterPosition {
    const data = instruction.slice(28, instruction.length - 2);
    const params = data.split(",");
    // console.log(params);
    const latDegree = params[3];
    const lngDegree = params[5];
    if (latDegree.length > 9) {
      //02335.05080
      const latFormat =
        latDegree[0] +
        latDegree[1] +
        "° " +
        latDegree[2] +
        latDegree[3] +
        "." +
        latDegree[5] +
        latDegree[6] +
        latDegree[7] +
        latDegree[8] +
        latDegree[9] +
        "' " +
        '0" ' +
        "N";

      const lngFormat =
        lngDegree[1] +
        lngDegree[2] +
        "° " +
        lngDegree[3] +
        lngDegree[4] +
        "." +
        lngDegree[6] +
        lngDegree[7] +
        latDegree[8] +
        latDegree[9] +
        "' " +
        '0" ' +
        "E";
      // console.log(latFormat);
      // console.log(lngFormat);
      const lat = sexagesimalToDecimal(latFormat);
      const lng = sexagesimalToDecimal(lngFormat);
      console.log(lat);
      console.log(lng);
      const position: ScooterPosition = {
        time: params[1],
        lng: lng,
        lat: lat,
      };
      return position;
    }
    return null;
  }

  public lockUnlockRequestDecode(instruction: string) {
    const data = instruction.slice(28, instruction.length - 2);
    const params = data.split(",");
    const lockUnlockResponse: lockUnlockResponse = {
      lockReq: params[0],
      key: params[1],
      userId: params[2],
    };
    return lockUnlockResponse;
  }
}
