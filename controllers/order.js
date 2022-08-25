const Express = require("../models/Order");
const ExpTransactions = require("../models/Express");
const { Order, CartItem } = require("../models/Order");
const { mwDecreaseQuantity } = require("../controllers/product");
const User = require("../models/User");
const Fcm = require("../models/Fcm");
const Shop = require("../models/Shop");
const Voucher = require("../models/Voucher");
const { dbErrorHandler } = require("../helpers/dbErrorHandler");
const sgMail = require("@sendgrid/mail");
const hypertrack = require("hypertrack")(
  "-7jVbFcD_lVlZefzZtKidKxIm7w",
  "eqRQCSflPWxRf6U-5rWKGpcllEXkZnyXFplpFvlRZxQzKxv9c27uSw"
);
const { Parser } = require("json2csv");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const { Webhook } = require("discord-webhook-node");
const { save, request, expressOrderDone } = require("./express/request");
const moment = require("moment-timezone");

const login = require("facebook-chat-api");


// MIDDLEWARES
exports.mwOrderById = (req, res, next, id) => {
  Order.findById(id)
    .populate({
      path: "products._id",
      model: "Product",
    })
    .populate({
      path: "history._id",
      model: "User",
    })
    .populate("user", "_id name address phone photo messenger")
    .populate("assignedRider", "_id name address phone photo messenger")
    .populate("shop", "_id name address status logo")
    .exec((err, order) => {
      console.log(err)
      console.log(order)
      if (err || !order) {
        return res.status(400).json({
          error: dbErrorHandler(err),
        });
      }
      req.order = order;
      next();
    });
};

exports.mwOrderByTransactionId = (req, res, next, transaction_id) => {
  Order.find({ transaction_id: transaction_id })
    .populate({
      path: "products._id",
      model: "Product",
    })
    .populate({
      path: "history._id",
      model: "User",
    })
    .populate("user", "_id name address phone photo messenger history deviceId")
    .populate("assignedRider", "_id name address phone photo messenger")
    .populate({
      path: "shop",
      populate: {
        path: "user",
        model: "User",
      },
    })
    .exec((err, order) => {
      if (err || !order) {
        return res.status(400).json({
          error: dbErrorHandler(err),
        });
      }
      req.order = order;
      next();
    });
};
// END MIDDLEWARES

exports.read = (req, res) => {
  return res.json(req.order);
};

exports.getListOrdersByShop = (req, res) => {
  const query = { shop: req.params.shopId, status: {$nin: ["Delivered", "Cancelled", "Rejected"] }};
  Order.find(query)
    .populate("user", "_id name address phone")
    .populate("shop", "_id name address status logo")
    .sort({ createdAt: -1 }) // sort most recent orders
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: dbErrorHandler(err),
        });
      }
      res.json(orders);
    });
};

exports.getListOrderByFilter = (req, res) => {
  // const query = {shop: req.params.shopId};
  Order.find({
    $or: [
      { status: "For-pickup" },
      { status: "On the way" },
      { status: "Arrived on Merchant" },
      { status: "Picked up" },
      { status: "Order on the way" },
      { status: "Arrived" },
    ],
    // status: { $in: ["For-pickup", "On the way", "Arrived on Merchant", "Picked up", "Order on the way", "Arrived"] }
  })
    .populate("user", "_id name address phone email")
    .populate({
      path: "shop",
      populate: {
        path: "user",
        model: "User",
      },
    })
    .sort({ createdAt: -1 }) // sort most recent orders
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: dbErrorHandler(error),
        });
      }
      res.json(orders);
    });
};

function downloadResource(res, fileName, data) {
  const json2csv = new Parser();
  const csv = json2csv.parse(data);
  res.header("Content-Type", "text/csv");
  res.attachment(fileName);
  return res.send(csv);
}

