const express = require("express");
const router = express.Router();

const { mwRequireSignin, mwIsAuth, mwIsMerchant } = require("../controllers/auth");
const { mwUserById, mwAddOrderToUserHistory } = require("../controllers/user");
const { sms, mwOrderById, create, getListOrders, getStatusValues, updateOrderStatus, read, getListOrderByFilter,getListOrderByFilterTime, getListOrdersForDelivery, assignRider, getOrdersByRider, getOrdersByRiderDelivered, getNotProcessedOrders} = require("../controllers/order");




// // CRUD
// // @route  CRUD api/product
// router.get("/",showreq, getListApproval);
// router.get("/:productId",showreq, read);
// // router.post("/:shopId", mwRequireSignin, multer({ storage: imagestorage }).array("file", 10), create); //mwIsMerchant
// router.delete("/:productId/", showreq, remove); // user is requested here because it makes sure that only an admin account can delete a product.
// router.patch("/:productId", showreq, update);
// router.put("/:productId", showreq, update);
// router.post("/:productId", showreq, update);

// router.put("/image/:imageId/:productId", showreq, imageApproval);
// // TODO: add image on product

// // END CRUD
// //LISTS
// // router.get("/list/all", getList);
// // router.get("/list/search", getListSearch);
// // router.get("/list/related/:productId", getListRelated);
// // router.get("/list/category", getListCategory);
// // router.get("/list/shop/:shopId", getListByShop);
// // router.post("/list/by-search", postListBySearch);
// // END LISTS

// router.get("/photo/:productId", mwPhoto);
// router.get("/image/:imageId", getImage);

// router.param("userId", mwUserById);
// router.param("productId", mwProductById);



// @ routes api/order/...
// @ desc Add a new order
router.get("/", getListOrdersForDelivery)
router.get("/upcoming", getNotProcessedOrders)
router.get("/list", getListOrderByFilter)
router.get("/date", getListOrderByFilterTime) //?start=10-1-15&end=10-5-15
router.get("/:orderId", read);
router.put("/rider/:orderId", assignRider);
router.get("/rider/:userId", getOrdersByRider);
router.get("/list/delivered/:userId", getOrdersByRiderDelivered);
router.put("/:orderId/status/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, updateOrderStatus)
router.post("/create/:userId", mwRequireSignin, mwIsAuth, mwAddOrderToUserHistory, create);
router.get("/list/all/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, getListOrders)
router.post("/sms", sms);

// @ desc get the value of enum for order status ["Not processed", "Processing", "Shipped", "Delivered", "Cancelled"]
// router.get("/status-values/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, getStatusValues)
// router.put("/:orderId/status/:userId", mwRequireSignin, mwIsAuth, mwIsMerchant, updateOrderStatus)


router.param("userId", mwUserById);
router.param("orderId", mwOrderById);

module.exports = router;
