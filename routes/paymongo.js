const express = require("express");
const {
  createPaymongoPaymentIntent,
  attachToPaymongoPaymentIntent,
  createPaymongoPaymentMethod,
  retrievePaymentIntent,
  savePaymongoRefundResource,
  getAllPaymongoRefundResource,
} = require("../controllers/paymongo");

const router = express.Router();

router.post("/payment_intents", createPaymongoPaymentIntent);

router.get("/payment_intents/:paymentIntentId", retrievePaymentIntent);

router.post("/payment_intents/attach", attachToPaymongoPaymentIntent);

router.post("/payment_methods", createPaymongoPaymentMethod);

router.post("/refund/save", savePaymongoRefundResource);

router.get("/refund/all/:userId", getAllPaymongoRefundResource);

module.exports = router;