exports.getListOrderByFilterTime = (req, res) => {
  // console.log(req.query);
  // const query = {shop: req.params.shopId};
  // return res.status(400).json({
  // 	error: "check charts for the data here, if not there ? - ask for help"
  // });

  try {
    if (!req.query.start && !req.query.end) {
      return res.status(400).json({
        error: "Filter start and end - format - year-month-day ",
      });
    }

    Order.find(
      {
        // 'createdAt': {
        // $gte: new Date(new Date(2020,10,14).setHours(00, 00, 00)),
        // $lt: new Date(new Date(2020,10,16).setHours(23, 59, 59))
        //  }
        updatedAt: {
          $gte: new Date(`${req.query.start}T00:00:00.000Z`),
          $lt: new Date(`${req.query.end}T23:59:59.000Z`),
        },
      },
      {
        _id: 0,
        address: 0,
        history: 0,
        deliveryNotes: 0,
        paymentType: 0,
        trip: 0,
        long: 0,
        // lat: 0,
        // createdAt: 0,
        // updatedAt: 0,
        __v: 0,
        "products.createdAt": 0,
        "products.updatedAt": 0,
        "products.__v": 0,
        "products._id": 0,
      }
    )
      .populate({
        path: "user",
        select: { name: 1, email: 1, phone: 1, _id: 0 },
      })
      .populate({
        path: "shop",
        select: { name: 1, _id: 0 },
        populate: {
          path: "user",
          model: "User",
          select: { name: 1, email: 1, phone: 1, _id: 0 },
        },
      })
      .populate({
        path: "assignedRider",
        select: { name: 1, _id: 0 },
      })
      .sort({ createdAt: "asc" }) // sort most recent orders
      .exec((err, orders) => {
        if (err) {
          console.log(err);
          return res.status(400).json({
            error: dbErrorHandler(error),
          });
        }

        // res.json(products.map((p) => {

        // 	try {
        // 		let {name, sold, description, price, quantity, createdAt, updatedAt, images, status, isApproved, category, isArchived, shop, imagePrimary } = p._doc;
        // 		return({"id": p._id, name, sold, description, price, quantity, createdAt, images, updatedAt, "category": category.name, "shop": shop.name, isApproved, status, isArchived, imagePrimary, "shopInspiration": (shop.inspiration=!''||shop.inspiration)});
        // 	  }
        // 	  catch (e) {
        // 		return({});
        // 		console.log("SPARKLEERROR: getListApproval");
        // 	  }
        //  }));

        // var newOrders = orders.map(function (obj) {
        // 		obj.when = new Date(obj.when).toLocaleString();
        // 		obj.remittance = "i love you baybe";
        // 		obj.Percent20 = "i love you baybe";
        // 		obj.total = "i love you baybe";
        // 		return obj;
        // 	})
        var newOrders = orders.map((p) => {
          return {
            Status: p.status,
            ShopName: p.shop.name,
            "Product-With-Quantity": p.products
              .map(function (obj) {
                return ` ${obj.count} - ${obj.name}`;
              })
              .toString(),
            "Date/Time": new Date(p.when).toLocaleString(),
            Amount: p.amount,
            "15%": p.amount * 0.15,
            "20Percent": p.deliveryFee * 0.2,
            Chomper: p.user.name,
            ContactNo: p.user.phone,
            Total: p.amount + p.deliveryFee * 0.2,
            Voucher: p.voucher,
            TransactionID: p.transaction_id,
            "OutsideRider/StatusMessage": p.statusMessage,
            Rider: p.assignedRider,
            PaymentMode: "COD",
            DeliveryFee: p.deliveryFee,
          };
        });
        // console.log(orders);
        // const json2csv = new Parser();
        // const csv = json2csv.parse(JSON.parse(JSON.stringify(orders)));
        const csv = JSON.stringify(newOrders);
        res.header("Content-Type", "application/json");
        res.attachment(
          `order-report-sparkles-${req.query.start}-to-${req.query.end}.json`
        );
        return res.send(csv);
        // return downloadResource(res, `order-report-sparkles-${start}-to-${end}.csv`, orders);
        // res.json(orders);
      });
  } catch (e) {
    return res.status(400).json({
      error: "An error occured, try again later. Ask help from the devs.",
    });
  }
};

function isDateBeforeToday(date) {
  console.log(`the date is : ${new Date().toISOString()}`)
  return new Date(date).valueOf() <= new Date(new Date()).valueOf();
}

function isTimeBusinessHours(date) {
  return new Date(date).getHours() >= 8 && new Date(date).getHours() < 22;
}

function isDayWeekday(date) {
  return new Date(date).getDay() != 0;
}

function send_fcm_notifications(title, text, userId, isMerchant) {
  console.log("inside fcm method", title, text, userId, isMerchant);
  // notification object with title and text

  // fcm device tokens array
  var fcm_tokens = [];
  Fcm.find({ user: mongoose.Types.ObjectId(userId) }).exec((err, data) => {
    console.log(data);
    // const isiOS =  deviceInfo.includes('Apple') ? true : false ;
    // console.log(data.deviceInfo, isiOS);

    var notification = {};

    if (isMerchant) {
      notification = {
        title: title,
        text: text,
        body: text,
        sound: "alarm_02.wav",
        android_channel_id: "SHOP_ORDERS",
      };
    } else {
      notification = {
        title: title,
        text: text,
        body: text,
        sound: "alarm_02.wav",
        android_channel_id: "SHOP_ORDERS",
      };
    }

    if (err || data.length == 0) {
      console.log("no fcm on this user");

      return;
    }
    var arrayOfIOSTokens = data.flatMap(function (obj) {
      if (obj.deviceInfo.includes("Apple")) {
        return obj.token;
      } else {
        return [];
      }
    });

    var arrayOfTokens = data.flatMap(function (obj) {
      if (!obj.deviceInfo.includes("Apple")) {
        return obj.token;
      } else {
        return [];
      }
    });

    if (arrayOfTokens.length != 0) {
      var notification_body = {
        notification: notification,
        registration_ids: arrayOfTokens,
      };
      console.log("notification body", notification_body);
      fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          // replace authorization key with your key
          Authorization:
            "key=" +
            (isMerchant
              ? "AAAAEDZLuWA:APA91bEcCG8O9HukxKIBMJbxjIcDVlgHhmy9BAjsKJww4HRmKTKwcLRytr-qrjTUDn9SQuSq7VKgBNgAawptoG_nt_XGG-cGHdU4bBenOwsbd88Dnldk8Fo_nG2qhdya-6BKsVa7E0vC"
              : "AAAAjxsgNKw:APA91bG8jp1iYMOVJiyAyQG7IO0oM5pwfCFYDN_bjwJk6QwMp4JClKj7zMZFBjAeFZyH9zL_4Ik9-eOmqa-ZOuuK4jXj8ditsQJuroN3ZAj2rdFdDGDK0tQm3qqd9WhILcP-5wlZIddz"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification_body),
      })
        .then(function (response) {
          console.log(response.body);
          console.log(
            `FCM logs sent to android - success - ${response.body.success} - failure - ${response.body.failure} - isMerchant - ${isMerchant}`
          );
        })
        .catch(function (error) {
          console.error(error);
        });
    }

    if (arrayOfIOSTokens.length != 0) {
      if (isMerchant) {
        notification.sound = "alarm_02.wav";
      }

      var notification_body = {
        notification: notification,
        registration_ids: arrayOfIOSTokens,
      };
      console.log("notification body", notification_body);
      fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          // replace authorization key with your key
          Authorization:
            "key=" +
            (isMerchant
              ? "AAAAEDZLuWA:APA91bEcCG8O9HukxKIBMJbxjIcDVlgHhmy9BAjsKJww4HRmKTKwcLRytr-qrjTUDn9SQuSq7VKgBNgAawptoG_nt_XGG-cGHdU4bBenOwsbd88Dnldk8Fo_nG2qhdya-6BKsVa7E0vC"
              : "AAAAjxsgNKw:APA91bG8jp1iYMOVJiyAyQG7IO0oM5pwfCFYDN_bjwJk6QwMp4JClKj7zMZFBjAeFZyH9zL_4Ik9-eOmqa-ZOuuK4jXj8ditsQJuroN3ZAj2rdFdDGDK0tQm3qqd9WhILcP-5wlZIddz"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification_body),
      })
        .then(function (response) {
          console.log(response.body);
          console.log(
            `FCM logs sent to ios - success - ${response.body.success} - failure - ${response.body.failure} - isMerchant - ${isMerchant}`
          );
        })
        .catch(function (error) {
          console.error(error);
        });
    }
  });
}

