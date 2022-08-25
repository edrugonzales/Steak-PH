const express = require('express');
const router = express.Router();
const { mwAddOrderToUserHistory, mwUserById } = require('../controllers/user');
const { dbErrorHandler } = require("../helpers/dbErrorHandler")
const {StoreOrder} = require('../models/shop/Order');

router.post("/create/:userId", mwAddOrderToUserHistory, (req, res,) => {
    req.body.order.user = req.profile;
    //console.log(req.body.order.deliveryFee)
    const order = new StoreOrder(req.body.order);
    order.address = req.profile.address;

    if (order.deliveryFee === 0 || order.deliveryFee == 0 || order.deliveryFee === 35 || order.deliveryFee == 35 || order.deliveryFee === 35.0 || order.deliveryFee == 35.0) { //todo: version handling
        return res.status(400).json({
            error: "Kindly download the latest version of the app to continue with the order. Thank you for your patience po."
        });
    }

    order.history = [{
        status: "Not Processed",
        updatedBy: req.profile._id
    }]
    

    order.save((error, data) => {
        if (error) {
            return res.status(400).json({
                error: dbErrorHandler(error)
            })
        }

        res.json(data);
    })
});

router.param("userId", mwUserById)

module.exports = router;