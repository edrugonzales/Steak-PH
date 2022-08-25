const mongoose = require("mongoose");
const { nanoid } = require('nanoid');
const Schema = mongoose.Schema;

const dataRider = {
    _id: {
        type: Schema.ObjectId, 
        ref: "User"
    },
    name: {
        type: String,
    },
    trip: {
       type: Array
    },
    status: String,
    statusMessage: String
}

const dataDetails = {
    location: {
        long: {
            type: String,  
            default: "120.9890"
        },
        lat: {
            type: String,
            default: "14.6038"
        },
    },
    items:{
        type: Array
    },
    shop: {
        type: Array
    },
    user: {
        type: Array
    },
    notes: {
        type: String
    }
}

const dataHistory = {
    status: String, 
    statusMessage: String
}


const dataRiderSchema = new Schema(dataRider, { timestamps: true });
const dataDetailsSchema = new Schema(dataDetails, { timestamps: true });
const dataHistorySchema = new Schema(dataHistory, {timestamps: true});

const dataExpress = {
    orderId: { 
        type: String 
    },
    transaction_id: {
        type: String
    },
    rider: [dataRiderSchema],
    payment: Array,
    details: [dataDetailsSchema],
    history: [dataHistorySchema],
    company: Array,
    status: {
        type: String,
        default: "",
        enum: [
            "Looking for a Rider",
            "Not processed", 
            "Preparing", 
            "Accepted", 
            "On the way to pickup",
            "Arived on pickup point",
            "Delivery on the way",
            "Delivered", 
            "On the way", 
            "Arrived on Merchant", 
            "Picked up", 
            "Order on the way", 
            "Arrived",
            "Rejected", 
            "Cancelled",
            "For-pickup", 
        ] 
    },
    dropoff: {
        type: Array
    },
    pickup: {
        type: Array
    },
    notes: String,
    paymentFrom: String,
    pabili: {
       type: Object 
    },
    packageType: String,
    when: String,
    //items: [], amount: Number
}

const ExpressSchema = new Schema(dataExpress, { timestamps: true });
const collectionName = "exp-transactions";
module.exports = mongoose.model('Express', ExpressSchema, collectionName);
