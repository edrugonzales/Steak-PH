const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const Schema = mongoose.Schema;
const collectionName = "vortextransactions";

const data = {
  referenceNumber: {
    type: String,
    trim: true,
    default: () => nanoid(8),
  },
  type: {
    type: String,
    required: true,
    enum: ["billspayment", "topup", "gift"],
  },
  userId: { type: Schema.ObjectId, required: false, ref: "User" },
  transactionData: {},
  requestInputPayload: {},
  currentTransactionData: {},
  paymentId: { type: String, default: "" },
  paymentMethod: { type: String, default: "PayPal" },
  convenienceFee: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  status: { type: String, default: "New" },
  paymongoRefundResourceID: {
    type: Schema.ObjectId,
    ref: "PaymongoResource",
  },
};

const vortexTransactionSchema = new Schema(data, { timestamps: true });

module.exports = mongoose.model(
  "VortexTransaction",
  vortexTransactionSchema,
  collectionName
);
