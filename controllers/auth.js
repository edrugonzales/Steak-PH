const User = require("../models/User");
const Shop = require("../models/Shop");
const ShopShop = require("../models/shop/Shop");
const { dbErrorHandler } = require("../helpers/dbErrorHandler");
const jwt = require("jsonwebtoken"); // to generate signed token
const expressJwt = require("express-jwt"); // for authorization check
const crypto = require("crypto"); // to create token
const sgMail = require("@sendgrid/mail"); // to send mail
const fetch = require("node-fetch");
const { nanoid } = require("nanoid");
const mongoose = require("mongoose");
const { passwordResetEmailHTML } = require("../helpers/passwordResetEmailHTML");
var connection = mongoose.connection;

const host = process.env.HOST || "http://localhost:3000"; // FRONTEND Host
sgMail.setApiKey(process.env.SEND_GRID_KEY);

// Define email address that will send the emails to your users.
const sendingEmail = process.env.SENDING_EMAIL || "d.ilagan@sparkles.com.ph";

// MIDDLEWARES - mw
// Require signin Middleware - create privite route
// This requires the cookie-parser
// About express-jwt: Middleware that validates JsonWebTokens and sets req.user.
// This module lets you authenticate HTTP requests using JWT tokens in your Node.js applications. JWTs are typically used to protect API endpoints, and are often issued using OpenID Connect.
exports.mwRequireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth",
});

exports.mwIsAuth = (req, res, next) => {
  //req.auth from userProperty in mwRequireSignin above.
  // compares the current data from profile with authorization token.
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({
      // html code for Forbidden
      error: "Access denied",
    });
  }
  next();
};

exports.platformVariables = (req, res, next) => {
  connection.db.collection("platform.variables", function (err, collection) {
    collection.find({}).toArray(function (err, data) {
      res.send(data);
    });
  });
};

exports.mwIsMerchant = (req, res, next) => {
  // if regular user, then deny access.
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "Merchant feature! Access denied",
    });
  }
  next();
};
// END MIDDLEWARES

exports.platformVariables = (req, res, next) => {
  connection.db.collection("platform.variables", function (err, collection) {
    collection.find({}).toArray(function (err, data) {
      res.send(data);
    });
  });
};

exports.newPassword = (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;

  User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.status(422).json({ error: "Try again session expired" });
      }

      user.password = newPassword;
      user.resetToken = undefined;
      user.expireToken = undefined;

      user.save().then((saveduser) => {
        //    res.json({message:"password updated success"})

        // Send the mail
        // const mail = {
        //   to: saveduser.email,
        //   from: `Sparkle Account Reset Password <d.ilagan@sparkles.com.ph>`,
        //   subject: "Your Password has been updated",
        //   text: "Some useless text",
        //   //  TODO: how to get host from herokuapp - include variable on env high-prio
        //   html: `<p>You are receiving this because you have successfully changed the password for your account.\n\n Have a Sparkling day.\n </p>`,
        // };

        // sgMail
        //   .send(mail)
        //   .then(() => {
        //     return res.status(200).send({
        //       message: `Password is updated. An update email has been sent to ${user.email}`,
        //     });
        //   })
        //   .catch(() => {
        //     return res.status(503).send({
        //       message: `Password is updated. Impossible to send an email to ${user.email}, try again. Our service may be down. `,
        //     });
        //   });

        return res.status(200).send({
          message: `Password is updated`,
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.reset = (req, res) => {
  try {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        console.log(err);
      }
      const token = buffer.toString("hex");

      console.log(token);
      User.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
          return res
            .status(422)
            .json({ error: "User dont exists with that email" });
        }
        user.resetToken = token;
        user.expireToken = Date.now() + 3600000;
        user.save().then((result) => {
          // Send the mail
          // const mail = {
          //   to: user.email,
          //   from: `Sparkle Account Reset Password (Do not reply)`,
          //   subject: "Reset password link",
          //   text: "Some useless text",
          //   //  TODO: how to get host from herokuapp - include variable on env high-prio
          //   html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n Please click on the following link, or paste this into your browser to complete the process:\n\n
          //             <a href="${host}/reset/${token}">Link</a> \n\n If you did not request this, please ignore this email and your password will remain unchanged.\n </p>`,
          // };
          // console.log(`<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n Please click on the following link, or paste this into your browser to complete the process:\n\n
          //             <a href="${host}/reset/${token}">Link</a> \n\n If you did not request this, please ignore this email and your password will remain unchanged.\n </p>`);

          // sgMail
          //   .send(mail)
          //   .then(() => {
          //     return res.status(200).send({
          //       message: `A validation email has been sent to ${user.email}`,
          //     });
          //   })
          //   .catch((error) => {
          //     console.log(error);
          //     return res.status(503).send({
          //       message: `Impossible to send an email to ${user.email}, try again. Our service may be down.`,
          //       error,
          //     });
          //   });

          // return res.status(200).send({
          //   message: `A validation email has been sent to ${user.email}`,
          // });

          const sendInBlueBody = {
            sender: {
              name: "SPARKLE PASSWORD RESET",
              email: "donotreply@sparkle.com",
            },
            to: [
              {
                email: user.email,
                name: "Sparkle User",
              },
            ],
            subject: "PASSWORD RESET",
            htmlContent: passwordResetEmailHTML({
              resetlink: `${host}/reset/${token}`,
            }),
          };

          fetch(`https://api.sendinblue.com/v3/smtp/email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-key": process.env.SENDINBLUE_KEY,
            },
            body: JSON.stringify(sendInBlueBody),
          })
            .then(() => {
              return res.status(200).send({
                message: `A validation email has been sent to ${user.email}`,
              });
            })
            .catch(() => {
              return res.status(503).send({
                message: `Impossible to send an email to ${user.email}, try again. Our service may be down.`,
                error,
              });
            });
        });
      });
    });
  } catch (error) {
    return res.status(400).send({
      message: `${error}`,
    });
  }
};

exports.signup = (req, res) => {
  // console.log("req.body", req.body);
  const newUser = new User(req.body);
  newUser.save((err, user) => {
    if (err) {
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    }
    // Not includes sensitive password
    user.salt = undefined;
    user.hashed_password = undefined;
    if (req.body.role == 1) {
      let newShop = new Shop({
        name: `${user.name}'s Shop`,
        user: user._id,
        address: user.address,
        long: req.body.long,
        lat: req.body.lat,
        pickUpNotes: req.body.pickUpNotes || "",
        location: {
          type: "Point",
          coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)],
        },
      });

      newShop.save((err, shop) => {
        if (err) {
          return res.status(400).json({
            error: dbErrorHandler(err),
          });
        }
        res.json({
          user,
          shop,
        });
      });
    } else {
      res.json({
        user,
      });
    }
  });
};

