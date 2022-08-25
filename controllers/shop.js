const Shop = require("../models/Shop");
const Voucher  = require('../models/Voucher')
const ShopProduct = require("../models/shop/Products");
const PreSave = require("../models/PreSave");
const { dbErrorHandler } = require("../helpers/dbErrorHandler");
const mongoose = require("mongoose");
var connection = mongoose.connection;
const axios = require("axios");
const moment = require("moment");
const _ = require("lodash");
const { getDistance } = require("geolib");

// MIDDLEWARES - mw
exports.mwShopById = (req, res, next, id) => {
  Shop.findById(id).exec((err, shop) => {
    if (err || !shop) {
      return res.status(400).json({
        error: "Shop does not exist",
      });
    }
    req.shop = shop;
    next();
  });
};
// END MIDDLEWARES

exports.create = (req, res) => {
  const newShop = new Shop(req.body);
  newShop.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    }
    res.json({ data });
  });
};

exports.read = (req, res) => {
  return res.json(req.shop);
};

exports.update = (req, res) => {
  console.log('update on shop- ', req.body)
  const query = {_id: mongoose.Types.ObjectId(req.params.shopId)};
  const update = {$set: req.body}
  console.log(query, update)


  Shop.findOneAndUpdate(
      { _id: req.params.shopId },
      update,
      { new: true },
      function(err,doc) {
          if (err) {
              return res.status(400).json({
                  error: dbErrorHandler(err)
              });
          }
          console.log('update on shop', doc)
          return res.json(doc);
      }
  );
};

exports.remove = (req, res) => {
  const shop = req.shop;
  shop.remove((err, data) => {
    if (err) {
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    }
    res.json({
      message: "Shop deleted",
    });
  });
};

exports.getList = (req, res) => {
  Shop.find().exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    }
    res.json(data);
    //TODO: get all REST function for React Admin
    // res.set('x-total-count', data.length)
    // res.json(data.map(d => ({"id": d._id, ...d._doc})));
  });
};

exports.getListApproval = (req, res) => {
  let order = req.query._order ? (req.query._order === "ASC"? -1:1) : -1;
  let sortBy = req.query._sort ? req.query._sort : "updatedAt";
  let end = req.query._end ? parseInt(req.query._end) : 20; // default
  let start = req.query._start ? parseInt(req.query._start) : 0; // default
  let customSort = {updatedAt: order}
  switch (sortBy) {
    case 'name': customSort = { name : order }
      break;
    case 'hasLogo': customSort = { logo : order }
    break;
    case 'hasBanner': customSort = { banner : order }
    break;
    case 'status': customSort = { status : order }
    break;
    case 'isActive': customSort = { isActive : order }
    break;
    case 'createdAt': customSort = { createdAt : order }
    break;
    case 'updatedAt': customSort = { updatedAt : order }
    break;

    default:
      customSort = {updatedAt: order}
      break;
  }

  Shop.aggregate([
    {
     $facet: {
       "data": [ { 
                 $lookup: { 
                     "from": "all-users", 
                     "localField": "user", 
                     "foreignField": "_id", 
                     "as": "user" 
                 },
             },      
             {
              $unwind: "$user"
              
          },   
             { "$sort": customSort },
             { "$skip": start },
             { "$limit": end-start },
         ],
         "totalCount": [
          { "$count": "count" }
        ]
      },
    }
      ])    
      .exec((err, shops) => {
        // console.log(shops)
          if (err) {
              return res.status(400).json({
                  error: "shops not found."
              });
          }
          res.set('x-total-count', shops[0].totalCount[0].count)
          // console.log(shops[0].totalCount[0].count);
          res.json(shops[0].data.map((p) => {
            // console.log(p)
              try {
                
                  let {name, updatedAt, createdAt, user, location, address, isActive, logo, banner, status, preparation, inspiration, pickUpNotes, schedule} = p;
                  return({"id": p._id, name, updatedAt, createdAt,  address, "hasLogo": (logo != ''), "hasBanner": banner != '', "merchantName": user.name, "merchantPhone": user.phone, "merchantEmail": user.email, location, isActive, status, logo, banner, preparation, inspiration, pickUpNotes, schedule});
                }
                catch (e) {
                  return({});
                  console.log("SPARKLEERROR: getListApproval shops");
                }
           }));
      });
};