exports.create = (req, res) => {
  req.body.order.user = req.profile;
  console.log("body.order", req.body.order);
  const order = new Order(req.body.order);

  if (
    order.deliveryFee === 0 ||
    order.deliveryFee == 0 ||
    order.deliveryFee === 35 ||
    order.deliveryFee == 35 ||
    order.deliveryFee === 35.0 ||
    order.deliveryFee == 35.0
  ) {
    //todo: version handling
    return res.status(400).json({
      error:
        "Kindly download the latest version of the app to continue with the order. Thank you for your patience po.",
    });
  }

  if (isDateBeforeToday(order.when)) {
    return res.status(400).json({
      error: "Order datetime can't be from the past.",
    });
  }
  // else if (!isDayWeekday(order.when)) {
  //   return res.status(400).json({
  //     error: "Order date can't be on Sunday.",
  //   });
  // }
  // else if (!isTimeBusinessHours(order.when)) {
  //   return res.status(400).json({
  //     error: `Order time can only be between 8am - 10pm for now. Selected time is ${new Date(order.when).getHours()}`
  //   });
  // }

  if(order.paymentType === "GCash") {
    order.status = "Waiting for Payment"
    order.history = [
      {
        status: "Waiting for Payment",
        updatedBy: req.profile._id,
      },
    ];
  } else {
    order.history = [
      {
        status: "Not Processed",
        updatedBy: req.profile._id,
      },
    ];
  }


  order.when = new Date(order.when).toISOString();

  order.save((error, data) => {
    console.log("step1");
    console.log(error);
    if (data.status === "Accepted") {
      Voucher.findOneAndUpdate(
        { name: order.voucher },
        { $push: { users_availed: order.user } }
      ).exec((err, data) => {
        if (err) {
          console.log("err on voucher update");
          console.log(err);
        }
      });
    }
    if (error) return res.json(data);

    Shop.findById(data.shop)
      .populate("user", "email, phone")
      .exec((err, shop) => {
        if (err || (!shop.user.email && !shop.user.phone)) {
          return res.json(data);
          // return res.status(400).json({
          //     error: "Merchant User not found! Order was created still"
          // });
        }

        var stringOfProducts = data.products.map(function (obj) {
          let addons =obj?.addons?.map(({name}) => {
            return `${name} `
          })
          let size = obj?.size ? ` - ${obj.size} - ` : ''

          return `${obj.name}${size} - ${addons}  x ${obj.count}`;
        });

        //   Ideal - not working due to recent FB updates? check
        // login({email: "sparkle.helpcenter@gmail.com", password: "S[arl;eStar2021"}, (err, api) => {
        // 	if(err) return console.error(err);

        // 	var yourID = "3313935808710775";
        // 	var msg = "Hey, hello world, this is a message coming from code - I am not human!";
        // 	api.sendMessage(msg, yourID);
        // });
        // Discord Hook to BRgy Sparkle - may order ba channel

        data
          .populate("user")
          .execPopulate()
          .then(function (dataWithUser) {
            console.log({
              text: "Iam in the order.js user data",
              customerDetails: `${dataWithUser.user.name} - ${dataWithUser.user.phone}`,
            });
            const hook = new Webhook(
              "https://discord.com/api/webhooks/823325081354502155/lkwrZFJ4vbECk3_dEmboOQaVbpDWfMYnYoOJpDVXaPjNJacDhE-DrCjo5zO1SIPWCJpm"
            );
            const IMAGE_URL =
              "https://www.sparkles.com.ph/static/2629bb8535ba6ae5406fc9385dadc2e0/497c6/Spark--noodles.png";
            hook.setUsername("Captain Sparkle");
            hook.setAvatar(IMAGE_URL);

            let ifParcel = data.origin.address ? " on Parcel Delivery" : "";
            let ifOriginParcel = data.origin.address
              ? ` [ ${data.origin.person} - ${data.origin.number} ]`
              : "";
            let ifDestinationParcel = data.destination.address
              ? ` [ ${data.destination.person} - ${data.destination.number} ] `
              : "";
            let pickup = data.origin.address
              ? data.origin.address
              : `${shop.address} - ${shop.name}`;
            let dropoff = data.destination.address
              ? data.destination.address
              : data.address;
            let pabili = data.pabili.items.map(
              ({ name, quantity }) => `${quantity} ${name}`
            );
            let customerDetails = `${dataWithUser.user.name} - ${dataWithUser.user.phone}`;
            let pabiliString =
              pabili.length > 0
                ? `Pabili: ${pabili} Total amount: ${data.pabili.amount}`
                : "";
            let withDiscount =
              data.voucher != ""
                ? `${data.amount}+${data.deliveryFee}-${data.amountDiscount}-${
                    data.deliveryFeeDiscount
                  } = ${
                    data.amount +
                    data.deliveryFee -
                    data.amountDiscount -
                    data.deliveryFeeDiscount
                  }`
                : `${data.amount}+${data.deliveryFee} = ${
                    data.amount + data.deliveryFee
                  }`;

                  if(order.paymentType === "GCash") {
                    hook.info(
                      `**Order Received  - payment via GCash - ${data.transaction_id}**`,
                      'Number Given: Abigail D. - 09107727553',
                      `Products: ${stringOfProducts} \nAmount to be collected: ${withDiscount} 
                    \n Link:https://com-sparkle-sparkle.herokuapp.com/admin/orderdelivery \n ${pabiliString} \n Customer: ${customerDetails} \n Expected: ${moment(
                        new Date(data.when)
                      ).fromNow()}  
                    \n Voucher: ${data.voucher} \n Voucher Discount: ${
                        data.amountDiscount >= 0 ? data.amountDiscount : ""
                      } \n Voucher Delivery Fee Discount: ${
                        data.deliveryFeeDiscount >= 0 ? data.deliveryFeeDiscount : ""
                      }
                    \n Delivery Notes: ${data.deliveryNotes}
                    \n`
                    );
                   } else {
                    hook.info(
                      `**Earn: Php ${(data.deliveryFee * 0.8).toFixed(
                        2
                      )} ${ifParcel} - ${data.transaction_id}**`,
                      `Pick Up: ${pickup} ${ifOriginParcel} \n \n` +
                        `Drop Off: ${dropoff} ${ifDestinationParcel}`,
                      `Products: ${stringOfProducts} \nAmount to be collected: ${withDiscount} 
                     \n ${pabiliString} \n Customer: ${customerDetails} \n Expected: ${moment(
                        new Date(data.when)
                      ).format('MMMM Do YYYY, h:mm:ss a')}  
                    \n Voucher: ${data.voucher} \n Voucher Discount: ${
                        data.amountDiscount >= 0 ? data.amountDiscount : ""
                      } \n Voucher Delivery Fee Discount: ${
                        data.deliveryFeeDiscount >= 0 ? data.deliveryFeeDiscount : ""
                      }
                    \n Delivery Notes: ${data.deliveryNotes}
                    \n Rider's app: https://rider.sparkles.com.ph/`
                    );
                   }

            
          });

        //add sms sending
        var sms_body = [
          {
            phone_number: shop.user.phone,
            message: `From Sparkle:  A new order is received po. Total Amount: ${order.amount}`,
            device_id: 122739,
          },
        ];
        fetch("	https://smsgateway.me/api/v4/message/send", {
          method: "POST",
          headers: {
            // replace authorization key with your key
            Authorization:
              "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhZG1pbiIsImlhdCI6MTYxMjIyNjM1NiwiZXhwIjo0MTAyNDQ0ODAwLCJ1aWQiOjg2OTkzLCJyb2xlcyI6WyJST0xFX1VTRVIiXX0.n2OQRitcHryea912NFQjEO-7ovz-nmAboiazu3ffP-0",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sms_body),
        })
          .then(function (response) {
            console.log(
              `Success SMS sent to - merchant  ${shop.user.phone} - ${order.status}`
            );
          })
          .catch(function (error) {
            console.error(error);
          });
        //end of sms sending
        send_fcm_notifications(
          "A new order is received po",
          `Products: ${stringOfProducts} Total Amount: ${order.amount}`,
          shop.user._id,
          true
        );

        data.orderId = data._id;
        data.shopName = shop.name;
        data.shopAddress = shop.address;
        data.shopPhone = shop.user.phone;
        data.shopGeo = { lat: shop.lat, lng: shop.long };

        //pickup and drop off
        if (
          data.origin.coordinates.length > 0 &&
          data.destination.coordinates.length > 0
        ) {
          console.log("first condition");
          data.pickup = data.origin;
          data.dropoff = data.destination;
          save("order-placed", data);
        } else {
          console.log("this is for the sparkle order");

          data.pickup = {
            person: `Shop: ${shop.name}`,
            number: shop.user.phone,
            address: shop.address,
            coordinates: [Number(shop.lat), Number(shop.long)],
          };

          data.dropoff = {
            person: req.profile.name,
            number: req.profile.phone,
            address: data.address,
            coordinates: [Number(data.lat), Number(data.long)],
          };

          save("order-placed", data);
        }
        sgMail.setApiKey(process.env.SEND_GRID_KEY);
        const msg = {
          //sender
          from: "Sparkle Order Notification <d.ilagan@sparkles.com.ph>",
          //recipients
          isMultiple: false, // the recipients can't see the other ones when this is on - TODO: beta testing show to everyone
          to: [
            "d.ilagan@sparkles.com.ph",
            shop.user.email,
            "sparklestardev@gmail.com",
          ],
          //
          subject: `A new order is received po`,
          html: `
                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>A new order is received po</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin: 0; padding: 0;">
	<table border="0" cellpadding="0" cellspacing="0" width="100%">	
		<tr>
			<td style="padding: 10px 0 30px 0;">
				<table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #cccccc; border-collapse: collapse;">
					<tr>
						<td align="center" bgcolor="#0085ff" style="padding: 40px 0 30px 0; color: #153643; font-size: 28px; font-weight: bold; font-family: Arial, sans-serif;">
							<img src="https://www.sparkles.com.ph/static/sparkle_logo_white-1c6a7b75f399e53f0fb6f0f4217540ef.png" alt="Sparkle" width="300" style="display: block;" />
              <img src="https://images.ctfassets.net/40va9oh2ho6x/64iJuu44ia1sJjiE9xBhLB/9f843044f31d44dc5add0374f74caa64/sparkle_banner_headline.gif?w=746&h=215&q=50" alt="Sparkle" width="300" style="display: block;" />
						</td>
					</tr>
					<tr>
						<td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
							<table border="0" cellpadding="0" cellspacing="0" width="100%">
								<tr>
									<td style="color: #153643; font-family: Arial, sans-serif; font-size: 24px;">
										<b>A new order is received po.</b>
									</td>
								</tr>
								<tr>
									<td style="padding: 20px 0 30px 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                    <strong>Customer Name:</strong> ${req.profile.name}
									</td>
								</tr>
								<tr>
									<td>
										<table border="0" cellpadding="0" cellspacing="0" width="100%">
											<tr>
												<td width="260" valign="top">
													<table border="0" cellpadding="0" cellspacing="0" width="100%">
														<tr>
															<td>
																<img src="https://www.sparkles.com.ph/static/2629bb8535ba6ae5406fc9385dadc2e0/497c6/Spark--noodles.png" alt="" width="100%"  style="display: block;" />
															</td>
														</tr>
														<tr>
															<td style="padding: 25px 0 0 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                <p><strong>Total products:</strong> ${order.products.length}</p>
                                <p> <strong>Total Cost:</strong> ${order.amount}</p>
															</td>
														</tr>
													</table>
												</td>
												<td width="260" valign="top">
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<tr>
						<td bgcolor="#ee4c50" style="padding: 30px 30px 30px 30px;">
							<table border="0" cellpadding="0" cellspacing="0" width="100%">
								<tr>
									<td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
										&reg; Sparkle Merchant, 2020<br/>
										<a href="#" style="color: #ffffff;"><font color="#ffffff">Unsubscribe</font></a> to this email notification instantly
									</td>
									<td align="right" width="25%">
										<table border="0" cellpadding="0" cellspacing="0">
											<tr>
												<td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
													<a href="http://www.twitter.com/" style="color: #ffffff;">
														<img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/tw.gif" alt="Twitter" width="38" height="38" style="display: block;" border="0" />
													</a>
												</td>
												<td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>
												<td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
													<a href="http://www.twitter.com/" style="color: #ffffff;">
														<img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/fb.gif" alt="Facebook" width="38" height="38" style="display: block;" border="0" />
													</a>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
                `,
        };

        sgMail
          .send(msg)
          .then(() =>
            console.log(
              `Mail sent successfully to - merchant ${shop.user.email}`
            )
          )
          .catch((error) => console.error(error.toString()));
        // end send email alert to admin

        return res.json(data);
      });
  });
};

