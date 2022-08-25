const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const expressValidator = require("express-validator");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const sockets = require("./sockets");
require("dotenv").config();

// init app
const app = express();

// DATABASE
const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true, // comment this out when this error occurs: MongoTimeoutError: Server selection timed out after 30000 ms || But be aware that things can not work properly
  useFindAndModify: false,
};
mongoose
  .connect(process.env.MONGO_KEY, options)
  .then(() => console.log(`MongoDB Connected... - ${process.env.MONGO_KEY}`))
  .catch((err) => console.log(err));
// END DATABASE

// MIDDLEWARES
app.use(
  cors({
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  })
);
app.use(express.json()); //n1
app.use(morgan("dev"));
app.use(cookieParser());

app.use(expressValidator());

// Set Static Folder

app.use(express.static(path.join(__dirname, "client/build")));
app.use(function (req, res, next) {
  //res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Expose-Headers", "X-Total-Count");
  next();
});
// routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/category", require("./routes/category"));
app.use("/api/shop", require("./routes/shop"));
app.use("/api/product", require("./routes/product"));
app.use("/api/riders", require("./routes/riders"));
app.use("/api/braintree", require("./routes/braintree"));
app.use("/api/order", require("./routes/order"));
app.use("/api/shop-distance", require("./routes/shop-distance"));

app.use("/api/shop-approval", require("./routes/shop-approval"));
app.use("/api/product-approval", require("./routes/product-approval"));
app.use("/api/pets-product-approval", require("./routes/pets-product-approval"))
app.use("/api/order-delivery", require("./routes/order-delivery"));
app.use("/api/review", require("./routes/review"));

app.use("/api/express", require("./routes/express"));

// needs to be aligned with sparkle endpoints  - /api/coop/order inside is get/post
app.use("/api/store-order", require("./routes/store-order"));
app.use("/api/coop", require("./routes/store"));
app.use("/api/voucher", require("./routes/voucher"));

//alerts
app.use("/api/broadcasts", require("./routes/broadcasts"));

//vortex
app.use("/api/vortex", require("./routes/vortex"));

//paymongo
app.use("/api/paymongo", require("./routes/paymongo"));

const listEndpoints = require("express-list-endpoints");
const broadcasts = require("./sockets/broadcasts");
const order = require("./sockets/order");

app.use("/docs-api", (req, res) => {
  res.json(listEndpoints(app));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});
// END MIDDLEWARES

const port = process.env.PORT || 8081;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const io = require("./socket").init(server);

io.on("connection", (_socket) => {
  sockets(io, _socket);
  broadcasts(io, _socket);
  order(io, _socket);
});


global.io = io