exports.addLogo = (req, res) => {

  try {
    if (req.file == undefined) {
      return res.status(400).json({
        error: `You must select a file`,
      });
    } else {
      Shop.findOneAndUpdate(
        { _id: req.params.shopId },
        {
          $set: {
            logo: `${process.env.IMGIX_SUBDOMAIN}/${req.file.key}`,
          },
        },
        { new: true },
        (err, shop) => {
          if (err) {
            return res.status(400).json({
              error: "Shop data not updated.",
            });
          }
          res.json(shop);
        }
      );
    }
  } catch (error) {
    return res.status(400).json({
      error: `Error when trying upload image: ${error}`,
    });
  }
};

exports.getLogo = (req, res) => {
  connection.db.collection("logo-shop.files", function (err, collection) {
    if (err) {
      res.status(400).json({
        error: dbErrorHandler(err),
      });
    }
    collection
      .find({ aliases: req.params.shopId })
      .toArray(function (err, data) {
        if (data.length == 0) {
          return res.status(400).json({
            error: `No available logo photo file for ${req.params.shopId}`,
          });
        }

        if (err) {
          res.status(400).json({
            error: dbErrorHandler(err),
          });
        }
        //Retrieving the chunks from the db
        connection.db.collection(
          "logo-shop.chunks",
          function (err, collectionChunks) {
            collectionChunks
              .find({ files_id: data[data.length - 1]._id })
              .sort({ n: 1 })
              .toArray(function (err, chunks) {
                if (err) {
                  return res.render("index", {
                    title: "Download Error",
                    message: "Error retrieving chunks",
                    error: err.errmsg,
                  });
                }
                if (!chunks || chunks.length === 0) {
                  //No data found
                  return res.render("index", {
                    title: "Download Error",
                    message: "No data found",
                  });
                }

                let fileData = [];
                for (let i = 0; i < chunks.length; i++) {
                  //This is in Binary JSON or BSON format, which is stored
                  //in fileData array in base64 endocoded string format

                  fileData.push(chunks[i].data.toString("base64"));
                }

                //Display the chunks using the data URI format
                let finalFile =
                  "data:" +
                  data[0].contentType +
                  ";base64," +
                  fileData.join("");

                const im = finalFile.split(",")[1];

                const img = Buffer.from(im, "base64");

                res.writeHead(200, {
                  "Content-Type": "image/png",
                  "Content-Length": img.length,
                });

                res.end(img);
              });
          }
        );
      });
  });
};

exports.addBanner = (req, res) => {
  try {
    if (req.file == undefined) {
      return res.status(400).json({
        error: `You must select a file`,
      });
    } else {
      Shop.findOneAndUpdate(
        { _id: req.params.shopId },
        {
          $set: {
            banner: `${process.env.IMGIX_SUBDOMAIN}/${req.file.key}`,
          },
        },
        { new: true },
        (err, shop) => {
          if (err) {
            return res.status(400).json({
              error: "Shop data not updated.",
            });
          }
          res.json(shop);
        }
      );
    }
  } catch (error) {
    return res.status(400).json({
      error: `Error when trying upload image: ${error}`,
    });
  }
};

exports.getBanner = (req, res) => {
  connection.db.collection("banner-shop.files", function (err, collection) {
    if (err) {
      res.status(400).json({
        error: dbErrorHandler(err),
      });
    }
    collection
      .find({ aliases: req.params.shopId })
      .toArray(function (err, data) {
        if (data.length == 0) {
          return res.status(400).json({
            error: `No available banner photo file for ${req.params.shopId}`,
          });
        }

        if (err) {
          res.status(400).json({
            error: dbErrorHandler(err),
          });
        }
        //Retrieving the chunks from the db
        connection.db.collection(
          "banner-shop.chunks",
          function (err, collectionChunks) {
            collectionChunks
              .find({ files_id: data[data.length - 1]._id })
              .sort({ n: 1 })
              .toArray(function (err, chunks) {
                if (err) {
                  return res.render("index", {
                    title: "Download Error",
                    message: "Error retrieving chunks",
                    error: err.errmsg,
                  });
                }
                if (!chunks || chunks.length === 0) {
                  //No data found
                  return res.render("index", {
                    title: "Download Error",
                    message: "No data found",
                  });
                }

                let fileData = [];
                for (let i = 0; i < chunks.length; i++) {
                  //This is in Binary JSON or BSON format, which is stored
                  //in fileData array in base64 endocoded string format

                  fileData.push(chunks[i].data.toString("base64"));
                }

                //Display the chunks using the data URI format
                let finalFile =
                  "data:" +
                  data[0].contentType +
                  ";base64," +
                  fileData.join("");

                const im = finalFile.split(",")[1];

                const img = Buffer.from(im, "base64");

                res.writeHead(200, {
                  "Content-Type": "image/png",
                  "Content-Length": img.length,
                });

                res.end(img);
              });
          }
        );
      });
  });
};

