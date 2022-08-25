const fetch = require("node-fetch");
const { dbErrorHandler } = require("../helpers/dbErrorHandler");
const VortexTransaction = require("../models/VortexTransaction");
const { Webhook, MessageBuilder } = require("discord-webhook-node");
const { json } = require("express");

const statusInterpretter = (updateData) => {
  switch (updateData?.errorCode || updateData?.fulfillmentResponse?.status || updateData?.statusCode || updateData?.status || updateData?.statusDescription) {

    case "FAILED":
      return "Failed"
    case -1:
      return "Failed"
    case 400:
      return "Failed"
    case 1:
      return "Processing"
    case 2:
      return "Completed"
    case "COMPLETED":
      return "Completed"
    default:
      return updateData?.errorCode || updateData?.fulfillmentResponse?.status || updateData?.statusCode || updateData?.status || updateData?.statusDescription
  }
}


getBasicAuthToken = () => {
  let token = Buffer(
    `${process.env.VORTEX_CLIENT_KEY}:${process.env.VORTEX_CLIENT_SECRET_KEY}`
  ).toString("base64");
  return token
};

const updateVortexTransactionLog = async ({ docId, updateData }) => {
  try {
    const updatedLog = await VortexTransaction.findByIdAndUpdate({ _id: docId }, {
      ...updateData
    })

    return updatedLog
  } catch (error) {
    throw error
  }
}


const updateCurrentTransactionData = async ({ refNo, updateData }) => {

  try {

    if (updateData?.status !== "40025" || updateData?.status !== "40402" || updateData?.status !== "404") {

      let updateObject = {
        currentTransactionData: updateData,
        status: statusInterpretter(updateData),
      }


      const updatedLog = await VortexTransaction.findOneAndUpdate({ referenceNumber: refNo }, {
        ...updateObject
      })

      return updatedLog

    }

    return updateData

  } catch (error) {
    throw error
  }
}


//GET VORTEX ACCESS TOKEN
exports.getVortexToken = async (req, res) => {
  var urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", "client_credentials");

  await fetch(`${process.env.VORTEX_TOKEN_BASE_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${getBasicAuthToken()}`,
    },
    body: urlencoded,
  })
    .then(async (response) => {
      const data = await response.json();
      return res.json(data);
    })
    .catch((err) => {
      //console.log(err)
      return res.status(400).json({ error: err });
    });
};

//GET VORTEX PRODUCTS
exports.getVortexProducts = async (req, res) => {
  let token = req.get("access_token");

  await fetch(`${process.env.VORTEX_URL}/vortex/api/v1/products`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Consumer-Key": `${process.env.VORTEX_CLIENT_KEY}`,
    },
  })
    .then(async (response) => {
      const data = await response.json();
      return res.json(data);
    })
    .catch((err) => {
      //console.log(err)
      return res.status(400).json({ error: err });
    });
};

//TOP UP SERVICE

