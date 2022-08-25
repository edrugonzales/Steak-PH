const Product = require("../models/Product");
const ProductShop = require("../models/shop/Products");
const ProductCategory = require('../models/shop/Category.js');
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { dbErrorHandler } = require("../helpers/dbErrorHandler");
const mongoose = require('mongoose');
const { schemaProducts } = require("./schema/products");
const { json } = require("express");
var connection = mongoose.connection;

// MIDDLEWARES - mw
exports.mwPhoto = (req, res, next) => {
    if (req.product.photo.data) {
        res.set("Content-Type", req.product.photo.contentType);
        return res.send(req.product.photo.data);
    }
    next();
};

exports.mwProductById = (req, res, next, id) => {
    Product.findById(id)
        .populate("category")
        .populate("shop")
        .exec((err, product) => {
            if (err || !product) {
                return res.status(400).json({
                    error: "Product not found"
                });
            }
            req.product = product;
            next();
        });
};

// @ desc update each product in the order list both subtracting the quantity and increase the number of sales of each.
exports.mwDecreaseQuantity = (products, res) => {
    console.log('updating quantity  ')
    // bulk operations
    let bulkOps = products.map(item => {
        return {
            updateOne: {
                filter: { _id: item._id },
                update: { $inc: { quantity: -item.count, sold: +item.count } } // n3
            }
        };
    });

    Product.bulkWrite(bulkOps, {}, (error, products) => { // n4
        if (error) {
            return res.status(400).json({
                error: "Could not update product"
            });
        }
        console.log("update products quantity")
        return;
    });
};
// END MIDDLEWARES

exports.getImage = (req, res) => {
    connection.db.collection("productimage.files", function (err, collection) {
        collection.find({ _id: mongoose.Types.ObjectId(req.params.imageId) }).toArray(function (err, data) {
            // console.log(data);
            if (data.length === 0) {
                res.redirect('https://via.placeholder.com/480x480?text=Image+Not+Approved');
                // res.writeHead(200, {'Content-Type': 'text/plain' });
                res.writeHead(403);
                return res.end();
            }
            //Retrieving the chunks from the db          
            connection.db.collection("productimage.chunks", function (err, collectionChunks) {
                collectionChunks.find({ files_id: data[0]._id })
                    .sort({ n: 1 }).toArray(function (err, chunks) {
                        if (err) {
                            return res.render('index', {
                                title: 'Download Error',
                                message: 'Error retrieving chunks',
                                error: err.errmsg
                            });
                        }
                        if (!chunks || chunks.length === 0) {
                            //No data found            
                            return res.render('index', {
                                title: 'Download Error',
                                message: 'No data found'
                            });
                        }

                        let fileData = [];
                        for (let i = 0; i < chunks.length; i++) {
                            //This is in Binary JSON or BSON format, which is stored               
                            //in fileData array in base64 endocoded string format               

                            fileData.push(chunks[i].data.toString('base64'));
                        }

                        //Display the chunks using the data URI format          
                        let finalFile = 'data:' + data[0].contentType + ';base64,'
                            + fileData.join('');


                        const im = finalFile.split(",")[1];

                        const img = Buffer.from(im, 'base64');

                        res.writeHead(200, {
                            'Content-Type': 'image/png',
                            'Content-Length': img.length
                        });

                        res.end(img);
                    });
            });
        });
    });
}

exports.addImage = async (req, res) => {
    const { url, file, type } = req.body

    let newImages = await Promise.all(req.files.map(async (file) => {
        const id = mongoose.Types.ObjectId();

        return ({
            url: `${process.env.IMGIX_SUBDOMAIN}/${file.key}`,
            id: id,
            isApproved: false
        });
    }));

    Product.findByIdAndUpdate(req.params.id, { $addToSet: { images: newImages } }, { new: true }, (err, product) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        res.json(product);
    });
}

exports.create = async (req, res) => {
    let sizes = []
    let addons = []

    try {
        sizes = JSON.parse(req.body.sizes)
        addons = JSON.parse(req.body.addons)
    } catch (err) {
        console.log(err)
    }
    // Check for all fields
    const { name, description, price, category, quantity } = req.body
    if (!name || !description || !price || !category || !quantity) {
        return res.status(400).json({
            error: "All fields must be filled"
        })
    }


    if (req.files.length === 0) {
        return res.status(400).json({
            error: "Invalid image type"
        })
    }

    req.body.images = await Promise.all(req.files.map(async (file) => {
        const id = mongoose.Types.ObjectId();

        return ({
            url: `${process.env.IMGIX_SUBDOMAIN}/${file.key}`,
            id: id,
            isApproved: false
        });
    }));

    req.body.shop = req.params.shopId;
    let product = new Product({ ...req.body, sizes, addons });

    var product_images = req.files;
    var arrayofId = product_images.map(function (obj) {
        return obj.id;
    })

    product.save((err, result) => {
        if (err) {
            return res.status(400).json({
                error: `Error on saving product: ${dbErrorHandler(err)}`
            });
        }


        connection.db.collection("productimage.files", function (err, collection) {
            if (err) {
                return res.status(400).json({
                    error: `Error on saving image: ${dbErrorHandler(err)}`
                });
            }
            collection.updateMany({
                _id:
                {
                    $in: arrayofId
                }
            }, {
                $set: { aliases: [result._id.toString()] }
            });
        });
        res.json(result);
    });

};

exports.createByType = (req, res) => {
    // Check for all fields
    const type = req.params.type;
    switch (type) {
        case "shop":
            return createShop(req, res);
        default:
            return create(req, res);
    }

};


