const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const collectionName = "store-products";

const data = {
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 50
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    ingredients: {
        type: String,
        maxlength: 2000
    },
    price: {
        type: Number,
        trim: true,
        required: true,
        maxlength: 32
    },
    category: {
        type: Schema.ObjectId,
        ref: "CategoryShop",
        required: true
    },
    store: {
        type: Schema.ObjectId,
        ref: "ShopShop",
        required: true
    },
    images: {
        type: Array
    },
    quantity: {
        type: Number
    },
    sold: {
        type: Number,
        default: 0
    },
    photo: {
        data: Buffer,
        contentType: String
    },
    status: {
        type: Boolean,
        default: false
    },
    isPreOrder: {
        type: Boolean,
        default: false
    },
    isOnDemand: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean, 
        default: false
    },
    imagePrimary: {
        type: String,
        default: 'https://via.placeholder.com/350/0087FF/FFCF13?text=Image'
    },
    member_price:{
        type: Number, 
    },
    non_member_price: {
        type: Number
    }
}

const productSchema = new Schema(data, { timestamps: true });

module.exports = mongoose.model("ProductShop", productSchema, collectionName);