const getTopupTransactionFromVortex = async ({ refNumber, token }) => {

  try {

    let response = await fetch(`${process.env.VORTEX_URL}/vortex/api/v1/topup/${refNumber}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json();

    await updateCurrentTransactionData({ refNo: refNumber, updateData: data })

    return data

  } catch (error) {
    throw error
  }

}


exports.getTopupTransactionByRefNumber = async (req, res) => {
  try {

    let token = req.get("access_token");

    let refNumber = req.params.refNumber;

    let data = await getTopupTransactionFromVortex({ refNumber: refNumber, token: token })

    console.log(data)

    return res.json(data);

  } catch (err) {

    return res.status(400).json({ error: err });

  }
};

exports.getTopupTransactionByClientRequestId = async (req, res) => {
  let token = req.get("access_token");
  let clientRequestId = req.params.clientRequestId;

  await await fetch(
    `${process.env.VORTEX_URL}/vortex/api/v1/topup/clientRequestId/${clientRequestId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then(async (response) => {
      const data = await response.json();
      return res.json(data);
    })
    .catch((err) => {
      //console.log(err)
      return res.status(400).json({ error: err });
    });
};

exports.createVortexTopupTransaction = async (req, res) => {
  let token = req.get("access_token");

  let {
    docId,
    clientRequestId,
    mobileNumber,
    productCode,
    userId,
    paymentId,
    convenienceFee,
    totalAmount,
  } = req.body;

  let vortexBody = {
    clientRequestId: clientRequestId,
    mobileNumber: mobileNumber,
    productCode: productCode,
  };

  if (!docId) {
    return res.status(400).json({
      error: `vortexTransactionId is needed`,
    });
  }

  return await fetch(`${process.env.VORTEX_URL}/vortex/api/v1/topup/synchronous`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "Consumer-Key": `${process.env.VORTEX_CLIENT_KEY}`,
    },
    body: JSON.stringify(vortexBody),
  })
    .then(async (response) => {
      try {
        const data = await response.json();


        if (data.referenceNumber) {
          await updateVortexTransactionLog({
            docId: docId,
            updateData: {
              referenceNumber: data?.referenceNumber,
              transactionData: JSON.stringify(data),
              requestInputPayload: JSON.stringify(vortexBody),
              paymentId: paymentId,
            }
          })
        } else { //vortex error without reference number
          await updateVortexTransactionLog({
            docId: docId,
            updateData: {
              transactionData: JSON.stringify(data),
              requestInputPayload: JSON.stringify(vortexBody),
              paymentId: paymentId,
              // convenienceFee: convenienceFee,
              // totalAmount: totalAmount,
            }
          })
        }



        if (response.status === 400) {
          return res.json(data);
        }

        if (response.status === 400) {
          return res.json(data);
        }

        return res.json(data);
      } catch (error) {
        throw error
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ err });
      return err;
    });
};

