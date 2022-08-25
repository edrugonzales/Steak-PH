const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  signout,
  reset,
  mwRequireSignin,
  newPassword,
  platformVariables,
  signin_chat,
  postVerify,
  getVerify,
} = require("../controllers/auth");
const { userSignupValidator } = require("../validator");
const login = require("facebook-chat-api");
const { Webhook } = require("discord-webhook-node");

const testUsers = {
  uid: 123456,
  login: "login_123456",
  email: "123456@test.com",
  user: {
    id: 123456,
    login: "login_123456",
    email: "123456@test.com",
  },
  users: [
    {
      uid: 123456,
      login: "login_123456",
      email: "123456@test.com",
    },
  ],
};

router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.post("/signin-chat", signin_chat);
router.get("/signout", signout);
router.get("/platform-variables", platformVariables);
router.post("/reset-password", reset);
router.post("/new-password", newPassword);

router.get("/hello", (req, res) => {
  login(
    { email: "sparkle.helpcenter@gmail.com", password: "SparkleStar2021" },
    (err, api) => {
      if (err) return console.error(err);

      var yourID = "3313935808710775";
      var msg =
        "Hey, hello world, this is a message coming from code - I am not human!";
      api.sendMessage(msg, yourID);
    }
  );

  const hook = new Webhook(
    "https://discord.com/api/webhooks/823325081354502155/lkwrZFJ4vbECk3_dEmboOQaVbpDWfMYnYoOJpDVXaPjNJacDhE-DrCjo5zO1SIPWCJpm"
  );
  const IMAGE_URL =
    "https://www.sparkles.com.ph/static/2629bb8535ba6ae5406fc9385dadc2e0/497c6/Spark--noodles.png";
  hook.setUsername("Captain Sparkle");
  hook.setAvatar(IMAGE_URL);
  //Sends an information message
  hook.info(
    "**Hi I am from routes/auth.js.router.get(/hello)**",
    "This is an information field - I am from backend",
    "Kansamida\n\nAwit. GLHF"
  );
  var data = {
    deliveryFee: 45,
    status: "Not processed",
    long: "120.99153262429033",
    lat: "14.611556357004769",
    trip: [],
    _id: "6057d54c9de0db00176b6c34",
    products: [
      {
        _id: "5ff3d514cefd0f0017d38173",
        name: "Spark Express Padala",
        price: 10,
        createdAt: "2021-01-05T02:55:16.589Z",
        updatedAt: "2021-01-05T02:55:16.589Z",
        count: 1,
      },
    ],
    address: "970 Lacson Ave, Sampaloc, Manila, 1008 Metro Manila, Philippines",
    amount: 10,
    when: "2021-03-22T08:07:50.966023",
    paymentType: "COD",
    deliveryNotes: "a test",
    shop: {
      schedule: [
        {
          open: "8:00 am",
          closed: "11:59 pm",
        },
        {
          open: "8:00 am",
          closed: "11:59 pm",
        },
        {
          open: "8:00 am",
          closed: "11:59 pm",
        },
        {
          open: "8:00 am",
          closed: "5:00 pm",
        },
        {
          open: "8:00 am",
          closed: "5:00 pm",
        },
        {
          open: "",
          closed: "",
        },
        {
          open: "",
          closed: "",
        },
      ],
      logo: "https://com-sparkle-sparkle.herokuapp.com/api/shop/logo/5f729026fc645c0017a90404",
      banner:
        "https://com-sparkle-sparkle.herokuapp.com/api/shop/banner/5f729026fc645c0017a90404",
      preparation: "Pre-order",
      status: true,
      long: "120.9889939",
      lat: "14.6038217",
      pickUpNotes: "",
      location: {
        type: "Point",
        coordinates: [120.9889939, 14.6038217],
      },
      _id: "5f729026fc645c0017a90404",
      name: "Sparkle Shop",
      user: {
        role: 1,
        history: [
          {
            _id: "5f73d097a1d1d600178dc72c",
            name: "Test",
            description: "TEST",
            category: {
              _id: "5f728b23fc645c0017a903e7",
              name: "Asian",
              createdAt: "2020-09-29T01:17:23.145Z",
              updatedAt: "2020-09-29T01:17:23.145Z",
              __v: 0,
            },
            quantity: 1,
            amount: 40,
          },
        ],
        photo: "",
        deviceId: "",
        long: "121.0280817",
        lat: "14.5624632",
        _id: "5f729026fc645c0017a90403",
        name: "Abigail Domacena",
        email: "a.domacena@sparkles.com.ph",
        salt: "83d58a70-01f4-11eb-a440-0f11879cbad1",
        hashed_password: "160941f5469516201b9d7652e5855cf93d81b3ca",
        phone: "09564409300",
        address:
          "Jollibee Makati Avenue, Makati Avenue, Makati, Metro Manila, Philippines",
        gender: "Female",
        birthdate: "2020-09-29T00:00:00.000",
        createdAt: "2020-09-29T01:38:46.040Z",
        updatedAt: "2021-03-21T23:22:51.927Z",
        __v: 0,
        location: {
          type: "Point",
          coordinates: [120.989, 14.603],
        },
      },
      address:
        " FERN Building, 934-974, P. Paredes St, Sampaloc, Manila, 1008 Metro Manila",
      createdAt: "2020-09-29T01:38:46.052Z",
      updatedAt: "2021-03-04T01:48:42.969Z",
      __v: 0,
      inspiration:
        "Our store was created to serve food to the customer during pandemic. Now we continuously expanding our customers.",
    },
    voucher: "this is a test",
    user: {
      _id: "5f729026fc645c0017a90403",
      name: "Abigail Domacena",
      email: "a.domacena@sparkles.com.ph",
      phone: "09564409300",
      address:
        "Jollibee Makati Avenue, Makati Avenue, Makati, Metro Manila, Philippines",
    },
    transaction_id: "ipGzI--c",
    history: [
      {
        status: "Not Processed",
        createdAt: "2021-03-21T23:22:52.454Z",
        updatedAt: "2021-03-21T23:22:52.454Z",
      },
    ],
    createdAt: "2021-03-21T23:22:52.455Z",
    updatedAt: "2021-03-21T23:22:52.455Z",
    __v: 0,
  };

  var stringOfProducts = data.products.map(function (obj) {
    return `${obj.name} x ${obj.count}`;
  });
  console.log(
    `**Earn: Php ${data.deliveryFee * 0.8}**`,
    `Pick Up: ${data.shop.address} - ${data.shop.name} `,
    `Drop Off: ${
      data.address
    } \n Products: ${stringOfProducts} \nAmount to be collected: ${
      data.amount
    }+${data.deliveryFee} = ${
      data.amount + data.deliveryFee
    } \n Link: http://com-sparkle-sparkle.herokuapp.com/t/${
      data.transaction_id
    }`
  );
  hook.info(
    `**Earn: Php ${data.deliveryFee * 0.8}**`,
    `Pick Up: ${data.shop.address} - ${data.shop.name} `,
    `Drop Off: ${
      data.address
    } \n Products: ${stringOfProducts} \nAmount to be collected: ${
      data.amount
    }+${data.deliveryFee} = ${
      data.amount + data.deliveryFee
    } \n Link: http://com-sparkle-sparkle.herokuapp.com/t/${
      data.transaction_id
    }`
  );
  res.send("Hello world");
});

router.get("/platform-variables", platformVariables);

router.get("/ping", (req, res, next) => {
  res.send("pong");
});

router.post("/verify", postVerify);

router.get("/verify", getVerify);

// mwRequireSignin

module.exports = router;
