
import { createBillsPaymentTransaction, createGiftPurchaseTransaction, createVortexTopupTransaction, getBillspaymentTransactionByRefNumber, getGiftTransactionByRefNumber, getTransactionByRefNumber, getVortexTokenBase, getVortexProducts, getBillers, getBillerById } from "../data/remote/vortex"

export async function handleVortexTopupRequest({ mobileNumber, docId, productCode, paymentId, totalAmount, userId, callbackUrl = "" }) {
  try {

    let tokenResponse = await getVortexTokenBase()

    if (tokenResponse.status !== 200) {
      throw Error("Failed getting authentication")
    }

    let tokenResult = await tokenResponse.json()

    let createTopupResponse = await createVortexTopupTransaction(tokenResult?.access_token, docId, mobileNumber, productCode, paymentId, totalAmount, userId, callbackUrl)

    if (createTopupResponse.status !== 200) {
      throw Error("Failed topup request")
    }

    let createTopupResult = await createTopupResponse.json()

    return createTopupResult

  } catch (error) {
    throw error
  }
}


export async function handleVortexGiftRequest({
  docId,
  quantity,
  productCode,
  senderName,
  senderEmail,
  senderMobile,
  recipientName,
  recipientEmail,
  recipientMobile,
  totalAmount,
  userId,
  message,
  paymentId, }) {
  try {

    let tokenResponse = await getVortexTokenBase()

    if (tokenResponse.status !== 200) {
      throw Error("Failed getting authentication")
    }

    let tokenResult = await tokenResponse.json()

    let createGiftResponse = await createGiftPurchaseTransaction({
      access_token: tokenResult?.access_token,
      docId: docId,
      quantity: quantity,
      productCode: productCode,
      senderName: senderName,
      senderEmail: senderEmail,
      senderMobile: senderMobile,
      recipientName: recipientName,
      recipientEmail: recipientEmail,
      recipientMobile: recipientMobile,
      totalAmount: totalAmount,
      userId: userId,
      message: message,
      paymentId: paymentId,

    })

    if (createGiftResponse.status !== 200) {
      throw Error("Failed Gift request")
    }

    let createGiftResult = await createGiftResponse.json()

    return createGiftResult

  } catch (error) {
    throw error
  }
}


export async function handleVortexBillsPaymentRequest({ docId, billerId, billDetails, paymentId, totalAmount, userId, callbackUrl = "" }) {
  try {

    let tokenResponse = await getVortexTokenBase()

    if (tokenResponse.status !== 200) {
      throw Error("Failed getting authentication")
    }

    let tokenResult = await tokenResponse.json()

    let createBillsPaymentResponse = await createBillsPaymentTransaction(tokenResult?.access_token, docId, billerId, billDetails, paymentId, totalAmount, userId, callbackUrl)

    if (createBillsPaymentResponse.status !== 200) {
      throw Error("Failed bills payment request")
    }

    let createBillsPaymentResult = await createBillsPaymentResponse.json()

    return createBillsPaymentResult

  } catch (error) {
    throw error
  }
}


export async function handleVortexGetByRef({ referenceNUmber, type }) {
  try {
    let tokenResponse = await getVortexTokenBase()

    if (tokenResponse.status !== 200) {
      throw Error("Failed getting authentication")
    }

    let tokenResult = await tokenResponse.json()

    switch (type) {
      case "topup":
        return await getTransactionByRefNumber(tokenResult?.access_token, referenceNUmber)
      case "billspayment":
        return await getBillspaymentTransactionByRefNumber(tokenResult?.access_token, referenceNUmber)
      case "gift":
        return await getGiftTransactionByRefNumber(tokenResult?.access_token, referenceNUmber)
      default:
        return await getTransactionByRefNumber(tokenResult?.access_token, referenceNUmber)
    }
  } catch (error) {
    throw error
  }
}


export async function handleVortexGetProductRequest() {
  try {

    let tokenResponse = await getVortexTokenBase()

    if (tokenResponse.status !== 200) {
      throw Error("Failed getting authentication")
    }

    let tokenResult = await tokenResponse.json()

    let allProductResponse = await getVortexProducts(tokenResult?.access_token)

    if (allProductResponse.status !== 200) {
      throw Error("Failed getting all products")
    }

    let allProductResult = await allProductResponse.json()

    return allProductResult

  } catch (error) {
    throw error
  }
}



export async function handleVortexGetBillersRequest() {
  try {

    let tokenResponse = await getVortexTokenBase()

    if (tokenResponse.status !== 200) {
      throw Error("Failed getting authentication")
    }

    let tokenResult = await tokenResponse.json()

    let allBillersResponse = await getBillers(tokenResult?.access_token, 1, 1000)

    if (allBillersResponse.status !== 200) {
      throw Error("Failed getting all billers")
    }

    let allBillerResult = await allBillersResponse.json()

    return allBillerResult

  } catch (error) {
    throw error
  }
}



export async function handleVortexGetBillerByidRequest(billerId) {
  try {

    let tokenResponse = await getVortexTokenBase()

    if (tokenResponse.status !== 200) {
      throw Error("Failed getting authentication")
    }

    let tokenResult = await tokenResponse.json()

    let billerResponse = await getBillerById(tokenResult?.access_token, billerId)

    if (billerResponse.status !== 200) {
      throw Error("Failed getting all billers")
    }

    let billerResult = await billerResponse.json()

    return billerResult

  } catch (error) {
    throw error
  }
}


