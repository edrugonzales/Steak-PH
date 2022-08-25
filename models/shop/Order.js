const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const Schema = mongoose.Schema;

const dataCart = {
    _id: {
        type: Schema.ObjectId, ref: "ProductShop",
    },
    name: String,
    price: Number,
    count: Number,
}

const cartItemSchema = new Schema(dataCart, { timestamps: true });
const collectionNameCart = "store-cart-item";
const StoreCartItem = mongoose.model("StoreCartItem", cartItemSchema, collectionNameCart);

const dataHistory = {
    _id: { type: Schema.ObjectId, ref: "User" },
    status: String,
    statusMessage: String,
}
const HistoryItemSchema = new Schema(dataHistory, { timestamps: true });

const collectionNameHistory = "sparkle-history-item";
const StoreHistoryItem = mongoose.model("SparkleHistoryItem", HistoryItemSchema, collectionNameHistory);

const shopOrder = {
    products: [cartItemSchema],
    transaction_id: {
        type: String,
        default: () => nanoid(8),
    },
    branch: {
        type: String,
    },
    location: {
        type: String, 
    },
    carrierName: {
        type: String,
    },
    schedule: {
        type: String
    },
    amount: { type: Number },
    deliveryFee: { type: Number, default: 35.00 },
    address: String,
    status: {
        type: String,
        default: "Not processed",
        enum: ["Waiting for Payment","Not processed", "Accepted", "Preparing", "For-pickup", "On the way", "Arrived on Merchant", "Picked up", "Order on the way", "Arrived", "Delivered", "Rejected", "Cancelled"] // enum means string object
    },
    history: [HistoryItemSchema],
    updated: Date,
    when: { type: String },
    deliverNotes: { type: String },
    paymentType: { type: String },
    user: { type: Schema.ObjectId, ref: "User" },
    assignedRider: { type: Schema.ObjectId, ref: "User" },
    statusMessage: { type: String },
    long: { type: String, default: "120.9890" },
    lat: { type: String, default: "14.6038" },
    trip: { type: Array }
}


const ShopOrderSchema = new Schema(shopOrder, { timestamps: true });
const collectionNameOrder = "shop-orders";
const StoreOrder = mongoose.model("ShopOrder", ShopOrderSchema, collectionNameOrder);

module.exports = { StoreOrder, StoreCartItem, StoreHistoryItem };