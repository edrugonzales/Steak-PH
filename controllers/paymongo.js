const fetch = require("node-fetch");
const PaymongoResource = require("../models/PaymongoResource");
const { dbErrorHandler } = require("../helpers/dbErrorHandler");

const getPublicAuthKey = () => {
  let token = Buffer(`${process.env.PAYMONGO_PUBLIC_KEY}`).toString("base64");
  return token;
};

const getSecretAuthKey = () => {
  let token = Buffer(`${process.env.PAYMONGO_SECRET_KEY}`).toString("base64");
  return token;
};

const createPaymentIntent = async ({
  amount = 0,
  paymentMethodAllowed = ["card"],
  currency = "PHP",
  description = "This is a payment for the product",
  statement_descriptor = "SPARKLE_STAR",
}) => {
  // SAMPLE CREATE PAYMENT INTENT BODY
  // let data = {
  //   data: {
  //     attributes: {
  //       amount: 10000,
  //       payment_method_allowed: ["card", "paymaya"],
  //       payment_method_options: { card: { request_three_d_secure: "any" } },
  //       currency: "PHP",
  //       description: "This is a payment for the vortex product",
  //       statement_descriptor: "This is a payment for the vortex product",
  //     },
  //   },
  // };

  let data = {
    data: {
      attributes: {
        amount: amount,
        payment_method_allowed: paymentMethodAllowed,
        payment_method_options: { card: { request_three_d_secure: "any" } },
        currency: currency,
        description: description,
        statement_descriptor: statement_descriptor,
      },
    },
  };

  try {
    let response = await fetch(
      `${process.env.PAYMONGO_API_URL}/v1/payment_intents`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${getSecretAuthKey()}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (response.status === 200) {
      let jsonData = await response.json();
      return jsonData;
    } else {
      let jsonData = await response.json();
      return jsonData;
    }
  } catch (error) {
    return error;
  }

  //SAMPLE RESPONSE
  // {
  //   "data": {
  //     "id": "pi_u6AeBbXcNn4Lo1WkaqfDCyts",
  //     "type": "payment_intent",
  //     "attributes": {
  //       "amount": 10000,
  //       "capture_type": "automatic",
  //       "client_key": "pi_u6AeBbXcNn4Lo1WkaqfDCyts_client_DBg32mQpja6M5pkW8XT5Yyot",
  //       "currency": "PHP",
  //       "description": "This is a payment for the vortex product",
  //       "livemode": false,
  //       "statement_descriptor": "This is a payment for the vortex product",
  //       "status": "awaiting_payment_method",
  //       "created_at": 1644420574,
  //       "updated_at": 1644420574,
  //       "last_payment_error": null,
  //       "payment_method_allowed": [
  //         "card",
  //         "paymaya"
  //       ],
  //       "payments": [],
  //       "next_action": null,
  //       "payment_method_options": {
  //         "card": {
  //           "request_three_d_secure": "any"
  //         }
  //       },
  //       "metadata": null
  //     }
  //   }
  // }
};

const attachToPaymentIntent = async ({
  paymentintent_clientKey,
  paymentMethodId,
  return_url,
}) => {
  //SAMPLE REQUEST BODY
  // {
  //   data: {
  //     attributes: {
  //       payment_method: 'pm_2EkmLDxzEex9oYNvyFvyh4mn',
  //       client_key: 'pi_u6AeBbXcNn4Lo1WkaqfDCyts_client_DBg32mQpja6M5pkW8XT5Yyot',
  //       return_url: return_url
  //     }
  //   }
  // }
  var paymentIntentId = paymentintent_clientKey.split("_client")[0];

  let reqBody = {
    data: {
      attributes: {
        client_key: paymentintent_clientKey,
        payment_method: paymentMethodId,
        return_url: return_url,
      },
    },
  };

  let response = await fetch(
    `${process.env.PAYMONGO_API_URL}/v1/payment_intents/${paymentIntentId}/attach`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${getSecretAuthKey()}`,
      },
      body: JSON.stringify(reqBody),
    }
  );

  if (response.status === 200) {
    let jsonData = await response.json();
    return jsonData;
  } else {
    let jsonData = await response.json();
    return jsonData;
  }

  //SAMPLE RESPONSE
  // {
  //   "data": {
  //     "id": "pi_u6AeBbXcNn4Lo1WkaqfDCyts",
  //     "type": "payment_intent",
  //     "attributes": {
  //       "amount": 10000,
  //       "capture_type": "automatic",
  //       "client_key": "pi_u6AeBbXcNn4Lo1WkaqfDCyts_client_DBg32mQpja6M5pkW8XT5Yyot",
  //       "currency": "PHP",
  //       "description": "This is a payment for the vortex product",
  //       "livemode": false,
  //       "statement_descriptor": "This is a payment for the vortex product",
  //       "status": "succeeded",
  //       "created_at": 1644420574,
  //       "updated_at": 1644421005,
  //       "last_payment_error": null,
  //       "payment_method_allowed": [
  //         "card",
  //         "paymaya"
  //       ],
  //       "next_action": null,
  //       "payment_method_options": {
  //         "card": {
  //           "request_three_d_secure": "any"
  //         }
  //       },
  //       "metadata": null
  //     }
  //   }
  // }
};

const createPaymentMethod = async ({
  type,
  card_number,
  exp_month,
  exp_year,
  cvc,
  addressl1,
  addressl2,
  city,
  state,
  postal_code,
  country,
  name,
  email,
  phone,
}) => {
  // SAMPLE PAYMENT METHOD BODY
  // let d = {
  //   data: {
  //     attributes: {
  //       details: {
  //         card_number: "4343434343434345",
  //         exp_month: 12,
  //         exp_year: 29,
  //         cvc: "030",
  //       },
  //       billing: {
  //         address: {
  //           line1: "9 Dr Sixto Antonio",
  //           line2: "Rosario",
  //           city: "Pasig",
  //           state: "Metro Manila",
  //           postal_code: "1609",
  //           country: "PH",
  //         },
  //         name: "Mark Jose Ultra",
  //         email: "markjoseultra@gmail.com",
  //         phone: "639273342196",
  //       },
  //       type: "card",
  //     },
  //   },
  // };

  let reqBody = {
    data: {
      attributes: {
        details: {
          card_number: card_number,
          exp_month: exp_month,
          exp_year: exp_year,
          cvc: cvc,
        },
        billing: {
          address: {
            line1: addressl1,
            line2: addressl2,
            city: city,
            state: state,
            postal_code: postal_code,
            country: country,
          },
          name: name,
          email: email,
          phone: phone,
        },
        type: type,
      },
    },
  };

  try {
    let response = await fetch(
      `${process.env.PAYMONGO_API_URL}/v1/payment_methods`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${getSecretAuthKey()}`,
        },
        body: JSON.stringify(reqBody),
      }
    );
    if (response.status === 200) {
      let jsonData = await response.json();
      return jsonData;
    } else {
      let jsonData = await response.json();
      return jsonData;
    }
  } catch (err) {
    return err;
  }

  //SAMPLE RESPONSE
  // {
  //   "data": {
  //     "id": "pm_2EkmLDxzEex9oYNvyFvyh4mn",
  //     "type": "payment_method",
  //     "attributes": {
  //       "livemode": false,
  //       "type": "card",
  //       "billing": {
  //         "address": {
  //           "city": "Pasig",
  //           "country": "PH",
  //           "line1": "9 Dr Sixto Antonio",
  //           "line2": "Rosario",
  //           "postal_code": "1609",
  //           "state": "Metro Manila"
  //         },
  //         "email": "markjoseultra@gmail.com",
  //         "name": "Mark Jose Ultra",
  //         "phone": "639273342196"
  //       },
  //       "created_at": 1644415139,
  //       "updated_at": 1644415139,
  //       "details": {
  //         "exp_month": 12,
  //         "exp_year": 29,
  //         "last4": "4345"
  //       },
  //       "metadata": null
  //     }
  //   }
  // }
};

