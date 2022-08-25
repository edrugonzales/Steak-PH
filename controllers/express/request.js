const { EXPRESS_API, JWT_SECRET } = process.env; // FRONTEND Host
const { dbErrorHandler } = require("../../helpers/dbErrorHandler");
const mongoose = require("mongoose");
const Express = require("./../../models/Express");
const User = require("./../../models/User");
const { Order } = require("./../../models/Order");
const sgMail = require("@sendgrid/mail");
const axios = require("axios");
const { add } = require("lodash");
const { format } = require("path");

// format data
function formatData(data) {
  const {
    orderId,
    transaction_id,
    long,
    lat,
    history,
    status,
    products,
    user,
    shop,
    shopName,
    shopAddress,
    shopGeo,
    shopPhone,
    paymentType,
    deliveryNotes,
    amount,
    address,
    trip,
    deliveryFee,
    when,
  } = data;

  const request = {
    orderId: orderId,
    transaction_id: transaction_id,
    rider: {
      trips: trip,
    },
    payment: {
      type: paymentType,
      deliveryFee: deliveryFee,
      amount: amount,
    },
    details: {
      location: {
        long: long,
        lat: lat,
      },
      items: {
        products: products,
      },
      shop: {
        _id: shop,
        name: shopName,
        address: shopAddress,
        lat: shopGeo.lat,
        lng: shopGeo.lng,
      },
      user: user,
      notes: deliveryNotes,
      address: address,
    },
    history: history,
    company: "Sparkle",
    status: status,
    dropoff: {
      name: user.name,
      address: address,
      lat: lat,
      lng: long,
      phone: user.phone,
    },
    pickup: {
      name: shopName,
      address: shopAddress,
      lat: shopGeo.lat,
      lng: shopGeo.lng,
      phone: shopPhone,
    },
    notes: deliveryNotes,
    when: when,
  };

  if (data.pickup && data.dropoff) {
    //pickup
    request.pickup.address = data.pickup.address;
    request.pickup.lat = data.pickup.coordinates[0];
    request.pickup.lng = data.pickup.coordinates[1];
    request.pickup.name = data.pickup.person;
    request.pickup.phone = data.pickup.number;

    //drop off
    request.dropoff.address = data.dropoff.address;
    request.dropoff.lat = data.dropoff.coordinates[0];
    request.dropoff.lng = data.dropoff.coordinates[1];
    request.dropoff.name = data.dropoff.person;
    request.dropoff.phone = data.dropoff.number;

    request.pabili = data.pabili;
    request.paymentFrom = data.paymentFrom;
    request.packageType = data.packageType;
  }

  console.log(request);

  return request;
}

function expressRoute(type) {
  const _expressReq = {
    "new-trns": "express/request/rider",
    "rider-accptd": "express/",
  };

  if (type == null) {
    return false;
  }

  if (type == null) {
    return false;
  }

  return _expressReq[type];
}
// validate object id
exports.mwExpId = (req, res, next, id) => {
  Express.findById(id).exec((err, id) => {
    if (err || !id) {
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    }
    req.id = id;
    next();
  });
};

// validate order Id
exports.mwOrderId = (req, res, next, id) => {
  Express.find({ orderId: id }).exec((err, id) => {
    if (err || !id) {
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    }
    req.id = id;
    next();
  });
};

// send request
exports.save = (_type, data) => {
  let formatted = formatData(data);
  let order = new Express(formatted);
  order
    .save()
    .then((dd) => {
      return dd;
    })
    .catch((err) => {
      console.log(err);
    });
};

// update local table
exports.update = (req, res) => {
  let { orderId, rider, status } = req.body;
  let setQuery = {
    rider: rider,
    status: status,
  };

  if (req.body.statusMessage === "") {
    req.body.statusMessage = "";
  }

  Express.findOneAndUpdate(
    { orderId: orderId },
    {
      $set: setQuery,
      $push: {
        history: {
          status: status,
          statusMessage: req.body.statusMessage,
        },
      },
    },
    (error, data) => {
      if (error) {
        return res.status(400).json({
          error: "Could not update user purchase history",
        });
      }
    }
  ).then((newData) => {
    return res.json(newData);
  });
};