exports.sms = (req, res) => {
  //add sms sending
  var sms_body = [
    {
      phone_number: req.body.number,
      message: `From Sparkle:  ${req.body.message}`,
      device_id: 122739,
    },
  ];
  // console.log('sms body on SMS feature - Feb 12,2021', sms_body)
  fetch("	https://smsgateway.me/api/v4/message/send", {
    method: "POST",
    headers: {
      // replace authorization key with your key
      Authorization:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhZG1pbiIsImlhdCI6MTYxMjIyNjM1NiwiZXhwIjo0MTAyNDQ0ODAwLCJ1aWQiOjg2OTkzLCJyb2xlcyI6WyJST0xFX1VTRVIiXX0.n2OQRitcHryea912NFQjEO-7ovz-nmAboiazu3ffP-0",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sms_body),
  })
    .then(function (response) {
      console.log(
        `Success SMS sent to - user  ${req.body.number} - ${req.body.message}`
      );
      return res.status(200).json({
        message: "Sent",
      });
    })
    .catch(function (error) {
      console.error(error);
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    });
  //end of sms sending
};

exports.getListOrders = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 20;
  Order.find()
    .populate("user", "_id name address phone")
    .populate({
      path: "shop",
      populate: {
        path: "user",
        model: "User",
      },
    })
    .populate("assignedRider", "_id name ")
    .sort({ createdAt: -1 }) // sort most recent orders
    .limit(limit)
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: dbErrorHandler(err),
        });
      }
      res.json(orders);
    });
};

