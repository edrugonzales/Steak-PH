import { isAuthenticated } from "../../../auth";
import { getGCashTransactions } from "../../apiAdmin";
import { createNewGeneralBroadcast } from "../../broadcast/data/api";




const { user, token } = isAuthenticated();




export const getVortexTokenBase = async () => {

  return await fetch(`${process.env.REACT_APP_API_URL}/vortex/token`, {
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

//send a vortex request
export const sendVortexRequest = async (access_token, body, url) => {

  console.log('test - i know the request', url)

  return await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "access_token": `${access_token}`
    },
    body: JSON.stringify(body)
  })
    .then((response) => {
      if (!response.ok) {
        console.log(response)
        throw Error(response)
      }
      return response.json();
    })
    .then((response) => {
      console.log(response)
      return response
    })
    .catch((err) => {
      console.log(err)
      throw Error(err)
    })
}


const gcashBroadcastHandler = async ({ type, data }) => {
  try {

    console.log("From Broadcast Handler", data)

    // const titleHandler = (type) => {

    //   switch (type) {
    //     case "billspayment":
    //       return `Hi your bills payment request has been processed`
    //     case "gift":
    //       return `Hi your gift request has been processed`
    //     case "topup":
    //       return `Hi your topup request has been processed ${data?.vortexTransactionData?.productName} to ${data?.vortexTransactionData?.mobileNumber}`
    //   }

    // }

    // let broadcastData = {
    //   title: titleHandler(type),
    //   body: `Ref. No. ${data?.referenceNumber}`,
    //   createdBy: "",
    //   type: "Notification",
    //   link: "app.sparkles.com.ph",
    //   published: true,
    //   target: "Selected",
    //   targetUsers: [data?.sparkleData?.userId?._id]
    // }


    // await createNewGeneralBroadcast(broadcastData)
  } catch (error) {
    console.log(error)
  }
}


export async function handleVortexRequest(tranData, gtn) {
  try {
    let vortexTokenResponse = await getVortexTokenBase()

    if (vortexTokenResponse.status === 200) {
      let vortextTokenResult = await vortexTokenResponse.json()

      let td = JSON.parse(tranData.requestInputPayload)

      console.log(td);

      let reqBody = {};
      let vortexTransactionResponse = {};


      switch (tranData.type) {
        case "billspayment":

          reqBody = {
            "clientRequestId": `SPARKLEADMIN${tranData.referenceNumber}`,
            "billerId": td.billerId,
            "billDetails": {
              ...td.billDetails
            },
            "callbackUrl": td.callbackUrl,
            "docId": tranData._id,
            "paymentId": `gcash_${gtn}`
          }

          vortexTransactionResponse = await sendVortexRequest(
            vortextTokenResult.access_token,
            reqBody,
            "/vortex/bills-payment"
          )


          let billspaymentBroadcastData = {
            sparkleData: tranData,
            vortexTransactionData: vortexTransactionResponse,
          }

          await gcashBroadcastHandler({ type: tranData.type, data: billspaymentBroadcastData })

          break;
        case "gift":
          reqBody = {
            "productCode": td.productCode.trim(),
            "clientRequestId": `SPARKLEADMIN${tranData.referenceNumber}`,
            "senderName": td.formData.senderName.trim(),
            "senderMobile": td.formData.senderMobile.trim(),
            "senderEmail": td.formData.senderEmail.trim(),
            "recipientName": td.formData.recipientName.trim(),
            "recipientMobile": td.formData.recipientMobile.trim(),
            "recipientEmail": td.formData.recipientEmail.trim(),
            "quantity": parseInt(td.formData.quantity),
            "message": td.formData.message,
            "docId": tranData._id,
            "paymentId": `gcash_${gtn}`
          }

          vortexTransactionResponse = await sendVortexRequest(
            vortextTokenResult.access_token,
            reqBody,
            "/vortex/gift"
          )

          let giftBroadcastData = {
            sparkleData: tranData,
            vortexTransactionData: vortexTransactionResponse,
          }

          await gcashBroadcastHandler({ type: tranData.type, data: giftBroadcastData })

          break;
        case "topup":
          reqBody = {
            "clientRequestId": `SPARKLEADMIN${tranData.referenceNumber}`,//`${clientRequestId}${uniqueId}`,
            "mobileNumber": `${td.mobileNumber.trim()}`,
            "productCode": `${td.productCode.trim()}`,
            "docId": tranData._id,
            "paymentId": `gcash_${gtn}`
          }

          vortexTransactionResponse = await sendVortexRequest(
            vortextTokenResult.access_token,
            reqBody,
            "/vortex/topup"
          )


          let topupBroadcastData = {
            sparkleData: tranData,
            vortexTransactionData: vortexTransactionResponse,
          }

          await gcashBroadcastHandler({ type: tranData.type, data: topupBroadcastData })

          break;


        default:
          alert("Unknown type cancelled process")
          break;
      }

    }
  } catch (error) {
    console.log(error)
    alert(error)
  }
}