//DO NOT USE THIS
// exports.mwRequirePaymongoPayment = async (req, res, next) => {
//   //Check request body if details is complete complete

//   //STEP 1. CREATE PAYMENT INTENT

//   let createPaymentIntentResponse = await createPaymentIntent({
//     amount: 0,
//     paymentMethodAllowed: ["card"],
//     currency: "PHP",
//     description: "This is a payment for the product",
//   });

//   //STEP 2. CREATE PAYMENT METHOD

//   let createPaymentMethodResponse = await createPaymentMethod({
//     type: "card",
//     card_number: "4343434343434345",
//     exp_month: "12",
//     exp_year: "29",
//     cvc: "030",
//     addressl1: "9 Dr Sixto Antonio",
//     addressl2: "Rosario",
//     city: "Pasig",
//     state: "Metro Manila",
//     postal_code: "1609",
//     country: "PH",
//     name: "Mark Jose Ultra",
//     email: "markjoseultra@gmail.com",
//     phone: "639273342196",
//   });

//   //STEP 3. ATTACH TO PAYMENT INTENT

//   let attachToPaymentIntentResponse = await attachToPaymentIntent({
//     paymentMethodId: createPaymentMethodResponse.data.id,
//     paymentintent_clientKey:
//       createPaymentIntentResponse.data.attributes.client_key,
//   });