exports.read = (req, res) => {
    // we do not fetch images due to their big size, there is another way in the front end to fetch them.
    req.product.photo = undefined;
    return res.json(req.product);
};

exports.remove = (req, res) => {
    let product = req.product;
    product.isArchived = true;
    product.save((err, product) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }

        res.json({
            message: "The product has been successfully archived!"
        })
    })
}

// This update the whole document. Need all the fields.
exports.update = (req, res) => {
    console.log('update on product- ', req.body)
    const query = { _id: mongoose.Types.ObjectId(req.params.productId) };
    const update = { $set: req.body }
    console.log(query, update)


    if(req.body.imagePrimary) {

    }
    // Product.updateOne(query, update, (err, product)=> {


    //     if (err) {
    //         console.log('there is erro? ', err)
    //         return res.status(400).json({
    //             error: dbErrorHandler(err)
    //         });
    //     }
    //     return res.json(product);
    // });

    Product.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(req.params.productId) },
        {
            "$set": req.body
        },
        function (err, doc) {
            if (err) {
                return res.status(400).json({
                    error: dbErrorHandler(err)
                });
            }

            res.json(doc);
        }
    );
    // let form = new formidable.IncomingForm();
    // form.keepExtensions = true;
    // form.parse(req, (err, fields, files) => {
    //     if (err) {
    //         return res.status(400).json({
    //             error: "The product could not be updated."
    //         });
    //     }
    // check for all fields
    // const {
    //     name,
    //     description,
    //     price,
    //     category,
    //     quantity,
    //     shipping
    // } = fields;

    // if (
    //     !name ||
    //     !description ||
    //     !price ||
    //     !category ||
    //     !quantity ||
    //     !shipping
    // ) {
    //     return res.status(400).json({
    //         error: "All fields are required"
    //     });
    // }

    //     let product = req.product;
    //     // merging new fields with the current  product
    //     product = _.extend(product, fields);

    //     // 1kb = 1000
    //     // 1mb = 1000000

    //     if (files.photo) {
    //         // console.log("FILES PHOTO: ", files.photo);
    //         if (files.photo.size > 1000000) {
    //             return res.status(400).json({
    //                 error: "Image should be less than 1mb in size"
    //             });
    //         }
    //         product.photo.data = fs.readFileSync(files.photo.path);
    //         product.photo.contentType = files.photo.type;
    //     }

    //     product.save((err, result) => {
    //         if (err) {
    //             return res.status(400).json({
    //                 error: dbErrorHandler(err)
    //             });
    //         }
    //         res.json(result);
    //     });
    // });
};

/**
 * sales (most popular products) / arrival (new products)
 * by sales = api/product/list/all?sortBy=sold&order=desc&limit=4
 * by arrival = api/product/list/all?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned
 */