exports.getListOrdersForDelivery = (req, res) => {
  Order.find({
    $or: [
      { status: "Accepted" },
      { status: "Preparing" },
      { status: "For-pickup" },
      { status: "On the way" },
      { status: "Arrived on Merchant" },
      { status: "Picked up" },
      { status: "Order on the way" },
      { status: "Arrived" },
    ],
  })
    .populate("user", "_id name address phone email messenger")
    .populate({
      path: "shop",
      populate: {
        path: "user",
        model: "User",
      },
    })
    .populate("assignedRider", "_id name messenger")
    .sort({ when: 1 }) // sort oldest date for delivery present > future
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: dbErrorHandler(err),
        });
      }
      return res.json(orders);
    });
};

exports.getStatusValues = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

function addOrderTrip(orderId, trip) {
  Order.findOneAndUpdate(
    // update itself is depracated.
    { _id: orderId },
    {
      $push: {
        trip: trip,
      },
    },
    (err, order) => {
      if (err) {
        return res.status(400).json({
          error: dbErrorHandler(err),
        });
      }
      console.log("added order trip", order);
    }
  );
}

// function createTripHyperTrack(status, order) {
// 	// add assigned rider
// 	User.findById(order.assignedRider)
// 		.exec((err, user) => {
// 			if (err || !user || !user.deviceId) {
// 				console.log(err)
// 				console.log({
// 					error: "Rider User device id not found!"
// 				});
// 			}