function updateDefault(req, res) {
  let { orderId, rider, status } = req.body;
  let setQuery = {
    rider: rider,
    status: status,
  };

  if (req.body.statusMessage === "") {
    req.body.statusMessage = "";
  }

  Express.findOneAndUpdate(
    { orderId: orderId },
    {
      $set: setQuery,
      $push: {
        history: {
          status: status,
          statusMessage: req.body.statusMessage,
        },
      },
    },
    (error, data) => {
      if (error) {
        return res.status(400).json({
          error: "Could not update user purchase history",
        });
      }
    }
  ).then((newData) => {
    return res.json(newData);
  });
}

exports.updateTransaction = (req, res) => {
  let { status, transaction_id, statusMessage } = req.body;
  let setQuery = {
    status: status,
  };

  if (req.body.statusMessage === "") {
    req.body.statusMessage = "";
  }

  updateDefault(req, res);
  let order = Order.findOneAndUpdate(
    { transaction_id: transaction_id },
    {
      $set: setQuery,
      $push: {
        history: {
          status: status,
          statusMessage: statusMessage,
        },
      },
    }
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
          error: "An error occured.",
        });
      }
    });

  if (order) {
    User.findById(order.user).exec((err, user) => {
      if (err || !user) {
        console.log(err);
      }
      let subjectNew = "";
      switch (status) {
        case "On the way":
          return res.json(order);
        case "Arrived on Merchant":
          subjectNew = "The rider arrived and is picking up the order po";
          break;
        case "Order on the way":
          return res.json(order);
        case "Arrived":
          subjectNew = "Anytime now, the rider is ready for you po.";
          break;
        case "Delivered":
          subjectNew = "Thank you for dining with Sparkle, sa uulitin po";
          break;
        case "Cancelled":
          subjectNew = `Your order has been cancelled, pasensya po. ${statusMessage}`;
          break;
        case "Rejected":
          subjectNew = `Your order has been rejected, try again po. ${statusMessage}`;
          break;
        default:
          return res.json(order);
      }

      var stringOfProducts = order.products.map(function (obj) {
        return `${obj.name} x ${obj.count}`;
      });

      if (status === "Arrived on Merchant")
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

      res.json(order);
    });
  }
};

exports.expressOrderDone = (order) => {
  let url = `${EXPRESS_API}/express/request/${order}/cancel`;
  try {
    axios
      .get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_SECRET}`,
        },
      })
      .then((response) => response)
      .catch(err);
  } catch (err) {
    return err;
  }
};

exports.request = (_id, _type, _query, _uid) => {
  let _url = `${EXPRESS_API}/${expressRoute(_type)}`;
  let history = {
    status: _query.status,
    // statusMessage: _query?.statusMessage,
    updatedBy: _uid,
  };

  Express.findOneAndUpdate(
    {
      orderId: _id,
    },
    {
      $set: _query,
      $push: {
        history,
      },
    }
  ).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    }

    // console.trace(data, _query);
    data.status = _query.status;
    try {
      axios
        .post(_url, data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_SECRET}`,
          },
        })
        .then((response) => {
          return response;
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      return err;
    }
  });
};

exports.lists = () => {
  Express.find().exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    }
    res.json(data);
  });
};

exports.listOfUser = (req, res) => {
  Express.find({
    "details.user": [mongoose.Types.ObjectId(req.params.userId)],
    "details.items.products.0": { $exists: false },
  }).exec((err, data) => {
    if (err)
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    res.json(data);
  });
};

exports.getById = (req, res) => {
  Express.find({ orderId: req.params.requestId }).exec((err, data) => {
    console.log(data);
    if (err)
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    res.json(data);
  });
};