exports.getRelatedProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6; // 6 by default
  // find this current category from the selected product but not include itself
  ShopProduct.find({
    _id: { $ne: req.product },
    category: req.product.category,
  }) //n1
    .limit(limit)
    .select("-photo") // activate this for better readability in postman
    .populate("category", "_id name")
    .populate("shop")
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "No products found",
        });
      }
      res.json(products);
    });
};

exports.mwGetShopProductById = (req, res, next, id) => {
  ShopProduct.findById(id)
    .populate("category")
    .populate("store")
    .exec((err, product) => {
      if (err || !product) {
        return res.status(400).json({
          error: "Product not found",
        });
      }

      req.product = product;
      next();
    });
};

exports.getListV2 = (req, res) => {
  let order = req.query.order ? req.query.order : "desc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
  let limit = req.query.limit ? parseInt(req.query.limit) : 6; // default
  let long = req.query.long ? parseFloat(req.query.long) : "";
  let lat = req.query.lat ? parseFloat(req.query.lat) : "";
  if (long === "" || lat === "") return res.json([]);

  Shop.aggregate([
    {
      $facet: {
        new: [
          {
            $match: {
              $and: [
                {
                  isActive: true,
                },
                {
                  name: { $ne: "Sparkle Shop" },
                },
              ],
            },
          },
          {
            $match: {
              location: {
                $geoWithin: {
                  $centerSphere: [[long, lat], 5 / 6378.1],
                },
              },
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 6 },
          {
            $addFields: {
              isNew: true,
              order: 1,
            },
          },
        ],
        //  bestseller: [
        //      {
        //          $lookup: {
        //              "from": "user-shops",
        //              "localField": "shop",
        //              "foreignField": "_id",
        //              "as": "shop"
        //          }
        //      },
        //      {
        //          $unwind: "$shop"
        //      },
        //      {
        //          $lookup: {
        //              "from": "product-categories",
        //              "localField": "category",
        //              "foreignField": "_id",
        //              "as": "category"
        //          }
        //      },
        //      {
        //          $unwind: "$category"
        //      },
        //      {
        //          $match: {
        //             $and:[
        //                 {
        //                     "shop.isActive": true,
        //                 },
        //                 {
        //                     "isApproved": true,
        //                 },
        //                 {
        //                     "isActive": true,
        //                 },
        //                 {
        //                     "shop.name":{$ne: "Sparkle Shop"}
        //                 },
        //                 {
        //                     "isArchived": false
        //                 }
        //              ]
        //          }
        //      },
        //      {
        //          $match: {
        //              "shop.location": {
        //                  $geoWithin: {
        //                      $centerSphere: [[long, lat], 5/6378.1]
        //                  }
        //              }
        //          }
        //      },
        //      { "$sort": { "sold": -1 } },
        //      { "$limit": 6 },
        //      {
        //          $addFields: {
        //              "isBestSeller": true,
        //              "order": 2
        //          }
        //      }
        //  ],
        mostreviewed: [
          {
            $match: {
              $and: [
                {
                  isActive: true,
                },
                {
                  name: { $ne: "Sparkle Shop" },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "reviews",
              localField: "_id",
              foreignField: "shop",
              as: "reviews",
            },
          },
          {
            $addFields: {
              totalReviews: { $sum: { $size: "$reviews.message" } },
            },
          },
          {
            $match: {
              location: {
                $geoWithin: {
                  $centerSphere: [[long, lat], 5 / 6378.1],
                },
              },
            },
          },
          { $sort: { totalReviews: -1 } },
          { $limit: 3 },
          {
            $addFields: {
              isMostReviewed: true,
              order: 3,
            },
          },
        ],
        open: [
          {
            $match: {
              $and: [
                {
                  isActive: true,
                },
                {
                  name: { $ne: "Sparkle Shop" },
                },
              ],
            },
          },
          {
            $match: {
              location: {
                $geoWithin: {
                  $centerSphere: [[long, lat], 5 / 6378.1],
                },
              },
            },
          },
          { $sort: { createdAt: -1 } },
          {
            $addFields: {
              isAvailable: true,
              order: 5,
            },
          },
        ],
      },
    },
    {
      $project: {
        tags: {
          $setUnion: ["$open"],
        },
        all: {
          $setUnion: ["$new", "$mostreviewed"], // '$bestseller'
        },
      },
    },
    {
      $project: {
        shops: {
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
                        cond: { $eq: ["$$two._id", "$$one._id"] },
                      },
                    },
                    0,
                  ],
                },
              ],
            },
          },
        },
      },
    },
    {
      $unwind: "$shops",
    },
    {
      $replaceRoot: { newRoot: "$shops" },
    },
    {
      $sort: {
        order: 1,
      },
    },
    {
      $limit: limit,
    },
  ]).exec(async (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Shops not found.",
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

exports.getListV3 = (req, res) => {
  let order = req.query.order ? req.query.order : "desc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
  let limit = req.query.limit ? parseInt(req.query.limit) : 100; // default
  let long = req.query.long ? parseFloat(req.query.long) : "";
  let lat = req.query.lat ? parseFloat(req.query.lat) : "";
  let place_id =
    req.query.place_id !== undefined ? req.query.place_id : undefined;
  if (long === "" || lat === "") return res.json([]);

  Shop.aggregate([
    {
      $facet: {
        new: [
          {
            $match: {
              $and: [
                {
                  isActive: true,
                },
              ],
            },
          },
          // {
          //   $match: {
          //     location: {
          //       $geoWithin: {
          //         $centerSphere: [[long, lat], 5 / 6378.1],
          //       },
          //     },
          //   },
          // },
          { $sort: { createdAt: -1 } },
          { $limit: 6 },
          {
            $addFields: {
              isNew: true,
              order: 1,
            },
          },
        ],
        mostreviewed: [
          {
            $match: {
              $and: [
                {
                  isActive: true,
                },
              ],
            },
          },
          {
            $lookup: {
              from: "reviews",
              localField: "_id",
              foreignField: "shop",
              as: "reviews",
            },
          },
          {
            $addFields: {
              totalReviews: { $sum: { $size: "$reviews.message" } },
            },
          },
          // {
          //   $match: {
          //     location: {
          //       $geoWithin: {
          //         $centerSphere: [[long, lat], 5 / 6378.1],
          //       },
          //     },
          //   },
          // },
          { $sort: { totalReviews: -1 } },
          { $limit: 3 },
          {
            $addFields: {
              isMostReviewed: true,
              order: 3,
            },
          },
        ],
        open: [
          {
            $match: {
              $and: [
                {
                  isActive: true,
                },
              ],
            },
          },
          // {
          //   $match: {
          //     location: {
          //       $geoWithin: {
          //         $centerSphere: [[long, lat], 5 / 6378.1],
          //       },
          //     },
          //   },
          // },
          { $sort: { createdAt: -1 } },
          {
            $addFields: {
              isAvailable: true,
              order: 5,
            },
          },
        ],
      },
    },
    {
      $project: {
        tags: {
          $setUnion: ["$open"],
        },
        all: {
          $setUnion: ["$new", "$mostreviewed"], // '$bestseller'
        },
      },
    },
    {
      $project: {
        shops: {
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
                        cond: { $eq: ["$$two._id", "$$one._id"] },
                      },
                    },
                    0,
                  ],
                },
              ],
            },
          },
        },
      },
    },
    {
      $unwind: "$shops",
    },
    {
      $replaceRoot: { newRoot: "$shops" },
    },
    {
      $sort: {
        order: 1,
        createdAt: -1
      },
    },
    {
      $limit: limit,
    },
  ]).exec(async (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Shops not found.",
      });
    }


    //return res.json(products)

    //FIXME: get all REST function for React Admin
    // res.set('x-total-count', products.length)

    let originAddress;
    let placeId = place_id === undefined ? "Others" : place_id;
    let newData;

    //Look for a presave data
    const result = await PreSave.findOne({
      user_id: mongoose.Types.ObjectId(req.params.userId),
    })
      .lean()
      .exec();


    if (!result || moment(result.date_created).isBefore(moment(), "day")) {
      newData = await Promise.all(
        products.map(async (v) => {
          let _d;
          const geolocation = v.location.coordinates;

          let theDistance =
            getDistance(
              { latitude: lat, longitude: long },
              { latitude: geolocation[1], longitude: geolocation[0] }
            ) / 1000;
          let theComputedDistance = theDistance * 0.3 + theDistance;
          // v.shopDistance = distance.text;
          // v.deliveryFee = floatDistance > 2 ? ((floatDistance - 2) * 10) + 45 : 45;

          //get the voucher information here
          let vouchers = v?.vouchers ? await Promise.all(v?.vouchers.map(async (voucher) => {
            let foundVoucher = await Voucher.findById(voucher).exec()
            return foundVoucher
          })): []
          _d = {
            ...v,
            shopId: v._id,
            shopDistance: `${theComputedDistance.toFixed(2)} km`,
            shopDistanceDouble: theComputedDistance,
            deliveryFee: Math.round(
              theComputedDistance > 2 ? (theComputedDistance - 2) * 10 + 45 : 45
            ),
            vouchers: vouchers
          };
          // await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=heading=90:,${long}&destinations=${geolocation[1]},${geolocation[0]}&key=AIzaSyAl7tRNhYX6XJn9nIDO7dyqpLcmA4Vl_pc`).then(response => {
          //     const { distance, duration, status } = response.data.rows[0].elements[0];
          //     const floatDistance = parseFloat(distance.text.replace('km', ''));

          //     originAddress = response.data.origin_addresses[0];
          //     if (status === "NOT_FOUND") return;

          //     v.shopDistance = distance.text;
          //     v.deliveryFee = floatDistance > 2 ? ((floatDistance - 2) * 10) + 45 : 45;
          //     _d = {
          //         ...v,
          //         shopId: v._id,
          //         shopDistance: v.shopDistance = distance.text,
          //         deliveryFee: v.deliveryFee = floatDistance > 2 ? ((floatDistance - 2) * 10) + 45 : 45
          //     }
          // });

          return {
            ..._d,
          };
        })
      );

      let saveData = {
        user_id: mongoose.Types.ObjectId(req.params.userId),
        location: originAddress,
        coordinates: [lat, long],
        place_id: placeId,
        shops: JSON.stringify(newData),
      };

      if (result && moment(result.date_created).isBefore(moment(), "day")) {
        await PreSave.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(req.params.userId) },
          saveData
        ).lean();
      } else {
        const data = new PreSave(saveData);
        await data.save(saveData);
      }


    } else {
      let _typeData;
      if (place_id === undefined) {
        _typeData = result;
      } else {
        const existing = await PreSave.findOne({
          user_id: mongoose.Types.ObjectId(req.params.userId),
          place_id: place_id,
        })
          .lean()
          .exec();
        _typeData = existing;
      }

      newData = await Promise.all(
        JSON.parse(_typeData.shops).map(async (v) => {
          let _d = products.filter((p) => p._id.toString() === v.shopId);
          if (!_d) return;
          return {
            ..._d,
            ...v,
          };
        })
      );
    }

    // return res.json(newData);

    let sortByLocation = _.sortBy(newData, "shopDistanceDouble");
    return res.json(sortByLocation);
  });
};