// 			console.log(status);
// 			console.log(((status === 'Order on the way') ? [parseFloat(order.long), parseFloat(order.lat)] : [parseFloat(order.shop.long), parseFloat(order.shop.lat)]));

// 			let tripData = {
// 				"device_id": user.deviceId,
// 				"destination": {
// 					"geometry": {
// 						"type": "Point",
// 						"coordinates": (status === 'Order on the way' ? [parseFloat(order.long), parseFloat(order.lat)] : [parseFloat(order.shop.long), parseFloat(order.shop.lat)])
// 					},
// 					"radius": 50
// 				}
// 			};

// 			hypertrack.trips.create(tripData).then(trip => {
// 				// Trip created
// 				addOrderTrip(order._id, trip);
// 				console.log("success on hypertrack", trip);
// 			}).catch(error => {
// 				console.log("error on hypertrack", error);
// 				// Error handling
// 			})
// 		})
// }

exports.updateOrderStatus = (req, res) => {
  let setQuery = {
    status: req.body.status,
  };

  // TODO: if no statusMessage on updateOrder don't remove statusMessage
  if (req.body.statusMessage || req.body.statusMessage !== "") {
    setQuery = {
      status: req.body.status,
      statusMessage: req.body.statusMessage,
    };
  }

  switch(req.body.status){
    case 'Delivered':
    case 'Cancelled': 
    case 'Rejected':
    expressOrderDone(req.body.orderId)
    break;
  }



  // add updatedBy when no profile_ID
  Order.findOneAndUpdate(
    // update itself is depracated.
    { _id: req.body.orderId },
    {
      $set: setQuery,
      $push: {
        history: {
          status: req.body.status,
          statusMessage: req.body.statusMessage,
          updatedBy: req.profile._id,
        },
      },
    },
    { new: true }
  )
    // .populate("shop", "_id name address status logo long lat user")
    .populate({
      path: "shop",
      populate: {
        path: "user",
        model: "User",
      },
    })
    .populate("user", "_id name address phone")
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: dbErrorHandler(err),
        });
      }

   

      //update exp transaction model
      if (order?.origin?.address) {
        //find the exp transaction model and update the status
        ExpTransactions.findOneAndUpdate(
          { transaction_id: order.transaction_id },
          {
            $set: setQuery,
            $push: {
              history: {
                status: req.body.status,
                statusMessage: req.body.statusMessage,
              },
            },
          }
        ).exec((err) => {
          if (err) {
            return res.status(400).json({
              error: dbErrorHandler(err),
            });
          }
        });
      }

      User.findById(order.user).exec((err, user) => {
        if (err || !user) {
          console.log(err);
          return res.status(400).json({
            error: "Chomper User not found! Order was updated still",
          });
        }
        let subjectNew = "";
        let statusData = "";

        // HANDLE push notifications
        switch (req.body.status) {
          case "Accepted":
            // For chomper only
            subjectNew = "Your order is accepted na po";
            //add the user to the list who availed the vouchers
            if (order.voucher.length > 0) {
              Voucher.findOneAndUpdate(
                { name: order.voucher },
                { $push: { users_availed: order.user } }
              ).exec((err, data) => {
                if (err) {
                  console.log("err on voucher update");
                  console.log(err);
                }
              });
            }

            //check if there is origin, then update quantity if exists
            order?.origin ? null : mwDecreaseQuantity(order.products, res);
            statusData = request(
              req.body.orderId,
              "new-trns",
              setQuery,
              user._id
            );

            // Order.findOne({_id: req.body.orderId})
            // .populate({
            //   path: "shop",
            //   populate: {
            //     path: "user",
            //     model: "User",
            //   },
            // }).exec((err, orderData) => {
            //   return res.json(orderData);
            // })

            return res.json(order);

          // case 'Preparing':
          //     subjectNew = 'Your order is being prepared na po'
          //     break;
          // case 'For-pickup':
          //     subjectNew = 'Your order is ready na po for pickup, courier is on the way'
          // 	break;
          case "On the way":
            // createTripHyperTrack(req.body.status, order);
            return res.json(order);

          case "Arrived on Merchant":
            subjectNew = "The rider arrived and is picking up the order po";
            break;
          case "Order on the way":
            // createTripHyperTrack(req.body.status, order);
            return res.json(order);

          case "Arrived":
            subjectNew = "Anytime now, the rider is ready for you po.";
            break;
          case "Delivered":
            subjectNew = "Thank you for dining with Sparkle, sa uulitin po";
            break;
          case "Cancelled":
            subjectNew = `Your order has been cancelled, pasensya po. ${req.body.statusMessage}`;
            break;
          case "Rejected":
            subjectNew = `Your order has been rejected, try again po. ${req.body.statusMessage}`;
            break;
          default:
            return res.json(order);
        }

        var stringOfProducts = order.products.map(function (obj) {
          return `${obj.name} x ${obj.count}`;
        });

        if (req.body.status === "Arrived on Merchant")
          send_fcm_notifications(
            "",
            `${subjectNew} - ${stringOfProducts.toString()}`,
            order.shop.user._id,
            true
          );
        else
          send_fcm_notifications(
            "",
            `${subjectNew} - ${stringOfProducts.toString()}`,
            user._id,
            false
          );

        sgMail.setApiKey(process.env.SEND_GRID_KEY);
        const msg = {
          //sender
          from: "Sparkle Order Notification <d.ilagan@sparkles.com.ph>",
          //recipients
          isMultiple: false, // the recipients can't see the other ones when this is on - TODO: beta testing show to everyone
          to: [
            "d.ilagan@sparkles.com.ph",
            "sparklestardev@gmail.com",
            req.body.status === "Arrived on Merchant"
              ? order.shop.user.email
              : user.email,
          ],
          //
          subject: subjectNew,
          html: `
					<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
					<html xmlns="http://www.w3.org/1999/xhtml">
					<head>
					<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
					<title>${subjectNew}</title>
					<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
					</head>
					<body style="margin: 0; padding: 0;">
						<table border="0" cellpadding="0" cellspacing="0" width="100%">	
							<tr>
								<td style="padding: 10px 0 30px 0;">
									<table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #cccccc; border-collapse: collapse;">
										<tr>
											<td align="center" bgcolor="#0085ff" style="padding: 40px 0 30px 0; color: #153643; font-size: 28px; font-weight: bold; font-family: Arial, sans-serif;">
												<img src="https://www.sparkles.com.ph/static/sparkle_logo_white-1c6a7b75f399e53f0fb6f0f4217540ef.png" alt="Sparkle" width="300" style="display: block;" />
								<img src="https://images.ctfassets.net/40va9oh2ho6x/64iJuu44ia1sJjiE9xBhLB/9f843044f31d44dc5add0374f74caa64/sparkle_banner_headline.gif?w=746&h=215&q=50" alt="Sparkle" width="300" style="display: block;" />
											</td>
										</tr>
										<tr>
											<td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
												<table border="0" cellpadding="0" cellspacing="0" width="100%">
													<tr>
														<td style="color: #153643; font-family: Arial, sans-serif; font-size: 24px;">
															<b>${subjectNew}</b>
														</td>
													</tr>
													<tr>
														<td style="padding: 20px 0 30px 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
										<strong>When to be delivered:</strong> ${order.when}
														</td>
													</tr>
													<tr>
														<td>
															<table border="0" cellpadding="0" cellspacing="0" width="100%">
																<tr>
																	<td width="260" valign="top">
																		<table border="0" cellpadding="0" cellspacing="0" width="100%">
																			<tr>
																				<td>
																					<img src="https://www.sparkles.com.ph/static/2629bb8535ba6ae5406fc9385dadc2e0/497c6/Spark--noodles.png" alt="" width="100%"  style="display: block;" />
																				</td>
																			</tr>
																			<tr>
																				<td style="padding: 25px 0 0 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
													<p><strong>Total products:</strong> ${order.products.length}</p>
													<p><strong>Payment type:</strong> ${order.paymentType}</p>
													<p><strong>Delivery Notes:</strong> ${order.deliveryNotes}</p>
													<p><strong>Total Cost:</strong> ${order.amount}</p>
																				</td>
																			</tr>
																		</table>
																	</td>
																	<td style="font-size: 0; line-height: 0;" width="20">
																		&nbsp;
																	</td>
																	<td width="260" valign="top">
																	</td>
																</tr>
															</table>
														</td>
													</tr>
												</table>
											</td>
										</tr>
										<tr>
											<td bgcolor="#ee4c50" style="padding: 30px 30px 30px 30px;">
												<table border="0" cellpadding="0" cellspacing="0" width="100%">
													<tr>
														<td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
															&reg; Sparkle, 2020<br/>
															<a href="#" style="color: #ffffff;"><font color="#ffffff">Unsubscribe</font></a> to this email notification instantly
														</td>
														<td align="right" width="25%">
															<table border="0" cellpadding="0" cellspacing="0">
																<tr>
																	<td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
																		<a href="http://www.twitter.com/" style="color: #ffffff;">
																			<img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/tw.gif" alt="Twitter" width="38" height="38" style="display: block;" border="0" />
																		</a>
																	</td>
																	<td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>
																	<td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
																		<a href="http://www.twitter.com/" style="color: #ffffff;">
																			<img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/fb.gif" alt="Facebook" width="38" height="38" style="display: block;" border="0" />
																		</a>
																	</td>
																</tr>
															</table>
														</td>
													</tr>
												</table>
											</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</body>
					</html>
					`,
        };

        sgMail
          .send(msg)
          .then(() => console.log("Order status Mail sent successfully"))
          .catch((error) => console.error(error.toString()));
        // } */

        // end send email alert to admin

        if (req.body.status === "Accepted") {
          res.json(statusData);
        } else {
          res.json(order); // n1
        }
      });
      // console.log("order after update", order)
      // res.json(order); // n1
    });
};

