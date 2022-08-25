const express = require("express");
const { mwRequireSignin } = require("../controllers/auth");
const {
  getVortexToken,
  getVortexProducts,
  getTopupTransactionByRefNumber,
  getBillers,
  getBillerDetailsById,
  createBillsPaymentTransaction,
  getBillingTransactionByRefNumber,
  getBillingTransactionByClientRequestId,
  getBillingTransactionHistory,
  getTopupTransactionByClientRequestId,
  createVortexTopupTransaction,
  getPins,
  getWallets,
  getAllGiftCategories,
  createPurchaseGiftTransactions,
  getAllGiftSubCategories,
  saveTopUpTransaction,
  saveBillsPaymentTransaction,
  saveGiftTransaction,
  getAllTopUpTransactionByUserId,
  getAllBillsPaymentTransactionByUserId,
  getAllGiftTransactionByUserId,
  getAllVortexTransactionByUserId,
  getVortexTransactionByRefId,
  updateVortexTransaction,
  getGiftTransactionByRefId,
  getAllVortexTransactionsForPayment,
  sendVortexDiscordRefund,
  getVortexTransactionByDocId,
  getAllVortexTransactions,
  getAllVortexTransactionsByDateRange,
  syncTransactions
} = require("../controllers/vortex");

const router = express.Router();

router.get("/token", getVortexToken);

router.get("/products", getVortexProducts);

//TOPUP SERVICE ENDPOINTS

router.post("/topup", mwRequireSignin, createVortexTopupTransaction);

router.get("/topup/:refNumber", getTopupTransactionByRefNumber);

router.get(
  "/topup/clientRequestId/:clientRequestId",
  getTopupTransactionByClientRequestId
);

//BILLING SERVICE ENDPOINTS

router.get("/bills-payment/billers", getBillers);

router.get("/bills-payment/billers/:billerId", getBillerDetailsById);

router.post("/bills-payment", mwRequireSignin, createBillsPaymentTransaction);

router.get("/bills-payment/:refNo", getBillingTransactionByRefNumber);

router.get(
  "/bills-payment/clientRequestId/:clientRequestId",

  getBillingTransactionByClientRequestId
);

router.get(
  "/bills-payment/history",

  getBillingTransactionHistory
);

//PIN SERVICE ENDPOINTS

router.get("/pins", getPins);

//WALLET SERVICE ENDPOINTS

router.get("/wallets", getWallets);

//GIFT SERVICE ENDPOINTS
router.get("/gift/categories", getAllGiftCategories);

router.get("/gift/subcategories", getAllGiftSubCategories);

router.get("/gift/transaction/:refId", getGiftTransactionByRefId);

router.post("/gift", mwRequireSignin, createPurchaseGiftTransactions);

//VORTEX TRANSACTIONS SPARKLE CRUD

router.post("/transaction/topup", mwRequireSignin, saveTopUpTransaction);

router.post(
  "/transaction/billspayment",
  mwRequireSignin,
  saveBillsPaymentTransaction
);

router.get("/paymentTransactions", getAllVortexTransactionsForPayment);

router.post("/transaction/gift", mwRequireSignin, saveGiftTransaction);

router.get("/transaction/topup/byuserId/:userId", getAllTopUpTransactionByUserId);

router.get(
  "/transaction/billspayment/byuserId/:userId",
  getAllBillsPaymentTransactionByUserId
);

router.get("/transaction/all", getAllVortexTransactions);

router.post("/transaction/bydate", getAllVortexTransactionsByDateRange);

router.get("/transaction/gifts/byuserId/:userId", getAllGiftTransactionByUserId);

router.get("/transaction/all/:userId", getAllVortexTransactionByUserId);

router.get("/transaction/byref/:refId", getVortexTransactionByRefId);

router.patch("/transaction/update/:refId", updateVortexTransaction);

router.get("/transaction/bydocid/:id", getVortexTransactionByDocId);

//VORTEX DISCORD WEBHOOK
router.post("/discord/refund", sendVortexDiscordRefund)

/**
 * Update all transactions with data from vortex
 */
router.get("/transactions/sync", syncTransactions)

module.exports = router;
