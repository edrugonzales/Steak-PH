const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const collectionName = "user-riders";
const crypto = require("crypto");
const uuidv1 = require("uuid/v1");

const data = {
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    hashed_password: {
        type: String,
        required: true
    },
    salt: String,
    resetToken: String,
    expireToken: Date,
    deviceId: {
        type: String,
        default: ""

    },
    photo: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        required: true,
    },
    lastLogin: {
        type: Date
    }
}

const riderSchema = new Schema(data, { timestamps: true });

riderSchema
    .virtual("password") // Here 'password' is now a property on User documents.
    .set(function(password) {
        this._password = password;
        this.salt = uuidv1();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });

riderSchema.methods = {
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },
    encryptPassword: function(password) {
        if (!password) return "";
        try {
            return crypto
                .createHmac("sha1", this.salt)
                .update(password)
                .digest("hex");
        } catch (err) {
            return "";
        }
    }
};

module.exports = mongoose.model("Riders", riderSchema, collectionName);