exports.getListV4 = (req, res) => {
  let order = req.query.order ? req.query.order : "desc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
  let limit = req.query.limit ? parseInt(req.query.limit) : 100; // default
  let long = req.query.long ? parseFloat(req.query.long) : "";
  let lat = req.query.lat ? parseFloat(req.query.lat) : "";
  let place_id =
    req.query.place_id !== undefined ? req.query.place_id : undefined;
  if (long === "" || lat === "") return res.json([]);

  Shop.aggregate([
    {
      $facet: {
        new: [
          {
            $match: {
              $and: [
                {
                  isActive: true,
                },
              ],
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 6 },
          {
            $addFields: {
              isNew: true,
              order: 1,
            },
          },
        ],
        mostreviewed: [
          {
            $match: {
              $and: [
                {
                  isActive: true,
                },
              ],
            },
          },
          {
            $lookup: {
              from: "reviews",
              localField: "_id",
              foreignField: "shop",
              as: "reviews",
            },
          },
          {
            $addFields: {
              totalReviews: { $sum: { $size: "$reviews.message" } },
            },
          },
          { $sort: { totalReviews: -1 } },
          { $limit: 3 },
          {
            $addFields: {
              isMostReviewed: true,
              order: 3,
            },
          },
        ],
        open: [
          {
            $match: {
              $and: [
                {
                  isActive: true,
                },
              ],
            },
          },
          { $sort: { createdAt: -1 } },
          {
            $addFields: {
              isAvailable: true,
              order: 5,
            },
          },
        ],
      },
    },
    {
      $project: {
        tags: {
          $setUnion: ["$open"],
        },
        all: {
          $setUnion: ["$new", "$mostreviewed"], // '$bestseller'
        },
      },
    },
    {
      $project: {
        shops: {
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
                        cond: { $eq: ["$$two._id", "$$one._id"] },
                      },
                    },
                    0,
                  ],
                },
              ],
            },
          },
        },
      },
    },
    {
      $unwind: "$shops",
    },
    {
      $replaceRoot: { newRoot: "$shops" },
    },
    {
      $sort: {
        createdAt: -1,
        order: 1,
      },
    },
    {
      $limit: limit,
    },
  ]).exec(async (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Shops not found.",
      });
    }


    //return res.json(products)

    //FIXME: get all REST function for React Admin
    // res.set('x-total-count', products.length)

    let originAddress;
    let placeId = place_id === undefined ? "Others" : place_id;
    let newData;

    //Look for a presave data
    const result = await PreSave.findOne({
      user_id: mongoose.Types.ObjectId(req.params.userId),
    })
      .lean()
      .exec();

      newData = await Promise.all(
        products.map(async (v) => {
          let _d;
          const geolocation = v.location.coordinates;

          let theDistance =
            getDistance(
              { latitude: lat, longitude: long },
              { latitude: geolocation[1], longitude: geolocation[0] }
            ) / 1000;
          let theComputedDistance = theDistance * 0.3 + theDistance;
          // v.shopDistance = distance.text;
          // v.deliveryFee = floatDistance > 2 ? ((floatDistance - 2) * 10) + 45 : 45;

          //get the voucher information here
          let vouchers = v?.vouchers ? await Promise.all(v?.vouchers.map(async (voucher) => {
            let foundVoucher = await Voucher.findById(voucher).exec()
            return foundVoucher
          })): []
          _d = {
            ...v,
            shopId: v._id,
            shopDistance: `${theComputedDistance.toFixed(2)} km`,
            shopDistanceDouble: theComputedDistance,
            deliveryFee: Math.round(
              theComputedDistance > 2 ? (theComputedDistance - 2) * 13.25 + 45 : 45
            ),
            vouchers: vouchers
          };

          return {
            ..._d,
          };
        })
      );

    

    let sortByLocation = _.sortBy(newData, "shopDistanceDouble");
    return res.json(sortByLocation);
  });
};




exports.getDistanceAndDeliveryFee = (req, res) => {
  let distance =
    getDistance(
      {
        latitude: req.query.from_lat,
        longitude: req.query.from_lng,
      },
      {
        latitude: req.query.to_lat,
        longitude: req.query.to_lng,
      }
    ) / 1000;

  let theComputedDistance = distance * 0.3 + distance;

  res.json({
    distance: `${theComputedDistance.toFixed(2)} km`,

    deliveryFee: Math.round(
      theComputedDistance > 2 ? (theComputedDistance - 2) * 13.25 + 45 : 45
    ),
  });
};


exports.searchShop = (req, res) => {
  const name = req.body.name

  Shop.find({name: new RegExp(name, 'i')}, function(err, result){
    if(err) 
      return res.status(400).json({
        error: dbErrorHandler(err)
      })
    res.json(result)
   
  })
}