exports.signin = (req, res) => {
  // find the user based on email
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "The user with this email does not exist. Try again!",
      });
    }
    // if user is found make sure the email and password match
    // create authenticate method in user model
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Invalid Credentials",
      });
    }
    // generate a signed token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET); // here can also be used expireIn to set expiry date.
    // persist the token as 't' (can be any name) in cookie with expiry date
    res.cookie("t", token, { expire: new Date() + 9999 }); // 9999 seconds
    // return response with user and token to frontend client
    // const { _id, name, email, role } = user;
    user.hashed_password = undefined;
    user.salt = undefined;
    if (user.role === 0) {
      return res.json({ token, user: user });
    } else if (user.role === 1) {
      Shop.findOne({ user: user._id }, (err, shop) => {
        return res.json({ token, user: user, shop: shop });
      });
    } else if (user.role === 2) {
      ShopShop.findOne({ user: user._id }, (err, store) => {
        return res.json({ token, user: user, store: store });
      });
    } else {
      return res.json({ token, user: user, isAdmin: true });
    }
  });
};

exports.signin_chat = (req, res) => {
  console.log("console.log - signin-chat", req.body);
  // find the user based on email
  const { user } = req.body;
  const { email, password } = user;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "The user with this email does not exist. Try again!",
      });
    }
    // if user is found make sure the email and password match
    // create authenticate method in user model
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Invalid Credentials",
      });
    }
    // generate a signed token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET); // here can also be used expireIn to set expiry date.
    // persist the token as 't' (can be any name) in cookie with expiry date
    res.cookie("t", token, { expire: new Date() + 9999 }); // 9999 seconds
    // return response with user and token to frontend client
    // const { _id, name, email, role } = user;
    user.hashed_password = undefined;
    user.salt = undefined;
    if (user.role === 0) {
      return res.json({ token, user: user });
    } else {
      Shop.findOne({ user: user._id }, (err, shop) => {
        return res.json({ token, user: user, shop: shop });
      });
    }
  });
};

exports.signout = (req, res) => {
  res.clearCookie("t");
  res.json({ message: "Signout success" });
};

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

exports.postVerify = (req, res, next) => {
  const token = req.body.token;
  console.log("POST /verify. req.body: ", req.body);
  console.log("POST /verify. token: ", token);

  const userData = verifyUser(token);

  console.log("userData", userData);

  if (!userData) {
    return res.status(422).json({ error: "User token is invalid" });
  }
  return res.status(200).json(userData);
};

exports.getVerify = (req, res, next) => {
  const token = req.query.token;
  console.log("GET /verify. req.query: ", req.query);
  console.log("GET /verify. token: ", token);

  const email = req.query.email;

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "The user with this email does not exist. Try again!",
      });
    } else {
      console.log({
        uid: user.id,
        login: user.email,
        email: user.email,
        avatar: user.photo,
        full_name: user.name,
        user: {
          id: user.id,
          login: user.email,
          email: user.email,
          avatar: user.photo,
          full_name: user.name,
        },
        users: [
          {
            uid: user.id,
            login: user.email,
            email: user.email,
            avatar: user.photo,
            full_name: user.name,
          },
        ],
      });

      return res.status(200).json({
        uid: user.id,
        login: user.email,
        email: user.email,
        avatar: user.photo,
        full_name: user.name,
        user: {
          id: user.id,
          login: user.email,
          email: user.email,
          avatar: user.photo,
          full_name: user.name,
        },
        users: [
          {
            uid: user.id,
            login: user.email,
            email: user.email,
            avatar: user.photo,
            full_name: user.name,
          },
        ],
      });
    }
  });
};