//BILLING SERVICE
exports.getBillers = async (req, res) => {
  let token = req.get("access_token");
  let pageNumber = req.query.pageNumber;
  let pageSize = req.query.pageSize;

  await fetch(
    `${process.env.VORTEX_URL}/vortex/api/v1/bills-payment/billers?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then(async (response) => {
      const data = await response.json();
      return res.json(data);
    })
    .catch((err) => {
      //console.log(err)
      return res.status(400).json({ error: err });
    });
};

exports.getBillerDetailsById = async (req, res) => {
  let token = req.get("access_token");

  let billerId = req.params.billerId;

  await fetch(
    `${process.env.VORTEX_URL}/vortex/api/v1/bills-payment/billers/${billerId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then(async (response) => {
      const data = await response.json();
      return res.json(data);
    })
    .catch((err) => {
      //console.log(err)
      return res.status(400).json({ error: err });
    });
};

exports.createBillsPaymentTransaction = async (req, res) => {
  let token = req.get("access_token");

  let { docId, userId, paymentId, convenienceFee, totalAmount, billerId, billDetails } = req.body;

  if (!docId) {
    return res.status(400).json({
      error: `vortexTransactionId is needed`,
    });
  }

  let vortexBody = {

    billerId: billerId,
    billDetails: billDetails,
    callbackUrl: "app.sparkles.com.ph",
  };

  console.log(vortexBody);

  await fetch(`${process.env.VORTEX_URL}/vortex/api/v1/bills-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "Consumer-Key": `${process.env.VORTEX_CLIENT_KEY}`,
    },
    body: JSON.stringify(vortexBody),
  })
    .then(async (response) => {
      console.log(response);

      const data = await response.json();


      if (data.referenceNumber) {
        await updateVortexTransactionLog({
          docId: docId,
          updateData: {
            referenceNumber: data?.referenceNumber,
            transactionData: JSON.stringify(data),
            requestInputPayload: JSON.stringify(vortexBody),
            paymentId: paymentId,
          }
        })
      } else { //vortex error without reference number
        await updateVortexTransactionLog({
          docId: docId,
          updateData: {
            transactionData: JSON.stringify(data),
            requestInputPayload: JSON.stringify(vortexBody),
            paymentId: paymentId,
            // convenienceFee: convenienceFee,
            // totalAmount: totalAmount,
          }
        })
      }



      if (response.status === 400) {
        return res.json(data);
      }

      return res.json(data);
    })
    .catch((err) => {
      //console.log(err)
      return res.status(400).json({ error: err });
    });
};

const getBillsTransactionFromVortex = async ({ refNumber, token }) => {
  try {

    let response = await fetch(
      `${process.env.VORTEX_URL}/vortex/api/v1/bills-payment/${refNumber}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json();

    await updateCurrentTransactionData({ refNo: refNumber, updateData: data })


    return data;

  } catch (error) {

    throw error

  }

}

exports.getBillingTransactionByRefNumber = async (req, res) => {
  try {
    let token = req.get("access_token");

    let refNumber = req.params.refNo;

    let data = await getBillsTransactionFromVortex({ refNumber: refNumber, token: token })

    return res.json(data);

  } catch (error) {
    return res.status(400).json({ error: error });
  }

};

exports.getBillingTransactionByClientRequestId = async (req, res) => {
  let token = req.get("access_token");

  let clientRequestId = req.params.clientRequestId;

  await fetch(
    `${process.env.VORTEX_URL}/vortex/api/v1/bills-payment/clientRequestId/${clientRequestId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then(async (response) => {
      const data = await response.json();
      return res.json(data);
    })
    .catch((err) => {
      //console.log(err)
      return res.status(400).json({ error: err });
    });
};

exports.getBillingTransactionHistory = async (req, res) => {
  let token = req.get("access_token");

  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  let pageNumber = req.query.pageNumber;
  let pageSize = req.query.pageSize;

  await fetch(
    `${process.env.VORTEX_URL}/vortex/api/v1/bills-payment/history?startDate=${startDate}&endDate=${endDate}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Consumer-Key": `${process.env.VORTEX_CLIENT_KEY}`,
      },
    }
  )
    .then(async (response) => {
      const data = await response.json();
      return res.json(data);
    })
    .catch((err) => {
      //console.log(err)
      return res.status(400).json({ error: err });
    });
};

//PIN SERVICE