exports.getList = (req, res) => {
    let order = req.query.order ? req.query.order : "desc";
    let sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    let limit = req.query.limit ? parseInt(req.query.limit) : 6; // default
    let long = req.query.long ? parseFloat(req.query.long) : '';
    let lat = req.query.lat ? parseFloat(req.query.lat) : '';
    if (long === '' || lat === '')
        return res.json([]);

    Product.aggregate([
        {
            $facet: {
                new: [{
                    $lookup: {
                        "from": "user-shops",
                        "localField": "shop",
                        "foreignField": "_id",
                        "as": "shop"
                    }
                },
                {
                    $unwind: "$shop"
                },
                {
                    $lookup: {
                        "from": "product-categories",
                        "localField": "category",
                        "foreignField": "_id",
                        "as": "category"
                    }
                },
                {
                    $unwind: "$category"
                },
                {
                    $match: {
                        $and: [
                            {
                                "shop.status": true,
                            },
                            {
                                "isApproved": true,
                            },
                            {
                                "status": true,
                            },
                            {
                                "shop.name": { $ne: "Sparkle Shop" }
                            },
                            {
                                "isArchived": false
                            }
                        ]
                    }
                },
                {
                    $match: {
                        "shop.location": {
                            $geoWithin: {
                                $centerSphere: [[long, lat], 5 / 6378.1]
                            }
                        }
                    }
                },
                { "$sort": { "createdAt": -1 } },
                { "$limit": 12 },
                {
                    $addFields: {
                        "isNew": true,
                        "order": 1
                    }
                }
                ],
                bestseller: [{
                    $lookup: {
                        "from": "user-shops",
                        "localField": "shop",
                        "foreignField": "_id",
                        "as": "shop"
                    }
                },
                {
                    $unwind: "$shop"
                },
                {
                    $lookup: {
                        "from": "product-categories",
                        "localField": "category",
                        "foreignField": "_id",
                        "as": "category"
                    }
                },
                {
                    $unwind: "$category"
                },
                {
                    $match: {
                        $and: [
                            {
                                "shop.status": true,
                            },
                            {
                                "isApproved": true,
                            },
                            {
                                "status": true,
                            },
                            {
                                "shop.name": { $ne: "Sparkle Shop" }
                            },
                            {
                                "isArchived": false
                            }
                        ]
                    }
                },
                {
                    $match: {
                        "shop.location": {
                            $geoWithin: {
                                $centerSphere: [[long, lat], 5 / 6378.1]
                            }
                        }
                    }
                },
                { "$sort": { "sold": -1 } },
                { "$limit": 6 },
                {
                    $addFields: {
                        "isBestSeller": true,
                        "order": 2
                    }
                }
                ],
                mostreviewed: [{
                    $lookup: {
                        "from": "user-shops",
                        "localField": "shop",
                        "foreignField": "_id",
                        "as": "shop"
                    }
                },
                {
                    $unwind: "$shop"
                },
                {
                    $lookup: {
                        "from": "product-categories",
                        "localField": "category",
                        "foreignField": "_id",
                        "as": "category"
                    }
                },
                {
                    $unwind: "$category"
                },
                {
                    $match: {
                        $and: [
                            {
                                "shop.status": true,
                            },
                            {
                                "isApproved": true,
                            },
                            {
                                "status": true,
                            },
                            {
                                "shop.name": { $ne: "Sparkle Shop" }
                            },
                            {
                                "isArchived": false
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        "from": "reviews",
                        "localField": "_id",
                        "foreignField": "product",
                        "as": "reviews"
                    }
                },
                {
                    $addFields: {
                        "totalReviews": { $sum: { $size: "$reviews.message" } }
                    }
                },
                {
                    $match: {
                        "shop.location": {
                            $geoWithin: {
                                $centerSphere: [[long, lat], 5 / 6378.1]
                            }
                        }
                    }
                },
                { "$sort": { "totalReviews": -1 } },
                { "$limit": 3 },
                {
                    $addFields: {
                        "isMostReviewed": true,
                        "order": 3
                    }
                }
                ],
                open: [{
                    $lookup: {
                        "from": "user-shops",
                        "localField": "shop",
                        "foreignField": "_id",
                        "as": "shop"
                    }
                },
                {
                    $unwind: "$shop"
                },
                {
                    $lookup: {
                        "from": "product-categories",
                        "localField": "category",
                        "foreignField": "_id",
                        "as": "category"
                    }
                },
                {
                    $unwind: "$category"
                },
                {
                    $match: {
                        $and: [
                            {
                                "shop.status": true,
                            },
                            {
                                "isApproved": true,
                            },
                            {
                                "status": true,
                            },
                            {
                                "shop.name": { $ne: "Sparkle Shop" }
                            },
                            {
                                "isArchived": false
                            }
                        ]
                    }
                },
                {
                    $match: {
                        "shop.location": {
                            $geoWithin: {
                                $centerSphere: [[long, lat], 5 / 6378.1]
                            }
                        }
                    }
                },
                { "$sort": { "createdAt": -1 } },
                {
                    $addFields: {
                        "isAvailable": true,
                        "order": 5
                    }
                }
                ]
            }
        },
        {
            $project: {
                tags: {
                    $setUnion: ['$open']
                },
                all: {
                    $setUnion: ['$new', '$bestseller', '$mostreviewed',]
                }
            }
        },
        {
            $project: {
                products: {
                    $map: {
                        input: "$tags",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$all",
                                                as: "two",
                                                cond: { $eq: ["$$two._id", "$$one._id"] }
                                            }
                                        },
                                        0
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $unwind: '$products'
        },
        {
            $replaceRoot: { newRoot: "$products" }
        },
        {
            $sort: {
                "order": 1
            }
        },
        {
            $limit: limit,
        }
    ])
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found."
                });
            }
            //FIXME: get all REST function for React Admin
            // res.set('x-total-count', products.length)
            res.json(products);
            // res.json(products.map((p) => {

            //     let {name, sold, description, price, quantity, createdAt} = p._doc;
            //     console.log(p)
            //     return({"id": p._id, name, sold, description, price, quantity, createdAt, "image": 'http://localhost:8000/api/product/photo/'+p._id});
            //  }));
        });
};