exports.getNotProcessedOrders = (req, res) => {
  Order.find({
    $or: [{ status: "Waiting for Payment" }, { status: "Not processed" }],
  })
    .populate("user", "_id name address phone email")
    .populate({
      path: "shop",
      populate: {
        path: "user",
        model: "User",
      },
    })
    .sort({ createdAt: -1 }) // sort most recent orders
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: dbErrorHandler(err),
        });
      }
      return res.json(orders);
    });
};

exports.getOrdersByRider = (req, res) => {
  Order.find({
    $or: [
      { status: "Waiting for Payment" },
      { status: "Not processed" },
      { status: "Accepted" },
      { status: "Preparing" },
      { status: "For-pickup" },
      { status: "On the way" },
      { status: "Arrived on Merchant" },
      { status: "Picked up" },
      { status: "Order on the way" },
      { status: "Arrived" },
    ],
    assignedRider: req.params.userId,
  })
    .populate("user", "_id name address phone email")
    .populate({
      path: "shop",
      populate: {
        path: "user",
        model: "User",
      },
    })
    .populate("assignedRider", "_id name")
    .sort({ createdAt: -1 }) // sort most recent orders
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: dbErrorHandler(err),
        });
      }
      return res.json(orders);
    });
};

exports.getOrdersByRiderDelivered = (req, res) => {
  Order.find({
    $or: [{ status: "Delivered" }],
    assignedRider: req.params.userId,
  })
    .populate("user", "_id name address phone email")
    .populate({
      path: "shop",
      populate: {
        path: "user",
        model: "User",
      },
    })
    .populate("assignedRider", "_id name")
    .sort({ createdAt: -1 }) // sort most recent orders
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: dbErrorHandler(error),
        });
      }
      return res.json(orders);
    });
};

