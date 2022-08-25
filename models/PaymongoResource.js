const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const collectionName = "paymongoresources";

const data = {
  referenceNumber: {
    type: String,
    trim: true,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["intent", "refund"],
  },
  userId: { type: Schema.ObjectId, required: true, ref: "User" },
  metadata: {},
};

const paymongoResourceSchema = new Schema(data, { timestamps: true });

module.exports = mongoose.model(
  "PaymongoResource",
  paymongoResourceSchema,
  collectionName
);
