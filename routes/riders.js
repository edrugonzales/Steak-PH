const express = require("express");
const router = express.Router();

const { mwUserById } = require("../controllers/user");
const { 
    create, 
    read,
    update, 
    remove, 
    getList, 
    mwRiderById 
} = require("../controllers/riders");
const { mwRequireSignin, mwIsAuth, mwIsMerchant } = require("../controllers/auth");

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
        return filename;
      }
      
      if(req.params.id == undefined) {
        return {
          bucketName: "riderimage",
          aliases: ["tobeadded"],
          filename: `${Date.now()}-sparkle-${file.originalname}`,
          metadata: {
            isApproved: false
          }
        };
  
      } else {
          return {
            bucketName: "riderimage",
            aliases: [req.params.id],
            filename: `${Date.now()}-sparkle-${file.originalname}`,
            metadata: {
              isApproved: false
            }
          };
      }
    }
  });


// @route  CRUD api/category
// router.get("/", getList);
router.post("/:userId", mwRequireSignin, multer({ storage: imagestorage }).array("photo", 10), create);
router.get("/:riderId", read)
router.delete("/:riderId/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, remove);
router.put("/:riderId/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, update);

router.get("/list/all", getList); // we can not use /categories directly since /:categoryId will be executed. We need one more level

router.param("riderId", mwRiderById)
router.param("userId", mwUserById)

module.exports = router;
