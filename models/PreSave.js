const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const collectionName = "pre-save";

const data = {
    user_id: {
        type: Schema.ObjectId,
        ref: "User",
        required: true
    },
    place_id: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    coordinates: {
        type: Array,
        required: true,
    },
    shops: {
        type: String,
        required: true
    },
    date_created: {
        type: Date,
        default: Date.now
    },
    expire: {
        type: Boolean,
        default: false
    }

}

const mapSchema = new Schema(data, { timestamps: true });

module.exports = mongoose.model("PreSave", mapSchema, collectionName);
