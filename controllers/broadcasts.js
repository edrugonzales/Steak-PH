const Broadcast = require("../models/Broadcast");
const FCM = require("../models/Fcm");
const mongoose = require("mongoose");
const { dbErrorHandler } = require("../helpers/dbErrorHandler");
const fetch = require("node-fetch");
var connection = mongoose.connection;

//Get All created broadcasts
exports.getBroadcasts = (req, res) => {
  Broadcast.find({})
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      return res.json(data);
    });
};

//Get general and selected Notification broadcasts
exports.getAllBroadcastsByUserId = (req, res) => {
  Broadcast.find({
    $or: [{ targetUsers: req.params.userId }, { target: "General" }],
    published: true,
  })
    .populate("targetUsers")
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      let finalData = []

      for (let index = 0; index < data.length; index++) {
        finalData.push({ ...data[index]._doc, isRead: data[index].viewedBy.includes(req.params.userId) })
      }


      return res.json(finalData);

    });

  // Broadcast.aggregate([
  //   {
  //     $match: {
  //       $or: [{$and: [{targetUsers: req.params.userId}, { target: "Selected" }]}, { target: "General" }],
  //       published: true,
  //     }
  //   },
  //   {
  //     $addFields: {
  //       'isRead': {$in: [{$toObjectId: req.params.userId}, "$viewedBy"]} 
  //     }
  //   }
  // ])
  //   .sort({ createdAt: -1 })
  //   .exec((err, data) => {
  //     if (err) {
  //       return res.status(400).json({
  //         error: err,
  //       });
  //     }

  //     return res.json(data);
  //   });
};


//Get all General broadcasts
exports.getGeneralBroadcasts = (req, res) => {
  Broadcast.find({ target: "General" })
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      return res.json(data);
    });
};

//Get all broadcasts by user id
exports.getBroadcastsByUserId = (req, res) => {
  Broadcast.find({
    $or: [{ targetUsers: req.params.userId }, { target: "General" }],
  })
    .populate("targetUsers")
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      return res.json(data);
    });
};

//Get general and selected Notification broadcasts
exports.getNotificationBroadcastsByUserId = (req, res) => {
  Broadcast.find({
    $or: [{ targetUsers: req.params.userId }, { target: "General" }],
    type: "Notification",
    published: true,
  })
    .populate("targetUsers")
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      return res.json(data);
    });
};

//Get general and selected advisory broadcasts
exports.getAdvisoryBroadcastsByUserId = (req, res) => {
  Broadcast.find({
    $or: [{ targetUsers: req.params.userId }, { target: "General" }],
    type: "Advisory",
    published: true,
  })
    .populate("targetUsers")
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      return res.json(data);
    });
};

//Get general and selected promotion broadcasts
exports.getPromotionBroadcastsByUserId = (req, res) => {
  Broadcast.find({
    $or: [{ targetUsers: req.params.userId }, { target: "General" }],
    type: "Promotion",
    published: true,
  })
    .populate("targetUsers")
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      return res.json(data);
    });
};

//Get all notification broadcasts
exports.getAllNotificationBroadcast = (req, res) => {
  Broadcast.find({
    type: "Notification",
  })
    .populate("targetUsers")
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      return res.json(data);
    });
};

//Get all advisory broadcasts
exports.getAllAdvisoryBroadcasts = (req, res) => {
  Broadcast.find({
    type: "Advisory",
  })
    .populate("targetUsers")
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      return res.json(data);
    });
};

//Get all promotion broadcasts
exports.getAllPromotionBroadcasts = (req, res) => {
  Broadcast.find({
    type: "Promotion",
  })
    .populate("targetUsers")
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      return res.json(data);
    });
};

//Post a general users broadcast
exports.postGeneralBroadcasts = async (req, res) => {
  try {
    const { title, body, createdBy } = req.body;

    if (!title || !body || !createdBy) {
      return res.status(400).json({
        error: `All fields must be filled`,
      });
    }

    // req.body.images = req.files.map(function (obj) {
    //   return {
    //     url: `${process.env.REACT_APP_API_URL}/broadcasts/image/${obj.id}`,
    //     id: obj.id,
    //   };
    // });

    req.body.images = await Promise.all(req.files.map(async (file) => {
      const id = mongoose.Types.ObjectId();

      return ({
        url: `${process.env.IMGIX_SUBDOMAIN}/${file.key}`,
        id: id,
      });

    }));

    let broadcast = new Broadcast({
      ...req.body,
      target: "General",
    });

    var broadcast_images = req.files;
    var arrayofId = broadcast_images.map(function (obj) {
      return obj.id;
    });

    broadcast.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: `Error on posting alert: ${dbErrorHandler(err)}`,
        });
      }

      if (result.published) {
        global.io.emit("receive-general-broadcasts", {
          ...result?._doc,
          isRead: false,
        });
      }





      return res.json(result);
    });
  } catch (error) {
    console.log(error);
  }
};

