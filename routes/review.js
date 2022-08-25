const express = require("express");
const router = express.Router();
const { mwUserById } = require("../controllers/user");
const { create, read, update, remove, getList, mwReviewById, getListShop, getListProduct, getLikesAndDislikesProduct, getLikesAndDislikesShop } = require("../controllers/review");
const { mwRequireSignin, mwIsAuth, mwIsMerchant } = require("../controllers/auth");

// @route  CRUD api/review
// router.get("/", getList);
router.post("/", create);
router.get("/:reviewId", read)
router.delete("/:reviewId", remove);
router.put("/:reviewId", update);

router.get("/list/all", getList); // we can not use /categories directly since /:reviewId will be executed. We need one more level
router.get("/shop/:shopId", getListShop); //
router.get("/product/:productId", getListProduct); //

router.get("/product-rating/:productId", getLikesAndDislikesProduct); //
router.get("/shop-rating/:shopId", getLikesAndDislikesShop); //

router.param("reviewId", mwReviewById)
router.param("userId", mwUserById)

module.exports = router;
