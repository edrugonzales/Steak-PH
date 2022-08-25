const User = require("../models/User");
const Fcm = require("../models/Fcm");
const { Order, CartItem } = require("../models/Order");
const { dbErrorHandler } = require("../helpers/dbErrorHandler");
const mongoose = require("mongoose");
var connection = mongoose.connection;

// MIDDLEWARES - mw
exports.mwUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found!",
      });
    }
    // user has brings all properties from User Model
    req.profile = user;
    next();
  });
};

exports.mwAddOrderToUserHistory = (req, res, next) => {
  let history = [];

  req.body.order.products.forEach((item) => {
    history.push({
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.count,
      amount: req.body.order.amount,
    });
  });

  console.log(req.profile)

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true }, // immediate JSON response
    (error, data) => {

      //Commenting this out temporarily causing a errMsg: {ok: 0, code: 8000, codeName: "AtlasError", name: "MongoError"}

      // if (error) {
      //   return res.status(400).json({
      //     error: "Could not update user purchase history",
      //     errMsg: error
      //   });
      // }

      next();
    }
  );
};
// END MIDDLEWARE

exports.addDeviceToken = (req, res) => {
  const newFcm = new Fcm(req.body);
  newFcm.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    }
    res.json({ data });
  });
};

exports.deleteDeviceToken = (req, res) => {
  Fcm.deleteOne({ token: req.params.id }, function (err) {
    if (err) {
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    }
    res.json({ message: "deleted" });
    // deleted at most one tank document
  });
};

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

// OFFICIAL WAY TO UPDATE - this allow to update by field and return the updated response in immediately
exports.update = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true }, // immediately updated! this send the most recently updated response/doc from database to app
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "You are not authorized to perform this action",
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      res.json(user);
    }
  );
};

exports.getListFavorite = (req, res) => {
  Product.distinct("favoriteList", {}, (err, categories) => {
    // n2
    if (err) {
      return res.status(400).json({
        error: "Categories not found",
      });
    }
    res.json(categories);
  });
};

exports.getListRiders = (req, res) => {
  User.find({ role: 3, deviceId: { $exists: true, $ne: null } }).exec(
    (err, users) => {
      if (err) {
        return res.status(400).json({
          error: dbErrorHandler(err),
        });
      }
      res.json(users);
    }
  );
};

exports.getListPurchaseHistory = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate({
      path: "products._id",
      model: "Product",
    })
    .populate({
      path: "history._id",
      model: "User",
    })
    .populate("user", "_id name address phone photo")
    .populate("assignedRider", "_id name address phone photo")
    .populate("shop", "_id name address status logo")
    .sort({ createdAt: -1 })
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: dbErrorHandler(err),
        });
      }
      res.json(orders);
    });
};

exports.getListPaginatedPurchaseHistory = (req, res) => {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)

  Order.find({ user: req.profile._id })
    .populate({
      path: "products._id",
      model: "Product",
    })
    .populate({
      path: "history._id",
      model: "User",
    })
    .populate("user", "_id name address phone photo")
    .populate("assignedRider", "_id name address phone photo")
    .populate("shop", "_id name address status logo")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: dbErrorHandler(err),
        });
      }
      res.json(orders);
    });
};

exports.addPhoto = (req, res) => {

  try {
    // Update User detail with ID of file
    if (req.file == undefined) {
      return res.status(400).json({
        error: `You must select a file`,
      });
    } else {
      console.log(req.params.userId);
      User.findOneAndUpdate(
        { _id: req.params.userId },
        {
          $set: {
            photo: `${process.env.IMGIX_SUBDOMAIN}/${req.file.key}`,
          },
        },
        { new: true },
        (err, user) => {
          if (err) {
            return res.status(400).json({
              error: "User data not updated.",
            });
          }
          user.hashed_password = undefined;
          user.salt = undefined;
          res.json(user);
        }
      );
    }
  } catch (error) {
    return res.status(400).json({
      error: `Error when trying upload image: ${error}`,
    });
  }
};

exports.getPhoto = (req, res) => {
  connection.db.collection("profilepicture.files", function (err, collection) {
    if (err) {
      res.status(400).json({
        error: dbErrorHandler(err),
      });
    }
    collection
      .find({ aliases: req.params.userId })
      .toArray(function (err, data) {
        if (data.length == 0) {
          return res.status(400).json({
            error: `No available photo file for ${req.params.userId}`,
          });
        }

        if (err) {
          res.status(400).json({
            error: dbErrorHandler(err),
          });
        }
        //Retrieving the chunks from the db
        connection.db.collection(
          "profilepicture.chunks",
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

exports.userSearch = (req, res) => {
  User.find({ name: { $regex: req.body.name, $options: 'i' } })
    .select({
      hashed_password: 0,
      salt: 0,
      birthdate: 0,
      gender: 0,
      address: 0,
      long: 0,
      lat: 0,
      history: 0,
      resetToken: 0,
      location: 0,
      messenger: 0,
    })
    .exec((err, users) => {
      if (err) {
        return res.status(400).json({
          error: dbErrorHandler(err),
        });
      }
      res.json(users);
    });
};

exports.getuserbyid = (req, res) => {
  User.findById(req.params.userId)
    .select({
      hashed_password: 0,
      salt: 0,
      birthdate: 0,
      gender: 0,
      // address: 1,
      long: 0,
      lat: 0,
      // history: 1,
      // resetToken: 1,
      // location: 1,
      // messenger: 1,
    })
    .exec((err, users) => {
      if (err) {
        return res.status(400).json({
          error: dbErrorHandler(err),
        });
      }
      res.json(users);
    });
};