//Post a selected users broadcast
exports.postSelectedBroadcasts = async (req, res) => {
  const { title, body, createdBy, targetUsers } = req.body;

  if (!title || !body || !createdBy || !targetUsers) {
    return res.status(400).json({
      error: `title, body, createdBy, targetUsers must be filled`,
    });
  }

  // req.body.images = req.files.map(function (obj) {
  //   return {
  //     url: `${process.env.REACT_APP_API_URL}/broadcasts/image/${obj.id}`,
  //     id: obj.id,
  //   };
  // });



  req.body.images = await Promise.all(req.files.map(async (file) => {
    const id = mongoose.Types.ObjectId();

    return ({
      url: `${process.env.IMGIX_SUBDOMAIN}/${file.key}`,
      id: id,
    });

  }));


  let broadcast = new Broadcast({ ...req.body, target: "Selected" });
  var broadcast_images = req.files;
  var arrayofId = broadcast_images.map(function (obj) {
    return obj.id;
  });

  broadcast.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: `Error on posting alert: ${dbErrorHandler(err)}`,
      });
    }

    console.log(targetUsers)

    if (result.published) {
      for (let index = 0; index < result?.targetUsers.length; index++) {
        global.io.emit(`receive-selected-broadcasts-${result?.targetUsers[index]?._id}`, {
          ...result?._doc,
          isRead: false,
        })
      }
    }


    //Send Push Notification

    //Getting registration ids
    FCM.find({ user: { $in: targetUsers } }).exec((err, data) => {
      if (err) {
        console.log(err);
      }
      // console.log(data);
      if (!data) {
        console.log("No fcm tokens found");
      } else {
        let reg_ids = data.flatMap(function (obj) {
          return obj.token;
        });
        // console.log(reg_ids);
        sendFirebaseNotification(title, body, false, reg_ids);
      }
    });

    //todo General Notification

    return res.json(result);
  });
};

//Update an broadcast
exports.putBroadcast = (req, res) => {
  Broadcast.findOneAndUpdate({ _id: req.params.broadcastId }, req.body).exec(
    (err, result) => {
      if (err) {
        return res.status(400).json({
          error: `Error on updating alert: ${dbErrorHandler(err)}`,
        });
      }

      return res.json(result);
    }
  );
};

//If user viewed the broadcast this will add the user id on the list
exports.viewBroadcast = (req, res) => {
  Broadcast.findOneAndUpdate(
    { _id: req.params.broadcastId },
    { $addToSet: { viewedBy: req.params.userId } }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: `Error on updating alert: ${dbErrorHandler(err)}`,
      });
    }
  });

  //Get the latest document
  Broadcast.find({ _id: req.params.broadcastId }).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: `Error on updating alert: ${dbErrorHandler(err)}`,
      });
    }

    return res.json(result);
  });
};

//Delete an broadcast
exports.deleteBroadcast = (req, res) => {
  Broadcast.findOneAndDelete({ _id: req.params.broadcastId }).exec(
    (err, result) => {
      if (err) {
        return res.status(400).json({
          error: `Error on deleting alert: ${dbErrorHandler(err)}`,
        });
      }

      return res.json(result);
    }
  );
};

//Function for getting the image
exports.getImage = (req, res) => {
  connection.db.collection("broadcastImages.files", function (err, collection) {
    collection
      .find({ _id: mongoose.Types.ObjectId(req.params.imageId) })
      .toArray(function (err, data) {
        // console.log(data);
        if (data.length === 0) {
          res.redirect(
            "https://via.placeholder.com/480x480?text=Image+Not+Approved"
          );
          // res.writeHead(200, {'Content-Type': 'text/plain' });
          res.writeHead(403);
          return res.end();
        }
        //Retrieving the chunks from the db
        connection.db.collection(
          "broadcastImages.chunks",
          function (err, collectionChunks) {
            collectionChunks
              .find({ files_id: data[0]._id })
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

//Handle Firebase notifications
function sendFirebaseNotification(
  title,
  body,
  isMerchant = false,
  registration_ids = []
) {
  var notification = {};

  if (isMerchant) {
    notification = {
      title: title,
      body: text,
      sound: "alarm_02.wav",
      android_channel_id: "SHOP_ORDERS",
    };
  } else {
    notification = {
      title: title,
      body: body,
      sound: "alarm_02.wav",
      android_channel_id: "SHOP_ORDERS",
    };
  }

  var notification_body = {
    notification: notification,
    registration_ids: registration_ids,
  };

  fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      // replace authorization key with your key
      Authorization:
        "key=" +
        (isMerchant
          ? "AAAAEDZLuWA:APA91bEcCG8O9HukxKIBMJbxjIcDVlgHhmy9BAjsKJww4HRmKTKwcLRytr-qrjTUDn9SQuSq7VKgBNgAawptoG_nt_XGG-cGHdU4bBenOwsbd88Dnldk8Fo_nG2qhdya-6BKsVa7E0vC"
          : "AAAAjxsgNKw:APA91bG8jp1iYMOVJiyAyQG7IO0oM5pwfCFYDN_bjwJk6QwMp4JClKj7zMZFBjAeFZyH9zL_4Ik9-eOmqa-ZOuuK4jXj8ditsQJuroN3ZAj2rdFdDGDK0tQm3qqd9WhILcP-5wlZIddz"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notification_body),
  })
    .then(function (response) {
      // console.log(response.body);
      console.log(
        `FCM logs sent to ios - success - ${response.body.success} - failure - ${response.body.failure} - isMerchant - ${isMerchant}`
      );
    })
    .catch(function (error) {
      console.error(error);
    });
}