exports.getListv2 = (req, res) => {
    let order = req.query.order ? req.query.order : "desc";
    let sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    let limit = req.query.limit ? parseInt(req.query.limit) : 6; // default
    let long = req.query.long ? parseFloat(req.query.long) : '';
    let lat = req.query.lat ? parseFloat(req.query.lat) : '';
    if (long === '' || lat === '')
        return res.json([]);

    Product
        .aggregate([
            {
                $facet: {
                    new: [{
                        $lookup: {
                            "from": "user-shops",
                            "localField": "shop",
                            "foreignField": "_id",
                            "as": "shop"
                        }
                    },
                    {
                        $unwind: "$shop"
                    },
                    {
                        $lookup: {
                            "from": "product-categories",
                            "localField": "category",
                            "foreignField": "_id",
                            "as": "category"
                        }
                    },
                    {
                        $unwind: "$category"
                    },
                    {
                        $match: {
                            "shop.status": true,
                            "isApproved": true,
                            "status": true,
                            "isArchived": false
                        }
                    },
                    {
                        $match: {
                            "shop.location": {
                                $geoWithin: {
                                    $centerSphere: [[long, lat], 5 / 6378.1]
                                }
                            }
                        }
                    },
                    { "$sort": { "createdAt": -1 } },
                    { "$limit": 6 },
                    {
                        $addFields: {
                            "isNew": true
                        }
                    }
                    ],
                    bestseller: [{
                        $lookup: {
                            "from": "user-shops",
                            "localField": "shop",
                            "foreignField": "_id",
                            "as": "shop"
                        }
                    },
                    {
                        $unwind: "$shop"
                    },
                    {
                        $lookup: {
                            "from": "product-categories",
                            "localField": "category",
                            "foreignField": "_id",
                            "as": "category"
                        }
                    },
                    {
                        $unwind: "$category"
                    },
                    {
                        $match: {
                            "shop.status": true,
                            "isApproved": true,
                            "status": true,
                            "isArchived": false
                        }
                    },
                    {
                        $match: {
                            "shop.location": {
                                $geoWithin: {
                                    $centerSphere: [[long, lat], 5 / 6378.1]
                                }
                            }
                        }
                    },
                    { "$sort": { "sold": -1 } },
                    { "$limit": 6 },
                    {
                        $addFields: {
                            "isBestSeller": true
                        }
                    }
                    ],
                    mostreviewed: [{
                        $lookup: {
                            "from": "user-shops",
                            "localField": "shop",
                            "foreignField": "_id",
                            "as": "shop"
                        }
                    },
                    {
                        $unwind: "$shop"
                    },
                    {
                        $lookup: {
                            "from": "product-categories",
                            "localField": "category",
                            "foreignField": "_id",
                            "as": "category"
                        }
                    },
                    {
                        $unwind: "$category"
                    },
                    {
                        $match: {
                            "shop.status": true,
                            "isApproved": true,
                            "status": true,
                            "isArchived": false
                        }
                    },
                    {
                        $lookup: {
                            "from": "reviews",
                            "localField": "_id",
                            "foreignField": "product",
                            "as": "reviews"
                        }
                    },
                    {
                        $addFields: {
                            "totalReviews": { $sum: { $size: "$reviews.message" } }
                        }
                    },
                    {
                        $match: {
                            "shop.location": {
                                $geoWithin: {
                                    $centerSphere: [[long, lat], 5 / 6378.1]
                                }
                            }
                        }
                    },
                    { "$sort": { "totalReviews": -1 } },
                    { "$limit": 6 },
                    {
                        $addFields: {
                            "isMostReviewed": true,
                        }
                    }
                    ],
                    open: [{
                        $lookup: {
                            "from": "user-shops",
                            "localField": "shop",
                            "foreignField": "_id",
                            "as": "shop"
                        }
                    },
                    {
                        $unwind: "$shop"
                    },
                    {
                        $lookup: {
                            "from": "product-categories",
                            "localField": "category",
                            "foreignField": "_id",
                            "as": "category"
                        }
                    },
                    {
                        $unwind: "$category"
                    },
                    {
                        $match: {
                            "shop.status": true,
                            "isApproved": true,
                            "status": true,
                            "isArchived": false
                        }
                    },
                    {
                        $match: {
                            "shop.location": {
                                $geoWithin: {
                                    $centerSphere: [[long, lat], 5 / 6378.1]
                                }
                            }
                        }
                    },
                    { "$sort": { "createdAt": -1 } },
                    { "$limit": limit },
                    {
                        $addFields: {
                            "isAlways": true,
                        }
                    }
                    ]
                }
            },
            {
                $project: {
                    all: {
                        $setUnion: ['$new', '$bestseller', '$mostreviewed', '$open']
                    }
                }
            },
            {
                $unwind: '$all'
            },
            {
                $replaceRoot: { newRoot: "$all" }
            }
            ,
            {
                $limit: limit
            }
        ])
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found."
                });
            }
            //FIXME: get all REST function for React Admin
            // res.set('x-total-count', products.length)
            res.json(products);
            // res.json(products.map((p) => {

            //     let {name, sold, description, price, quantity, createdAt} = p._doc;
            //     console.log(p)
            //     return({"id": p._id, name, sold, description, price, quantity, createdAt, "image": 'http://localhost:8000/api/product/photo/'+p._id});
            //  }));
        });
};

