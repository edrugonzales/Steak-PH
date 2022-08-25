import { v4 as uuidv4 } from 'uuid';
import { API } from '../../../config';

export const getVortexTokenBase = async () => {
  const { token } = JSON.parse(localStorage.getItem("jwt"));


  return await fetch(`${API}/vortex/token`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  })
    .then((response) => {
      return response
    })
    .catch((err) => {

      return err
    })
}



export const createBillsPaymentTransaction = async (access_token, docId, billerId, billDetails, paymentId, totalAmount, userId, callbackUrl) => {


  const { token } = JSON.parse(localStorage.getItem("jwt"));

  let uniqueId = uuidv4()

  let reqBody = {
    "clientRequestId": `SPARKLEADMIN${uniqueId}`,
    "docId": docId,
    "billerId": billerId,
    "billDetails": {
      ...billDetails
    },
    "callbackUrl": callbackUrl,
    "userId": userId,
    "paymentId": paymentId,
    "totalAmount": totalAmount
  }


  return await fetch(`${API}/vortex/bills-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "access_token": `${access_token}`,
    },
    body: JSON.stringify(reqBody)
  })
    .then((response) => {
      return response
    })
    .catch((err) => {

      return err
    })
}

export const createGiftPurchaseTransaction = async (
  { access_token,
    docId,
    userId,
    productCode,
    senderName,
    senderMobile,
    senderEmail,
    recipientName,
    recipientMobile,
    recipientEmail,
    quantity,
    message,
    paymentId,
    totalAmount
  }) => {


  const { token } = JSON.parse(localStorage.getItem("jwt"));

  let uniqueId = uuidv4()

  let reqBody = {
    "productCode": productCode.trim(),
    "clientRequestId": `SPARKLEADMIN${uniqueId}`,
    "docId": docId,
    "senderName": senderName.trim(),
    "senderMobile": senderMobile.trim(),
    "senderEmail": senderEmail.trim(),
    "recipientName": recipientName.trim(),
    "recipientMobile": recipientMobile.trim(),
    "recipientEmail": recipientEmail.trim(),
    "quantity": parseInt(quantity),
    "message": message,
    "userId": userId,
    "paymentId": paymentId,
    "totalAmount": totalAmount
  }

  return await fetch(`${API}/vortex/gift`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "access_token": `${access_token}`,
    },
    body: JSON.stringify(reqBody)
  })
    .then((response) => {
      return response
    })
    .catch((err) => {

      return err
    })
}

export const createVortexTopupTransaction = async (access_token, docId, mobileNumber, productCode, paymentId, totalAmount, userId, callbackUrl) => {

  const { token } = JSON.parse(localStorage.getItem("jwt"));

  let uniqueId = uuidv4()

  let reqBody = {
    "clientRequestId": `SPARKLEADMIN${uniqueId}`,
    "docId": docId,
    "mobileNumber": `${mobileNumber.trim()}`,
    "productCode": `${productCode.trim()}`,
    "userId": userId,
    "paymentId": paymentId,
    "totalAmount": totalAmount
  }

  return await fetch(`${API}/vortex/topup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "access_token": `${access_token}`
    },
    body: JSON.stringify(reqBody)
  })
    .then((response) => {
      return response
    })
    .catch((err) => {

      return err
    })
}


export const getAllVortexTransactionByUserID = async ({ userId }) => {

  return fetch(`${API}/vortex/transaction/all/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(response => response)
    .catch(error => {
      throw error
    });
}

export const getTransactionByRefNumber = async (access_token, refNumber) => {

  const { token } = JSON.parse(localStorage.getItem("jwt"));

  return await fetch(`${API}/vortex/topup/${refNumber}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "access_token": `${access_token}`
    },

  })
    .then((response) => {
      return response
    })
    .catch((err) => {

      return err
    })
}

export const getBillspaymentTransactionByRefNumber = async (access_token, refNo) => {

  const { token } = JSON.parse(localStorage.getItem("jwt"));

  return await fetch(`${API}/vortex/bills-payment/${refNo}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "access_token": access_token
    },

  })
    .then((response) => {
      return response
    })
    .catch((err) => {

      return err
    })
}

export const getGiftTransactionByRefNumber = async (access_token, refNo) => {

  const { token } = JSON.parse(localStorage.getItem("jwt"));

  return await fetch(`${API}/vortex/gift/transaction/${refNo}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "access_token": access_token
    },

  })
    .then((response) => {
      return response
    })
    .catch((err) => {

      return err
    })
}