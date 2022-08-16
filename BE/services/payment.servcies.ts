import { Trip } from "../models/trips";

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);

export default class PaymentService {
  public generatePaymentIntent(trip: Trip) {
    return stripe.paymentIntents.create({
      amount: Math.floor(trip.cost),
      currency: "ron",
      payment_method: "pm_card_visa",
      description: `Thanks for the ride, you have traveled ${trip.distance} meters using MOVE, see you soon!`,
      confirm: true,
    });
  }
}