exports.getListSearch = (req, res) => {

    // Product.createIndex(
    //     {
    //       name: "text",
    //       description: "text"
    //     }
    //   );
    // create query object to hold search value and category value
    const query = {};
    let tempQ = req.query.search.split('?');
    console.log(tempQ)

    if (tempQ.length > 1) { ///api/product/list/search?search=banana?long=120.989?lat=14.6038
        req.query.search = tempQ[0];
        req.query.long = tempQ[1].split('=')[1]
        req.query.lat = tempQ[2].split('=')[1]
    }
    // assign search value to query.name
    if (req.query.search) {
        query.name = { $regex: `${req.query.search}`, $options: "is" };
        // query.shop = { name: { $regex: req.query.search, $options: "is" }}; //add shop
        //todo not case senstivive
        // assigne category value to query.category
        if (req.query.category && req.query.category != "All") {
            query.category = req.query.category;
        }
        // find the product based on query object with 2 properties
        // search and category
        let long = req.query.long ? parseFloat(req.query.long) : '';
        let lat = req.query.lat ? parseFloat(req.query.lat) : '';
        if (long === '' || lat === '')
            return res.json([]);


        Product.aggregate([
            {
                $facet: {
                    new: [{
                        $lookup: {
                            "from": "user-shops",
                            "localField": "shop",
                            "foreignField": "_id",
                            "as": "shop"
                        }
                    },
                    {
                        $unwind: "$shop"
                    },
                    {
                        $lookup: {
                            "from": "product-categories",
                            "localField": "category",
                            "foreignField": "_id",
                            "as": "category"
                        }
                    },
                    {
                        $unwind: "$category"
                    },
                    {
                        $match: {
                            "shop.isActive": true,
                            "isApproved": true,
                            "status": true,
                            "isArchived": false
                        }
                    },
                    // {
                    //     $match: {
                    //         "shop.location": {
                    //             $geoWithin: {
                    //                 $centerSphere: [[long, lat], 5 / 6378.1]
                    //             }
                    //         }
                    //     }
                    // },
                    { "$sort": { "createdAt": -1 } },
                    { "$limit": 6 },
                    {
                        $addFields: {
                            "isNew": true
                        }
                    }
                    ],
                    bestseller: [{
                        $lookup: {
                            "from": "user-shops",
                            "localField": "shop",
                            "foreignField": "_id",
                            "as": "shop"
                        }
                    },
                    {
                        $unwind: "$shop"
                    },
                    {
                        $lookup: {
                            "from": "product-categories",
                            "localField": "category",
                            "foreignField": "_id",
                            "as": "category"
                        }
                    },
                    {
                        $unwind: "$category"
                    },
                    {
                        $match: {
                            "shop.isActive": true,
                            "isApproved": true,
                            "status": true,
                            "isArchived": false
                        }
                    },
                    // {
                    //     $match: {
                    //         "shop.location": {
                    //             $geoWithin: {
                    //                 $centerSphere: [[long, lat], 5 / 6378.1]
                    //             }
                    //         }
                    //     }
                    // },
                    { "$sort": { "sold": -1 } },
                    { "$limit": 6 },
                    {
                        $addFields: {
                            "isBestSeller": true
                        }
                    }
                    ],
                    mostreviewed: [{
                        $lookup: {
                            "from": "user-shops",
                            "localField": "shop",
                            "foreignField": "_id",
                            "as": "shop"
                        }
                    },
                    {
                        $unwind: "$shop"
                    },
                    {
                        $lookup: {
                            "from": "product-categories",
                            "localField": "category",
                            "foreignField": "_id",
                            "as": "category"
                        }
                    },
                    {
                        $unwind: "$category"
                    },
                    {
                        $match: {
                            "shop.isActive": true,
                            "isApproved": true,
                            "status": true,
                            "isArchived": false
                        }
                    },
                    {
                        $lookup: {
                            "from": "reviews",
                            "localField": "_id",
                            "foreignField": "product",
                            "as": "reviews"
                        }
                    },
                    {
                        $addFields: {
                            "totalReviews": { $sum: { $size: "$reviews.message" } }
                        }
                    },
                    // {
                    //     $match: {
                    //         "shop.location": {
                    //             $geoWithin: {
                    //                 $centerSphere: [[long, lat], 5 / 6378.1]
                    //             }
                    //         }
                    //     }
                    // },
                    { "$sort": { "totalReviews": -1 } },
                    { "$limit": 3 },
                    {
                        $addFields: {
                            "isMostReviewed": true,
                        }
                    }
                    ],
                    open: [{
                        $lookup: {
                            "from": "user-shops",
                            "localField": "shop",
                            "foreignField": "_id",
                            "as": "shop"
                        }
                    },
                    {
                        $unwind: "$shop"
                    },
                    {
                        $lookup: {
                            "from": "product-categories",
                            "localField": "category",
                            "foreignField": "_id",
                            "as": "category"
                        }
                    },
                    {
                        $unwind: "$category"
                    },
                    {
                        $match: {
                            "shop.isActive": true,
                            "isApproved": true,
                            "status": true,
                            "isArchived": false
                        }
                    },
                    // {
                    //     $match: {
                    //         "shop.location": {
                    //             $geoWithin: {
                    //                 $centerSphere: [[long, lat], 5 / 6378.1]
                    //             }
                    //         }
                    //     }
                    // },
                    {
                        $match: {
                            $or: [
                                {
                                    "name": { $regex: `${req.query.search}`, $options: "is" }
                                },
                                {
                                    "shop.name": { $regex: `${req.query.search}`, $options: "is" }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            "isAlways": true,
                        }
                    }
                    ]
                }
            },
            {
                $project: {
                    tags: {
                        $setUnion: ['$open']
                    },
                    all: {
                        $setUnion: ['$new', '$bestseller', '$mostreviewed',]
                    }
                }
            },
            {
                $project: {
                    products: {
                        $map: {
                            input: "$tags",
                            as: "one",
                            in: {
                                $mergeObjects: [
                                    "$$one",
                                    {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: "$all",
                                                    as: "two",
                                                    cond: { $eq: ["$$two._id", "$$one._id"] }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $unwind: '$products'
            },
            {
                $replaceRoot: { newRoot: "$products" }
            },
            // {
            //     $limit: limit
            // }
        ])
            .exec((err, products) => {
                if (err) {
                    return res.status(400).json({
                        error: dbErrorHandler(err)
                    });
                }
                res.json(products);
            })
    }
};

exports.getListByShop = (req, res) => {
    let isMerchant = req.query.ismerchant ? req.query.ismerchant : 'false';
    // create query object to hold search value and category value
    let query = { shop: req.params.shopId, isArchived: false, status: true };
    if (isMerchant === 'true') {
        query = { shop: req.params.shopId, isArchived: false };
    }

    Product.find(query, (err, products) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        res.json(products);
    }).sort({ createdAt: -1 }).select("-photo")
        .populate("category", "_id name")
        .populate("shop");
    //add sort


    /*jjjj
    Product.find(query,).select("-photo")
        .populate("category", "_id name")
        .populate("shop");
    //add sort
    */
};

exports.getListByCategory = async (req, res) => {
    let category = req.params.categoryId ? req.params.categoryId : '';
    //get items on this branch and brand
    let brand = req.query.brand.toLowerCase();
    let cat = await ProductCategory.findById(category)
    let cats = cat.brands.map((cat) => {
        return cat.name.toLowerCase();
    })

    let query = {
        name: { $regex: brand, $options: "i" },
        category: category,
        store: req.query.branch,
        quantity: { $gt: 0 },

        //createdAt: {$gt: new Date("2021-02-18T07:39:47.906Z").toISOString()}
    };
    //check if there is date given
    if (typeof req.query.index !== 'undefined') {
        query.createdAt = { $gt: new Date(req.query.index).toISOString() }
    }

    //
    if (brand === 'others') {
        delete query.name
    }

    ProductShop.find(query).sort({ createdAt: 1 }).limit(5).exec((err, products) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        if (brand === 'others') {
            let prods = products.map((product) => {
                let render = true

                cats.forEach(function (cat) {
                    console.log(product.name)
                    if (product.name.toLowerCase().includes(cat))
                        render = false
                })

                return { ...product.toJSON(), render: render }


            })
            console.log(prods)
            res.json(prods)
        } else
            res.json(products)
    })

}

exports.getListByStore = (req, res) => {
    let isSeller = req.query.isSeller ? req.query.isSeller : 'false';
    // create query object to hold search value and category value
    let query = { store: req.params.storeId, isArchived: false, status: true };
    if (isSeller === 'true') {
        query = { store: req.params.storeId, isArchived: false };
    }

    ProductShop.find(query, (err, products) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        res.json(products);
    }).select("-photo")
        .populate("category", "_id name")
        .populate("store");
    //add sort
};

/**
 * it will find the products based on the req product category
 * other products that has the same category, will be returned
 */
exports.getListRelated = (req, res) => {
    console.log("getList Related req product", req.product)
    let limit = req.query.limit ? parseInt(req.query.limit) : 6; // 6 by default
    // find this current category from the selected product but not include itself
    Product.find({ _id: { $ne: req.product }, category: req.product.category }) //n1
        .limit(limit)
        .select('-photo') // activate this for better readability in postman
        .populate("category", "_id name")
        .populate("shop")
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "No products found"
                });
            }
            res.json(products);
        });
};

