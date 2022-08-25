const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const collectionName = "reviews";

const data = {
    message: {
        type: String,
    },
    user: {
        type: Schema.ObjectId,
        ref: "User",
        required: true
    },
    shop: {
        type: Schema.ObjectId,
        ref: "Shop",
        required: true
    },
    product: {
        type: Schema.ObjectId,
        ref: "Product",
        required: true
    },
    isLike: {
        type: Boolean
    },
    order: {
        type: Schema.ObjectId,
        ref: "Order",
        required: true
    }
    
}

const reviewSchema = new Schema(data, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema, collectionName);
