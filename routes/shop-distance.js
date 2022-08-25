const express = require('express')
const router = express.Router();
const {getDistanceAndDeliveryFee} = require('../controllers/shop')

router.get('/', getDistanceAndDeliveryFee)

module.exports = router;