exports.getListCategory = (req, res) => {
    Product.distinct("category", {}, (err, categories) => { // n2
        if (err) {
            return res.status(400).json({
                error: "Categories not found"
            });
        }
        res.json(categories);
    });
};

exports.getListByType = (req, res) => {
    let order = req.query.order ? req.query.order : "desc";
    let sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    let limit = req.query.limit ? parseInt(req.query.limit) : 6; // default
    let long = req.query.long ? parseFloat(req.query.long) : '';
    let lat = req.query.lat ? parseFloat(req.query.lat) : '';

    //if(long === '' || lat === '')
    //return res.json([]);

    ProductShop.aggregate(
        schemaProducts(limit, long, lat)
    ).exec((err, products) => {
        if (err) {
            return res.status(400).json({
                error: "Products not found."
            });
        }
        res.json(products);
    });
};


/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */

// route - make sure its post / we need body from the front end
// router.post("/products/by/search", listBySearch);

exports.postListBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};
    let long = req.body.long ? parseFloat(req.body.long) : '';
    let lat = req.body.lat ? parseFloat(req.body.lat) : '';
    if (long === '' || lat === '')
        return res.json([]);
    console.log(order, sortBy, limit, skip, req.body.filters, req.body);

    //FIXME: Add preOrder and onDemand postman documentation
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] =
                {
                    $in: req.body.filters[key].map(x => mongoose.Types.ObjectId(x))
                }
            }
        }
    }

    console.log("findArgs", findArgs);

    // Product.find(findArgs)
    //     .select("-photo")
    //     .populate("category")i
    //     .populate("shop")
    //     .sort([[sortBy, order]])
    //     .skip(skip)
    //     .limit(limit)

    Product.aggregate([
        {
            $facet: {
                new: [{
                    $lookup: {
                        "from": "user-shops",
                        "localField": "shop",
                        "foreignField": "_id",
                        "as": "shop"
                    }
                },
                {
                    $unwind: "$shop"
                },
                {
                    $lookup: {
                        "from": "product-categories",
                        "localField": "category",
                        "foreignField": "_id",
                        "as": "category"
                    }
                },
                {
                    $unwind: "$category"
                },
                {
                    $match: {
                        "shop.status": true,
                        "isApproved": true,
                        "status": true,
                        "isArchived": false
                    }
                },
                {
                    $match: {
                        "shop.location": {
                            $geoWithin: {
                                $centerSphere: [[long, lat], 5 / 6378.1]
                            }
                        }
                    }
                },
                { "$sort": { "createdAt": -1 } },
                { "$limit": 6 },
                {
                    $addFields: {
                        "isNew": true
                    }
                }
                ],
                bestseller: [{
                    $lookup: {
                        "from": "user-shops",
                        "localField": "shop",
                        "foreignField": "_id",
                        "as": "shop"
                    }
                },
                {
                    $unwind: "$shop"
                },
                {
                    $lookup: {
                        "from": "product-categories",
                        "localField": "category",
                        "foreignField": "_id",
                        "as": "category"
                    }
                },
                {
                    $unwind: "$category"
                },
                {
                    $match: {
                        "shop.status": true,
                        "isApproved": true,
                        "status": true,
                        "isArchived": false
                    }
                },
                {
                    $match: {
                        "shop.location": {
                            $geoWithin: {
                                $centerSphere: [[long, lat], 5 / 6378.1]
                            }
                        }
                    }
                },
                { "$sort": { "sold": -1 } },
                { "$limit": 6 },
                {
                    $addFields: {
                        "isBestSeller": true
                    }
                }
                ],
                mostreviewed: [{
                    $lookup: {
                        "from": "user-shops",
                        "localField": "shop",
                        "foreignField": "_id",
                        "as": "shop"
                    }
                },
                {
                    $unwind: "$shop"
                },
                {
                    $lookup: {
                        "from": "product-categories",
                        "localField": "category",
                        "foreignField": "_id",
                        "as": "category"
                    }
                },
                {
                    $unwind: "$category"
                },
                {
                    $match: {
                        "shop.status": true,
                        "isApproved": true,
                        "status": true,
                        "isArchived": false
                    }
                },
                {
                    $lookup: {
                        "from": "reviews",
                        "localField": "_id",
                        "foreignField": "product",
                        "as": "reviews"
                    }
                },
                {
                    $addFields: {
                        "totalReviews": { $sum: { $size: "$reviews.message" } }
                    }
                },
                {
                    $match: {
                        "shop.location": {
                            $geoWithin: {
                                $centerSphere: [[long, lat], 5 / 6378.1]
                            }
                        }
                    }
                },
                { "$sort": { "totalReviews": -1 } },
                { "$limit": 3 },
                {
                    $addFields: {
                        "isMostReviewed": true,
                    }
                }
                ],
                open: [{
                    $lookup: {
                        "from": "user-shops",
                        "localField": "shop",
                        "foreignField": "_id",
                        "as": "shop"
                    }
                },
                {
                    $unwind: "$shop"
                },
                {
                    $match: {
                        $and: [
                            {
                                "shop.status": true,
                            },
                            {
                                "isApproved": true,
                            },
                            {
                                "status": true,
                            },
                            {
                                "isArchived": false
                            }
                        ]
                    }
                },
                {
                    $match: {
                        "shop.location": {
                            $geoWithin: {
                                $centerSphere: [[long, lat], 5 / 6378.1]
                            }
                        }
                    }
                },
                {
                    $match: findArgs
                },
                {
                    $lookup: {
                        "from": "product-categories",
                        "localField": "category",
                        "foreignField": "_id",
                        "as": "category"
                    }
                },
                {
                    $unwind: "$category"
                },
                { "$sort": { "createdAt": -1 } },
                { "$limit": limit },
                {
                    $addFields: {
                        "isAlways": true,
                    }
                }
                ]
            }
        },
        {
            $project: {
                tags: {
                    $setUnion: ['$open']
                },
                all: {
                    $setUnion: ['$new', '$bestseller', '$mostreviewed',]
                }
            }
        },
        {
            $project: {
                products: {
                    $map: {
                        input: "$tags",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$all",
                                                as: "two",
                                                cond: { $eq: ["$$two._id", "$$one._id"] }
                                            }
                                        },
                                        0
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $unwind: '$products'
        },
        {
            $replaceRoot: { newRoot: "$products" }
        },
        // {
        //     $limit: limit
        // }
    ])
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

// n1 - $ne - not included operator (because we do not want to return the targeted selected id product)
/* n2 - .distinct: Finds the distinct values for a specified field across a single collection or view and returns the results in an array.
* eg
{ "_id": 1, "dept": "A", "item": { "sku": "111", "color": "red" }, "sizes": [ "S", "M" ] }
{ "_id": 2, "dept": "A", "item": { "sku": "111", "color": "blue" }, "sizes": [ "M", "L" ] }
{ "_id": 3, "dept": "B", "item": { "sku": "222", "color": "blue" }, "sizes": "S" }
{ "_id": 4, "dept": "A", "item": { "sku": "333", "color": "black" }, "sizes": [ "S" ] }
Inventory.distinct( "dept" )
#
[ "A", "B" ]
*/

// n3 - $ inc operator
/* e.g
DOC:
{
  _id: 1,
  sku: "abc123",
  quantity: 10,
  metrics: {
    orders: 2,
    ratings: 3.5
  }
}
UPDATE:
db.products.update(
   { sku: "abc123" },
   { $inc: { quantity: -2, "metrics.orders": 1 } }
)
AFTER UPDATE:
{
   "_id" : 1,
   "sku" : "abc123",
   "quantity" : 8,
   "metrics" : {
      "orders" : 3,
      "ratings" : 3.5
   }
}
*/


// n4 - bulkWrite - Performs multiple write operations with controls for order of execution.


exports.getListApproval = async (req, res) => {
    let order = req.query.order ? req.query.order : -1;
    let sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    let limit = req.query._end ? parseInt(req.query._end) : 20; // default
    let query  = req.query.q ? req.query.q : ''
    let start = req.query._start ? req.query._start : 0

    let queryObj = {}
    if(query.trim().length > 0) {
        queryObj = {
            $text: {
                $search: query
            }
        }
    }

    if(req.isForPets){
        queryObj.isForPets = true
    }


    let count  = await Product.count(queryObj)
    Product.find(queryObj)
        .select("-photo")
        .populate("category")
        .populate("shop")
        .sort([[sortBy, order]])
        .skip(Number(start))
        .limit(limit)
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found."
                });
            }
            res.set('x-total-count', count)
            console.log(products.length);
            res.json(products.map((p) => {

                try {
                    let { name, sold, description, price, quantity, createdAt, updatedAt, images, status, isApproved, category, isArchived, shop, imagePrimary } = p._doc;
                    return ({ "id": p._id, name, sold, description, price, quantity, createdAt, images, updatedAt, "category": category.name, "shop": shop.name, isApproved, status, isArchived, imagePrimary, "shopInspiration": (shop.inspiration = !'' || shop.inspiration) });
                }
                catch (e) {
                    return ({});
                    console.log("SPARKLEERROR: getListApproval");
                }
            }));
        });
};

