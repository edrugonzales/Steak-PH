const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const collectionName = "user-stores";

const data = {
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 98,
    },
    schedule: {
        type: Array,
        default: [
            {
                "open": "8:00 am",
                "closed": "5:00 pm"
            },
            {
                "open": "8:00 am",
                "closed": "5:00 pm"
            },
            {
                "open": "8:00 am",
                "closed": "5:00 pm"
            },
            {
                "open": "8:00 am",
                "closed": "5:00 pm"
            },
            {
                "open": "8:00 am",
                "closed": "5:00 pm"
            },
            {
                "open": "",
                "closed": ""
            },
            {
                "open": "",
                "closed": ""
            }
        ]
    },
    address: {
        type: String,
        trim: true
    },
    inspiration: {
        type: String,
        trim: true
    },
    logo: {
        type: String,
        default: ''
    },
    banner: {
        type: String,
        default: ''
    },
    preparation: {
        type: String,
        default: "At least one day"
    },
    user: {
        type: Schema.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    long: {type: String, default: "120.9890"},
    lat: {type: String, default: "14.6038"},
    pickUpNotes: {type: String, default: ''}
}

const categorySchema = new Schema(data, { timestamps: true });

module.exports = mongoose.model("ShopShop", categorySchema, collectionName);
