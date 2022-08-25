const  Riders  = require("../models/Riders");
const { dbErrorHandler } = require("../helpers/dbErrorHandler");
const mongoose = require('mongoose');
var connection = mongoose.connection;

// MIDDLEWARES - mw
exports.mwRiderById = (req, res, next, id) => {
    Riders.findById(id).exec((err, rider) => {
        if (err || !rider) {
            return res.status(400).json({
                error: "Rider does not exist"
            });
        }
        req.rider = rider;
        next();
    });
};
// END MIDDLEWARES


// CRUD - RIDER 
exports.create = (req, res) => {
    const { name, email, deviceId, isActive } = req.body
    if (!name || !email || !deviceId || !isActive ) {
        return res.status(400).json({
            error: "All fields must be filled"
        })
    }

    req.body.password =  Math.random().toString(36).slice(-8);
    req.body.photo =  `${process.env.REACT_APP_API_URL}/rider/image/${req.files[0].id}`;
    let riders = new Riders(req.body);
    riders.save((err, result) => {
        if (err) {
            return res.status(400).json({
                error: `Error on saving rider: ${dbErrorHandler(err)}`
            });
        }
        connection.db.collection("riderimage.files", function(err, collection){
            if (err) {
                return res.status(400).json({
                    error: `Error on saving image: ${dbErrorHandler(err)}`
                });
            }   
            collection.updateOne({
                _id: req.files[0].id
            }, {
                $set: { aliases: [result._id.toString()] }
            });
        });
        res.json(result);
    });

};

exports.read = (req, res) => {
    return res.json(req.rider);
}


exports.update = (req, res) => {
    const rider = req.rider;
    rider.name = req.body.name;
    rider.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        res.json(data);
    });
};

exports.remove = (req, res) => {
    const rider = req.rider;
    rider.remove((err, data) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        res.json({
            message: "Rider deleted"
        });
    });
};

exports.getList = (req, res) => {
    Riders.find().exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        res.json(data);
    });
};

// END CRUD - RIDER 