exports.imageApproval = (req, res) => {

    Product.findOneAndUpdate(
        { "images.id": mongoose.Types.ObjectId(req.params.imageId) },
        {
            "$set": {
                "images.$.isApproved": req.body.isApproved
            }
        },
        function (err, doc) {
            if (err) {
                return res.status(400).json({
                    error: dbErrorHandler(err)
                });
            }

            res.json(doc);
        }
    );

    // const query = {_id: req.params.productId};
    // Product.find(query, (err, product)=> {
    //     if (err) {
    //         return res.status(400).json({
    //             error: dbErrorHandler(err)
    //         });
    //     }
    //     var tempArray = [];
    //     var array = [];
    //     array = product.images;
    //     // console.log(product)
    //     for (let index = 0; index < array.length; index++) {
    //         var imageObj = array[index];
    //         if(index === 1)
    //         {
    //             imageObj.isApproved = req.body.isApproved;
    //             tempArray.push(imageObj);
    //         }else {
    //             tempArray.push(imageObj);
    //         }
    //     }
    //     product.images = tempArray;
    //     product.save((err, result) => {
    //         if (err) {
    //             return res.status(400).json({
    //                 error: `Error on approving product image: ${dbErrorHandler(err)}`
    //             });
    //         }
    //         console.log(product)
    //     res.json(product);
    //     });


    // });
    // const query = {'image.id': req.params.productId};
    // const update = {$set: req.body}
    // Product.findOne({_id: req.params.productId}).then(doc => {
    //     item = doc.images.id(req.params.imageId );
    //     item["isApproved"] = req.body.isApproved;
    //     doc.save();
    //     //sent respnse to client
    //   }).catch((err, data) => {
    //     if (err) {
    //         console.log(err)
    //         return res.status(400).json({
    //             error: "Product image approving not successfull." + err
    //         });
    //     }
    //     res.json(data);
    //   });

    // Product.updateOne({'image.id': req.params.imageId}, {'$set': {
    //     'image.$.isApproved': req.body.isApproved
    // }}, function(err, data) {
    //     if (err) {
    //         return res.status(400).json({
    //             error: "Product image approving not successfull." + err
    //         });
    //     }
    //     res.json(data);
    // })
    // console.log(req.params.imageId)
    // Product.find({"_id": req.params.productId, "images.id": req.params.imageId }, 
    // // {$set: {"isApproved": req.body.isApproved}},
    //  function(err, data) { //images.$.
    //     console.log(err)
    //     console.log(data)
    //     if (err) {
    //         return res.status(400).json({
    //             error: "Product image approving not successfull." + err
    //         });
    //     }
    //     res.json(data);
    // })

    // const query = { _id: req.params.productId };//{ _id: req.params.productId };
    // const update = { $set: { 'images.$[elem].isApproved': req.body.isApproved } };
    // const options = { new: true, arrayFilters: [{ 'elem.id': req.params.imageId }]};
    // Product.findOne(query, (err, data)=> {
    //     if (err) {
    //         return res.status(400).json({
    //             error: "Product image approving not successfull." + err
    //         });
    //     }
    //     // newImagesApproval = data.images.map(function (obj) {
    //     //     return obj.id;
    //     // })
    //     console.log(data.images)
    //     for (let index = 0; index < data.images.length; index++) {
    //         if(index===1) {//data.images[index].id === req.params.imageId.toString()
    //             data.images[index].isApproved = req.body.isApproved;
    //         } 
    //     }
    //     data.images[1].isApproved = true;
    //     data.save()
    //     res.json(data);
    // });


}


