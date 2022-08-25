const express = require("express");
const router = express.Router();

const { mwUserById } = require("../controllers/user");
const { searchShop, create, read, update, remove, getList, mwShopById, addLogo, getLogo, addBanner, getBanner, getRelatedProducts, mwGetShopProductById, getListV2, getListV3, getDistanceAndDeliveryFee, getListV4 } = require("../controllers/shop");
const { mwRequireSignin, mwIsAuth, mwIsMerchant } = require("../controllers/auth");

const { mwMulterS3 } = require("../helpers/mwMulterS3")

const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

const ShopProduct = require('../models/shop/Products');

var logoimagestorage = new GridFsStorage({
  url: process.env.MONGO_KEY.toString(),
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-sparkle-${file.originalname}`;
      return filename;
    }

    if (req.params.shopId == undefined) {
      return {
        bucketName: "logo-shop",
        aliases: ["tobeadded"],
        filename: `${Date.now()}-sparkle-${file.originalname}`
      };

    } else {
      return {
        bucketName: "logo-shop",
        aliases: [req.params.shopId],
        filename: `${Date.now()}-sparkle-${file.originalname}`
      };
    }
  }
});

var bannerimagestorage = new GridFsStorage({
  url: process.env.MONGO_KEY.toString(),
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-sparkle-${file.originalname}`;
      return filename;
    }

    if (req.params.shopId == undefined) {
      return {
        bucketName: "banner-shop",
        aliases: ["tobeadded"],
        filename: `${Date.now()}-sparkle-${file.originalname}`
      };

    } else {
      return {
        bucketName: "banner-shop",
        aliases: [req.params.shopId],
        filename: `${Date.now()}-sparkle-${file.originalname}`
      };
    }
  }
});

// @route  CRUD api/shop
// router.get("/", getList);

router.post('/search', searchShop)
router.post("/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, create);
router.get("/:shopId", read)
router.delete("/:shopId/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, remove);
router.put("/:shopId/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, update);

router.post("/logo/:shopId", mwMulterS3.single("file"), addLogo); //mwRequireSignin, mwIsAuth,
router.get("/logo/:shopId", getLogo);

router.post("/banner/:shopId", mwMulterS3.single("file"), addBanner); //mwRequireSignin, mwIsAuth,
router.get("/banner/:shopId", getBanner);

router.get("/list/all", getList); // we can not use /categories directly since /:shopId will be executed. We need one more level
router.get("/list/allv2", getListV2);
router.get("/list/all/:userId", getListV4);
router.get('/products/related/:productId', getRelatedProducts)


router.param("shopId", mwShopById)
router.param("userId", mwUserById)
router.param("productId", mwGetShopProductById)

module.exports = router;
