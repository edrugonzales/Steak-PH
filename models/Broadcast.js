const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const collectionName = "broadcasts";

const data = {
  title: {
    type: String,
    trim: true,
    required: true,
  },
  body: {
    type: String,
    trim: true,
    required: true,
  },
  images: {
    default: [],
    type: Array,
  },
  published: {
    default: false,
    type: Boolean,
  },
  link: {
    default: "https://www.sparkles.com.ph/",
    type: String,
  },
  isArchived: {
    default: false,
    type: Boolean,
  },
  type: {
    type: String,
    default: "Notification",
    enum: ["Notification", "Advisory", "Promotion", "OrderUpdate"], // enum means string objects
  },
  target: {
    type: String,
    default: "General",
    enum: ["General", "Selected"], // enum means string objects
  },
  targetUsers: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    default: [],
  },
  viewedBy: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    default: [],
  },
  expirationDate: {
    default: Date.now(),
    type: Date,
  },
  createdBy: { type: Schema.ObjectId, ref: "User" },
};

const broadcastSchema = new Schema(data, { timestamps: true });

module.exports = mongoose.model("Broadcast", broadcastSchema, collectionName);
