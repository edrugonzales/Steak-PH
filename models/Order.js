const mongoose = require("mongoose");
const { nanoid } = require('nanoid');

const Schema = mongoose.Schema;


// cart item
const dataCart = {
    _id: { type: Schema.ObjectId, ref: "Product" },
    name: String,
    price: Number,
    count: Number,
    size: String,
    discount: String, 
    addons: Array,
}
const CartItemSchema = new Schema(dataCart, { timestamps: true });

const collectionNameCart = "cart-item";
const CartItem = mongoose.model("CartItem", CartItemSchema, collectionNameCart);
// end cart item

//TODO: enforce add user who updated status of user
const dataHistory = {
    _id: { type: Schema.ObjectId, ref: "User" },
    status: String,
    statusMessage: String,
}
const HistoryItemSchema = new Schema(dataHistory, { timestamps: true });

const collectionNameHistory = "history-item";
const HistoryItem = mongoose.model("HistoryItem", HistoryItemSchema, collectionNameHistory);
// end history item

const endPoint =  {
    address: {type: String},
    coordinates: {type: Array}
}


// order
const dataOrder = {
    products: [CartItemSchema], // Array of Objects
    transaction_id: {
        type: String,
        default: () => nanoid(8),
    },
    amount: { type: Number },
    deliveryFee: {type: Number, default: 35.00},
    address: String,
    status: {
        type: String,
        default: "Not processed",
        enum: ["Waiting for Payment", "Not processed", "Accepted", "Preparing", "For-pickup", "On the way", "Arrived on Merchant", "Arived on pickup point", "Picked up", "Order on the way", "Delivery on the way", "Arrived","Delivered", "Rejected", "Cancelled"] // enum means string objects
    },
    history: [HistoryItemSchema],
    updated: Date,
    when: {type: String},
    deliveryNotes: {type: String},
    paymentType: {type: String},
    user: { type: Schema.ObjectId, ref: "User" },
    assignedRider: { type: Schema.ObjectId, ref: "User" },
    statusMessage: {type: String},
    shop: { type: Schema.ObjectId, ref: "Shop" },
    long: {type: String, default: "120.9890"},
    lat: {type: String, default: "14.6038"},
    trip: {type: Array},
    voucher: {type: String},
    origin: {
        person: String, 
        number: String, 
        address: String,
        coordinates: [Number],
    },
    destination: {
        person: String, 
        number: String,
        address: String, 
        coordinates: [Number]
    },
    deliveryType: String,
    pabili: {
        items: [], 
        amount: Number
    },
    paymentFrom: String,
    packageType: String, 
    deliveryFeeDiscount: Number,
    amountDiscount: Number,
    addons: {type: Array}
}
const OrderSchema = new Schema(dataOrder, { timestamps: true });

const collectionNameOrder = "orders";
const Order = mongoose.model("Order", OrderSchema, collectionNameOrder);
// end order

module.exports = { Order, CartItem, HistoryItem };