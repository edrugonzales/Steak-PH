const Review = require("../models/Review");
const { dbErrorHandler } = require("../helpers/dbErrorHandler");
const mongoose = require('mongoose');

// MIDDLEWARES - mw
exports.mwReviewById = (req, res, next, id) => {
    Review.findById(id).exec((err, review) => {
        if (err || !review) {
            return res.status(400).json({
                error: "Review does not exist"
            });
        }
        req.review = review;
        next();
    });
};
// END MIDDLEWARES

exports.create = (req, res) => {

    // TODO: add validation that user has already sent a rating from this order for this product $ne: $message
    const { name } = req.body
    // Review.findOne({ name })
    // .then(review => {
    //     // check if the product
    //     if(review) return res.status(400).json({ error: "The review already exists"})

        const newReview = new Review(req.body);
        newReview.save((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: dbErrorHandler(err)
                });
            }
            res.json({ data });
        });
    // })
};

exports.read = (req, res) => {
    return res.json(req.review);
}

exports.update = (req, res) => {
    const review = req.review;
    // TODO: add upsert 
    review.name = req.body.name;
    review.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        res.json(data);
    });
};

exports.remove = (req, res) => {
    const review = req.review;
    review.remove((err, data) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        res.json({
            message: "Review deleted"
        });
    });
};

// get review per product
exports.getList = (req, res) => {
    Review.find().exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        res.json(data);
        //FIXME: get all REST function for React Admin low-prio
        // res.set('x-total-count', data.length)
        // res.json(data.map(d => ({"id": d._id, ...d._doc})));
    });
};

// get review per shop
exports.getList = (req, res) => {
    Review.find().exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        res.json(data);
        //FIXME: get all REST function for React Admin low-prio
        // res.set('x-total-count', data.length)
        // res.json(data.map(d => ({"id": d._id, ...d._doc})));
    });
};


// get review per shop
exports.getListShop = (req, res) => {
   
    Review.find({
        "shop": req.params.shopId
    // status: { $in: ["For-pickup", "On the way", "Arrived on Merchant", "Picked up", "Order on the way", "Arrived"] }
    })
    .populate("user", "_id name photo ")
    .populate("shop", "_id name logo ")
    .populate("product", "_id name images ")
    .populate("order", "_id when updatedAt ")
    .sort({"createdAt": -1}) // sort most recent orders
    .exec((err, orders) => {
    if (err) {
        return res.status(400).json({
            error: dbErrorHandler(error)
        });
    }
    res.json(orders);
    });

};

// get review per product
exports.getListProduct = (req, res) => {
   
    Review.find({
        "product": req.params.productId
    // status: { $in: ["For-pickup", "On the way", "Arrived on Merchant", "Picked up", "Order on the way", "Arrived"] }
    })
    .populate("user", "_id name photo ")
    .populate("shop", "_id name logo ")
    .populate("product", "_id name images ")
    .populate("order", "_id when updatedAt ")
    .sort({"createdAt": -1}) // sort most recent orders
    .exec((err, orders) => {
    if (err) {
        return res.status(400).json({
            error: dbErrorHandler(error)
        });
    }
    res.json(orders);
    });

};

// get likes and dislikes
exports.getLikesAndDislikesProduct = (req, res) => {
   
    console.log("getlikes", req.params.productId)
    Review.aggregate([
        { "$facet": {
          "Likes": [
            { "$match" : {
                "isLike": { "$exists": true, "$eq": true },
                "product": { "$eq": mongoose.Types.ObjectId(req.params.productId)}   
            }},
            { "$count": "Likes" }
          ],
          "Dislikes": [
            { "$match" : {
                "isLike": { "$exists": true, "$eq": false },
                "product": { "$eq": mongoose.Types.ObjectId(req.params.productId)}  
            }},
            { "$count": "Dislikes" }
          ]
        }},
        { "$project": {
          "Likes": { "$arrayElemAt": ["$Likes.Likes", 0] },
          "Dislikes": { "$arrayElemAt": ["$Dislikes.Dislikes", 0] }
        }}
      ])
    .exec((err, data) => {
    if (err) {
        return res.status(400).json({
            error: dbErrorHandler(error)
        });
    }
    res.json(data);
    });
}

// get likes and dislikes
exports.getLikesAndDislikesShop = (req, res) => {
   
    console.log("getlikes", req.params.shopId)
    Review.aggregate([
        { "$facet": {
          "Likes": [
            { "$match" : {
                "isLike": { "$exists": true, "$eq": true },
                "shop": { "$eq": mongoose.Types.ObjectId(req.params.shopId)}   
            }},
            { "$count": "Likes" }
          ],
          "Dislikes": [
            { "$match" : {
                "isLike": { "$exists": true, "$eq": false },
                "shop": { "$eq": mongoose.Types.ObjectId(req.params.shopId)}  
            }},
            { "$count": "Dislikes" }
          ]
        }},
        { "$project": {
          "Likes": { "$arrayElemAt": ["$Likes.Likes", 0] },
          "Dislikes": { "$arrayElemAt": ["$Dislikes.Dislikes", 0] }
        }}
      ])
    .exec((err, data) => {
    if (err) {
        return res.status(400).json({
            error: dbErrorHandler(error)
        });
    }
    res.json(data);
    });
}


