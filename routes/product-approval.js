const express = require("express");
const router = express.Router();
const {
    create,
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
    getListApproval,
    imageApproval
} = require("../controllers/product");
const { mwRequireSignin, mwIsAuth, mwIsMerchant } = require("../controllers/auth");
const { mwUserById } = require("../controllers/user");

const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const mongoose = require('mongoose');
var connection = mongoose.connection;


var imagestorage = new GridFsStorage({
    url: process.env.MONGO_KEY.toString(),
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
      const match = ["image/png", "image/jpeg"];
      
      if (match.indexOf(file.mimetype) === -1) {
        const filename = `${Date.now()}-sparkle-${file.originalname}`;
        return filename;
      }
      
      if(req.params.id == undefined) {
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

showreq = (req, res, next) => {
  console.log('req.body', req.body);
  next()
}



// CRUD
// @route  CRUD api/product
router.get("/",showreq, getListApproval);
router.get("/:productId",showreq, read);
// router.post("/:shopId", mwRequireSignin, multer({ storage: imagestorage }).array("file", 10), create); //mwIsMerchant
router.delete("/:productId/", showreq, remove); // user is requested here because it makes sure that only an admin account can delete a product.
router.patch("/:productId", showreq, update);
router.put("/:productId", showreq, update);
router.post("/:productId", showreq, update);

router.put("/image/:imageId/:productId", showreq, imageApproval);
// FIXME: add image on product via backoffice

// END CRUD
//LISTS
// router.get("/list/all", getList);
// router.get("/list/search", getListSearch);
// router.get("/list/related/:productId", getListRelated);
// router.get("/list/category", getListCategory);
// router.get("/list/shop/:shopId", getListByShop);
// router.post("/list/by-search", postListBySearch);
// END LISTS

router.get("/photo/:productId", mwPhoto);
router.get("/image/:imageId", getImage);

router.param("userId", mwUserById);
router.param("productId", mwProductById);

module.exports = router;