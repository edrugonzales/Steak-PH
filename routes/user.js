const express = require("express");
const router = express.Router();

const {
  mwRequireSignin,
  mwIsAuth,
  mwIsMerchant,
} = require("../controllers/auth");

const {
  read,
  update,
  getListFavorite,
  getListPurchaseHistory,
  getListPaginatedPurchaseHistory,
  mwUserById,
  addPhoto,
  getPhoto,
  addDeviceToken,
  deleteDeviceToken,
  getListRiders,
  userSearch,
  getuserbyid,
} = require("../controllers/user");

const { mwMulterS3 } = require("../helpers/mwMulterS3")

const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

var imagestorage = new GridFsStorage({
  url: process.env.MONGO_KEY.toString(),
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-sparkle-${file.originalname}`;
      return filename;
    }

    if (req.params.userId == undefined) {
      return {
        bucketName: "profilepicture",
        aliases: ["tobeadded"],
        filename: `${Date.now()}-sparkle-${file.originalname}`,
      };
    } else {
      return {
        bucketName: "profilepicture",
        aliases: [req.params.userId],
        filename: `${Date.now()}-sparkle-${file.originalname}`,
      };
    }
  },
});

// this requires two headers: application/json and Bearer [token]
// With the token approved, the authorized user can access other user's profiles too.
// But with mwIsAuth we limit this access and the user can only have access to his/her profile.
// With mwIsMerchant on, only admin can have access.
// @route   GET api/user
router.get(
  "/secret/:userId",
  mwRequireSignin,
  mwIsAuth,
  mwIsMerchant,
  (req, res) => {
    res.json({
      user: req.profile,
    });
  }
);

// @route  api/user
router.get("/:userId", mwRequireSignin, mwIsAuth, read);
router.put("/:userId", mwRequireSignin, mwIsAuth, update);
router.get("/byid/:userId", mwRequireSignin, getuserbyid);
router.post(
  "/photo/:userId",
  mwRequireSignin,
  mwIsAuth,
  mwMulterS3.single("file"),
  addPhoto
);
router.get("/photo/:userId", getPhoto);
router.get("/list/rider", getListRiders);
router.get("/list/favorite/:userId", getListFavorite);
router.get("/list/purchase-history/:userId", getListPurchaseHistory);
router.get("/list/paginated-purchase-history/:userId", getListPaginatedPurchaseHistory);
router.post("/device-token", addDeviceToken);
router.delete("/device-token/:id", deleteDeviceToken);
router.post("/search/byname", userSearch);

// Everytime there is a userId, this router will run and make this user info available in the request object
router.param("userId", mwUserById);

module.exports = router;