exports.assignRider = (req, res) => {
  let query = {
    $set: {
      assignedRider: req.body.assignedRider,
    },
  };
  if (req.body.assignedRider === "") {
    query = {
      $unset: {
        assignedRider: 1,
      },
    };
  }

  // add updatedBy when no profile_ID
  Order.findOneAndUpdate(
    // update itself is depracated.
    { _id: req.params.orderId },
    query
  )
    .populate({
      path: "shop",
      populate: {
        path: "user",
        model: "User",
      },
    })
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: dbErrorHandler(err),
        });
      }
      console.log("order on update assign", order);
      res.json(order);
    });
};

// n1
// this is the order's output:
/*
{ n: 1,
[0]   nModified: 1,
[0]   opTime:
[0]    { ts:
[0]       Timestamp { _bsontype: 'Timestamp', low_: 2, high_: 1573435902 },
[0]      t: 5 },
[0]   electionId: 7fffffff0000000000000005,
[0]   ok: 1,
[0]   operationTime:
[0]    Timestamp { _bsontype: 'Timestamp', low_: 2, high_: 1573435902 },
[0]   '$clusterTime':
[0]    { clusterTime:
[0]       Timestamp { _bsontype: 'Timestamp', low_: 2, high_: 1573435902 },
[0]      signature: { hash: [Binary], keyId: [Long] } } }
[0] PUT /api/order/5dc871903b2b781adcc2aa46/status/5dbf0f0b5bf94a25249b31dc 200 884.032 ms - 285
[0] OPTIONS /api/order/list/all/5dbf0f0b5bf94a25249b31dc 2
 */

// req.body got the actual data
/*
{ status: 'Processing',
[0]   _id: 5dc871903b2b781adcc2aa46,
[0]   products:
[0]    [ { _id: 5dc00a28631d8810181eba6e,
[0]        name: 'Railsfdds',
[0]        price: 100,
[0]        createdAt: 2019-11-04T11:23:20.949Z,
[0]        updatedAt: 2019-11-04T11:23:20.949Z,
[0]        __v: 0,
[0]        count: 5 },
[0]      { _id: 5dc01114b75b9b233c150c32,
[0]        name: 'Atari',
[0]        price: 1222,
[0]        createdAt: 2019-11-04T11:52:52.518Z,
[0]        updatedAt: 2019-11-04T11:52:52.518Z,
[0]        __v: 0,
[0]        count: 3 } ],
[0]   transaction_id: 'fqp39htv',
[0]   amount: 4166,
[0]   address: 'Rua da Indústria, N* 13 B - Compensa 1',
[0]   user: 5dc2156aa48a0a1e70b252b7,
[0]   createdAt: 2019-11-10T20:22:40.129Z,
[0]   updatedAt: 2019-11-11T01:24:41.153Z,
[0]   __v: 0 }
 */
