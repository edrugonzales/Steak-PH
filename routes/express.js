const express = require("express");
const router = express.Router();

const { update, updateTransaction, lists, mwExpId, mwOrderId, listOfUser, getById} = require('../controllers/express/request');

router.patch("/request/update/:orderId", update);
router.patch("/request/order/status/:orderId", updateTransaction);
router.patch("/request/list/", lists);
router.get("/list/:userId", listOfUser)
router.get('/request/:requestId', getById)
router.param("id", mwExpId);
router.param("orderId", mwOrderId);

module.exports = router;