const express = require("express");
const router = express.Router();
const {
  create,
  createByType,
  read,
  remove,
  update,
  getList,
  getListSearch,
  getListRelated,
  getListCategory,
  postListBySearch,
  mwPhoto,
  mwProductById,
  getImage,
  getListByShop,
  addImage,
  getListv2,
  getListByType,
  getListByStore,
  getListByCategory
} = require("../controllers/product");
const { mwRequireSignin, mwIsAuth, mwIsMerchant } = require("../controllers/auth");
const { mwUserById } = require("../controllers/user");
const { mwMulterS3 } = require("../helpers/mwMulterS3")

const multer = require("multer");


const GridFsStorage = require("multer-gridfs-storage");
const mongoose = require('mongoose');
var connection = mongoose.connection;


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
        bucketName: "productimage",
        aliases: ["tobeadded"],
        filename: `${Date.now()}-sparkle-${file.originalname}`,
        metadata: {
          isApproved: false
        }
      };

    } else {
      return {
        bucketName: "productimage",
        aliases: [req.params.id],
        filename: `${Date.now()}-sparkle-${file.originalname}`,
        metadata: {
          isApproved: false
        }
      };
    }
  }
});



// CRUD
// @route  CRUD api/product
router.post("/list/by-search", postListBySearch);
router.post("/image/:id", mwMulterS3.array("file", 10), addImage);
router.post("/imageBrowser/:id", mwMulterS3.array("file", 10), addImage);

// router.get("/", getList);
router.get("/:productId", read);
router.post("/:shopId", mwRequireSignin, mwMulterS3.array("file", 10), create); //mwIsMerchant
router.post("/:shopId/:type", mwRequireSignin, mwMulterS3.array("file", 10), createByType);
router.delete("/:productId/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, remove); // user is requested here because it makes sure that only an admin account can delete a product.
router.put("/:productId/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, update);
// router.put("/coop/:productId/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, update); //coop product update


// END CRUD
//LISTS
router.get("/list/all", getList);
router.get("/list/all2", getListv2)
router.get("/list/search", getListSearch);
router.get("/list/related/:productId", getListRelated);
router.get("/list/category", getListCategory);
router.get("/list/shop/:shopId", getListByShop);
router.get("/list/store/:storeId", getListByStore);

router.get("/list/category/:categoryId", getListByCategory)

router.get("/list/all/shop", getListByType);
// END LISTS

router.get("/photo/:productId", mwPhoto);
router.get("/image/:imageId", getImage);

router.param("userId", mwUserById);
router.param("productId", mwProductById);

module.exports = router;