//   let data = await attachToPaymentIntentResponse.json();

//   return res.json(data);

//   next();
// };

exports.createPaymongoPaymentIntent = async (req, res) => {
  let { amount, paymentMethodAllowed, currency, description } = req.body;

  if (!amount || !paymentMethodAllowed || !currency || !description) {
    return res
      .status(400)
      .json({ error: "Make sure to fill all fields on the request body" });
  }

  try {
    let data = await createPaymentIntent({
      amount: amount,
      paymentMethodAllowed: paymentMethodAllowed,
      currency: currency,
      description: description,
    });

    return res.json(data);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

exports.retrievePaymentIntent = async (req, res) => {
  let paymentIntentId = req.params.paymentIntentId;

  try {
    let response = await fetch(
      `${process.env.PAYMONGO_API_URL}/v1/payment_intents/${paymentIntentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${getSecretAuthKey()}`,
        },
      }
    );

    if (response.status === 200) {
      let jsonData = await response.json();
      return res.json(jsonData);
    } else {
      let jsonData = await response.json();
      return res.status(400).json({ error: jsonData });
    }
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

exports.createPaymongoPaymentMethod = async (req, res) => {
  let {
    type,
    card_number,
    exp_month,
    exp_year,
    cvc,
    addressl1,
    addressl2,
    city,
    state,
    postal_code,
    country,
    name,
    email,
    phone,
  } = req.body;

  if (
    !type ||
    !card_number ||
    !exp_month ||
    !exp_year ||
    !cvc ||
    !addressl1 ||
    !addressl2 ||
    !city ||
    !state ||
    !postal_code ||
    !country ||
    !name ||
    !email ||
    !phone
  ) {
    return res.status(400).json({
      error: "Make sure to fill all fields on the request body",
      data: req.body,
    });
  }

  try {
    let data = await createPaymentMethod({
      type: type,
      card_number: card_number,
      exp_month: exp_month,
      exp_year: exp_year,
      cvc: cvc,
      addressl1: addressl1,
      addressl2: addressl2,
      city: city,
      state: state,
      postal_code: postal_code,
      country: country,
      name: name,
      email: email,
      phone: phone,
    });

    return res.json(data);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

exports.attachToPaymongoPaymentIntent = async (req, res) => {
  let { paymentintent_clientKey, paymentMethodId, return_url } = req.body;
  if (!paymentintent_clientKey || !paymentMethodId || !return_url) {
    return res
      .status(400)
      .json({ error: "Make sure to fill all fields on the request body" });
  }

  try {
    let data = await attachToPaymentIntent({
      paymentMethodId: paymentMethodId,
      paymentintent_clientKey: paymentintent_clientKey,
      return_url: return_url,
    });

    return res.json(data);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

exports.savePaymongoRefundResource = async (req, res) => {
  try {
    let { referenceNumber, metadata, userId } = req.body;

    if (!referenceNumber || !userId) {
      return res.status(400).json({
        error: `All fields must be filled`,
      });
    }

    let paymongoResource = new PaymongoResource({
      referenceNumber: referenceNumber,
      type: "refund",
      userId: userId,
      metadata: metadata,
    });

    paymongoResource.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: `Error on saving vortex paymongo refund resource: ${dbErrorHandler(
            err
          )}`,
        });
      }

      return res.json(result);
    });
  } catch (error) {
    return dbErrorHandler(error);
  }
};

exports.getAllPaymongoRefundResource = async (req, res) => {
  try {
    PaymongoResource.find({
      userId: req.params.userId,
      type: "refund",
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
