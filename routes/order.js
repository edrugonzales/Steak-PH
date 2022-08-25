const express = require("express");
const router = express.Router();

const { mwRequireSignin, mwIsAuth, mwIsMerchant } = require("../controllers/auth");
const { mwUserById, mwAddOrderToUserHistory } = require("../controllers/user");
const { mwOrderById,mwOrderByTransactionId, create, getListOrders, getStatusValues, updateOrderStatus, read, getListOrdersByShop} = require("../controllers/order");

// @ routes api/order/...
// @ desc Add a new order
router.post("/create/:userId", mwRequireSignin, mwIsAuth, mwAddOrderToUserHistory, create);
router.get("/list/all/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, getListOrders)
router.get("/:orderId", read);
router.get("/tid/:transactionId", read);
router.get("/list/all/shop/:shopId", getListOrdersByShop);
router.get("/list/all", getListOrders)
// @ desc get the value of enum for order status ["Not processed", "Processing", "Shipped", "Delivered", "Cancelled"]
router.get("/status-values/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, getStatusValues)
router.put("/:orderId/status/:userId", updateOrderStatus)
router.patch("/:orderId/status/:userId", updateOrderStatus)


router.param("userId", mwUserById);
router.param("orderId", mwOrderById);
router.param("transactionId", mwOrderByTransactionId);

module.exports = router;
