const { StoreOrder } = require('../../models/shop/Order');
const { dbErrorHandler } = require('../../helpers/dbErrorHandler');
const fetch = require('node-fetch');

exports.getOrders = (req, res) => {
    StoreOrder.find({
        status: "Not processed"
    })
        .populate("user", "_id name address phone")
        .sort({ "createdAt": -1 })
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: dbErrorHandler(err)
                })
            }
            res.json(orders)
        })

}

exports.updateOrderStatus = (req, res) => {
    let { user } = req.order
    let { order } = req
    //update the order

    //find the user and send sms
    if (req.body.status === 'Accepted') {
        order.status = req.body.status
        order.save();

        var sms_body = [{
            "phone_number": user.phone,
            "message": "Sparkle Coop: Your order has been accepted.",
            "device_id": 122739
        }]

        fetch('https://smsgateway.me/api/v4/message/send', {
            'method': 'POST',
            'headers': {
                // replace authorization key with your key
                'Authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhZG1pbiIsImlhdCI6MTYxMjIyNjM1NiwiZXhwIjo0MTAyNDQ0ODAwLCJ1aWQiOjg2OTkzLCJyb2xlcyI6WyJST0xFX1VTRVIiXX0.n2OQRitcHryea912NFQjEO-7ovz-nmAboiazu3ffP-0',
                'Content-Type': 'application/json'
            },
            'body': JSON.stringify(sms_body)
        }).then(function (response) {
            res.json(order)
            //console.log(response)
        }).catch(function (error) {
            console.error(error);
        })
    }
    else if (req.body.status === 'Rejected') {
        order.status = req.body.status
        order.save();
        var sms_body = [{
            "phone_number": user.phone,
            "message": "Sparkle Coop: Your order has been rejected.",
            "device_id": 122739
        }]

        fetch('	https://smsgateway.me/api/v4/message/send', {
            'method': 'POST',
            'headers': {
                // replace authorization key with your key
                'Authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhZG1pbiIsImlhdCI6MTYxMjIyNjM1NiwiZXhwIjo0MTAyNDQ0ODAwLCJ1aWQiOjg2OTkzLCJyb2xlcyI6WyJST0xFX1VTRVIiXX0.n2OQRitcHryea912NFQjEO-7ovz-nmAboiazu3ffP-0',
                'Content-Type': 'application/json'
            },
            'body': JSON.stringify(sms_body)
        }).then(function (response) {
            res.json(order)
        }).catch(function (error) {
            console.error(error);
        })
    } else {
        res.status(400).json({
            error: 'Please choose another status'
        })


    }
}

exports.mwFindOrderById = (req, res, next, id) => {
    //get the order
    StoreOrder.findById(id).populate("user", "_id phone email name").exec((err, order) => {
        if (err || !order) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        req.order = order;
        next();
    })
}