exports.getPins = async (req, res) => {
  let token = req.get("access_token");

  let productCode = req.query.productCode;

  return await fetch(
    `${process.env.VORTEX_URL}/vortex/api/v1/pins?productCode=${productCode}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Consumer-Key": `${process.env.VORTEX_CLIENT_KEY}`,
      },
    }
  )
    .then(async (response) => {
      const data = await response.json();
      return res.json(data);
    })
    .catch((err) => {
      //console.log(err)
      return res.status(400).json({ error: err });
    });
};

//WALLET SERVICE

exports.getWallets = async (req, res) => {
  let token = req.get("access_token");

  return await fetch(`${process.env.VORTEX_URL}/vortex/api/v1/wallets`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "Consumer-Key": `${process.env.VORTEX_CLIENT_KEY}`,
    },
  })
    .then(async (response) => {
      const data = await response.json();
      return res.json(data);
    })
    .catch((err) => {
      //console.log(err)
      return res.status(400).json({ error: err });
    });
};

//GIFT SERVICE
exports.getAllGiftCategories = async (req, res) => {
  let token = req.get("access_token");

  return await fetch(
    `${process.env.VORTEX_URL}/vortex/api/v1/e-gift/categories`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then(async (response) => {
      console.log(response.body);
      const data = await response.json();
      return res.json(data);
    })
    .catch((err) => {
      //console.log(err)
      return res.status(400).json({ error: err });
    });
};

exports.getAllGiftSubCategories = async (req, res) => {
  let token = req.get("access_token");

  let category = req.query.category;

  return await fetch(
    `${process.env.VORTEX_URL}/vortex/api/v1/e-gift/subcategories?category=${category}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then(async (response) => {
      console.log(response.body);
      const data = await response.json();
      return res.json(data);
    })
    .catch((err) => {
      //console.log(err)
      return res.status(400).json({ error: err });
    });
};

const getGiftTransactionFromVortex = async ({ refNumber, token }) => {
  try {

    let response = await fetch(
      `${process.env.VORTEX_URL}/vortex/api/v1/e-gift/${refNumber}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )


    const data = await response.json();

    await updateCurrentTransactionData({ refNo: refNumber, updateData: data })

    return data

  } catch (error) {

    throw error

  }
}

exports.getGiftTransactionByRefId = async (req, res) => {
  try {

    let token = req.get("access_token");

    let refId = req.params.refId;

    let data = await getGiftTransactionFromVortex({ refNumber: refId, token: token })

    return res.json(data)

  } catch (error) {

    return res.status(400).json({ error: error });

  }


};

exports.createPurchaseGiftTransactions = async (req, res) => {
  let token = req.get("access_token");

  let {
    docId,
    productCode,
    clientRequestId,
    quantity,
    senderName,
    senderMobile,
    senderEmail,
    recipientName,
    recipientMobile,
    recipientEmail,
    message,
    paymentId,
    convenienceFee,
    totalAmount,
  } = req.body;

  if (
    !docId ||
    !productCode ||
    !clientRequestId ||
    !senderName ||
    !senderEmail ||
    !senderMobile ||
    !recipientName ||
    !recipientMobile ||
    !recipientEmail ||
    !quantity
  ) {
    return res.status(400).json({
      error: "Make sure to fill all fields on the request body",
      missingFields: {
        docId: !docId,
        productCode: !productCode,
        clientRequestId: !clientRequestId,
        senderName: !senderName,
        senderEmail: !senderEmail,
        senderMobile: !senderMobile,
        recipientName: !recipientName,
        recipientMobile: !recipientMobile,
        recipientEmail: !recipientEmail,
        quantity: !quantity,
      },
      data: req.body,
    });
  }

  let vortexBody = {
    productCode: productCode,
    clientRequestId: clientRequestId,
    formData: {
      quantity: quantity,
      senderName: senderName,
      senderMobile: senderMobile,
      senderEmail: senderEmail,
      recipientName: recipientName,
      recipientMobile: recipientMobile,
      recipientEmail: recipientEmail,
      message: message,
    },
  };

  return await fetch(`${process.env.VORTEX_URL}/vortex/api/v1/e-gift/sync`, {
    method: "POST",
    headers: {
      "Consumer-Key": `${process.env.VORTEX_CLIENT_KEY}`,
      "Content-Type": "application/json",
      "Content-Length": 540,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(vortexBody),
  })
    .then(async (response) => {
      const data = await response.json();


      if (data.referenceNumber) {
        await updateVortexTransactionLog({
          docId: docId,
          updateData: {
            referenceNumber: data?.referenceNumber,
            transactionData: JSON.stringify(data),
            requestInputPayload: JSON.stringify(vortexBody),
            paymentId: paymentId,
          }
        })
      } else { //vortex error without reference number
        await updateVortexTransactionLog({
          docId: docId,
          updateData: {
            transactionData: JSON.stringify(data),
            requestInputPayload: JSON.stringify(vortexBody),
            paymentId: paymentId,
            // convenienceFee: convenienceFee,
            // totalAmount: totalAmount,
          }
        })
      }

      if (response.status === 400) {
        return res.json(data);
      }

      return res.json(data);
    })
    .catch((err) => {
      return res.status(400).json({ error: err });
    });
};


exports.sendVortexDiscordRefund = async (req, res) => {
  try {
    const { username, phone, email } = req.body
    const hook = new Webhook(
      process.env.VORTEX_DISCORD_REFUND_WEBHOOK
    );

    hook.setAvatar("https://sparkle-vortex.imgix.net/vortex_logo_white.png")
    hook.setUsername("Captain Vortex");

    const embed = new MessageBuilder()
      .setTitle('Vortex assistance request')
      .setDescription('Someone requested for assistance\nplease contact the user immediately to avoid any dissatisfaction')
      .setURL('https://www.paypal.com/ph/home')
      .addField('User name', `${username}`)
      .addField('Phone', `${phone}`)
      .addField('Email', `${email}`)
      .setColor('#00b0f4')
      .setTimestamp();

    hook.send(embed);
    res.json({ status: "success" })
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: error })
  }

}

//VORTEX TRANSACTIONS SPARKLE CRUD

exports.saveTopUpTransaction = (req, res) => {
  try {
    let { userId, referenceNumber, transactionData, paymentId, totalAmount, convenienceFee, requestInputPayload } =
      req.body;

    if (!userId) {
      return res.status(400).json({
        error: `userId must be filled`,
      });
    }

    let vortexTransaction = {};

    if (paymentId === "Awaiting for GCash Payment") {
      vortexTransaction = new VortexTransaction({
        type: "topup",
        userId: userId,
        transactionData: transactionData,
        paymentId: paymentId,
        convenienceFee: 0,
      });

      fetch(
        " https://discord.com/api/webhooks/823325081354502155/lkwrZFJ4vbECk3_dEmboOQaVbpDWfMYnYoOJpDVXaPjNJacDhE-DrCjo5zO1SIPWCJpm",
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // the username to be displayed
            username: "Expect GCash Payment",
            // the avatar to be displayed
            avatar_url:
              "https://play-lh.googleusercontent.com/QNP0Aj2hyumAmYiWVAsJtY2LLTQnzHxdW7-DpwFUFNkPJjgRxi-BXg7A4yI6tgYKMeU",
            // contents of the message to be sent
            content: `Total to be paid: ${totalAmount} - Transaction Id: ${vortexTransaction.referenceNumber}`,
          }),
        }
      );
    } else {
      vortexTransaction = new VortexTransaction({
        referenceNumber: referenceNumber,
        type: "topup",
        userId: userId,
        transactionData: transactionData,
        requestInputPayload: requestInputPayload,
        paymentId: paymentId,
        convenienceFee: convenienceFee,
        totalAmount: totalAmount,
      });
    }
    vortexTransaction.save((err, result) => {
      console.log(err)
      if (err) {
        return res.status(400).json({
          error: `Error on saving vortex transaction: ${dbErrorHandler(err)}`,
        });
      }

      return res.json(result);
    });
  } catch (error) {
    return res.status(400).json({ error: error });
  }
};

exports.saveBillsPaymentTransaction = async (req, res) => {
  try {
    let { userId, referenceNumber, transactionData, convenienceFee, paymentId, totalAmount, requestInputPayload } =
      req.body;

    if (!userId) {
      return res.status(400).json({
        error: `userId must be filled`,
      });
    }

    let vortexTransaction = {};

    if (paymentId === "Awaiting for GCash Payment") {
      vortexTransaction = new VortexTransaction({
        type: "billspayment",
        userId: userId,
        requestInputPayload: requestInputPayload,
        transactionData: transactionData,
        paymentId: paymentId,
        convenienceFee: 0,
      });

      fetch(
        " https://discord.com/api/webhooks/823325081354502155/lkwrZFJ4vbECk3_dEmboOQaVbpDWfMYnYoOJpDVXaPjNJacDhE-DrCjo5zO1SIPWCJpm",
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // the username to be displayed
            username: "Expect GCash Payment",
            // the avatar to be displayed
            avatar_url:
              "https://play-lh.googleusercontent.com/QNP0Aj2hyumAmYiWVAsJtY2LLTQnzHxdW7-DpwFUFNkPJjgRxi-BXg7A4yI6tgYKMeU",
            // contents of the message to be sent
            content: `Total to be paid: ${totalAmount} - Transaction Id: ${vortexTransaction.referenceNumber}`,
          }),
        }
      );
    } else {
      vortexTransaction = new VortexTransaction({
        referenceNumber: referenceNumber,
        type: "billspayment",
        userId: userId,
        requestInputPayload: requestInputPayload,
        transactionData: transactionData,
        paymentId: paymentId,
        convenienceFee: convenienceFee,
        totalAmount: totalAmount,
      });
    }

    vortexTransaction.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: `Error on saving vortex transaction: ${dbErrorHandler(err)}`,
        });
      }

      return res.json(result);
    });
  } catch (error) {
    return dbErrorHandler(error);
  }
};

exports.saveGiftTransaction = async (req, res) => {
  try {
    let { userId, referenceNumber, transactionData, paymentId, convenienceFee, totalAmount, requestInputPayload } =
      req.body;

    if (!userId) {
      return res.status(400).json({
        error: `All fields must be filled`,
      });
    }

    let vortexTransaction = {};

    if (paymentId === "Awaiting for GCash Payment") {
      vortexTransaction = new VortexTransaction({
        type: "gift",
        userId: userId,
        requestInputPayload: requestInputPayload,
        transactionData: transactionData,
        paymentId: paymentId,
        convenienceFee: 0,
      });

      fetch(
        " https://discord.com/api/webhooks/823325081354502155/lkwrZFJ4vbECk3_dEmboOQaVbpDWfMYnYoOJpDVXaPjNJacDhE-DrCjo5zO1SIPWCJpm",
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // the username to be displayed
            username: "Expect GCash Payment",
            // the avatar to be displayed
            avatar_url:
              "https://play-lh.googleusercontent.com/QNP0Aj2hyumAmYiWVAsJtY2LLTQnzHxdW7-DpwFUFNkPJjgRxi-BXg7A4yI6tgYKMeU",
            // contents of the message to be sent
            content: `Total to be paid: ${totalAmount} - Transaction Id: ${vortexTransaction.referenceNumber}`,
          }),
        }
      );
    } else {
      vortexTransaction = new VortexTransaction({
        referenceNumber: referenceNumber,
        type: "gift",
        userId: userId,
        transactionData: transactionData,
        requestInputPayload: requestInputPayload,
        paymentId: paymentId,
        convenienceFee: convenienceFee,
        totalAmount: totalAmount,
      });
    }

    vortexTransaction.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: `Error on saving vortex transaction: ${dbErrorHandler(err)}`,
        });
      }

      return res.json(result);
    });
  } catch (error) {
    return dbErrorHandler(error);
  }
};

exports.getAllTopUpTransactionByUserId = async (req, res) => {
  try {
    VortexTransaction.find({
      type: "Topup",
      userId: req.params.userId,
    })
      .sort({ createdAt: -1 })
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        return res.json(data);
      });
  } catch (error) {
    return dbErrorHandler(error);
  }
};

exports.getAllBillsPaymentTransactionByUserId = async (req, res) => {
  try {
    VortexTransaction.find({
      type: "Billspayment",
      userId: req.params.userId,
    })
      .sort({ createdAt: -1 })
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        return res.json(data);
      });
  } catch (error) {
    return dbErrorHandler(error);
  }
};

exports.getAllGiftTransactionByUserId = async (req, res) => {
  try {
    VortexTransaction.find({
      type: "Gift",
      userId: req.params.userId,
    })
      .sort({ createdAt: -1 })
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        return res.json(data);
      });
  } catch (error) {
    return dbErrorHandler(error);
  }
};

exports.getAllVortexTransactionByUserId = async (req, res) => {
  try {
    VortexTransaction.find({
      userId: req.params.userId,
    })
      .sort({ createdAt: -1 })
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        return res.json(data);
      });
  } catch (error) {
    return dbErrorHandler(error);
  }
};

exports.getVortexTransactionByRefId = async (req, res) => {
  try {
    VortexTransaction.findOne({
      referenceNumber: req.params.refId,
    })
      .populate("paymongoRefundResourceID")
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        return res.json(data);
      });
  } catch (error) {
    return dbErrorHandler(error);
  }
};

exports.updateVortexTransaction = async (req, res) => {
  console.log(req.body);
  try {
    VortexTransaction.findOneAndUpdate(
      { referenceNumber: req.params.refId },
      req.body,
      { new: true }
    ).exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: `Error on saving vortex transaction: ${dbErrorHandler(err)}`,
        });
      }

      return res.json(result);
    });
  } catch (error) {
    return dbErrorHandler(error);
  }
};

exports.getAllVortexTransactionsForPayment = async (req, res) => {
  try {
    VortexTransaction.find({
      // paymentId: "Awaiting for GCash Payment",
      // referenceNumber: { "$regex": "^[\s\S]{2,}$" }, // name.length >= 40
      referenceNumber: { $exists: true },
      $expr: { $lt: [{ $strLenCP: '$referenceNumber' }, 9] }
    })
      .sort({ createdAt: -1 })
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        return res.json(data);
      });
  } catch (error) {
    return dbErrorHandler(error);
  }
};

exports.getVortexTransactionByDocId = async (req, res) => {
  try {
    VortexTransaction.findOne({
      _id: req.params.id,
    })
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        return res.json(data);
      });
  } catch (error) {
    return dbErrorHandler(error);
  }
}

exports.getAllVortexTransactions = async (req, res) => {
  try {
    VortexTransaction.find({})
      .populate("userId", "_id name email phone")
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        return res.json(data);
      });
  } catch (error) {
    return dbErrorHandler(error);
  }
}



exports.getAllVortexTransactionsByDateRange = async (req, res) => {

  let { startDate, endDate } = req.body

  if (!startDate || !endDate) {
    return res.status(400).json({
      error: "startDate or endDate must be provided",
    });
  }


  try {
    VortexTransaction.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .populate("userId", "_id name email phone")
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        return res.json(data);
      });
  } catch (error) {
    return dbErrorHandler(error);
  }

}

exports.syncTransactions = async (req, res) => {



  let token = req.get("access_token");

  let vortexTransactionsList = await VortexTransaction.find({})

  for (let index = 0; index < vortexTransactionsList.length; index++) {

    let updateData = { "data": "empty" }

    if (vortexTransactionsList[index]?.currentTransactionData?.data === "empty" || vortexTransactionsList[index]?.status === "New") {

      //if (vortexTransactionsList[index]?.status === "40402") {


      switch (vortexTransactionsList[index].type) {

        case "topup":

          updateData = await getTopupTransactionFromVortex({ refNumber: vortexTransactionsList[index].referenceNumber, token: token })

          await updateCurrentTransactionData({ refNo: vortexTransactionsList[index].referenceNumber, updateData: updateData })

          console.log(`[${index}] Vortex sync done ${vortexTransactionsList[index]._id} `)

          break;

        case "billspayment":

          updateData = await getBillsTransactionFromVortex({ refNumber: vortexTransactionsList[index].referenceNumber, token: token })

          await updateCurrentTransactionData({ refNo: vortexTransactionsList[index].referenceNumber, updateData: updateData })

          break;

        case "gift":

          updateData = await getGiftTransactionFromVortex({ refNumber: vortexTransactionsList[index].referenceNumber, token: token })

          await updateCurrentTransactionData({ refNo: vortexTransactionsList[index].referenceNumber, updateData: updateData })

          console.log(`[${index}] Vortex sync done ${vortexTransactionsList[index]._id} `)

          break;

        default:
          break;
      }

    }

  }

  return res.json("Syncing Done!")


}