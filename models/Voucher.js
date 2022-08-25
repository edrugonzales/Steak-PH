const mongoose = require('mongoose');
const {nanoid}  = require('nanoid');
const Schema  = mongoose.Schema;
const collectionName = 'vouchers';

const Voucher = {
	product:{
		type:String, 
		default: 'sparkle'
	},
	name: {
		type:String, 
		required: true,
		unique: true,
	},
	valid_from: {
		type: Date, 
	},
	valid_to: {
		type: Date, 
	},
	every_date_of_month: {
		type: String
	},
	available: {
		type: Boolean,
		default: false
	},
	amount: {
		type: String, 
	}, 
	areas: {
		type: String
	}, 
	minimum_purchase: {
		type: Number
	}, 
	users_availed: {
		type: Array
	},
	delivery_fee_discount: { //free or type a number
		type: String,
	},
	one_time_use: {
		type: Boolean,
		default:false,
	},
	shops: [],
	apply_automatically: {
		type: Boolean, 
		default: false,
	}
}

const voucherSchema = new Schema(Voucher, {timestamps: true})

module.exports = mongoose.model('Vouchers', voucherSchema, collectionName);