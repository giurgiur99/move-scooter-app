import { Customer } from "../models/customer";
const customerCollection = require("../db/customer.db");

export default class CustomerService {
  public register(customer: Customer) {
    console.log("--- Customer added! ---");
    return customerCollection.create(customer);
  }

  public findDuplicateEmail(email: string) {
    return customerCollection.exists({ email: email });
  }

  public findByEmail(email: string) {
    return customerCollection.findOne({ email: email });
  }

  public findByUsername(username: string, status?: string) {
    return customerCollection.findOne({
      username,
      ...(status ? { status } : {}),
    });
  }

  public findById(id: string) {
    return customerCollection.findOne({ _id: id });
  }

  public checkUnique(email, username) {
    return this.findDuplicateEmail(email) && this.findByUsername(username);
  }

  public updatePassword(username, newPassword) {
    return customerCollection.findOneAndUpdate(
      { username: username },
      { password: newPassword }
    );
  }

  public setDrivingLicensePath(username, path, link: string) {
    return customerCollection.findOneAndUpdate(
      { username: username },
      { drivingLicense: path, status: "ACTIVE", linkDrivingLicense: link }
    );
  }

  public setStatusInactive(username: string) {
    return customerCollection.findOneAndUpdate(
      { username: username },
      { status: "INACTIVE" }
    );
  }

  public startRide(username: string) {
    return customerCollection.findOneAndUpdate(
      { username: username },
      { status: "RIDING", $inc: { numberOfTrips: 1 } }
    );
  }

  public endRide(username: string, status: string) {
    return customerCollection.findOneAndUpdate(
      { username: username },
      { status: status }
    );
  }

  public suspendCustomer(username: string) {
    return customerCollection.findOneAndUpdate(
      { username: username },
      { status: "SUSPENDED" }
    );
  }

  public unsuspendCustomer(username: string) {
    return customerCollection.findOneAndUpdate(
      { username: username },
      { status: "ACTIVE" }
    );
  }

  public getCustomers(start, length) {
    return customerCollection.find(
      {},
      {
        joinedDate: 1,
        drivingLicense: 1,
        linkDrivingLicense: 1,
        username: 1,
        email: 1,
        numberOfTrips: 1,
        status: 1,
      },
      {
        skip: start,
        limit: length,
        sort: { joinedDate: -1 },
      }
    );
  }

  public getNoOfCustomers() {
    return customerCollection.find().count();
  }
}
