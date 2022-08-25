const express = require("express");
const router = express.Router();

const { mwUserById } = require("../controllers/user");
const { create, read, update, remove, getList, getListByType, mwCategoryById } = require("../controllers/category");
const { mwRequireSignin, mwIsAuth, mwIsMerchant } = require("../controllers/auth");

// @route  CRUD api/category
// router.get("/", getList);
router.post("/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, create);
router.get("/:categoryId", read)
router.delete("/:categoryId/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, remove);
router.put("/:categoryId/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, update);

router.get("/list/all", getList); // we can not use /categories directly since /:categoryId will be executed. We need one more level
router.get("/list/all/:type", getListByType); // we can not use /categories directly since /:categoryId will be executed. We need one more level

router.param("categoryId", mwCategoryById)
router.param("userId", mwUserById)

module.exports = router;
