const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const FcmSchema = new mongoose.Schema ({
  token: {type: String, default:""},
  deviceInfo:{type: String, default: ""},
  user: { type: Schema.ObjectId, ref: "User" },
});
 
module.exports = mongoose.model ('Fcm', FcmSchema, 'user-devices');
