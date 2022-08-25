const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const collectionName = "store-product-categories";

const brands = {
    _id: Schema.ObjectId,
    name: String,
    image: String,
}

const brandSchema = new Schema(brands)
const data = {
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
        unique: true
    },
    brands: [brandSchema]
}

const categorySchema = new Schema(data, { timestamps: true });

module.exports = mongoose.model("CategoryShop", categorySchema, collectionName);