/* Homemade */

async function create(req, res) {

    // Check for all fields
    const { name, description, price, category, quantity } = req.body
    if (!name || !description || !price || !category || !quantity) {
        return res.status(400).json({
            error: "All fields must be filled"
        })
    }


    req.body.images = await Promise.all(req.files.map(async (file) => {
        const id = mongoose.Types.ObjectId();

        return ({
            url: `${process.env.IMGIX_SUBDOMAIN}/${file.key}`,
            id: id,
            isApproved: false
        });
    }));


    req.body.shop = req.params.shopId;
    console.log(req.body)
    let product = new Product(req.body);

    var product_images = req.files;
    var arrayofId = product_images.map(function (obj) {
        return obj.id;
    })


    product.save((err, result) => {
        if (err) {
            return res.status(400).json({
                error: `Error on saving product: ${dbErrorHandler(err)}`
            });
        }
        connection.db.collection("productimage.files", function (err, collection) {
            if (err) {
                return res.status(400).json({
                    error: `Error on saving image: ${dbErrorHandler(err)}`
                });
            }
            collection.updateMany({
                _id:
                {
                    $in: arrayofId
                }
            }, {
                $set: { aliases: [result._id.toString()] }
            });
        });
        res.json(result);
    });
}

/* Coop */


async function createShop(req, res) {

    // Check for all fields
    const { name, description, price, category, quantity } = req.body
    if (!name || !description || !price || !category || !quantity) {
        return res.status(400).json({
            error: "All fields must be filled"
        })
    }
    req.body.images = await Promise.all(req.files.map(async (file) => {
        const id = mongoose.Types.ObjectId();

        return ({
            url: `${process.env.IMGIX_SUBDOMAIN}/${file.key}`,
            id: id,
            isApproved: false
        });
    }));

    req.body.store = req.params.shopId;
    let product = new ProductShop(req.body);

    var product_images = req.files;
    var arrayofId = product_images.map(function (obj) {
        return obj.id;
    })


    product.save((err, result) => {
        if (err) {
            return res.status(400).json({
                error: `Error on saving product: ${dbErrorHandler(err)}`
            });
        }
        connection.db.collection("productimage.files", function (err, collection) {
            if (err) {
                return res.status(400).json({
                    error: `Error on saving image: ${dbErrorHandler(err)}`
                });
            }
            collection.updateMany({
                _id:
                {
                    $in: arrayofId
                }
            }, {
                $set: { aliases: [result._id.toString()] }
            });
        });
        res.json(result);
    });
}
