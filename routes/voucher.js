const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { dbErrorHandler } = require("../helpers/dbErrorHandler");

const Voucher = require("../models/Voucher");
const Shop = require("../models/Shop");
const User = require("../models/User");



router.get('/sparkle-automatic-vouchers', (req, res) => {
  Voucher.find({apply_automatically: true}, (err,data) => {
    if(err)
      return res.status(400).json({
        error: dbErrorHandler(err)
      })
    
      res.json(data)
  })
})

router.get("/pasuyo", (req, res) => {
  Voucher.find({ product: "pabili" }, (err, data) => {
    if (err)
      return res.status(400).json({
        error: dbErrorHandler(err),
      });

    res.json(data);
  });
});

router.get("/spark-express", (req, res) => {
  Voucher.find({ product: "deliver" }, (err, data) => {
    if (err)
      return res.status(400).json({
        error: dbErrorHandler(err),
      });

    res.json(data);
  });
});

router.get("/add", (req, res) => {
  User.findById("5f729026fc645c0017a90403", (err, data) => {
    if (err) {
      console.log("err on user id");
      console.log(err);
    }
    Voucher.findOneAndUpdate(
      { name: "postvoucher" },
      { $push: { users_availed: data.id } }
    ).exec((err, data) => {
      if (err) {
        console.log("err on voucher");
        console.log(err);
      }
      res.json(data);
    });
  });
});
router.get("/:voucher", (req, res) => {
  let { voucher } = req.params;

  Voucher.find({ name: voucher }, (err, data) => {
    if (err)
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    res.json(data);
  });
});

//goods
router.get("/", (req, res) => {
  Voucher.find({ product: "sparkle" }, (err, data) => {
    if (err)
      return res.status(400).json({
        error: dbErrorHandler(err),
      });

    res.json(data);
  });
});

//goods
router.post("/", (req, res) => {
  let voucher = new Voucher(req.body);
  voucher.save(async (err, voucher) => {
    if (err)
      return res.status(400).json({
        error: dbErrorHandler(err),
      });

    //find the shops
    try {
      let query = voucher.shops.map((shop) =>
        mongoose.Types.ObjectId(shop.value)
      );
      await Shop.updateMany(
        { _id: { $in: query } },
        { $push: { vouchers: voucher } }
      ).exec();
    } catch (err) {
      console.log("may error");
      console.log(err);
    }
    res.json(voucher);
  });
});

//goods
router.patch("/:voucher", async (req, res) => {
  let { voucher } = req.params;

  //find the difference between new and old entry
  try {
    let oldVoucher = await Voucher.findById(voucher).exec();

    let oldShops = oldVoucher.shops.map((shop) => shop.value);
    let newShops = req.body.shops.map((shop) => shop.value);

    console.log(oldShops);
    console.log(newShops);
    console.log(oldShops.length > newShops.length);

    if (oldShops.length > newShops.length) {
      console.log("now find difference here");
      let diff = oldShops.filter((x) => !newShops.includes(x));
      let queryDiff = diff.map((x) => mongoose.Types.ObjectId(x));

      await Voucher.findByIdAndUpdate(voucher, req.body, { new: true });
      await Shop.updateMany(
        {
          _id: { $in: queryDiff },
        },
        {
          $pull: {
            vouchers: voucher,
          },
        }
      ).exec();
    } else {
      await Voucher.findByIdAndUpdate(voucher, req.body, {
        new: true,
      });
      console.log("new shops added");
      let diff = newShops.filter((x) => !oldShops.includes(x));
      let queryDiff =
        diff.length > 0
          ? diff.map((x) => mongoose.Types.ObjectId(x))
          : newShops.map((x) => mongoose.Types.ObjectId(x));

      let update = {
        $addToSet: {
          vouchers: voucher,
        },
      };

      await Shop.updateMany({ _id: { $in: queryDiff } }, update).exec();
    }
  } catch (err) {
    console.log(err);
  }

  res.json(voucher);
});

router.delete("/:voucher", (req, res) => {
  let { voucher } = req.params;
  Voucher.deleteOne({ _id: voucher }).exec((err) => {
    if (err)
      return res.status(400).json({
        error: dbErrorHandler(err),
      });
    res.json("ok");
  });
});

module.exports = router;
