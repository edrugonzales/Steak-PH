const express = require("express");
const {
  getBroadcasts,
  getBroadcastsByUserId,
  getNotificationBroadcastsByUserId,
  getAdvisoryBroadcastsByUserId,
  getPromotionBroadcastsByUserId,
  getAllNotificationBroadcast,
  getAllAdvisoryBroadcasts,
  getAllPromotionBroadcasts,
  postGeneralBroadcasts,
  postSelectedBroadcasts,
  putBroadcast,
  viewBroadcast,
  deleteBroadcast,
  getGeneralBroadcasts,
  getImage,
  getAllBroadcastsByUserId,
} = require("../controllers/broadcasts");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const { mwIsAuth, mwRequireSignin } = require("../controllers/auth");
const { mwMulterS3 } = require("../helpers/mwMulterS3")
const router = express.Router();

var imagestorage = new GridFsStorage({
  url: process.env.MONGO_KEY.toString(),
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg", "image/jpg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-sparkle-${file.originalname}`;
      return;
    }

    if (req.params.id == undefined) {
      return {
        bucketName: "broadcastImages",
        aliases: ["tobeadded"],
        filename: `${Date.now()}-sparkle-${file.originalname}`,
        metadata: {
          isApproved: false,
        },
      };
    } else {
      return {
        bucketName: "broadcastImages",
        aliases: [req.params.id],
        filename: `${Date.now()}-sparkle-${file.originalname}`,
        metadata: {
          isApproved: false,
        },
      };
    }
  },
});

router.get("/", mwRequireSignin, getBroadcasts);

router.get("/general", mwRequireSignin, getGeneralBroadcasts);

router.get("/all/types/:userId", mwRequireSignin, getAllBroadcastsByUserId);

router.get("/:userId", mwRequireSignin, getBroadcastsByUserId);

router.get(
  "/all/notifications",
  mwRequireSignin,

  getAllNotificationBroadcast
);

router.get(
  "/all/advisory",
  mwRequireSignin,

  getAllAdvisoryBroadcasts
);

router.get(
  "/all/promotions",
  mwRequireSignin,

  getAllPromotionBroadcasts
);

router.get(
  "/notifications/:userId",
  mwRequireSignin,

  getNotificationBroadcastsByUserId
);

router.get(
  "/advisory/:userId",
  mwRequireSignin,

  getAdvisoryBroadcastsByUserId
);

router.get(
  "/promotions/:userId",
  mwRequireSignin,

  getPromotionBroadcastsByUserId
);

router.get("/image/:imageId", getImage);

router.post(
  "/general/post",
  mwRequireSignin,
  mwMulterS3.array("file", 10),
  postGeneralBroadcasts
);

router.post(
  "/selected/post",
  mwRequireSignin,
  mwMulterS3.array("file", 10),
  postSelectedBroadcasts
);

router.put("/:broadcastId", mwRequireSignin, putBroadcast);

router.put("/:broadcastId/:userId", mwRequireSignin, viewBroadcast);

router.delete("/:broadcastId", mwRequireSignin, deleteBroadcast);

module.exports = router;
